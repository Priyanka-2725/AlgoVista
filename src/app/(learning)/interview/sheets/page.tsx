'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronRight, Zap, Target, Trophy, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { CURATED_SHEETS } from '@/lib/sheets-data';
import { cn } from '@/lib/utils';

export default function CuratedSheetsPage() {
  const { user } = useAuth();
  

  
    

  const [allProgress , set_allProgress ] = React.useState<any[]>([]);

  const getProgressForSheet = (sheetId: string) => {
    const progress = allProgress?.find(p => p.sheetId === sheetId);
    return progress?.progressPercent || 0;
  };

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <BookOpen size={32} className="text-indigo-500" />
            </div>
            <div>
              <h1 className="text-5xl font-black font-headline tracking-tighter italic text-white uppercase">Curated Study Sheets</h1>
              <p className="text-slate-400 text-lg">Master technical interviews with structured, high-signal problem sets.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CURATED_SHEETS.map((sheet, idx) => {
            const progress = getProgressForSheet(sheet.id);
            const totalProblems = sheet.topics.reduce((acc, t) => acc + t.problemIds.length, 0);

            return (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={`/interview/sheets/${sheet.id}`}>
                  <Card className="glass-card border-none bg-slate-900/40 h-full hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] transition-all group cursor-pointer overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Trophy size={120} />
                    </div>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="outline" className={cn(
                          "italic font-black border-none uppercase text-[10px]",
                          sheet.level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                          sheet.level === 'Intermediate' ? 'bg-indigo-500/10 text-indigo-400' :
                          'bg-red-500/10 text-red-400'
                        )}>
                          {sheet.level} Path
                        </Badge>
                        <CardTitle className="text-3xl font-black text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
                          {sheet.title}
                        </CardTitle>
                      </div>
                      <div className="h-14 w-14 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col items-center justify-center text-indigo-400">
                        <span className="text-xl font-black">{totalProblems}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest">Items</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {sheet.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mastery Level</span>
                          <span className="text-xs font-black text-indigo-400 italic">{progress}% COMPLETE</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-800" />
                      </div>

                      <div className="flex items-center text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em]">
                        ACCESS PROTOCOL <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass-card border-none bg-slate-900/40 p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Target size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic">Placement Algorithm</h3>
                <p className="text-slate-400 text-sm">Our sheets are indexed by current hiring trends at FAANG+ companies.</p>
              </div>
            </div>
            <Badge className="bg-indigo-600 text-white font-black italic px-4 py-1">LIVE DATA</Badge>
          </Card>

          <Card className="glass-card border-none bg-indigo-600/10 p-8 text-center space-y-4">
            <Zap className="mx-auto text-indigo-400" size={32} />
            <h3 className="text-lg font-black text-white uppercase italic">Auto-Sync</h3>
            <p className="text-xs text-slate-400">Solving any problem in the Arena automatically updates your sheet progress.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
