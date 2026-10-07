
"use client"

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LearningProgressProps {
  activities: any[] | null;
  detailed?: boolean;
}

const CATEGORIES = ['Arrays', 'Searching', 'Sorting', 'Graph', 'Dynamic Programming', 'Greedy', 'Strings'];

export function LearningProgress({ activities, detailed }: LearningProgressProps) {
  // Aggregate category stats
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    CATEGORIES.forEach(c => stats[c] = 0);
    
    activities?.forEach(act => {
      if (act.eventType === 'problem_solved' && act.category) {
        const cat = CATEGORIES.find(c => act.category.toLowerCase().includes(c.toLowerCase()));
        if (cat) stats[cat]++;
      }
    });
    
    return stats;
  }, [activities]);

  const sortedCategories = CATEGORIES.sort((a, b) => categoryStats[b] - categoryStats[a]);

  return (
    <div className="space-y-6">
      {sortedCategories.map((cat, i) => {
        const solved = categoryStats[cat];
        const target = 10; // Target for mastery
        const percentage = Math.min(100, (solved / target) * 100);
        
        if (!detailed && solved === 0 && i > 3) return null;

        return (
          <div key={cat} className="space-y-2">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase italic tracking-tighter">{cat}</span>
                {percentage >= 100 && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[8px] uppercase">
                    MASTERED
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                {solved} / {target} PROBLEMS
              </span>
            </div>
            <div className="relative">
              <Progress value={percentage} className="h-2 bg-slate-800" />
              {detailed && solved > 0 && (
                <div className="absolute top-0 right-0 -mt-6">
                   <span className="text-[9px] font-black text-indigo-400 italic">{percentage.toFixed(0)}% COMPLETE</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
