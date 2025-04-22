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

// Example route
app.get('/', (req, res) => {
  res.send('MCP Agent Server Running');
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
