// @ts-nocheck

"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Timer, 
  Code2, 
  Terminal, 
  Bot, 
  User, 
  Swords, 
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trophy,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { BOSSES, Boss } from '@/lib/boss-data';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { submitCodeToJudge, SubmissionResult } from '@/lib/services/judgeService';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import { adaptDifficulty } from '@/features/learning/services/difficultyAdapter';
import { incrementDailySolveCount } from '@/features/dashboard/services/activityService';

const LANGUAGES = [
  { id: 'python', name: 'Python 3', starter: 'def solution(input_data):\n    # Write logic here\n    return 0' },
  { id: 'java', name: 'Java 17', starter: 'class Solution {\n    public int solution(Object input) {\n        return 0;\n    }\n}' },
  { id: 'cpp', name: 'C++ 20', starter: 'int solution(vector<int>& nums) {\n    return 0;\n}' },
  { id: 'javascript', name: 'JavaScript', starter: 'function solution(data) {\n    return 0;\n}' }
];

type BattleState = 'starting' | 'playing' | 'result';
type Winner = 'player' | 'boss' | 'draw' | null;

export default function BossBattlePage() {
  const { bossId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const boss = BOSSES.find(b => b.id === bossId);
  const problem = React.useMemo(() => {
    const pool = ARENA_PROBLEMS.filter(p => p.difficulty === boss?.difficulty);
    return pool[Math.floor(Math.random() * pool.length)] || ARENA_PROBLEMS[0];
  }, [boss]);

  const [battleState, setBattleState] = useState<BattleState>('starting');
  const [winner, setWinner] = useState<Winner>(null);
  const [playerCode, setPlayerCode] = useState("");
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerResult, setPlayerResult] = useState<SubmissionResult | null>(null);

  const [aiProgress, setAiProgress] = useState(0);
  const [aiStage, setAiStage] = useState('Initializing Logic...');
  const [aiFinishTime, setAiFinishTime] = useState(0);
  const aiIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (!boss || !problem) return;
    setPlayerCode(problem.starterCode[selectedLang.id] || selectedLang.starter);
  }, [boss, problem, selectedLang]);

  useEffect(() => {
    if (battleState === 'starting') {
      const timer = setTimeout(() => {
        setBattleState('playing');
        startTimestampRef.current = Date.now();
        trackEvent('boss_battle_started', { battleMode: 'Boss Battle', problemDifficulty: problem.difficulty });
        startAiSimulation();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [battleState, trackEvent, problem.difficulty]);

  const startAiSimulation = () => {
    if (!boss) return;
    const baseTime = boss.solveTimeRange[0] + Math.random() * (boss.solveTimeRange[1] - boss.solveTimeRange[0]);
    const totalTimeMs = baseTime * 1000;
    setAiFinishTime(baseTime);
    const startTime = Date.now();
    aiIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / totalTimeMs) * 100);
      setAiProgress(progress);
      if (progress < 25) setAiStage('Analyzing Complexity...');
      else if (progress < 60) setAiStage('Writing Optimal Solution...');
      else if (progress < 90) setAiStage('Running System Tests...');
      else setAiStage('Submitting to Judge...');
      if (progress >= 100) {
        if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
        handleAiSubmission();
      }
    }, 100);
  };

  const handleAiSubmission = () => {
    if (!boss) return;
    if (Math.random() > boss.errorChance) { if (!winner) finalizeBattle('boss'); }
    else { setAiStage('AI Runtime Error! Retrying...'); setTimeout(() => { setAiProgress(0); startAiSimulation(); }, 5000); }
  };

  const handlePlayerSubmit = async () => {
    if (battleState !== 'playing' || isSubmitting) return;
    setIsSubmitting(true);
    trackEvent('problem_attempted', { battleMode: 'Boss Battle', problemDifficulty: problem.difficulty });
    try {
      const result = await submitCodeToJudge(playerCode, selectedLang.id, problem, 'submit');
      setPlayerResult(result);
      if (result.status === 'Accepted' && !winner) finalizeBattle('player');
      else if (result.status !== 'Accepted') toast({ variant: "destructive", title: "Rejected", description: result.status });
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  const finalizeBattle = async (battleWinner: Winner) => {
    if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    setWinner(battleWinner); setBattleState('result');
    if (!user || !boss) return;
    const playerTime = (Date.now() - startTimestampRef.current) / 1000;
    const xpReward = battleWinner === 'player' ? boss.rewardXP : 20;
    trackEvent(battleWinner === 'player' ? 'boss_battle_won' : 'duel_lost', { battleMode: 'Boss Battle', xpEarned: xpReward });
    
    try {
      if (battleWinner === 'player') { 
        await apiClient.post('/dashboard/activities', { 
          eventType: 'boss_battle_won', 
          xpAmount: xpReward,
          bossName: boss.name,
          problemId: problem.id
        });
      } else {
        await apiClient.post('/dashboard/activities', { 
          eventType: 'boss_battle_lost', 
          xpAmount: xpReward,
          bossName: boss.name,
          problemId: problem.id
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!boss) return null;
  if (battleState === 'starting') return <div className="h-screen bg-[#020617] flex items-center justify-center p-6 overflow-hidden"><motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8"><div className={`w-40 h-40 rounded-full bg-gradient-to-br ${boss.color} flex items-center justify-center text-8xl shadow-[0_0_100px_rgba(239,68,68,0.3)] mx-auto border-4 border-white/20 animate-pulse`}>{boss.avatar}</div><div className="space-y-2"><h2 className="text-6xl font-black italic text-white uppercase tracking-tighter">VERSUS {boss.name}</h2><p className="text-red-500 font-bold tracking-[0.5em] uppercase text-xl">Prepare for combat</p></div></motion.div></div>;
  if (battleState === 'result') return <div className="h-screen bg-[#020617] flex items-center justify-center p-6"><motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-2xl w-full"><Card className={`glass-card border-none overflow-hidden relative ${winner === 'player' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}><CardContent className="p-12 text-center space-y-10"><h1 className="text-8xl font-black italic text-white">{winner === 'player' ? 'VICTORY' : 'DEFEATED'}</h1><div className="grid grid-cols-2 gap-8 max-w-md mx-auto"><div><p className="text-xs font-bold text-slate-500 uppercase">Player Time</p><p className="text-3xl font-black text-white">{((Date.now() - startTimestampRef.current) / 1000).toFixed(1)}s</p></div><div><p className="text-xs font-bold text-slate-500 uppercase">Boss Time</p><p className="text-3xl font-black text-red-400">{aiFinishTime.toFixed(1)}s</p></div></div><div className="bg-white/5 rounded-2xl p-8 space-y-4"><div className="flex justify-between items-center"><span className="text-slate-400 font-bold uppercase text-xs">XP Gained</span><span className="text-2xl font-black text-indigo-400">+{winner === 'player' ? boss.rewardXP : 20} XP</span></div></div><Button onClick={() => router.push('/battles/boss-arena')} className="w-full h-16 text-xl font-black bg-indigo-600">Return to Lobby</Button></CardContent></Card></motion.div></div>;

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      <header className="h-24 bg-slate-900/80 border-b border-red-500/20 px-8 flex items-center justify-between backdrop-blur-md relative z-20"><div className="flex items-center gap-12"><div className="flex items-center gap-4"><div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl italic">P1</div><div><p className="text-[10px] font-bold text-indigo-400 uppercase">You</p><p className="text-lg font-black uppercase">{user?.displayName?.split(' ')[0]}</p></div></div><div className="text-4xl font-black italic text-slate-700">VS</div><div className="flex items-center gap-4"><div className="text-right"><p className="text-[10px] font-bold text-red-400 uppercase">The Boss</p><p className="text-lg font-black uppercase">{boss.name}</p></div><div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${boss.color} flex items-center justify-center text-3xl shadow-lg`}>{boss.avatar}</div></div></div><div className="flex-1 max-w-md px-12"><div className="w-full bg-white/5 h-3 rounded-full overflow-hidden"><motion.div className="h-full bg-red-600" animate={{ width: `${aiProgress}%` }} /></div><p className="text-[10px] text-red-400 text-center mt-2 font-black uppercase">{aiStage}</p></div><div className="flex items-center gap-6"><Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-black uppercase px-4 py-1">{problem.title}</Badge><Button variant="ghost" onClick={() => router.push('/battles/boss-arena')} className="text-slate-500">Forfeit</Button></div></header>
      <main className="flex-1 flex overflow-hidden">
        <section className="w-1/3 border-r border-white/5 bg-slate-950/30 overflow-y-auto p-8 space-y-8"><div className="space-y-4"><h2 className="text-2xl font-black text-white uppercase italic">{problem.title}</h2><p className="text-slate-400 text-sm">{problem.description}</p></div><div className="p-6 rounded-2xl bg-white/5 space-y-6"><div><p className="text-[10px] font-bold text-slate-500 uppercase">Input Format</p><pre className="text-xs text-emerald-400 bg-black/40 p-3 rounded font-mono">{problem.inputFormat}</pre></div><div><p className="text-[10px] font-bold text-slate-500 uppercase">Output Format</p><pre className="text-xs text-indigo-400 bg-black/40 p-3 rounded font-mono">{problem.outputFormat}</pre></div></div></section>
        <section className="flex-1 flex flex-col bg-[#1e1e1e]"><div className="h-12 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6"><Code2 size={14} className="text-indigo-400" /><div className="flex gap-4"><select className="bg-white/5 border-none text-[10px] rounded px-3 py-1 text-slate-300 uppercase font-bold" value={selectedLang.id} onChange={(e) => { const lang = LANGUAGES.find(l => l.id === e.target.value); if (lang) { setSelectedLang(lang); setPlayerCode(problem.starterCode[lang.id] || lang.starter); } }} >{LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div></div><div className="flex-1 relative"><Editor height="100%" theme="vs-dark" language={selectedLang.id} value={playerCode} onChange={(v) => setPlayerCode(v || "")} options={{ fontSize: 14, fontFamily: 'Fira Code', minimap: { enabled: false }, padding: { top: 20 }, automaticLayout: true }} /></div><div className="h-64 bg-slate-950 border-t border-red-500/20 flex flex-col"><div className="h-12 bg-black/40 flex items-center justify-between px-6"><Terminal size={14} className="text-emerald-400" /><Button size="sm" onClick={handlePlayerSubmit} disabled={isSubmitting} className="h-8 bg-indigo-600 font-black uppercase text-[10px] px-8">{isSubmitting ? '...' : 'Execute Submission'}</Button></div><div className="flex-1 p-6 font-mono text-xs overflow-y-auto">{playerResult ? <div className={`flex items-center gap-2 font-black uppercase ${playerResult.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>{playerResult.status}</div> : <div className="text-slate-600 italic">Ready.</div>}</div></div></section>
      </main>
    </div>
  );
}
