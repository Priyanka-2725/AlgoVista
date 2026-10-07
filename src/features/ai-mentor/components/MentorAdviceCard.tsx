'use client';
// @ts-nocheck

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  BrainCircuit, 
  Code2, 
  Swords, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { MentorAdvice } from '@/features/ai-mentor/services/aiMentor';
import { motion } from 'framer-motion';

interface MentorAdviceCardProps {
  advice: MentorAdvice | null;
  isLoading?: boolean;
}

const typeIcons = {
  study: MessageSquare,
  practice: Code2,
  battle: Swords,
  visualization: BrainCircuit
};

export function MentorAdviceCard({ advice, isLoading }: MentorAdviceCardProps) {
  if (isLoading) {
    return (
      <Card className="glass-card border-none bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
        <Sparkles className="text-indigo-400 animate-pulse" size={32} />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Consulting AI Mentor...</p>
      </Card>
    );
  }

  if (!advice) return null;

  const Icon = typeIcons[advice.type] || MessageSquare;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card border-none bg-indigo-600/10 border-l-4 border-l-indigo-500 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon size={80} />
        </div>
        
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Mentor Advice</span>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">{advice.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{advice.message}</p>
          </div>

          <Link href={advice.actionUrl}>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold uppercase gap-2">
              {advice.recommendedAction} <ChevronRight size={14} />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
