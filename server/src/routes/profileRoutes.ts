import { Router } from 'express';
import { getProfile } from '../controllers/profileController';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get('/', asyncHandler(getProfile));

export default router;
