'use client';
import { apiClient } from '@/lib/apiClient';

export type TaskType = 'topic' | 'problem' | 'mock' | 'revision' | 'general';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  type: TaskType;
  linkedId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt?: any;
  dueDate?: any;
  delayed?: boolean;
  xpAwarded?: number;
}

/**
 * Checks if a task is delayed (pending and > 2 days old).
 */
export function checkTaskDelay(createdAt: any, status: TaskStatus): boolean {
  if (status === 'completed' || !createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 2;
}

/**
 * Fetch all tasks
 */
export async function getTasks() {
  const res = await apiClient.get('/todos');
  return res.data;
}

/**
 * Adds a new task to the user's mission log.
 */
export async function addTask(userId: string, task: Omit<Task, 'createdAt' | 'delayed' | 'xpAwarded' | 'status'>) {
  const payload = {
    ...task,
    status: 'pending',
  };
  const res = await apiClient.post('/todos', payload);
  return res.data;
}

/**
 * Toggles task status and awards XP if completed.
 */
export async function toggleTaskStatus(userId: string, taskId: string, currentStatus: TaskStatus) {
  const newStatus: TaskStatus = currentStatus === 'pending' ? 'completed' : 'pending';
  const res = await apiClient.put(`/todos/${taskId}`, { isCompleted: newStatus === 'completed' });
  return res.data;
}

/**
 * Deletes a task.
 */
export async function deleteTask(userId: string, taskId: string) {
  const res = await apiClient.delete(`/todos/${taskId}`);
  return res.data;
}

/**
 * Auto-generates suggested tasks based on weak topics and revision queue.
 */
export async function generateSuggestedMissions(userId: string) {
  console.log('generateSuggestedMissions called (not implemented in backend yet)');
}
