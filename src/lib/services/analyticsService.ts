'use client';
import { apiClient } from '@/lib/apiClient';

/**
 * Generic API wrapper replacing Backend logic.
 * You may need to adjust the function signatures based on exact UI usage.
 */
export async function genericGet(endpoint: string) {
  try {
    const res = await apiClient.get(endpoint);
    return res.data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

export async function genericPost(endpoint: string, data: any) {
  try {
    const res = await apiClient.post(endpoint, data);
    return res.data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

export async function genericPut(endpoint: string, data: any) {
  try {
    const res = await apiClient.put(endpoint, data);
    return res.data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

export async function genericDelete(endpoint: string) {
  try {
    const res = await apiClient.delete(endpoint);
    return res.data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

export type AnalyticsEventType = 
  | 'algorithm_viewed'
  | 'problem_attempted'
  | 'problem_solved'
  | 'duel_started'
  | 'duel_won'
  | 'duel_lost'
  | 'boss_battle_started'
  | 'boss_battle_won'
  | 'speed_sprint_started'
  | 'speed_sprint_completed'
  | 'mistake_pattern_detected'
  | 'behavioral_session_completed'
  | 'resume_interview_completed'
  | 'mock_interview_completed';

export interface AnalyticsLog {
  userID: string;
  eventType: AnalyticsEventType;
  sessionID?: string;
  sessionDuration?: number;
  problemDifficulty?: string;
  problemId?: string;
  category?: string;
  solveTime?: number;
  submissionResult?: string;
  xpEarned?: number;
  isFirstTry?: boolean;
}

/**
 * Logs a behavioral event to the userAnalytics collection.
 */

export async function logAnalyticsEvent(...args: any[]) {
  console.warn('logAnalyticsEvent is now using API client. Implement exact logic on backend.');
  return genericPost('/api/logAnalyticsEvent', { args });
}

export async function createSessionDoc(...args: any[]) {
  console.warn('createSessionDoc is now using API client. Implement exact logic on backend.');
  return genericPost('/api/createSessionDoc', { args });
}

export async function updateSessionStats(...args: any[]) {
  console.warn('updateSessionStats is now using API client. Implement exact logic on backend.');
  return genericPost('/api/updateSessionStats', { args });
}

export async function closeSession(...args: any[]) {
  console.warn('closeSession is now using API client. Implement exact logic on backend.');
  return genericPost('/api/closeSession', { args });
}

