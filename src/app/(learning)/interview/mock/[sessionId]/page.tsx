'use client';
// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Zap, 
  Swords, 
  AlertTriangle,
  ChevronRight,
  Bot,
  Loader2,
  BrainCircuit,
  MessageSquare,
  RotateCcw,
  Play
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Editor } from '@monaco-editor/react';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { COMPANY_LEVEL_PROBLEMS } from '@/lib/sheets-data';
import { submitCodeToJudge, SubmissionResult } from '@/lib/services/judgeService';
import { getInterviewFeedback, InterviewFeedbackResponse } from '@/ai/flows/interview-feedback-flow';
import { getReplayCritique } from '@/ai/flows/interview-replay-critique-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AIMentorPanel } from '@/features/ai-mentor/components/AIMentorPanel';

export default function MockInterviewArena() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();
  
  
  const [session, set_session] = React.useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = React.useState(true);
  
  useEffect(() => {
    if (sessionId) {
      apiClient.get(`/api/arena/${sessionId}`).then(res => set_session(res.data)).catch(console.error);
    }
  }, [sessionId]);
  useEffect(() => {
    if (session) setIsSessionLoading(false);
  }, [session]);
  
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [timeLeft, setTimeLeft] = useState(2700); // 45m
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<Record<string, SubmissionResult>>({});
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedbackResponse | null>(null);

  const problems = session?.problemIds?.map((id: string) => {
    return [...ARENA_PROBLEMS, ...COMPANY_LEVEL_PROBLEMS].find(p => p.id === id) || ARENA_PROBLEMS[0];
  }) || [];
  
  const currentProblem = problems[activeProblemIdx];
  const lastSavedCodeRef = useRef("");
  const startTimeRef = useRef(Date.now());

  // Snapshot Recording Logic
  useEffect(() => {
    if (!session || session.status !== 'active' || !user || !currentProblem) return;

    const recordSnapshot = async (event?: string) => {
      if (code === lastSavedCodeRef.current && !event) return;
      
      
      const payload = {
        timestamp: Date.now() - startTimeRef.current,
        code,
        language,
        problemId: currentProblem.id,
        event: event || 'typing',
        codeLength: code.length
      };
      
      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
      lastSavedCodeRef.current = code;
    };

    const interval = setInterval(() => recordSnapshot(), 15000); // Every 15s
    return () => clearInterval(interval);
  }, [code, session, user, currentProblem, language, sessionId]);

  useEffect(() => {
    if (currentProblem) {
      const starter = (currentProblem as any).starterCode;
      setCode(starter?.[language] || "");
    }
  }, [activeProblemIdx, language, currentProblem]);

  useEffect(() => {
    if (!session || session.status !== 'active') return;
    
    if (session.submissions) {
      setResults(session.submissions);
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { 
          clearInterval(interval);
          handleAutoFinalize(); 
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleAutoFinalize = () => {
    if (!isFinalizing && session?.status === 'active') {
      finalizeInterview();
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem || isSubmitting || session?.status !== 'active') return;
    setIsSubmitting(true);
    
    // Record explicit submit event
    if (user) {
      
      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    }

    try {
      const res = await submitCodeToJudge(code, language, currentProblem as any, 'submit');
      const newResults = { ...results, [currentProblem.id]: res };
      setResults(newResults);
      
      if (sessionRef) {
        apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
      }

      if (res.status === 'Accepted') {
        toast({ title: "Signal Accepted", description: "Interviewer is satisfied with this approach." });
        if (activeProblemIdx < problems.length - 1) {
          setTimeout(() => setActiveProblemIdx(prev => prev + 1), 1500);
        }
      } else {
        toast({ variant: "destructive", title: "Logical Error", description: "The interviewer detected a failure in your execution." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Transmission Error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizeInterview = async () => {
    if (isFinalizing || !currentProblem || !user) return;
    setIsFinalizing(true);
    try {
      const allPassed = problems.every(p => results[p.id]?.status === 'Accepted');
      const verdict = allPassed ? 'Accepted' : 'Partial/Incomplete';
      
      const aiFeedback = await getInterviewFeedback({
        problemTitle: currentProblem.title,
        problemDescription: currentProblem.description,
        userCode: code,
        language,
        resultStatus: verdict
      });

      setFeedback(aiFeedback);
      
      await apiClient.post(`/api/arena/${sessionId}/complete`, {
        feedback: aiFeedback,
        submissions: results
      });

      
      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
      
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Evaluation Core Offline", description: "Failed to generate report." });
    } finally {
      setIsFinalizing(false);
    }
  };

  if (isSessionLoading) return null;

  if (session?.status === 'completed' || feedback) {
    const finalScore = feedback?.mockScore || session?.score || 0;
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl w-full">
          <Card className="glass-card border-none bg-slate-900/60 p-12 space-y-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Swords size={200} className="text-indigo-400" />
            </div>
            
            <div className="text-center space-y-4">
              <div className={cn(
                "h-28 w-28 rounded-full flex items-center justify-center mx-auto text-5xl font-black italic text-white shadow-2xl border-4 border-white/10",
                finalScore >= 80 ? "bg-emerald-600 shadow-emerald-500/20" : 
                finalScore >= 50 ? "bg-indigo-600 shadow-indigo-500/20" : 
                "bg-red-600 shadow-red-500/20"
              )}>
                {finalScore}
              </div>
              <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter">Arena Report</h1>
              <Badge className="bg-indigo-600 text-white border-none px-8 py-1.5 italic font-black uppercase text-sm">
                Technical Readiness Rating
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                    <Bot size={16} /> Interviewer Summary
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed italic bg-black/40 p-6 rounded-2xl border border-white/5">
                    "{feedback?.summary || session?.feedback}"
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <BrainCircuit size={16} /> Technical Critique
                  </h3>
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-400 leading-relaxed">
                    {feedback?.technicalCritique || session?.technicalCritique}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <MessageSquare size={16} /> Behavioral Tip
                  </h3>
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-xs text-amber-200 leading-relaxed italic">
                      "{feedback?.behavioralTip || session?.behavioralTip}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">XP Earned</p>
                    <p className="text-3xl font-black text-emerald-400">+100</p>
                  </div>
                  <div className="bg-indigo-500/10 p-6 rounded-2xl border border-indigo-500/20 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</p>
                    <p className="text-xl font-black text-white uppercase italic">RECORDED</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={() => router.push(`/interview/mock/replay/${sessionId}`)}
                className="w-full h-20 bg-indigo-600 hover:bg-indigo-500 text-2xl font-black italic rounded-2xl shadow-xl flex items-center justify-center gap-4"
              >
                <Play size={28} className="fill-current" /> WATCH SESSION REPLAY
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/interview')} 
                className="w-full h-14 border-white/10 text-slate-400 hover:text-white uppercase font-black tracking-widest"
              >
                RETURN TO COMMAND CENTER
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      <header className="h-24 bg-slate-900/80 border-b border-red-500/20 px-10 flex items-center justify-between backdrop-blur-md relative z-20 shadow-2xl">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-3xl italic shadow-lg">M1</div>
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Candidate</p>
              <p className="text-xl font-black uppercase">{(user?.displayName || 'Explorer').split(' ')[0]}</p>
            </div>
          </div>
          <div className="h-12 w-px bg-white/5" />
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-black px-6 h-10 uppercase text-xs">Live Mock Session</Badge>
            <Badge variant="outline" className="border-white/10 text-slate-500 font-black px-6 h-10 uppercase text-xs italic">Stage {activeProblemIdx + 1} of 2</Badge>
          </div>
        </div>

        <div className="flex flex-col items-center bg-black/40 px-10 py-3 rounded-2xl border border-white/5">
          <div className={cn(
            "flex items-center gap-3 text-4xl font-mono font-black tabular-nums",
            timeLeft < 300 ? "text-red-500 animate-pulse" : "text-amber-500"
          )}>
            <Timer size={32} />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-[9px] uppercase font-bold text-slate-500 mt-1 tracking-[0.3em]">Evaluation Window</p>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={finalizeInterview}
            disabled={isFinalizing}
            className="h-14 bg-white/5 hover:bg-red-600/20 border border-white/10 text-white font-black italic uppercase px-10 rounded-xl"
          >
            {isFinalizing ? <Loader2 className="animate-spin" /> : 'SUBMIT ALL & FINISH'}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <section className="w-1/3 border-r border-white/5 bg-slate-950/30 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <div className="space-y-4">
            <Badge className="bg-indigo-600/20 border-none text-indigo-400 font-black uppercase text-[10px] px-3">{currentProblem?.category}</Badge>
            <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{currentProblem?.title}</h2>
            <p className="text-slate-400 leading-relaxed">{currentProblem?.description}</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-8">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                <Terminal size={14} className="text-indigo-400" /> Input Specification
              </p>
              <pre className="text-xs text-emerald-400 font-mono bg-black/40 p-5 rounded-2xl border border-white/5">{currentProblem?.inputFormat}</pre>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-indigo-400" /> Expected Output
              </p>
              <pre className="text-xs text-indigo-400 font-mono bg-black/40 p-5 rounded-2xl border border-white/5">{currentProblem?.outputFormat}</pre>
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col bg-[#1e1e1e] relative">
          <div className="h-12 bg-slate-900 border-b border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Code Buffer</span>
            </div>
            <div className="flex gap-4">
              <select 
                className="bg-white/5 border-none text-[10px] rounded px-4 py-1 outline-none text-slate-300 font-bold uppercase"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="python">Python 3</option>
                <option value="java">Java 17</option>
                <option value="cpp">C++ 20</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <Editor 
              height="100%" 
              theme="vs-dark" 
              language={language} 
              value={code} 
              onChange={(v) => setCode(v || "")}
              options={{ fontSize: 14, fontFamily: 'Fira Code', minimap: { enabled: false }, padding: { top: 20 }, automaticLayout: true }}
            />
          </div>

          <div className="h-64 bg-slate-950 border-t border-indigo-500/20 flex flex-col overflow-hidden">
            <div className="h-12 bg-black/40 border-b border-white/5 flex items-center justify-between px-6">
              <div className="flex items-center gap-6">
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 border-b-2 border-indigo-500 h-full">System Console</button>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="h-8 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase px-10 shadow-lg rounded-lg"
              >
                {isSubmitting ? 'VERIFYING...' : 'TRANSMIT SOLUTION'}
              </Button>
            </div>
            <div className="flex-1 p-8 font-mono text-xs overflow-y-auto">
              {results[currentProblem?.id] ? (
                <div className="space-y-4">
                  <div className={cn(
                    "flex items-center gap-3 text-sm font-black uppercase",
                    results[currentProblem?.id].status === 'Accepted' ? "text-emerald-400" : "text-red-400"
                  )}>
                    {results[currentProblem?.id].status === 'Accepted' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    {results[currentProblem?.id].status}
                  </div>
                  <p className="text-slate-500 italic">Interviewer Notes: Approach recorded. Passed {results[currentProblem?.id].passedCount} / {results[currentProblem?.id].totalTestCases} buffers.</p>
                </div>
              ) : (
                <div className="text-slate-600 italic">The interviewer is observing your logic pattern... no output yet.</div>
              )}
            </div>
          </div>
        </section>
      </main>

      <AIMentorPanel 
        problemTitle={currentProblem?.title}
        problemDescription={currentProblem?.description}
        currentCode={code}
        language={language}
        mode="arena"
      />
    </div>
  );
}
