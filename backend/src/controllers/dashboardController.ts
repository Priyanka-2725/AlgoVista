import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Activity from '../models/Activity';
import DailyPlan from '../models/DailyPlan';
import DailyChallenge from '../models/DailyChallenge';
import User from '../models/User';

export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activities = await Activity.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(20);
    res.json(activities.map(a => ({ ...a.toObject(), id: a._id })));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventType, xpAmount } = req.body;
    const activity = new Activity({ userId: req.user.id, eventType, xpAmount });
    await activity.save();
    
    // Also update user XP
    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: xpAmount || 0 } });
    
    res.status(201).json({ ...activity.toObject(), id: activity._id });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getDailyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const plan = await DailyPlan.findOne({ userId: req.user.id, date: date as string });
    if (!plan) {
      res.json(null);
      return;
    }
    res.json({ ...plan.toObject(), id: plan._id });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateDailyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, tasks } = req.body;
    const plan = await DailyPlan.findOneAndUpdate(
      { userId: req.user.id, date },
      { $set: { tasks } },
      { new: true, upsert: true }
    );
    res.json({ ...plan.toObject(), id: plan._id });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getDailyChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    let challenge = await DailyChallenge.findOne({ date: date as string });
    
    if (!challenge) {
      // Mock generating a challenge if one doesn't exist
      challenge = new DailyChallenge({
        title: 'Complete 3 Binary Search Problems',
        description: 'Test your searching skills today.',
        difficulty: 'medium',
        xpReward: 50,
        date: date as string
      });
      await challenge.save();
    }
    
    const isCompleted = challenge.completedBy.includes(req.user.id);
    res.json({ ...challenge.toObject(), id: challenge._id, isCompleted });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const completeDailyChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const challenge = await DailyChallenge.findById(id);
    if (!challenge) {
      res.status(404).json({ message: 'Challenge not found' });
      return;
    }
    
    if (!challenge.completedBy.includes(req.user.id)) {
      challenge.completedBy.push(req.user.id);
      await challenge.save();
      
      // Update User XP
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: challenge.xpReward } });
      
      // Add activity
      await Activity.create({ userId: req.user.id, eventType: 'challenge_completed', xpAmount: challenge.xpReward });
    }
    
    res.json({ ...challenge.toObject(), id: challenge._id, isCompleted: true });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
