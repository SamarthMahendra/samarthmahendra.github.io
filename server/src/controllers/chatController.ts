import { Request, Response } from 'express';
import Profile from '../models/Profile';
import Meeting from '../models/Meeting';

/**
 * Main handler for chat/MCP agent logic.
 * Responds to Q&A about profile, meetings, and general chat.
 */
export const chatHandler = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    // Simple logic: check if question is about profile or meetings
    if (/profile|about|who are you|your name|skills|email/i.test(message)) {
      const profile = await Profile.findOne();
      if (!profile) return res.json({ reply: "Sorry, I don't have profile info yet." });
      return res.json({ reply: `I'm ${profile.name}. ${profile.about} You can reach me at ${profile.email}. My skills: ${profile.skills.join(', ')}` });
    }
    if (/meeting|schedule|appointment|book/i.test(message)) {
      const meetings = await Meeting.find({ status: 'confirmed' });
      if (!meetings.length) return res.json({ reply: 'No confirmed meetings yet.' });
      return res.json({ reply: `Here are your confirmed meetings: ${meetings.map(m => `${m.title} on ${m.datetime}`).join('; ')}` });
    }
    // Default fallback
    return res.json({ reply: "I'm your MCP assistant. Ask me about my profile or schedule a meeting!" });
  } catch (err) {
    res.status(500).json({ message: 'Chat error', error: err });
  }
};
