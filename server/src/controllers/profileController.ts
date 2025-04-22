import { Request, Response } from 'express';
import Profile from '../models/Profile';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Add more profile-related controller functions as needed
