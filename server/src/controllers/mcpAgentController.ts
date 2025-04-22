import { Request, Response } from 'express';
import OpenAI from 'openai';
import Profile from '../models/Profile';
import Meeting from '../models/Meeting';
import { createClient } from 'redis';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect();

// Utility: get resources
async function getResources() {
  const profile = await Profile.findOne();
  const meetings = await Meeting.find({});
  const messages = await redis.lRange('messages', 0, 20);
  return { profile, meetings, messages };
}

// Utility: define tools for the agent
function getToolSchemas() {
  return [
    {
      name: 'send_message',
      description: 'Send a message via Teams or email',
      parameters: {
        type: 'object',
        properties: {
          channel: { type: 'string', enum: ['teams', 'email'] },
          recipient: { type: 'string' },
          content: { type: 'string' },
          subject: { type: 'string' },
        },
        required: ['channel', 'recipient', 'content'],
      },
    },
    {
      name: 'check_message',
      description: 'Check for new messages (Teams or Redis)',
      parameters: {
        type: 'object',
        properties: {
          channel: { type: 'string', enum: ['teams', 'redis'] },
          recipient: { type: 'string' },
          since: { type: 'string' },
        },
        required: ['channel'],
      },
    },
    {
      name: 'query_db',
      description: 'Query MongoDB for profile or meetings',
      parameters: {
        type: 'object',
        properties: {
          collection: { type: 'string' },
          filter: { type: 'object' },
        },
        required: ['collection'],
      },
    },
    {
      name: 'send_email',
      description: 'Send an email',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
  ];
}

// MCP Agent Chat Handler (streams OpenAI GPT-4.1-nano response)
export const mcpAgentChatHandler = async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    const resources = await getResources();
    const tools = getToolSchemas();

    // Compose OpenAI input
    const input = [
      { role: 'system', content: 'You are an MCP-compliant assistant. Use tools and resources as needed.' },
      ...history,
      { role: 'user', content: message },
      { role: 'system', content: `Resources: ${JSON.stringify(resources)}` },
      { role: 'system', content: `Available tools: ${tools.map(t => t.name).join(', ')}` },
    ];

    // Stream OpenAI response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.responses.stream({
      model: 'gpt-4.1-nano',
      input,
      text: { format: { type: 'text' } },
      reasoning: {},
      tools: [], // Tool calling can be implemented here
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: true,
    });

    for await (const chunk of stream) {
      res.write(`data: ${chunk.choices?.[0]?.delta?.content || ''}\n\n`);
    }
    res.write('data: [END]\n\n');
    res.end();
  } catch (err: any) {
    res.write(`data: [ERROR] ${err.message}\n\n`);
    res.end();
  }
};
