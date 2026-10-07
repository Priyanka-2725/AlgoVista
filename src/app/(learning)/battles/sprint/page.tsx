// @ts-nocheck
"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Zap, Flame, Terminal, Code2, Lightbulb, AlertTriangle, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Editor } from '@monaco-editor/react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { submitCodeToJudge, SubmissionResult } from '@/lib/services/judgeService';
import { useToast } from '@/hooks/use-toast';
import { Problem } from '@/features/learning/components/ProblemList';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { useAnalytics } from '@/hooks/use-analytics';

type GameStatus = 'idle' | 'playing' | 'finished';

export default function SpeedSprintPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const [status, setStatus] = useState<GameStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(300); 
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [multiplier, setMultiplier] = useState(1.0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [personalBest, setPersonalBest] = useState(0);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [sessionDocId, setSessionDocId] = useState<string | null>(null);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const problemStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!user) return;
    const fetchBest = async () => {
      
      const snap = await getDocs(q);
      if (!snap.empty) setPersonalBest(Math.max(...snap.docs.map(d => d.data().score || 0)));
    };
    fetchBest();
  }, [user]);

  const handleGameOver = useCallback(async () => {
    setStatus('finished');
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (!user || !sessionDocId) return;
    const xpGained = Math.floor(score / 20);
    trackEvent('speed_sprint_completed', { battleMode: 'Speed Sprint', xpEarned: xpGained });
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
  }, [user, score, problemsSolved, sessionDocId, trackEvent]);

  useEffect(() => {
    if (status === 'playing') {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { handleGameOver(); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => { if (gameTimerRef.current) clearInterval(gameTimerRef.current); };
  }, [status, handleGameOver]);

  const loadNextProblem = async () => {
    const next = ARENA_PROBLEMS.filter(p => !solvedIds.includes(p.id))[0] || ARENA_PROBLEMS[0];
    setCurrentProblem(next);
    setCode(next.starterCode[language] || "");
    problemStartTimeRef.current = Date.now();
    setShowHint(false);
  };

  const startSprint = async () => {
    if (!user) return;
    
    setSessionDocId(sessionRef.id);
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    setStatus('playing'); setScore(0); setCombo(1); setMultiplier(1.0); setProblemsSolved(0); setTimeLeft(300); setSolvedIds([]);
    loadNextProblem();
    trackEvent('speed_sprint_started', { battleMode: 'Speed Sprint' });
  };

  const handleSubmit = async () => {
    if (!currentProblem || isSubmitting || status !== 'playing' || !user) return;
    setIsSubmitting(true); setLastResult(null);
    try {
      const result = await submitCodeToJudge(code, language, currentProblem, 'submit');
      setLastResult(result);
      if (result.status === 'Accepted') {
        const points = currentProblem.difficulty === 'Easy' ? 100 : currentProblem.difficulty === 'Medium' ? 200 : 400;
        const finalPoints = Math.round(points * multiplier);
        setScore(s => s + finalPoints); setProblemsSolved(p => p + 1); setSolvedIds(prev => [...prev, currentProblem.id]);
        setCombo(c => c + 1); setMultiplier(combo >= 4 ? 2.0 : combo >= 2 ? 1.5 : 1.0);
        toast({ title: "SOLVED!", description: `+${finalPoints} Points!` });
        loadNextProblem();
      } else { setCombo(1); setMultiplier(1.0); toast({ variant: "destructive", title: "WRONG" }); }
    } catch (e) { toast({ variant: "destructive", title: "Judge Error" }); } finally { setIsSubmitting(false); }
  };

  if (status === 'idle') return <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6"><Card className="max-w-xl w-full glass-card border-none bg-slate-900/60 p-12 text-center space-y-8"><Zap size={48} className="mx-auto text-indigo-500" /><h1 className="text-5xl font-black italic text-white uppercase">Speed Sprint</h1><Button onClick={startSprint} className="w-full h-16 text-xl font-black bg-indigo-600 italic">START SPRINT</Button></Card></div>;
  if (status === 'finished') return <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6"><Card className="glass-card border-none bg-slate-900/60 p-12 text-center space-y-8"><Award size={64} className="mx-auto text-amber-500" /><h2 className="text-5xl font-black italic text-white">COMPLETE</h2><div className="text-6xl font-black text-indigo-400">{score.toLocaleString()}</div><Button onClick={startSprint} className="w-full h-14 bg-indigo-600 uppercase font-bold">Try Again</Button></Card></div>;

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      <header className="h-20 bg-slate-900/80 border-b border-indigo-500/20 px-8 flex items-center justify-between backdrop-blur-md z-10"><div className="flex gap-8"><div className="flex flex-col"><span className="text-[10px] uppercase font-black text-slate-500">Score</span><span className="text-3xl font-black text-indigo-400">{score.toLocaleString()}</span></div><div className="flex flex-col"><span className="text-[10px] uppercase font-black text-slate-500">Solved</span><span className="text-3xl font-black text-white">{problemsSolved}</span></div></div><div className="flex flex-col items-center"><div className={`flex items-center gap-2 text-3xl font-mono font-black px-8 py-2 rounded-full border ${timeLeft < 30 ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}><Timer size={28} />{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div></div><div className="flex flex-col items-end"><span className="text-[10px] uppercase font-black text-amber-500">Combo</span><div className="flex items-center gap-2"><Flame size={20} className={multiplier > 1.5 ? 'text-red-500 fill-red-500' : 'text-amber-500 fill-amber-500'} /><span className="text-3xl font-black">{multiplier}x</span></div></div></header>
      <main className="flex-1 flex overflow-hidden">
        <section className="w-1/3 border-r border-white/5 bg-slate-950/30 overflow-y-auto p-8 space-y-8"><div className="space-y-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-indigo-400"><Code2 size={20} /><h3 className="font-bold uppercase tracking-wider text-sm">Challenge {problemsSolved + 1}</h3></div><Badge className="bg-indigo-600/20 border-none">{currentProblem?.difficulty}</Badge></div><h2 className="text-2xl font-black text-white">{currentProblem?.title}</h2><p className="text-slate-400 text-sm">{currentProblem?.description}</p></div></section>
        <section className="flex-1 flex flex-col bg-[#1e1e1e]"><div className="flex-1 relative"><Editor height="100%" theme="vs-dark" language={language} value={code} onChange={v => setCode(v || "")} options={{ fontSize: 14, fontFamily: 'Fira Code', minimap: { enabled: false }, padding: { top: 20 } }} /></div><div className="h-64 bg-slate-900 border-t border-indigo-500/20 flex flex-col overflow-hidden"><div className="h-12 bg-black/40 border-b border-white/5 flex items-center justify-between px-6"><Terminal size={14} className="text-emerald-400" /><Button size="sm" className="h-8 text-[10px] uppercase font-black bg-indigo-600 hover:bg-indigo-500 px-8" onClick={handleSubmit} disabled={isSubmitting}>Submit</Button></div><div className="flex-1 p-6 font-mono text-xs overflow-y-auto">{lastResult ? <div className="space-y-3"><div className={`flex items-center gap-2 font-black ${lastResult.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>{lastResult.status.toUpperCase()}</div><p className="text-slate-500">Passed {lastResult.passedCount} / {lastResult.totalTestCases} cases.</p></div> : <div className="text-slate-600 italic">Ready.</div>}</div></div></section>
      </main>
    </div>
  );
}
