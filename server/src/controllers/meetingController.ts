import { Request, Response } from 'express';
import Meeting from '../models/Meeting';

import { requestMeetingApproval } from '../services/meetingApprovalService';

// Request a new meeting
export const requestMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, datetime, participants, requestedBy } = req.body;
    const meeting = await Meeting.create({
      title,
      datetime,
      participants,
      requestedBy,
      status: 'pending',
    });
    // Notify owner via Teams and poll for approval
    const meetingId = (meeting._id as unknown as string) || '';
    const meetingInfo = `${title} at ${datetime} with ${participants.join(', ')}`;
    const approval = await requestMeetingApproval(meetingId, meetingInfo);
    if (approval === 'confirmed' || approval === 'declined') {
      meeting.status = approval;
      await meeting.save();
    }
    // If timeout, status remains 'pending'
    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Error requesting meeting', error: err });
  }
};

// Confirm or decline a meeting (by owner)
export const respondToMeeting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, confirmedBy } = req.body; // status: 'confirmed' | 'declined'
    const meeting = await Meeting.findByIdAndUpdate(
      id,
      { status, confirmedBy },
      { new: true }
    );
    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }
    // TODO: Notify requester of the decision
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Error updating meeting', error: err });
  }
};

// Get all meetings (for dashboard)
export const getMeetings = async (req: Request, res: Response): Promise<void> => {
  try {
    const meetings = await Meeting.find();
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meetings', error: err });
  }
};
