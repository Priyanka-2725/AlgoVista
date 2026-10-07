import { Request, Response } from 'express';
import { ArenaSession } from '../models/ArenaSession';

export const startArena = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { problemIds, weakTopicSelected } = req.body;
    
    const session = await ArenaSession.create({
      userId,
      problemIds,
      weakTopicSelected,
      status: 'active'
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('[arenaController.startArena]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getArenaSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const session = await ArenaSession.findOne({ _id: req.params.id, userId });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    // Just a dummy endpoint to accept snapshots and not crash
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeArena = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { feedback, submissions } = req.body;
    
    const session = await ArenaSession.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status: 'completed', feedback, submissions },
      { new: true }
    );
    
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
