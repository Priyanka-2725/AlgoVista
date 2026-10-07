'use client';
// @ts-nocheck

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  Zap, 
  ChevronLeft, 
  Swords, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Play,
  BrainCircuit,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { COMPANY_LEVEL_PROBLEMS } from '@/lib/sheets-data';
import { analyzeUserPerformance } from '@/features/ai-mentor/services/aiMentor';

export default function MockInterviewLobby() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const startMock = async () => {
    if (!user) {
      console.error("[Mock Arena] User or DB not initialized");
      return;
    }
    setLoading(true);
    
    try {
      // 1. Try to analyze performance, but don't let it crash the whole process
      let weakCategory = 'Arrays';
      try {
        const perfReq = await apiClient.get('/api/ai-mentor/performance'); const perf = perfReq.data;
        weakCategory = perf.weakCategories[0] || 'Arrays';
      } catch (perfErr) {
        console.warn("[Mock Arena] Performance analysis failed, using default category:", perfErr);
      }
      
      // CRITICAL: Only pick problems that have full technical data (starterCode, testCases)
      const allProblems = [...ARENA_PROBLEMS, ...COMPANY_LEVEL_PROBLEMS].filter(p => !!(p as any).starterCode);
      
      // 2. Select Medium from Weak Category
      const mediumWeak = allProblems.filter(p => p.difficulty === 'Medium' && (p.category === weakCategory || (p as any).topic === weakCategory));
      const mediumFallback = allProblems.filter(p => p.difficulty === 'Medium');
      const p1 = mediumWeak.length > 0 
        ? mediumWeak[Math.floor(Math.random() * mediumWeak.length)] 
        : (mediumFallback.length > 0 ? mediumFallback[Math.floor(Math.random() * mediumFallback.length)] : allProblems.find(p => p.difficulty === 'Easy'));

      // 3. Select Hard (Random or High Signal)
      const hards = allProblems.filter(p => p.difficulty === 'Hard');
      const p2 = hards.length > 0 ? hards[Math.floor(Math.random() * hards.length)] : (allProblems.find(p => p.difficulty === 'Medium') || allProblems[0]);

      if (!p1 || !p2) {
        throw new Error("Insufficient executable problems found in the arena database.");
      }

      const problemIds = [p1.id, p2.id];

      // 4. Create Session
      const sessionData = {
        userId: user.uid,
        problemIds,
        status: 'active',
        startTime: serverTimestamp(),
        timeLeft: 2700, // 45 minutes
        score: 0,
        weakTopicSelected: weakCategory,
        createdAt: serverTimestamp()
      };

      

      const arenaReq = await apiClient.post('/api/arena/start', {
        problemIds,
        weakTopicSelected: weakCategory
      });
      router.push(`/interview/mock/${arenaReq.data._id}`);
    } catch (e: any) {
      console.error("[Mock Arena] Deployment failure:", e);
      toast({ 
        variant: "destructive", 
        title: "Arena Deployment Failed", 
        description: e.message || "The logic core is unstable. Try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/interview')} className="text-slate-400">
              <ChevronLeft size={24} />
            </Button>
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Mock Interview Arena</h1>
              <p className="text-slate-400 text-lg">High-stakes simulation. AI-driven evaluation.</p>
            </div>
          </div>
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 px-4 py-1.5 font-black uppercase italic">
            Ranked Simulation
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass-card border-none bg-slate-900/40 p-10 space-y-10">
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                <Swords className="text-indigo-500" /> Arena Protocol
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { text: '45 Minute Hard Countdown', icon: Timer, desc: 'Session auto-closes when time expires.' },
                  { text: 'AI Interaction Required', icon: BrainCircuit, desc: 'Interviewer will prompt for approach and logic.' },
                  { text: 'Sequential Solving', icon: TrendingUp, desc: 'Complete Medium before attempting Hard.' },
                  { text: 'Locked Environment', icon: Lock, desc: 'External resources are detected by logic monitors.' }
                ].map((rule, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <rule.icon size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{rule.text}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button 
                onClick={startMock}
                disabled={loading}
                className="w-full h-20 bg-indigo-600 hover:bg-indigo-500 text-2xl font-black italic shadow-[0_0_50px_rgba(99,102,241,0.3)] rounded-2xl group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loading ? 'INITIALIZING ARENA...' : 'ENTER MOCK ARENA'}
                <Play size={24} className="ml-3 fill-current" />
              </Button>
            </div>
          </Card>

          <div className="space-y-8">
            <Card className="glass-card border-none bg-indigo-600/10 p-8 space-y-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckCircle2 size={24} />
                <h4 className="text-lg font-black uppercase tracking-tighter italic">Combat Rewards</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Completion</span>
                  <span className="text-xl font-black text-white">+100 XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Top 10% Score</span>
                  <span className="text-xl font-black text-emerald-400">+50 XP</span>
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-[10px] font-black uppercase text-amber-400 mb-1">Badge Unlocked</p>
                  <p className="text-sm font-bold text-slate-200">Interview Readiness Badge</p>
                </div>
              </div>
            </Card>

            <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Fair Play Directive</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold text-center italic">
                Closing the arena or switching tabs excessively will trigger a "Behavioral Failure" flag. Maintain focus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
