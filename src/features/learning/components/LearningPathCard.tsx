'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  BrainCircuit, 
  Code2, 
  Swords, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { LearningStep, StepType, generateLearningPath } from '@/features/learning/services/learningPathGenerator';

interface LearningPathCardProps {
  step: LearningStep | null;
  totalSteps?: number;
  completedSteps?: number;
}

const typeIcons: Record<StepType, any> = {
  visualization: BrainCircuit,
  problem: Code2,
  practice_set: Zap,
  boss_battle: Swords,
  duel_challenge: Swords
};

const typeColors: Record<StepType, string> = {
  visualization: 'text-indigo-400',
  problem: 'text-emerald-400',
  practice_set: 'text-amber-400',
  boss_battle: 'text-red-400',
  duel_challenge: 'text-purple-400'
};

export function LearningPathCard({ step: initialStep, totalSteps = 5, completedSteps = 0 }: LearningPathCardProps) {
  const [step, setStep] = useState<LearningStep | null>(initialStep);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (!step) {
      const timer = setTimeout(() => {
        console.log("[Path Card] Loading timeout, showing default step.");
        setStep(generateLearningPath()[0]);
        setShowFallback(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (!step) return (
    <Card className="glass-card border-none bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[240px]">
      <Sparkles className="text-indigo-400 animate-pulse" size={32} />
      <div>
        <p className="font-bold text-white uppercase tracking-tight">Generating Roadmap...</p>
        <p className="text-xs text-slate-500 italic">Analyzing your skills to create your next step.</p>
      </div>
    </Card>
  );

  const Icon = typeIcons[step.type] || BrainCircuit;

  return (
    <Card className="glass-card border-none bg-slate-900/40 overflow-hidden group hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="text-indigo-400" size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {showFallback ? "Getting Started" : "AI Recommendation"}
          </span>
        </div>
        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 text-[9px]">
          {completedSteps} / {totalSteps} COMPLETE
        </Badge>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${typeColors[step.type] || 'text-indigo-400'}`}>
            <Icon size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{step.category}</p>
            <h3 className="text-lg font-black text-white leading-tight uppercase italic tracking-tighter truncate">
              {step.recommendedTask}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Badge className={`${
              step.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' :
              step.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            } border-none text-[10px]`}>
              {step.difficulty} Tier
            </Badge>
          </div>
          <Link href="/dashboard/learning-paths">
            <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 group/btn">
              Explore Path <ChevronRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
