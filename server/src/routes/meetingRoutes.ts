import { Router } from 'express';
import { requestMeeting, respondToMeeting, getMeetings } from '../controllers/meetingController';

const router = Router();

// Request a meeting
router.post('/', requestMeeting);
// Respond to a meeting (confirm/decline)
router.patch('/:id', respondToMeeting);
// Get all meetings
router.get('/', getMeetings);

export default router;
