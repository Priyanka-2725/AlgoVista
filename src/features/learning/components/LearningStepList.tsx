'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LearningStep, StepType } from '@/features/learning/services/learningPathGenerator';
import { CheckCircle2, Circle, BrainCircuit, Code2, Swords, Zap, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface LearningStepListProps {
  steps: LearningStep[];
  currentStepIndex: number;
  completedStepIndices: number[];
}

const typeIcons: Record<StepType, any> = {
  visualization: BrainCircuit,
  problem: Code2,
  practice_set: Zap,
  boss_battle: Swords,
  duel_challenge: Swords
};

export function LearningStepList({ steps, currentStepIndex, completedStepIndices }: LearningStepListProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, idx) => {
        const Icon = typeIcons[step.type];
        const isCompleted = completedStepIndices.includes(idx);
        const isCurrent = idx === currentStepIndex;
        const isLocked = idx > currentStepIndex;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "p-4 rounded-xl border flex items-center gap-4 transition-all relative overflow-hidden",
              isCurrent 
                ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)] ring-1 ring-indigo-500/50" 
                : isCompleted 
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-white/5 border-white/5 opacity-50"
            )}
          >
            {isCurrent && (
              <motion.div 
                className="absolute inset-0 bg-indigo-500/5"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center border-2 shrink-0 relative z-10",
              isCompleted ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
              isCurrent ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" :
              "border-slate-700 text-slate-600"
            )}>
              {isCompleted ? <CheckCircle2 size={20} /> : 
               isLocked ? <Lock size={16} /> :
               <Circle size={16} className="fill-indigo-500" />}
            </div>

            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={isCurrent ? "text-indigo-400" : isCompleted ? "text-emerald-400" : "text-slate-500"} />
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isCurrent ? "text-indigo-400" : isCompleted ? "text-emerald-400" : "text-slate-500"
                )}>
                  {step.type.replace('_', ' ')}
                </span>
                {isCurrent && (
                  <span className="text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black animate-pulse">ACTIVE</span>
                )}
              </div>
              <h4 className={cn("font-bold truncate", isCompleted ? "text-slate-400 line-through" : "text-white")}>
                {step.recommendedTask}
              </h4>
              <p className="text-[10px] text-slate-500 uppercase font-black">{step.category} • {step.difficulty}</p>
            </div>

            {isCurrent && (
              <Link href={step.type === 'visualization' ? '/learn' : step.type === 'boss_battle' ? '/battles/boss-arena' : '/battles/practice'} className="relative z-10">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase h-8 shadow-lg">
                  Launch <ChevronRight size={12} className="ml-1" />
                </Button>
              </Link>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
