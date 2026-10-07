'use client';
import { apiClient } from '@/lib/apiClient';

/**
 * Gets the recent activities for the user.
 */
export async function getActivities() {
  const res = await apiClient.get('/dashboard/activities');
  return res.data;
}

/**
 * Increments the solve count for the current day in the user's daily activity aggregate.
 */
export async function incrementDailySolveCount(userId: string) {
  const res = await apiClient.post('/dashboard/activities', {
    eventType: 'solve',
    xpAmount: 10
  });
  return res.data;
}
