import { Request, Response } from 'express';
import { MockSession } from '../models/MockSession';

const BEHAVIORAL_QUESTIONS = [
  "Tell me about a time you faced a difficult technical challenge and how you overcame it.",
  "Describe a situation where you had a disagreement with a team member. How did you handle it?",
  "What is your greatest weakness, and what are you doing to improve it?",
  "Tell me about a project you are most proud of and why.",
  "How do you prioritize tasks when you have multiple deadlines?"
];

const TECHNICAL_QUESTIONS = [
  "Explain the difference between a process and a thread.",
  "How does a hash table work under the hood?",
  "Describe the concept of polymorphism in object-oriented programming.",
  "What is the time complexity of quicksort in the worst case, and how can you avoid it?",
  "Explain how garbage collection works in modern programming languages."
];

function getRandomQuestions(type: 'behavioral' | 'technical', count: number) {
  const pool = type === 'behavioral' ? BEHAVIORAL_QUESTIONS : TECHNICAL_QUESTIONS;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(q => ({ questionText: q }));
}

export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, role, company } = req.body;
    if (!type || !['behavioral', 'technical'].includes(type)) {
      res.status(400).json({ error: 'Invalid or missing type (must be behavioral or technical)' });
      return;
    }
    if (!role) {
      res.status(400).json({ error: 'Role is required' });
      return;
    }

    const questions = getRandomQuestions(type, 3); // 3 questions per mock

    const session = await MockSession.create({
      userId,
      type,
      role,
      company,
      questions,
      status: 'in_progress'
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('[mockInterviewController.startSession]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const sessions = await MockSession.find({ userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('[mockInterviewController.getSessions]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const session = await MockSession.findOne({ _id: req.params.id, userId });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json(session);
  } catch (error) {
    console.error('[mockInterviewController.getSessionById]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { questionIndex, answer } = req.body;
    if (questionIndex === undefined || !answer) {
      res.status(400).json({ error: 'questionIndex and answer are required' });
      return;
    }

    const session = await MockSession.findOne({ _id: req.params.id, userId });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.status === 'completed') {
      res.status(400).json({ error: 'Session is already completed' });
      return;
    }

    if (questionIndex < 0 || questionIndex >= session.questions.length) {
      res.status(400).json({ error: 'Invalid questionIndex' });
      return;
    }

    // Dummy AI feedback logic for the answer
    const lengthScore = Math.min(100, answer.length / 2);
    const score = Math.floor(lengthScore);
    let feedback = 'Good attempt.';
    if (score < 50) feedback = 'Try to provide more detail and context in your answers.';
    else if (score > 80) feedback = 'Excellent and detailed answer!';

    session.questions[questionIndex].answer = answer;
    session.questions[questionIndex].feedback = feedback;
    session.questions[questionIndex].score = score;

    await session.save();
    res.json(session);
  } catch (error) {
    console.error('[mockInterviewController.submitAnswer]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const session = await MockSession.findOne({ _id: req.params.id, userId });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.status === 'completed') {
      res.status(400).json({ error: 'Session is already completed' });
      return;
    }

    let totalScore = 0;
    let answered = 0;
    session.questions.forEach(q => {
      if (q.score !== undefined) {
        totalScore += q.score;
        answered++;
      }
    });

    session.overallScore = answered > 0 ? Math.floor(totalScore / answered) : 0;
    
    if (session.overallScore >= 80) session.overallFeedback = "Great job overall!";
    else if (session.overallScore >= 50) session.overallFeedback = "Good effort, but there's room for improvement in detailing your answers.";
    else session.overallFeedback = "You should practice more and try to elaborate your thoughts clearly.";

    session.status = 'completed';
    await session.save();
    
    res.json(session);
  } catch (error) {
    console.error('[mockInterviewController.completeSession]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
