
"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Code2, Swords, Bot, Zap, Trophy, Flame, BrainCircuit } from 'lucide-react';

interface RecentActivityListProps {
  activities: any[] | null;
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-20 text-slate-600 font-bold italic">
        The archive is empty. Begin your journey to populate the record.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'problem_solved': return <Code2 size={16} className="text-emerald-400" />;
      case 'duel_won':
      case 'duel_lost':
      case 'duel_draw': return <Swords size={16} className="text-purple-400" />;
      case 'boss_battle_won':
      case 'boss_battle_lost': return <Bot size={16} className="text-red-400" />;
      case 'sprint_completed': return <Zap size={16} className="text-amber-400" />;
      case 'algorithm_viewed': return <BrainCircuit size={16} className="text-indigo-400" />;
      case 'profile_created': return <Trophy size={16} className="text-blue-400" />;
      default: return <Flame size={16} className="text-indigo-400" />;
    }
  };

  const getTitle = (activity: any) => {
    switch (activity.eventType) {
      case 'problem_solved': return `Solved ${activity.problemId?.replace('-', ' ')}`;
      case 'duel_won': return `Defeated opponent in Ranked Duel`;
      case 'duel_lost': return `Fell in combat during Ranked Duel`;
      case 'boss_battle_won': return `Defeated ${activity.bossName || 'AI Boss'}`;
      case 'sprint_completed': return `Completed Speed Sprint with score ${activity.score}`;
      case 'algorithm_viewed': return `Studied ${activity.algorithmName}`;
      default: return activity.eventType.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, i) => {
        const timestamp = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
        
        return (
          <Card key={i} className="glass-card border-none bg-slate-900/40 p-4 flex items-center gap-6 hover:bg-white/5 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              {getIcon(activity.eventType)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white uppercase text-sm truncate italic tracking-tight">
                {getTitle(activity)}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {activity.category || activity.eventType.split('_')[0]} • {formatDistanceToNow(timestamp, { addSuffix: true })}
              </p>
            </div>
            {activity.result === 'victory' || activity.result === 'correct' ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-none italic font-black">
                SUCCESS
              </Badge>
            ) : activity.result === 'defeat' ? (
              <Badge className="bg-red-500/20 text-red-400 border-none italic font-black">
                FAILED
              </Badge>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
