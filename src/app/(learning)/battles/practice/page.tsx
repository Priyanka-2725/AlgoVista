// @ts-nocheck

"use client"

import React, { useState, useEffect, useRef } from 'react';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell, 
  ChevronLeft, 
  Play, 
  Send, 
  RotateCcw, 
  Terminal,
  Zap,
  Code2,
  Flame,
  Save,
  Timer as TimerIcon,
  Trophy,
  Focus,
  Eye,
  Settings
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Editor } from '@monaco-editor/react';
import { Problem, ProblemList } from '@/features/learning/components/ProblemList';
import { ProblemDescription } from '@/features/learning/components/ProblemDescription';
import { TestCasePanel } from '@/features/learning/components/TestCasePanel';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { submitCodeToJudge, SubmissionResult } from '@/lib/services/judgeService';
import { useToast } from '@/hooks/use-toast';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { useAnalytics } from '@/hooks/use-analytics';
import { adaptDifficulty } from '@/features/learning/services/difficultyAdapter';
import { updateStreak } from '@/features/gamification/services/streakService';
import { getTodayChallenge, completeDailyChallenge } from '@/features/dashboard/services/dailyChallengeService';
import { incrementDailySolveCount } from '@/features/dashboard/services/activityService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionVisualizer } from '@/features/learning/components/ExecutionVisualizer';

export default function PracticeArenaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [runType, setRunType] = useState<'run' | 'submit'>('run');
  const [isLoadingProblems, setIsLoadingLoadingProblems] = useState(true);
  const [dailyProblemId, setDailyProblemId] = useState<string | null>(null);
  
  const [solveStartTime, setSolveStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'execution'>('editor');

  useEffect(() => {
    const fetchProblems = async () => {
      let problemList: Problem[] = [];
      {
        try {
          
          if (!snap.empty) {
            problemList = snap.docs.map(d => ({ id: d.id, ...d.data() } as Problem));
          }
          const daily = await apiClient.get('/api/daily-challenge').then(res => res.data);
          setDailyProblemId(daily.problemId);
        } catch (e) {
          console.error("[Practice Arena] Firestore error:", e);
        }
      }

      if (problemList.length === 0) {
        problemList = ARENA_PROBLEMS;
      }

      setProblems(problemList);
      
      // Handle direct link via search param
      const targetId = searchParams.get('id');
      if (targetId) {
        const found = problemList.find(p => p.id === targetId);
        if (found) setSelectedProblem(found);
      } else if (problemList.length > 0) {
        setSelectedProblem(problemList[0]);
      }
      setIsLoadingLoadingProblems(false);
    };
    fetchProblems();
  }, [db, searchParams]);

  useEffect(() => {
    if (selectedProblem) {
      setSolveStartTime(Date.now());
      setElapsedSeconds(0);
      setCode(selectedProblem.starterCode[language] || "");
      setLastResult(null);
      setViewMode('editor');
    }
  }, [selectedProblem, language]);

  useEffect(() => {
    if (!selectedProblem || isSubmitting) return;
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - solveStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [solveStartTime, selectedProblem, isSubmitting]);

  const handleJudge = async (type: 'run' | 'submit') => {
    if (!user || !selectedProblem || isRunning || isSubmitting) return;

    setRunType(type);
    if (type === 'run') setIsRunning(true);
    else setIsSubmitting(true);
    
    setLastResult(null);

    try {
      const result = await submitCodeToJudge(code, language, selectedProblem, type);
      setLastResult(result);

      if (result.status === 'Accepted' && type === 'submit') {
        
        apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
        incrementDailySolveCount(user.uid);
        apiClient.post('/api/users/update-streak');
        toast({ title: "Accepted!", description: "Problem mastered. +20 XP awarded." });
        adaptDifficulty(user.uid);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Judge Error" });
    } finally {
      setIsRunning(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-slate-900/40 px-8 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!isFocusMode && (
              <Button variant="ghost" size="icon" onClick={() => router.push('/battles')} className="text-slate-400">
                <ChevronLeft size={20} />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-black font-headline tracking-tighter italic text-white flex items-center gap-2 uppercase">
                <Dumbbell className="text-indigo-500" size={20} />
                Practice Arena
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                  {selectedProblem?.title || 'Loading...'}
                </p>
                <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px]">
                  <TimerIcon size={10} /> {Math.floor(elapsedSeconds/60)}:{(elapsedSeconds%60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('editor')}
                className={cn("h-8 text-[10px] font-black uppercase px-4 rounded-lg transition-all", viewMode === 'editor' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500")}
              >
                <Code2 size={14} className="mr-2" /> Code Editor
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('execution')}
                className={cn("h-8 text-[10px] font-black uppercase px-4 rounded-lg transition-all", viewMode === 'execution' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500")}
              >
                <Eye size={14} className="mr-2" /> Watch Execution
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={cn("h-8 text-[10px] uppercase font-bold gap-2", isFocusMode ? "bg-indigo-500/20 text-indigo-400" : "text-slate-500")}
            >
              <Focus size={14} /> {isFocusMode ? 'Focus On' : 'Focus Off'}
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {!isFocusMode && (
            <aside className="w-72 border-r border-white/5 bg-slate-950/20 p-4">
              <ProblemList 
                problems={problems} 
                selectedProblemId={selectedProblem?.id || null}
                onSelect={setSelectedProblem}
                solvedIds={[]}
              />
            </aside>
          )}

          <section className="flex-1 border-r border-white/5 bg-slate-950/40 p-8 overflow-hidden relative">
            <ProblemDescription problem={selectedProblem} />
          </section>

          <section className={cn("flex flex-col bg-[#1e1e1e] transition-all duration-500", isFocusMode ? "w-[60%]" : "w-[45%]")}>
            <AnimatePresence mode="wait">
              {viewMode === 'editor' ? (
                <motion.div 
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="h-12 bg-slate-900/80 border-b border-white/5 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                      <Code2 size={14} className="text-indigo-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logic Buffer</span>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        className="bg-white/5 border-none text-[10px] rounded px-2 py-1 outline-none text-slate-300 uppercase font-bold"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative group">
                    <Editor
                      height="100%"
                      theme="vs-dark"
                      language={language}
                      value={code}
                      onChange={(val) => setCode(val || "")}
                      options={{ fontSize: 14, fontFamily: 'Fira Code', minimap: { enabled: false }, padding: { top: 20 }, automaticLayout: true }}
                    />
                    <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" className="h-10 bg-indigo-600 hover:bg-indigo-500 font-black uppercase text-[10px] px-6 shadow-xl" onClick={() => handleJudge('submit')} disabled={isRunning || isSubmitting}>
                        <Play size={12} className="mr-2" /> Submit
                      </Button>
                    </div>
                  </div>

                  <div className="h-80 bg-slate-900 border-t border-white/5 p-6">
                    <TestCasePanel result={lastResult} isRunning={isRunning || isSubmitting} type={runType} code={code} language={language} />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="execution"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 p-8 overflow-hidden"
                >
                  <ExecutionVisualizer 
                    problemId={selectedProblem?.id || ''} 
                    onClose={() => setViewMode('editor')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
}
