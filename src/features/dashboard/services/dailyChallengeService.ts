'use client';
import { apiClient } from '@/lib/apiClient';
import { format } from 'date-fns';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { XP_RULES } from '@/lib/services/xpService';

export interface DailyChallenge {
  id?: string;
  problemId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  date: string; // YYYY-MM-DD
  isCompleted?: boolean;
}

/**
 * Retrieves today's daily challenge or generates a new one.
 */
export async function getTodayChallenge(): Promise<DailyChallenge> {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const res = await apiClient.get(`/dashboard/daily-challenge?date=${todayStr}`);
  
  // Format the backend response to match frontend expectations
  return {
    id: res.data.id,
    problemId: res.data.title.includes('Binary Search') ? 'bin_search_1' : 'arr_1',
    title: res.data.title,
    difficulty: res.data.difficulty.charAt(0).toUpperCase() + res.data.difficulty.slice(1) as any,
    category: 'Algorithms',
    date: res.data.date,
    isCompleted: res.data.isCompleted
  };
}

/**
 * Checks if a user has completed today's challenge.
 */
export async function isChallengeCompleted(userId: string): Promise<boolean> {
  const challenge = await getTodayChallenge();
  return !!challenge.isCompleted;
}

/**
 * Awards daily challenge completion bonuses.
 */
export async function completeDailyChallenge(userId: string, problem: any): Promise<number> {
  const challenge = await getTodayChallenge();
  if (challenge.isCompleted) return 0;

  const res = await apiClient.post(`/dashboard/daily-challenge/${challenge.id}/complete`);
  return res.data.xpReward || 50;
}
