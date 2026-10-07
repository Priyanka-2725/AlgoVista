'use client';

import { apiClient } from '@/lib/apiClient';

/**
 * Updates user streak logic and awards milestone bonuses via backend API.
 */
export async function updateStreak(userId?: string): Promise<{ newStreak: number; bonusXP: number }> {
  try {
    const res = await apiClient.post('/api/users/update-streak');
    return { newStreak: res.data.newStreak || 0, bonusXP: res.data.bonusXP || 0 };
  } catch (error) {
    console.error('Failed to update streak:', error);
    return { newStreak: 0, bonusXP: 0 };
  }
}
