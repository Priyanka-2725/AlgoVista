


export const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 50)) || 1;
};

export const XP_RULES = {
  ALGORITHM_VIEWED: 10,
  PROBLEM_SOLVED: 20,
  BATTLE_WIN: 100,
  BATTLE_PARTICIPATION: 30,
  SESSION_COMPLETION: 20,
  // Daily Rewards
  DAILY_CHALLENGE_EASY: 30,
  DAILY_CHALLENGE_MEDIUM: 50,
  DAILY_CHALLENGE_HARD: 80,
  // Streak Bonuses
  STREAK_3_DAY: 20,
  STREAK_7_DAY: 50,
  STREAK_30_DAY: 200,
};

export interface UserStats {
  xp: number;
  level: number;
  streakDays: number;
  maxStreak: number;
  lastSolvedDate?: string; // YYYY-MM-DD
  algorithmsLearned: string[];
  problemsSolved: number;
  skillRating: number;
  dropoutRisk: number;
  battleEnergy: number;
  lastEnergyUpdate: string; // ISO string or serverTimestamp
  integrityScore: number;
  flaggedSubmissions: number;
  solvedProblemIds: string[];
}

export const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  streakDays: 0,
  maxStreak: 0,
  algorithmsLearned: [],
  problemsSolved: 0,
  skillRating: 1000,
  dropoutRisk: 0,
  battleEnergy: 10,
  lastEnergyUpdate: new Date().toISOString(),
  integrityScore: 100,
  flaggedSubmissions: 0,
  solvedProblemIds: [],
};
