import { Router } from 'express';
import { requestMeeting, respondToMeeting, getMeetings } from '../controllers/meetingController';
import asyncHandler from 'express-async-handler';

const router = Router();

// Request a meeting
router.post('/', asyncHandler(requestMeeting));
// Respond to a meeting (confirm/decline)
router.patch('/:id', asyncHandler(respondToMeeting));
// Get all meetings
router.get('/', asyncHandler(getMeetings));

export default router;
