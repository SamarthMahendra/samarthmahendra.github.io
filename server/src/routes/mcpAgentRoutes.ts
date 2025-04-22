import { Router } from 'express';
import { mcpAgentChatHandler } from '../controllers/mcpAgentController';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/chat', asyncHandler(mcpAgentChatHandler));

export default router;
