'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy, Zap } from 'lucide-react';

interface LearningProgressTrackerProps {
  completed: number;
  total: number;
}

export function LearningProgressTracker({ completed, total }: LearningProgressTrackerProps) {
  const percentage = (completed / total) * 100;

  return (
    <div className="space-y-6 bg-white/5 rounded-2xl p-8 border border-white/5">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="text-amber-500" /> Path Mastery
          </h3>
          <p className="text-slate-500 text-sm">Your progress through the current roadmap.</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-indigo-400">{Math.round(percentage)}%</span>
        </div>
      </div>

      <Progress value={percentage} className="h-3 bg-slate-800" />

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Tasks Cleared</p>
          <p className="text-2xl font-black text-white">{completed} / {total}</p>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Mastery Level</p>
          <p className="text-2xl font-black text-emerald-400 italic">Advanced</p>
        </div>
      </div>
    </div>
  );
}
