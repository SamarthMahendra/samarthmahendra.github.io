import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mcp_agent';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MCP Agent (MCP context) middleware
import { mcpContextMiddleware } from './mcp/contextManager';
app.use(mcpContextMiddleware);

// Profile routes
import profileRoutes from './routes/profileRoutes';
app.use('/api/profile', profileRoutes);

// Meeting routes
import meetingRoutes from './routes/meetingRoutes';
app.use('/api/meetings', meetingRoutes);

// Chat routes (MCP agent)
import chatRoutes from './routes/chatRoutes';
app.use('/api/chat', chatRoutes);

// MCP Agent routes (OpenAI-powered agent)
import mcpAgentRoutes from './routes/mcpAgentRoutes';
app.use('/api/mcp-agent', mcpAgentRoutes);

// Example route
app.get('/', (req, res) => {
  res.send('MCP Agent Server Running');
});

// Serve static testing UI
import path from 'path';
app.use('/testing/static', express.static(path.join(__dirname, '../../client/testing/build')));

// Serve the testing chatbot page
app.get('/testing', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/testing/build/index.html'));
});

// Streaming chat endpoint for testing
import axios from 'axios';
app.post('/testing/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const { message, history } = req.body;
  try {
    const response = await axios.post(`http://localhost:${PORT}/api/mcp-agent/chat`, { message, history }, { responseType: 'stream' });
    response.data.on('data', (chunk: Buffer) => {
      res.write(chunk);
    });
    response.data.on('end', () => {
      res.end();
    });
    response.data.on('error', (err: any) => {
      res.write(`data: [ERROR] ${err && typeof err === 'object' && 'message' in err ? err.message : String(err)}\n\n`);
      res.end();
    });
  } catch (err: any) {
    const errorMsg = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
    res.write(`data: [ERROR] ${errorMsg}\n\n`);
    res.end();
  }
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
