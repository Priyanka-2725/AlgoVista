import { Request, Response } from 'express';
import User from '../models/User';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const leaders = await User.find({}).sort({ xp: -1 }).limit(50);
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
