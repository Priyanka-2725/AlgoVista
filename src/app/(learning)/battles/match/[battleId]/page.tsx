// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Code2, Terminal, CheckCircle2, XCircle, Trophy, Activity, Zap, Swords, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Editor } from '@monaco-editor/react';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { submitCodeToJudge, SubmissionResult } from '@/lib/services/judgeService';
import { calculateRatingChange } from '@/lib/services/eloService';

export default function BattleArenaPage() {
  const { battleId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  
  
  const [battleData, set_battleData] = React.useState<any>(null);
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localResult, setLocalResult] = useState<SubmissionResult | null>(null);
  
  const opponentId = battleData?.players?.find((p: string) => p !== user?.uid);
  const problem = ARENA_PROBLEMS.find(p => p.id === battleData?.problemId) || ARENA_PROBLEMS[0];

  useEffect(() => {
    if (isBattleLoading || !battleData) return;
    if (problem && !code) setCode(problem.starterCode[language] || "");
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [battleData, isBattleLoading, problem, language, code]);

  const handleSubmit = async () => {
    if (!user || !battleData || isSubmitting) return;
    
    setIsSubmitting(true);
    setLocalResult(null);
    
    try {
      const result = await submitCodeToJudge(code, language, problem, 'submit');
      setLocalResult(result);

      const submission = { userId: user.uid, userName: user.displayName || 'Me', code, status: result.status, timestamp: new Date().toISOString() };

      if (battleDocRef) {
        apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
        if (result.status === 'Accepted') {
          const opponentRating = battleData.playerRatings[opponentId] || 1000;
          const myRating = battleData.playerRatings[user.uid] || 1000;
          const change = calculateRatingChange(myRating, opponentRating, 1);
          apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
          
          apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
        }
      }
    } catch (e) {
      console.error(e);
    } finally { setIsSubmitting(false); }
  };

  if (isBattleLoading) return null;

  if (battleData?.status === 'finished') {
    const isWinner = battleData.winner === user?.uid;
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full">
          <Card className={`glass-card border-none ${isWinner ? 'bg-emerald-500/10' : 'bg-red-500/10'} p-12 text-center space-y-8 shadow-[0_0_50px_rgba(34,197,94,0.2)]`}>
             <div className="flex justify-center">{isWinner ? <div className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)]"><Trophy size={64} className="text-white" /></div> : <div className="w-32 h-32 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)]"><Activity size={64} className="text-white" /></div>}</div>
             <div className="space-y-2"><h1 className="text-6xl font-black italic tracking-tighter text-white">{isWinner ? 'VICTORY' : 'DEFEAT'}</h1><p className="text-slate-400">Match duration: {Math.floor(battleData.duration / 60)}m {battleData.duration % 60}s</p></div>
             <div className="grid grid-cols-2 gap-4"><div className="bg-white/5 p-4 rounded-xl border border-white/5"><p className="text-xs text-slate-500 uppercase font-bold mb-1">XP Gained</p><p className="text-2xl font-bold text-indigo-400">+{isWinner ? 100 : 20}</p></div><div className="bg-white/5 p-4 rounded-xl border border-white/5"><p className="text-xs text-slate-500 uppercase font-bold mb-1">Rating Change</p><p className={`text-2xl font-bold ${isWinner ? 'text-emerald-400' : 'text-red-400'}`}>{isWinner ? '+20' : '-12'}</p></div></div>
             <Button onClick={() => router.push('/battles')} className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-500">Return to Lobby</Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      <header className="h-20 bg-slate-900/80 border-b border-indigo-500/20 px-8 flex items-center justify-between relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-8"><div className="flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white italic">P1</div><div><p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">You</p><p className="font-bold">{(user?.displayName || 'Explorer').split(' ')[0]}</p></div></div><div className="text-2xl font-black italic text-slate-600">VS</div><div className="flex items-center gap-4"><div><p className="text-xs font-bold text-red-400 uppercase tracking-widest text-right">Opponent</p><p className="font-bold text-right">{battleData?.playerNames[opponentId] || 'Challenger'}</p></div><div className="h-10 w-10 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white italic">P2</div></div></div>
        <div className="flex flex-col items-center"><div className="flex items-center gap-2 text-2xl font-mono font-black text-amber-500 px-6 py-1 bg-amber-500/10 rounded-full border border-amber-500/20"><Timer size={24} />{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div><p className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-widest">Time Remaining</p></div>
        <div className="flex items-center gap-4"><Badge variant="outline" className="border-indigo-500/30 text-indigo-400 px-4 py-1">{problem?.title || 'Algorithm Duel'}</Badge><Button variant="ghost" onClick={() => router.push('/battles')} className="text-slate-500 hover:text-white">Forfeit</Button></div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <section className="w-1/3 border-r border-white/5 bg-slate-950/30 overflow-y-auto p-8 space-y-8"><div className="space-y-4"><div className="flex items-center gap-2 text-indigo-400"><Code2 size={20} /><h3 className="font-bold uppercase tracking-wider text-sm">Challenge Description</h3></div><h2 className="text-2xl font-black text-white">{problem?.title}</h2><p className="text-slate-400 leading-relaxed">{problem?.description}</p></div><div className="space-y-4"><div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4"><div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Input Format</p><code className="text-sm text-emerald-400 bg-black/40 px-2 py-1 rounded">{problem?.inputFormat}</code></div><div><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Output Format</p><code className="text-sm text-emerald-400 bg-black/40 px-2 py-1 rounded">{problem?.outputFormat}</code></div></div></div><div className="space-y-4"><div className="flex items-center gap-2 text-amber-400"><AlertTriangle size={18} /><h3 className="font-bold uppercase tracking-wider text-xs">Constraints</h3></div><ul className="text-xs text-slate-500 space-y-2 list-disc pl-4"><li>Time limit: 2000ms</li><li>Memory limit: 256MB</li></ul></div></section>
        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 bg-[#1e1e1e] relative"><div className="absolute top-4 right-8 z-20 flex gap-2"><select className="bg-slate-800 border-none text-xs rounded-md px-2 py-1 outline-none text-slate-300" value={language} onChange={(e) => setLanguage(e.target.value)}><option value="python">Python 3</option><option value="java">Java 17</option><option value="cpp">C++ 20</option></select></div><Editor height="100%" theme="vs-dark" language={language} value={code} onChange={(val) => setCode(val || "")} options={{ fontSize: 14, fontFamily: 'Fira Code', minimap: { enabled: false }, padding: { top: 20 }, automaticLayout: true }} /></div>
          <div className="h-64 bg-slate-900 border-t border-indigo-500/20 flex flex-col overflow-hidden">
            <div className="h-10 bg-black/40 border-b border-white/5 flex items-center justify-between px-4"><div className="flex items-center gap-4 h-full"><button className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 border-b-2 border-indigo-500 h-full px-2">Output</button></div><Button size="sm" className="h-7 text-[10px] uppercase font-bold bg-indigo-600 hover:bg-indigo-500" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Verifying...' : 'Submit Solution'}</Button></div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs"><AnimatePresence mode="wait">{localResult ? <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3"><div className={`flex items-center gap-2 font-black ${localResult.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>{localResult.status === 'Accepted' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}{localResult.status}</div><p className="text-slate-400">Passed {localResult.passedCount} / {localResult.totalTestCases} secure judge buffers.</p></motion.div> : <div className="text-slate-600 italic">Console ready.</div>}</AnimatePresence></div>
          </div>
        </section>
      </main>
    </div>
  );
}
