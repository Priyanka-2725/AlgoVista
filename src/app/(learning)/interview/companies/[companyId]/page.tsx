'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  Target, 
  Zap, 
  BrainCircuit, 
  CheckCircle2, 
  Circle,
  Building2,
  TrendingUp,
  Info,
  Filter,
  Swords,
  Play
} from 'lucide-react';
import { COMPANIES } from '@/lib/companies-data';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { COMPANY_LEVEL_PROBLEMS } from '@/lib/sheets-data';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { getRecommendedCompanyProblems, calculateCompanyReadiness, ScoredProblem } from '@/features/learning/services/companyService';
import { analyzeUserPerformance, PerformanceSummary } from '@/features/ai-mentor/services/aiMentor';
import { cn } from '@/lib/utils';

export default function CompanyPrepDetailPage() {
  const { companyId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  

  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [filterTopic, setFilterTopic] = useState('all');
  const [showSolved, setShowSolved] = useState(true);

  const company = COMPANIES.find(c => c.id === companyId);
  
  // Deduplicate problems by ID
  const allProblems = React.useMemo(() => {
    const map = new Map();
    [...ARENA_PROBLEMS, ...COMPANY_LEVEL_PROBLEMS].forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }, []);

  
  const [userData , set_userData ] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => set_userData(res.data)).catch(console.error);
    }
  }, [user]);

  const solvedIds = userData?.solvedProblemIds || [];

  useEffect(() => {
    if (user) {
      apiClient.get('/api/ai-mentor/performance').then(res => setPerformance(res.data));
    }
  }, [user]);

  if (!company) return null;

  const recommendedProblems = getRecommendedCompanyProblems(company, allProblems, performance, solvedIds)
    .filter(p => filterTopic === 'all' || p.category === filterTopic)
    .filter(p => showSolved || !p.solved);

  const readiness = calculateCompanyReadiness(company, solvedIds, allProblems);
  const topics = Array.from(new Set(allProblems.map(p => p.category)));

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto space-y-10 pb-32">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
          <div className="space-y-4 flex-1">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/interview/companies')}
              className="text-slate-500 hover:text-white p-0 gap-2 font-black uppercase text-[10px] tracking-widest"
            >
              <ChevronLeft size={14} /> Back to Directory
            </Button>
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center p-4">
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{company.name} Workspace</h1>
                <p className="text-slate-400 text-lg max-w-xl">{company.description}</p>
              </div>
            </div>
          </div>

          <Card className="w-full lg:w-80 glass-card border-none bg-emerald-500/10 p-8 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest italic">Interview Readiness</p>
                <h3 className="text-4xl font-black text-white italic">{readiness}%</h3>
              </div>
              <TrendingUp className="text-emerald-400 mb-1" size={32} />
            </div>
            <Progress value={readiness} className="h-2 bg-slate-800" />
            <Button 
              onClick={() => router.push('/interview/mock')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 font-black italic uppercase text-[10px] h-10 shadow-lg"
            >
              <Swords size={14} className="mr-2" /> Start {company.name} Mock
            </Button>
          </Card>
        </div>

        {/* Priority Topics Sidebar & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <Card className="glass-card border-none bg-slate-900/40 p-6 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Target size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">Hiring Focus</h3>
              </div>
              <div className="space-y-4">
                {company.priorityTopics.map((pt) => (
                  <div key={pt.topic} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase">
                      <span className="text-white">{pt.topic}</span>
                      <span className="text-slate-500">{Math.round(pt.weight * 100)}% WEIGHT</span>
                    </div>
                    <Progress value={pt.weight * 100} className="h-1 bg-slate-800" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card border-none bg-indigo-600/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400">
                <BrainCircuit size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest italic">AI Strategy</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Based on your recent attempts, we've prioritized <span className="text-white font-bold">{performance?.weakCategories[0] || 'Graphs'}</span> challenges. These are frequently used in {company.name}'s L4/L5 coding rounds."
              </p>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5 items-center">
              <div className="flex items-center gap-2 text-slate-500 mr-4">
                <Filter size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
              </div>
              <select 
                className="bg-black/40 border-none text-[10px] rounded-lg px-4 h-9 text-slate-300 uppercase font-black outline-none"
                value={filterTopic}
                onChange={(e) => setFilterTopic(e.target.value)}
              >
                <option value="all">All Topics</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSolved(!showSolved)}
                className={cn(
                  "text-[10px] font-black uppercase h-9 px-4 rounded-lg",
                  showSolved ? "bg-indigo-600/10 text-indigo-400" : "text-slate-500"
                )}
              >
                {showSolved ? 'Showing Solved' : 'Hiding Solved'}
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {recommendedProblems.map((problem, idx) => (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    layout
                  >
                    <Card 
                      className={cn(
                        "glass-card border-none overflow-hidden transition-all group cursor-pointer",
                        problem.solved ? "bg-white/5 opacity-60" : "bg-slate-900/40 hover:bg-white/5"
                      )}
                      onClick={() => router.push(`/battles/practice?id=${problem.id}`)}
                    >
                      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center border-2 shrink-0 transition-all",
                          problem.solved ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-black/20 border-white/5 text-slate-700 group-hover:border-indigo-500 group-hover:text-indigo-400"
                        )}>
                          {problem.solved ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className={cn("text-lg font-black uppercase italic tracking-tighter", problem.solved ? "text-slate-500" : "text-white")}>
                              {problem.title}
                            </h4>
                            <Badge className={cn(
                              "text-[8px] font-black uppercase border-none",
                              problem.priorityLabel === 'High Priority 🔥' ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-slate-500"
                            )}>
                              {problem.priorityLabel}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>{problem.category}</span>
                            <span>•</span>
                            <span className={cn(
                              problem.difficulty === 'Easy' ? 'text-emerald-400' : 
                              problem.difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                            )}>{problem.difficulty}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="hidden lg:block text-right mr-4">
                            <p className="text-[9px] font-black text-indigo-400 uppercase italic">Why this?</p>
                            <p className="text-[10px] text-slate-500 max-w-[150px] leading-tight line-clamp-2">
                              {problem.reason}
                            </p>
                          </div>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase h-10 px-6 ml-auto">
                            Deploy <Play size={12} className="ml-2 fill-current" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {recommendedProblems.length === 0 && (
                <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl space-y-4">
                  <Target className="mx-auto text-slate-800" size={48} />
                  <p className="text-slate-500 font-bold italic uppercase tracking-widest">No challenges found matching your current filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
