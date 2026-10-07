'use client';
// @ts-nocheck

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { SUBJECTS_HUB } from '@/lib/concepts-data';
import { cn } from '@/lib/utils';

export default function SubjectTopicsPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const subject = SUBJECTS_HUB[subjectId as string];

  if (!subject) return null;

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-10 pb-32">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/learn')}
            className="text-slate-500 hover:text-white p-0 gap-2 font-black uppercase text-[10px] tracking-widest"
          >
            <ChevronLeft size={14} /> Back to Hub
          </Button>
          <div className="flex items-center gap-6">
            <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5", subject.color)}>
              <BookOpen size={40} />
            </div>
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{subject.title}</h1>
              <p className="text-slate-400 text-lg">{subject.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {subject.concepts.length > 0 ? subject.concepts.map((concept, idx) => (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card 
                className="glass-card border-none bg-slate-900/40 p-6 hover:bg-white/5 transition-all cursor-pointer group"
                onClick={() => router.push(`/learn/concept/${concept.id}`)}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 font-black italic text-xl">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">{concept.title}</h3>
                        <Badge className={cn(
                          "text-[8px] font-black uppercase border-none",
                          concept.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-400" :
                          concept.difficulty === 'Medium' ? "bg-amber-500/10 text-amber-400" :
                          "bg-red-500/10 text-red-400"
                        )}>
                          {concept.difficulty}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-sm">{concept.shortDescription}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </motion.div>
          )) : (
            <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl space-y-4">
              <Target className="mx-auto text-slate-800" size={48} />
              <p className="text-slate-500 font-bold italic uppercase tracking-widest">The archives for this subject are still being compiled.</p>
            </div>
          )}
        </div>

        <Card className="glass-card border-none bg-slate-900/40 p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Zap size={28} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white uppercase italic">Mastery Protocol</h4>
              <p className="text-slate-500 text-sm">Completing each concept module and passing the check grants +20 XP.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Potential Rewards</p>
            <p className="text-2xl font-black text-indigo-400">+{subject.concepts.length * 20} XP</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
