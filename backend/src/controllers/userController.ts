import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import User from '../models/User';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEnergy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { battleEnergy } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.battleEnergy = battleEnergy;
    user.lastEnergyUpdate = new Date();
    await user.save();
    res.json({ message: 'Energy updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
