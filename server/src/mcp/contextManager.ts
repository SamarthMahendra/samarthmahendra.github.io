// MCP Context Manager (simplified)
import { Request, Response, NextFunction } from 'express';

export interface MCPContext {
  userId?: string;
  conversationHistory?: any[];
  currentTask?: string;
  // Add more context fields as needed
}

declare module 'express-serve-static-core' {
  interface Request {
    mcpContext?: MCPContext;
  }
}

export const mcpContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.mcpContext = {
    userId: req.headers['x-user-id'] as string || undefined,
    conversationHistory: [],
    currentTask: '',
  };
  next();
};
