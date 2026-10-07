
export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Legend';

export const getRankTier = (rating: number): RankTier => {
  if (rating < 1000) return 'Bronze';
  if (rating < 1200) return 'Silver';
  if (rating < 1500) return 'Gold';
  if (rating < 1800) return 'Platinum';
  if (rating < 2100) return 'Diamond';
  return 'Legend';
};

export const getRankColor = (tier: RankTier): string => {
  switch (tier) {
    case 'Bronze': return 'text-orange-700 bg-orange-700/10 border-orange-700/20';
    case 'Silver': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    case 'Gold': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'Platinum': return 'text-teal-400 bg-teal-400/10 border-teal-400/20';
    case 'Diamond': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'Legend': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  }
};
