
"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Code2, Swords, Bot, Zap, Clock, TrendingUp, Target } from 'lucide-react';

interface ProfileStatsGridProps {
  userData: any;
  duels: any[] | null;
  bosses: any[] | null;
  sprints: any[] | null;
}

export function ProfileStatsGrid({ userData, duels, bosses, sprints }: ProfileStatsGridProps) {
  const duelWins = duels?.filter(d => d.result === 'victory').length || 0;
  const duelWinRate = duels && duels.length > 0 ? Math.round((duelWins / duels.length) * 100) : 0;
  const sprintBest = sprints && sprints.length > 0 ? Math.max(...sprints.map(s => s.score || 0)) : 0;

  const stats = [
    {
      label: 'Problems Solved',
      value: userData?.problemsSolved || 0,
      icon: Code2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Algos Mastered',
      value: userData?.algorithmsLearned?.length || 0,
      icon: Target,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      label: 'Duels Won',
      value: `${duelWins} (${duelWinRate}%)`,
      icon: Swords,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Bosses Slain',
      value: bosses?.filter(b => b.result === 'victory').length || 0,
      icon: Bot,
      color: 'text-red-400',
      bg: 'bg-red-500/10'
    },
    {
      label: 'Sprint Best',
      value: sprintBest.toLocaleString(),
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      label: 'Avg Solve Time',
      value: '1.2m', // Simulated
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="glass-card border-none bg-slate-900/40 p-4 flex flex-col items-center text-center group hover:scale-105 transition-all">
          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} mb-3 group-hover:scale-110 transition-transform`}>
            <stat.icon size={20} />
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">{stat.label}</p>
          <p className="text-xl font-black text-white">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
