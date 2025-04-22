import { Router } from 'express';
import { chatHandler } from '../controllers/chatController';
import asyncHandler from 'express-async-handler';

const router = Router();

router.post('/', asyncHandler(chatHandler));

export default router;
