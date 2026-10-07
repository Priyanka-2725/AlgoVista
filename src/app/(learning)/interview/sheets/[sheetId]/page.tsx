'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Circle, 
  Building2, 
  ExternalLink,
  Search,
  BookOpen,
  Zap,
  Info
} from 'lucide-react';
import { CURATED_SHEETS, COMPANY_LEVEL_PROBLEMS } from '@/lib/sheets-data';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function SheetDetailPage() {
  const { sheetId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');

  const sheet = CURATED_SHEETS.find(s => s.id === sheetId);
  const totalProblemsCount = sheet?.topics.reduce((acc, t) => acc + t.problemIds.length, 0) || 0;

  const [progressData, set_progressData] = React.useState<any>(null);
  const [userData, set_userData] = React.useState<any>(null);
  const solvedGlobal = userData?.solvedProblemIds || [];
  const solvedSheet = progressData?.solvedProblems || [];
  const combinedSolved = Array.from(new Set([...solvedGlobal, ...solvedSheet]));

  if (!sheet) return null;

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto space-y-10 pb-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="space-y-4 flex-1">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/interview/sheets')}
              className="text-slate-500 hover:text-white p-0 gap-2 font-black uppercase text-[10px] tracking-widest"
            >
              <ChevronLeft size={14} /> Back to Library
            </Button>
            <div className="space-y-2">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{sheet.title}</h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{sheet.description}</p>
            </div>
          </div>

          <Card className="w-full md:w-80 glass-card border-none bg-indigo-600/10 p-6 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest italic">Global Progress</span>
              <span className="text-2xl font-black text-white italic">{progressData?.progressPercent || 0}%</span>
            </div>
            <Progress value={progressData?.progressPercent || 0} className="h-3 bg-slate-800" />
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              <span>{combinedSolved.filter(id => sheet.topics.some(t => t.problemIds.includes(id))).length} SOLVED</span>
              <span>{totalProblemsCount} TOTAL</span>
            </div>
          </Card>
        </div>

        {/* Quick Revision Notes Section */}
        {sheet.revisionNotes && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <BookOpen className="text-amber-500" size={24} />
                <h3 className="text-xl font-black text-white uppercase italic">Revision & Pattern Guide</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sheet.revisionNotes.map((note, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                    <div className="h-6 w-6 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-[10px] font-black shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-300 italic">"{note}"</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input 
              placeholder="Filter by problem name or company..." 
              className="pl-10 bg-black/20 border-white/5 h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'solved', 'unsolved'].map((f) => (
              <Button
                key={f}
                size="sm"
                variant="ghost"
                onClick={() => setStatusFilter(f as any)}
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl transition-all",
                  statusFilter === f ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-12">
          {sheet.topics.map((topic, tIdx) => {
            const topicProblems = topic.problemIds.map(id => {
              const base = COMPANY_LEVEL_PROBLEMS.find(p => p.id === id) || ARENA_PROBLEMS.find(p => p.id === id);
              return base ? { ...base, solved: combinedSolved.includes(id) } : null;
            }).filter(Boolean);

            const filteredProblems = topicProblems.filter(p => {
              if (!p) return false;
              const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   (p as any).companies?.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()));
              const matchesStatus = statusFilter === 'all' ? true :
                                   statusFilter === 'solved' ? p.solved : !p.solved;
              return matchesSearch && matchesStatus;
            });

            if (filteredProblems.length === 0 && (searchTerm || statusFilter !== 'all')) return null;

            return (
              <div key={tIdx} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-indigo-400 italic">
                    {tIdx + 1}
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{topic.name}</h3>
                  <div className="h-px bg-slate-800 flex-1 ml-4" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    {topicProblems.filter(p => p?.solved).length} / {topicProblems.length} DONE
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredProblems.map((problem: any) => (
                    <motion.div 
                      key={problem.id}
                      whileHover={{ x: 10 }}
                      className={cn(
                        "p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group cursor-pointer",
                        problem.solved 
                          ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
                          : "bg-slate-900/40 border-white/5 hover:border-indigo-500/30"
                      )}
                      onClick={() => router.push(`/battles/practice?id=${problem.id}`)}
                    >
                      <div className="flex items-start md:items-center gap-6 flex-1 min-w-0">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors",
                          problem.solved ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-slate-800 text-slate-700 group-hover:border-indigo-500 group-hover:text-indigo-400"
                        )}>
                          {problem.solved ? <CheckCircle2 size={20} /> : <Circle size={18} />}
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h4 className={cn("font-bold uppercase italic tracking-tight truncate", problem.solved ? "text-slate-400 line-through" : "text-white")}>
                              {problem.title}
                            </h4>
                            <Badge className={cn(
                              "text-[8px] font-black uppercase border-none h-5",
                              problem.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-400" :
                              problem.difficulty === 'Medium' ? "bg-amber-500/10 text-amber-400" :
                              "bg-red-500/10 text-red-400"
                            )}>
                              {problem.difficulty}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {problem.companies?.map((c: string) => (
                              <div key={c} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] font-bold text-slate-500 uppercase">
                                <Building2 size={8} /> {c}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button size="sm" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white hover:bg-indigo-600 gap-2 ml-auto h-10 px-6">
                          Solve Challenge <ExternalLink size={12} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
