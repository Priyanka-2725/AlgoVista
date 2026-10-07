'use client';
import { apiClient } from '@/lib/apiClient';

export type StepType = 'visualization' | 'problem' | 'practice_set' | 'boss_battle' | 'duel_challenge';
export type AlgoCategory = 'Arrays' | 'Searching' | 'Sorting' | 'Graphs' | 'Dynamic Programming' | 'Greedy' | 'Strings';

export interface LearningStep {
  type: StepType;
  category: AlgoCategory;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  recommendedTask: string;
}

export interface LearningPathData {
  id: string;
  recommendedSteps: LearningStep[];
  currentStepIndex: number;
  completedStepIndices: number[];
}

/**
 * Gets or generates the user's learning path.
 */
export async function getLearningPath(): Promise<LearningPathData> {
  const res = await apiClient.get('/learning/path');
  return res.data;
}

/**
 * Generates a personalized learning path based on the user profile.
 */
export async function generateLearningPath(): Promise<void> {
  await apiClient.post('/learning/path/generate');
}

/**
 * Marks a specific roadmap step as completed and unlocks the next.
 */
export async function completeLearningStep(stepIndex: number): Promise<void> {
  await apiClient.post('/learning/path/complete-step', { stepIndex });
}
