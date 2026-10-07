// @ts-nocheck
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Editor } from '@monaco-editor/react';
import { 
  Timer, 
  Code2, 
  Terminal, 
  Trophy, 
  LayoutGrid, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Users,
  Swords,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { submitCodeToJudge, SubmissionResult } from '@/lib/services/judgeService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContestArenaRoom() {
  const { contestId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();

  
  const [contest, set_contest] = React.useState<any>(null);

  
    
  const [leaderboard , set_leaderboard ] = React.useState<any[]>([]);

  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);

  const problems = contest?.problemIds?.map((id: string) => ARENA_PROBLEMS.find(p => p.id === id) || ARENA_PROBLEMS[0]) || [];
  const currentProblem = problems[activeProblemIdx];

  useEffect(() => {
    if (currentProblem) {
      setCode(currentProblem.starterCode[language] || "");
      setLastResult(null);
    }
  }, [activeProblemIdx, language, currentProblem]);

  useEffect(() => {
    if (!contest || contest.status !== 'live') return;
    const endTime = contest.endTime?.toDate ? contest.endTime.toDate().getTime() : new Date(contest.endTime).getTime();
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const handleSubmit = async () => {
    if (!user || !db || !contest || !currentProblem || isSubmitting) return;
    if (contest.status !== 'live') {
      toast({ variant: "destructive", title: "Arena Locked", description: "Contest is not live." });
      return;
    }

    setIsSubmitting(true);
    setLastResult(null);

    try {
      const result = await submitCodeToJudge(code, language, currentProblem, 'submit');
      setLastResult(result);

      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);

      const isAccepted = result.status === 'Accepted';
      const points = currentProblem.difficulty === 'Easy' ? 100 : currentProblem.difficulty === 'Medium' ? 200 : 300;
      const leaderboardRef = doc(db, 'contest_leaderboard', contest.id, 'entries', user.uid);
      const startTime = contest.startTime?.toDate ? contest.startTime.toDate().getTime() : new Date(contest.startTime).getTime();
      const currentPenalty = Math.floor((Date.now() - startTime) / 60000);

      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);

      if (isAccepted) toast({ title: "SOLVED!", description: `+${points} Points earned.` });
      else toast({ variant: "destructive", title: "WRONG ANSWER", description: "Penalty added." });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isContestLoading) return null;

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      <header className="h-20 bg-slate-900/80 border-b border-indigo-500/20 px-8 flex items-center justify-between backdrop-blur-md relative z-20">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/sprint/contests')} className="text-slate-500 hover:text-white">
            <ChevronLeft size={20} />
          </Button>
          <div className="h-10 w-px bg-white/5" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
              <Swords size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-white truncate max-w-[200px]">{contest.title}</h1>
              <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[9px] uppercase font-black">{contest.status} ARENA</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className={`flex items-center gap-3 text-3xl font-mono font-black ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
            <Timer size={28} />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-[9px] uppercase font-bold text-slate-500 mt-1 tracking-widest">Contest Window Closing</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Standing</p>
            <p className="text-xl font-black text-indigo-400">#{leaderboard?.findIndex(e => e.userId === user?.uid) + 1 || '--'}</p>
          </div>
          <div className="h-10 w-px bg-white/5" />
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-black h-10 px-4">
            SCORE: {leaderboard?.find(e => e.userId === user?.uid)?.score || 0}
          </Badge>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-slate-950/40 border-r border-white/5 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 mb-4 px-2">
            <LayoutGrid size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Arena Challenges</span>
          </div>
          {problems.map((p, i) => {
            const isSolved = leaderboard?.find(e => e.userId === user?.uid)?.[`solved_${p.id}`];
            return (
              <button key={p.id} onClick={() => setActiveProblemIdx(i)} className={cn("w-full p-4 rounded-xl border text-left transition-all relative overflow-hidden group", activeProblemIdx === i ? "bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-black/20 border-white/5 hover:border-white/10")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Problem {String.fromCharCode(65 + i)}</span>
                  {isSolved && <CheckCircle2 size={14} className="text-emerald-400" />}
                </div>
                <h4 className="font-bold text-white text-sm truncate">{p.title}</h4>
                <div className="flex items-center justify-between mt-2">
                  <Badge className={cn("text-[8px] uppercase border-none", p.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-400" : p.difficulty === 'Medium' ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400")}>{p.difficulty}</Badge>
                  <span className="text-[8px] font-bold text-slate-600">{p.difficulty === 'Easy' ? '100' : p.difficulty === 'Medium' ? '200' : '300'} PTS</span>
                </div>
              </button>
            );
          })}
        </aside>

        <section className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="description" className="flex-1 flex flex-col">
            <div className="h-12 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6">
              <TabsList className="bg-transparent border-none">
                <TabsTrigger value="description" className="data-[state=active]:bg-indigo-600/10 data-[state=active]:text-indigo-400 uppercase font-black text-[10px] tracking-widest h-8">Intel</TabsTrigger>
                <TabsTrigger value="editor" className="data-[state=active]:bg-indigo-600/10 data-[state=active]:text-indigo-400 uppercase font-black text-[10px] tracking-widest h-8">Editor</TabsTrigger>
                <TabsTrigger value="leaderboard" className="data-[state=active]:bg-indigo-600/10 data-[state=active]:text-indigo-400 uppercase font-black text-[10px] tracking-widest h-8">Leaderboard</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-4">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-white/5 border-none h-8 text-[10px] font-black uppercase w-32"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="python">Python 3</SelectItem>
                    <SelectItem value="java">Java 17</SelectItem>
                    <SelectItem value="cpp">C++ 20</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleSubmit} disabled={isSubmitting} className="h-8 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase px-6">{isSubmitting ? 'Verifying...' : 'DEPLOY SOLUTION'}</Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="description" className="h-full m-0 p-10 overflow-y-auto space-y-10 scrollbar-thin">
                <div className="space-y-4">
                  <Badge variant="outline" className="border-indigo-500/20 text-indigo-400">{currentProblem?.category}</Badge>
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">{currentProblem?.title}</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">{currentProblem?.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400"><Terminal size={18} /><h3 className="text-xs font-black uppercase tracking-widest">Input Pattern</h3></div>
                    <pre className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-emerald-400 text-sm">{currentProblem?.inputFormat}</pre>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-indigo-400"><Code2 size={18} /><h3 className="text-xs font-black uppercase tracking-widest">Output Logic</h3></div>
                    <pre className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-indigo-400 text-sm">{currentProblem?.outputFormat}</pre>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="editor" className="h-full m-0 bg-[#1e1e1e]">
                <Editor height="100%" theme="vs-dark" language={language} value={code} onChange={(v) => setCode(v || "")} options={{ fontSize: 14, fontFamily: 'Fira Code', minimap: { enabled: false }, padding: { top: 20 } }} />
              </TabsContent>
              <TabsContent value="leaderboard" className="h-full m-0 overflow-y-auto p-10 bg-slate-950/20">
                <div className="space-y-8">
                  <div className="flex items-center justify-between"><h2 className="text-3xl font-black italic uppercase text-white">Battle Statistics</h2><div className="flex items-center gap-2 text-slate-500"><Users size={16} /><span className="text-xs font-bold">{leaderboard?.length || 0} Participants</span></div></div>
                  <div className="space-y-3">
                    {leaderboard?.map((entry, idx) => (
                      <div key={entry.userId} className={cn("p-6 rounded-2xl border flex items-center justify-between transition-all", entry.userId === user?.uid ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]" : "bg-slate-900/40 border-white/5")}>
                        <div className="flex items-center gap-8">
                          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center font-black italic text-xl", idx === 0 ? "bg-amber-500 text-slate-900" : idx === 1 ? "bg-slate-300 text-slate-900" : idx === 2 ? "bg-amber-700 text-white" : "bg-slate-800 text-slate-500")}>#{idx + 1}</div>
                          <div><p className="text-lg font-black uppercase text-white">{entry.username}</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{entry.problemsSolved || 0} Solved • {entry.penalty || 0}m Penalty</p></div>
                        </div>
                        <div className="text-right"><p className="text-3xl font-black italic text-indigo-400">{entry.score || 0}</p><p className="text-[10px] text-slate-500 font-bold uppercase">Total Points</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
