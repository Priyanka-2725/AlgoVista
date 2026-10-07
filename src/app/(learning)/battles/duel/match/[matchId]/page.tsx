// @ts-nocheck

"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Code2, Terminal, CheckCircle2, XCircle, Trophy, Activity, Zap, Swords, AlertTriangle, RotateCcw, Eye, Users, Smile } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Editor } from '@monaco-editor/react';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { calculateRatingChange } from '@/lib/services/eloService';
import { submitCodeToJudge, SubmissionResult } from '@/lib/services/judgeService';
import { useToast } from '@/hooks/use-toast';
import { RankBadge } from '@/components/ui/RankBadge';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/use-analytics';

export default function DuelMatchPage() {
  const { matchId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  
  
  const [roomData, set_roomData] = React.useState<any>(null);
  
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localResult, setLocalResult] = useState<SubmissionResult | null>(null);
  
  const opponentId = roomData?.players?.find((p: string) => p !== user?.uid);
  const problem = ARENA_PROBLEMS.find(p => p.id === roomData?.problemId) || ARENA_PROBLEMS[0];

  const hasStartedTracked = useRef(false);

  useEffect(() => {
    if (!user || !roomRef) return;
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    return () => { apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error); };
  }, [user, roomRef]);

  // Opponent Tracking Logic
  useEffect(() => {
    if (!user || !roomRef || !code) return;
    
    const updateTypingStatus = async () => {
      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    };

    const timer = setTimeout(updateTypingStatus, 1000);
    return () => clearTimeout(timer);
  }, [code, user, roomRef]);

  useEffect(() => {
    if (isRoomLoading || !roomData) return;
    if (code === "" && problem) setCode(problem.starterCode[language] || "");

    if (roomData.status === 'active' && !hasStartedTracked.current) {
      trackEvent('duel_started', { battleMode: 'Ranked Duel', problemDifficulty: problem.difficulty });
      hasStartedTracked.current = true;
    }

    const interval = setInterval(() => {
      if (roomData.status !== 'active') {
        clearInterval(interval);
        return;
      }
      setTimeLeft(prev => {
        if (prev <= 0) {
          if (user?.uid === roomData.players[0]) apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [roomData, isRoomLoading, problem, language, code, user?.uid, roomRef, trackEvent]);

  const handleSubmit = async () => {
    if (!user || !roomData || isSubmitting || roomData.status !== 'active') return;
    
    setIsSubmitting(true);
    setLocalResult(null);
    
    if (roomRef) {
      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    }

    trackEvent('problem_attempted', { battleMode: 'Ranked Duel', problemDifficulty: problem.difficulty, problemId: problem.id });

    try {
      const result = await submitCodeToJudge(code, language, problem, 'submit');
      setLocalResult(result);

      const submissionRecord = { userID: user.uid, userName: user.displayName || 'Me', status: result.status, timestamp: new Date().toISOString() };

      if (roomRef) {
        apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
        if (result.status === 'Accepted') await finalizeDuel(user.uid);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Judge Failure", description: "Submission failed." });
    } finally { setIsSubmitting(false); }
  };

  const handleReaction = async (emoji: string) => {
    if (!user || !roomRef) return;
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
  };

  const finalizeDuel = async (winnerId: string) => {
    if (!roomRef || !user || !roomData || roomData.status === 'finished') return;
    const myRating = roomData.playerRatings[user.uid] || 1000;
    const oppRating = roomData.playerRatings[opponentId] || 1000;
    let res: 1 | 0.5 | 0 = winnerId === user.uid ? 1 : winnerId === 'draw' ? 0.5 : 0;
    const ratingChange = calculateRatingChange(myRating, oppRating, res);
    const xpReward = res === 1 ? 100 : res === 0.5 ? 40 : 20;

    trackEvent(res === 1 ? 'duel_won' : 'duel_lost', { battleMode: 'Ranked Duel', xpEarned: xpReward, problemId: problem.id });
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
  };

  if (isRoomLoading) return null;

  if (roomData?.status === 'finished') {
    const isWinner = roomData.winner === user?.uid;
    const isDraw = roomData.winner === 'draw';
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full">
          <Card className={`glass-card border-none ${isWinner ? 'bg-emerald-500/10' : isDraw ? 'bg-indigo-500/10' : 'bg-red-500/10'} p-12 text-center space-y-8 shadow-2xl`}>
             <div className="flex justify-center">{isWinner ? <div className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]"><Trophy size={64} className="text-white" /></div> : isDraw ? <div className="w-32 h-32 rounded-full bg-indigo-500 flex items-center justify-center"><Swords size={64} className="text-white" /></div> : <div className="w-32 h-32 rounded-full bg-red-500 flex items-center justify-center"><Activity size={64} className="text-white" /></div>}</div>
             <div className="space-y-2"><h1 className="text-7xl font-black italic tracking-tighter text-white uppercase">{isWinner ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}</h1><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Battle Outcome: {problem.title}</p></div>
             <div className="flex justify-center gap-4 py-4">
               {['👍', '🔥', '😈', 'GG'].map(emoji => (
                 <button key={emoji} onClick={() => handleReaction(emoji)} className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-xl transition-all">
                   {emoji}
                 </button>
               ))}
             </div>
             <div className="grid grid-cols-2 gap-4"><div className="bg-white/5 p-6 rounded-2xl border border-white/5"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">XP Reward</p><p className="text-3xl font-black text-indigo-400">+{isWinner ? 100 : isDraw ? 40 : 20}</p></div><div className="bg-white/5 p-6 rounded-2xl border border-white/5"><p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Rank Tier</p><div className="flex justify-center mt-1"><RankBadge rating={roomData.playerRatings[user?.uid || ''] + (isWinner ? 24 : -16)} /></div></div></div>
             <Button onClick={() => router.push('/battles/duel')} className="w-full h-16 text-xl font-black italic bg-indigo-600 hover:bg-indigo-500 rounded-xl">RETURN TO LOBBY</Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const oppProgress = roomData?.progress?.[opponentId] || { attempts: 0, lastStatus: 'Idle' };
  const isOpponentTyping = roomData?.typing?.[opponentId] && (Date.now() - roomData.typing[opponentId].toMillis() < 3000);

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      <header className="h-24 bg-slate-900/80 border-b border-indigo-500/20 px-10 flex items-center justify-between relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4"><div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl italic">P1</div><div><p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">YOU</p><div className="flex items-center gap-2"><p className="text-lg font-black uppercase">{(user?.displayName || 'Explorer').split(' ')[0]}</p><RankBadge rating={roomData?.playerRatings[user?.uid || '']} showIcon={false} /></div></div></div>
          <div className="text-4xl font-black italic text-slate-700">VS</div>
          <div className="flex items-center gap-4"><div className="text-right"><p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">OPPONENT</p><div className="flex items-center gap-2 justify-end"><RankBadge rating={roomData?.playerRatings[opponentId]} showIcon={false} /><p className="text-lg font-black uppercase">{roomData?.playerNames[opponentId] || 'Challenger'}</p></div></div><div className="h-14 w-14 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-2xl italic">P2</div></div>
        </div>
        <div className="flex flex-col items-center bg-black/40 px-10 py-3 rounded-2xl border border-white/5 relative">
          <div className={`flex items-center gap-3 text-4xl font-mono font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}><Timer size={32} />{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          <p className="text-[10px] uppercase font-bold text-slate-500 mt-1 tracking-widest">TRANSMISSION WINDOW</p>
          <div className="absolute -bottom-6 flex items-center gap-1 text-[10px] text-slate-500"><Users size={10} /><span>{roomData?.spectators?.length || 0} Watchers</span></div>
        </div>
        <div className="flex items-center gap-6"><Badge variant="outline" className="border-indigo-500/30 text-indigo-400 px-6 py-2 text-sm font-black uppercase italic">RANKED: {problem.title}</Badge><Button variant="ghost" onClick={() => router.push('/battles/duel')} className="text-slate-500 hover:text-white font-bold uppercase tracking-tighter">Forfeit</Button></div>
      </header>
      <main className="flex-1 flex overflow-hidden">
        <section className="w-1/3 border-r border-white/5 bg-slate-950/30 overflow-y-auto p-10 space-y-10">
          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2"><Users size={14} /> Opponent Tracking</h3>
              {isOpponentTyping && <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity }} className="text-[9px] font-black text-indigo-400 uppercase italic">Typing...</motion.div>}
            </div>
            <div className="grid grid-cols-2 gap-4"><div><p className="text-[9px] text-slate-500 uppercase font-bold">Attempts</p><p className="text-xl font-black text-white">{oppProgress.attempts}</p></div><div><p className="text-[9px] text-slate-500 uppercase font-bold">Status</p><p className={cn("text-xs font-black uppercase italic", oppProgress.lastStatus === 'Accepted' ? 'text-emerald-400' : oppProgress.lastStatus === 'Idle' ? 'text-slate-500' : 'text-red-400')}>{oppProgress.lastStatus}</p></div></div>
          </div>
          <div className="space-y-4"><div className="flex items-center gap-3 text-indigo-400"><Code2 size={24} /><h3 className="font-black uppercase tracking-wider text-sm">Challenge Specs</h3></div><h2 className="text-3xl font-black text-white uppercase italic tracking-tight">{problem.title}</h2><p className="text-slate-400 leading-relaxed">{problem.description}</p></div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6"><div className="space-y-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Input Pattern</p><pre className="text-xs text-emerald-400 bg-black/40 p-4 rounded-xl font-mono whitespace-pre-wrap">{problem.inputFormat}</pre></div><div className="space-y-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Return Logic</p><pre className="text-xs text-indigo-400 bg-black/40 p-4 rounded-xl font-mono whitespace-pre-wrap">{problem.outputFormat}</pre></div></div>
        </section>
        <section className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
          <div className="h-12 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6"><div className="flex items-center gap-2"><Code2 size={14} className="text-indigo-400" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Battle Editor</span></div><div className="flex gap-4"><select className="bg-white/5 border-none text-[10px] rounded px-3 py-1 outline-none text-slate-300 font-bold uppercase" value={language} onChange={(e) => { setLanguage(e.target.value); setCode(problem.starterCode[e.target.value] || ""); }}><option value="python">Python 3</option><option value="java">Java 17</option><option value="cpp">C++ 20</option><option value="javascript">JavaScript</option></select><Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => setCode(problem.starterCode[language] || "")}><RotateCcw size={14} /></Button></div></div>
          <div className="flex-1 relative"><Editor height="100%" theme="vs-dark" language={language} value={code} onChange={(v) => setCode(v || "")} options={{ fontSize: 14, fontFamily: 'Fira Code', minimap: { enabled: false }, padding: { top: 20 }, automaticLayout: true }} /></div>
          <div className="h-64 bg-slate-950 border-t border-indigo-500/20 flex flex-col">
            <div className="h-12 bg-black/40 border-b border-white/5 flex items-center justify-between px-6"><div className="flex items-center gap-6"><button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b-2 border-indigo-500 h-full">System Console</button><button className="text-[10px] font-black uppercase tracking-widest text-slate-500 h-full">Logs ({roomData?.submissions?.length || 0})</button></div><Button size="sm" onClick={handleSubmit} disabled={isSubmitting} className="h-8 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase px-10 shadow-lg">{isSubmitting ? 'Transmitting...' : 'Submit Solution'}</Button></div>
            <div className="flex-1 p-8 font-mono text-xs overflow-y-auto"><AnimatePresence mode="wait">{localResult ? <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4"><div className={`flex items-center gap-3 text-sm font-black uppercase ${localResult.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>{localResult.status === 'Accepted' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}{localResult.status}</div><p className="text-slate-500">Passed {localResult.passedCount} / {localResult.totalTestCases} secure judge buffers.</p></motion.div> : <div className="text-slate-600 italic">Console initialized. Awaiting solution...</div>}</AnimatePresence></div>
          </div>
        </section>
      </main>
    </div>
  );
}
