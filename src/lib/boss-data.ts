
export type BossTier = 'Bronze' | 'Silver' | 'Legendary';

export interface Boss {
  id: string;
  name: string;
  tier: BossTier;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  avatar: string;
  solveTimeRange: [number, number]; // seconds
  errorChance: number; // 0 to 1
  rewardXP: number;
  achievement: string;
  color: string;
  unlockLevel: number;
}

export const BOSSES: Boss[] = [
  {
    id: 'bronze-bot',
    name: 'Bronze Bot',
    tier: 'Bronze',
    difficulty: 'Easy',
    description: 'A basic parsing unit that follows standard logic patterns. Prone to syntax jitter.',
    avatar: '🤖',
    solveTimeRange: [60, 120],
    errorChance: 0.2,
    rewardXP: 50,
    achievement: 'Boss Slayer',
    color: 'from-orange-400 to-orange-700',
    unlockLevel: 1
  },
  {
    id: 'silver-strategist',
    name: 'Silver Strategist',
    tier: 'Silver',
    difficulty: 'Medium',
    description: 'Analyzes algorithms with ruthless efficiency. Rarely makes mistakes in flow control.',
    avatar: '🛡️',
    solveTimeRange: [45, 90],
    errorChance: 0.1,
    rewardXP: 120,
    achievement: 'Strategist Conqueror',
    color: 'from-slate-300 to-slate-500',
    unlockLevel: 1
  },
  {
    id: 'legendary-overlord',
    name: 'Legendary Overlord',
    tier: 'Legendary',
    difficulty: 'Hard',
    description: 'The pinnacle of algorithmic perfection. Operates at near-instantaneous speed.',
    avatar: '👑',
    solveTimeRange: [30, 60],
    errorChance: 0.05,
    rewardXP: 250,
    achievement: 'Algorithm Overlord',
    color: 'from-yellow-400 to-amber-600',
    unlockLevel: 5
  }
];
