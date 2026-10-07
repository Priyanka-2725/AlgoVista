import { Request, Response } from 'express';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { AIMentorAdvice } from '../models/AIMentorAdvice';

const CATEGORIES = ['Arrays', 'Searching', 'Sorting', 'Graphs', 'Dynamic Programming', 'Greedy', 'Strings', 'DBMS', 'Operating Systems', 'System Design'];

export const getUserPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Fetch recent activities
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(200);

    const totalSolved = user.problemsSolved || 0;
    const attempts = activities.filter(a => a.eventType === 'problem_attempted' || a.eventType === 'problem_solved');
    const totalAttempts = attempts.length;
    const successRate = totalAttempts > 0 ? (totalSolved / totalAttempts) * 100 : (totalSolved > 0 ? 100 : 0);

    const categoryMap: Record<string, { attempted: number; solved: number; lastTimestamp: number }> = {};
    CATEGORIES.forEach(cat => categoryMap[cat] = { attempted: 0, solved: 0, lastTimestamp: 0 });

    activities.forEach(act => {
      const cat = act.category || (act.problemId ? act.problemId.split('-')[0] : 'General');
      const normalizedCat = CATEGORIES.find(c => cat.toLowerCase().includes(c.toLowerCase())) || 'General';
      
      if (categoryMap[normalizedCat]) {
        categoryMap[normalizedCat].attempted++;
        if (act.result === 'correct' || act.result === 'completed' || act.eventType === 'problem_solved') {
          categoryMap[normalizedCat].solved++;
        }
        const ts = new Date(act.createdAt).getTime();
        if (ts > categoryMap[normalizedCat].lastTimestamp) {
          categoryMap[normalizedCat].lastTimestamp = ts;
        }
      }
    });

    const now = Date.now();
    const topicStats = CATEGORIES.map(cat => {
      const stats = categoryMap[cat];
      const accuracy = stats.attempted > 0 ? (stats.solved / stats.attempted) * 100 : 0;
      const daysSince = stats.lastTimestamp > 0 ? (now - stats.lastTimestamp) / (1000 * 60 * 60 * 24) : 999;
      
      let level: 'strong' | 'medium' | 'weak' = 'weak';
      if (accuracy >= 80 && daysSince <= 2) level = 'strong';
      else if (accuracy >= 50 && accuracy < 80) level = 'medium';
      else level = 'weak';

      return {
        category: cat,
        solved: stats.solved,
        attempted: stats.attempted,
        accuracy,
        level,
        daysSinceLastAttempt: Math.floor(daysSince)
      };
    });

    const weakCategories = topicStats
      .filter(s => s.level === 'weak')
      .sort((a, b) => a.accuracy - b.accuracy)
      .map(s => s.category);

    const recentCount = activities.filter(a => {
      const ts = new Date(a.createdAt).getTime();
      return (now - ts) < (3 * 24 * 60 * 60 * 1000);
    }).length;

    res.json({
      successRate,
      weakCategories: weakCategories.length > 0 ? weakCategories : [CATEGORIES[0]],
      avgSolutionTime: 0,
      activityLevel: recentCount > 15 ? 'High' : recentCount > 5 ? 'Medium' : 'Low',
      streakDays: user.streakDays || 0,
      dropoutRisk: user.dropoutRisk || 0,
      totalAttempts,
      totalSolved,
      topicStats
    });
  } catch (error) {
    console.error('[aiMentorController.getUserPerformance]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const generateAdvice = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Call the same performance logic to determine advice...
    const reqProxy = { user: { id: userId } } as any;
    let performanceData: any = null;
    const resProxy = {
      status: () => resProxy,
      json: (data: any) => { performanceData = data; }
    } as any;
    
    await getUserPerformance(reqProxy, resProxy);
    if (!performanceData || performanceData.error) {
      res.status(500).json({ error: 'Failed to generate advice' });
      return;
    }

    const performance = performanceData;
    let advice;

    if (performance.dropoutRisk > 60) {
      advice = {
        title: "Confidence Booster",
        message: "You've been tackling some tough challenges lately! Try reviewing some basic visualizations to rebuild your momentum.",
        recommendedAction: "Review Visualizations",
        actionUrl: "/learn",
        type: 'visualization'
      };
    } else if (performance.weakCategories.length > 0) {
      advice = {
        title: `Stabilize: ${performance.weakCategories[0]}`,
        message: `Your data shows declining accuracy in ${performance.weakCategories[0]}. Let's resolve this before your next ranked duel.`,
        recommendedAction: "Practice Weak Topic",
        actionUrl: "/learn",
        type: 'practice'
      };
    } else {
      advice = {
        title: "Keep the Momentum",
        message: "Consistency is key to mastering algorithms. Solve one problem today to keep your streak alive!",
        recommendedAction: "Start Practice",
        actionUrl: "/battles/practice",
        type: 'study'
      };
    }

    const newAdvice = await AIMentorAdvice.create({
      userId,
      ...advice,
      category: performance.weakCategories[0] || 'General'
    });

    res.json(newAdvice);
  } catch (error) {
    console.error('[aiMentorController.generateAdvice]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
