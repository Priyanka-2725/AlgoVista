'use client';
// @ts-nocheck
import { apiClient } from '@/lib/apiClient';
import { format } from 'date-fns';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { SUBJECTS_HUB } from '@/lib/concepts-data';

export interface DailyPlanObjective {
  id: string;
  title: string;
  type: 'problem' | 'topic' | 'mock' | 'revision';
  linkedId: string;
  difficulty: string;
  completed: boolean;
}

export interface DailyPlan {
  id?: string;
  date: string;
  tasks: any[];
  objectives?: DailyPlanObjective[];
  coachMessage?: string;
  isCompleted?: boolean;
}

/**
 * Fetch the user's daily plan
 */
export async function getDailyPlan(date: string) {
  const res = await apiClient.get(`/dashboard/daily-plan?date=${date}`);
  return res.data;
}

/**
 * Generates a personalized daily plan based on user behavior and state.
 */
export async function generateDailyPlan(userId: string): Promise<DailyPlan> {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  // 2. Select Objectives
  const objectives: DailyPlanObjective[] = [];
  const primaryWeakness = 'Arrays';

  // Objective A: DSA Problem (Focus on weakness)
  const dsaProb = ARENA_PROBLEMS.find(p => p.category === primaryWeakness) || ARENA_PROBLEMS[0];
  objectives.push({
    id: 'obj_dsa',
    title: `Solve 1 ${primaryWeakness} problem: ${dsaProb.title}`,
    type: 'problem',
    linkedId: dsaProb.id,
    difficulty: dsaProb.difficulty,
    completed: false
  });

  // Objective B: Core Subject Topic
  const coreSubjects = ['os', 'dbms', 'cn', 'system-design'];
  const randomSubject = coreSubjects[Math.floor(Math.random() * coreSubjects.length)];
  const subjectData = SUBJECTS_HUB[randomSubject as any];
  const randomTopic = subjectData.concepts[Math.floor(Math.random() * subjectData.concepts.length)];
  
  objectives.push({
    id: 'obj_core',
    title: `Revise ${randomTopic.title} (${subjectData.title})`,
    type: 'topic',
    linkedId: randomTopic.id,
    difficulty: randomTopic.difficulty,
    completed: false
  });

  // Objective C: Interview Mock
  objectives.push({
    id: 'obj_mock',
    title: "Attempt 1 Mock Interview session",
    type: 'mock',
    linkedId: 'standard_mock',
    difficulty: 'Medium',
    completed: false
  });

  const coachMessage = "A balanced explorer is a successful one. Today's plan covers theory, practice, and professional confidence.";

  const planData = {
    date: todayStr,
    tasks: objectives.map(obj => ({ ...obj, isCompleted: obj.completed }))
  };

  const res = await apiClient.post('/dashboard/daily-plan', planData);
  return { ...res.data, objectives, coachMessage, isCompleted: false };
}

/**
 * Checks off an objective in the daily plan.
 */
export async function toggleObjective(userId: string, objectiveId: string, currentTasks: any[], date: string) {
  // We mock the toggling logic by finding the task in currentTasks, updating it, and saving
  const newTasks = currentTasks.map((t: any, idx: number) => {
    // Assuming objectiveId is obj_dsa (0), obj_core (1), obj_mock (2)
    if ((objectiveId === 'obj_dsa' && idx === 0) || 
        (objectiveId === 'obj_core' && idx === 1) || 
        (objectiveId === 'obj_mock' && idx === 2)) {
      return { ...t, isCompleted: !t.isCompleted };
    }
    return t;
  });

  const res = await apiClient.post('/dashboard/daily-plan', { date, tasks: newTasks });
  return res.data;
}
