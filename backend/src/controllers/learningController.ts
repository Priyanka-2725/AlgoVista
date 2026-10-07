import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import LearningPath from '../models/LearningPath';
import Activity from '../models/Activity';

const CATEGORIES = ['Arrays', 'Searching', 'Sorting', 'Graphs', 'Dynamic Programming', 'Greedy', 'Strings'];

export const getLearningPath = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let path = await LearningPath.findOne({ userId: req.user.id });
    if (!path) {
      path = await generateLearningPathLogic(req.user.id);
    }
    res.json({ ...path.toObject(), id: path._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const generateLearningPath = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const path = await generateLearningPathLogic(req.user.id);
    res.json({ ...path.toObject(), id: path._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const completeStep = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stepIndex } = req.body;
    const path = await LearningPath.findOne({ userId: req.user.id });
    
    if (!path) {
      res.status(404).json({ message: 'Learning path not found' });
      return;
    }

    if (!path.completedStepIndices.includes(stepIndex)) {
      path.completedStepIndices.push(stepIndex);
      
      if (stepIndex === path.currentStepIndex) {
        path.currentStepIndex += 1;
      }
      
      path.lastUpdated = new Date();
      await path.save();
    }
    
    res.json({ ...path.toObject(), id: path._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getRevisionItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Mock revision items for now
    const items = [
      { conceptId: 'arrays_intro', title: 'Arrays Fundamentals', nextReviewAt: new Date() }
    ];
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

async function generateLearningPathLogic(userId: string) {
  const activities = await Activity.find({ userId });
  const solved = 10; // Mock stat

  const steps = [
    { type: 'visualization', category: 'Searching', difficulty: 'Easy', recommendedTask: 'Binary Search visualization' },
    { type: 'problem', category: 'Arrays', difficulty: 'Easy', recommendedTask: 'Easy Array problems' },
    { type: 'practice_set', category: 'Sorting', difficulty: 'Easy', recommendedTask: 'Sorting algorithm practice' },
    { type: 'visualization', category: 'Graphs', difficulty: 'Easy', recommendedTask: 'Basic Graph BFS introduction' },
    { type: 'problem', category: 'Graphs', difficulty: 'Easy', recommendedTask: 'Practice graph problems' }
  ];

  const path = await LearningPath.findOneAndUpdate(
    { userId },
    { 
      $set: { 
        recommendedSteps: steps,
        lastUpdated: new Date()
      },
      $setOnInsert: {
        currentStepIndex: 0,
        completedStepIndices: [],
        generatedAt: new Date()
      }
    },
    { new: true, upsert: true }
  );

  return path;
}
