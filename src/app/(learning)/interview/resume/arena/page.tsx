'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Loader2,
  Trophy,
  RotateCcw,
  ArrowRight,
  BrainCircuit,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { evaluateResumeAnswer, ResumeEvalResponse } from '@/ai/flows/resume-eval-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ResumeInterviewArena() {
  const { user } = useAuth();
  
  const { toast } = useToast();

  
  const [resumeData, set_resumeData] = React.useState<any>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<ResumeEvalResponse | null>(null);
  const [sessionResults, setSessionResults] = useState<ResumeEvalResponse[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const questions = resumeData?.questions || [];
  const currentQ = questions[currentIdx];

  const handleEvaluate = async () => {
    if (!answer.trim() || isEvaluating || !currentQ) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateResumeAnswer({
        question: currentQ.text,
        answer: answer,
        context: currentQ.context
      });
      setEvalResult(result);
      setSessionResults(prev => [...prev, result]);
      toast({ title: "Point Recorded", description: "The Senior Interviewer has evaluated your project ownership." });
    } catch (e) {
      toast({ variant: "destructive", title: "Evaluation Failed", description: "Logic core unstable. Try again." });
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1 && currentIdx < 4) { // Cap at 5 questions for MVP
      setCurrentIdx(currentIdx + 1);
      setAnswer("");
      setEvalResult(null);
    } else {
      finalizeSession();
    }
  };

  const finalizeSession = async () => {
    setIsFinished(true);
    if (!user) return;

    const avgScore = sessionResults.reduce((acc, r) => acc + r.score, 0) / sessionResults.length;
    const finalRating = Math.round(avgScore * 10);

    // Reward XP
    
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);

    // Log activity
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
  };

  if (false) return null;

  if (isFinished) {
    const totalScore = Math.round(sessionResults.reduce((acc, r) => acc + r.score, 0) / sessionResults.length * 10);
    
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center p-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full">
            <Card className="glass-card border-none bg-slate-900/60 p-12 text-center space-y-8 shadow-2xl">
              <div className="flex justify-center">
                <div className={cn(
                  "h-32 w-32 rounded-full flex items-center justify-center text-5xl font-black italic border-4",
                  totalScore >= 80 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                  totalScore >= 60 ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" :
                  "bg-red-500/20 border-red-500 text-red-400"
                )}>
                  {totalScore}
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter">Debrief Complete</h1>
                <Badge className="bg-indigo-600 text-white border-none px-6 py-1 italic font-black uppercase text-xs">
                  Project Ownership Rating
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">XP Earned</p>
                  <p className="text-3xl font-black text-indigo-400">+50</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Verdict</p>
                  <p className="text-xl font-black text-white uppercase italic">
                    {totalScore >= 80 ? 'Architect' : totalScore >= 60 ? 'Builder' : 'Junior'}
                  </p>
                </div>
              </div>
              <Button onClick={() => window.location.reload()} className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-xl font-black italic rounded-2xl">
                RE-INITIALIZE ARENA
              </Button>
            </Card>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  if (!currentQ) return (
    <AppShell>
      <div className="h-screen flex items-center justify-center text-slate-500 uppercase font-black italic">
        No questions generated. Return to Intel Center.
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto space-y-10 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Project Deep-Dive</h1>
            <p className="text-slate-400 text-lg">Justify your architecture and project decisions to the logic core.</p>
          </div>
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 px-6 py-2 h-10 uppercase font-black italic">
            Stage {currentIdx + 1} of {Math.min(questions.length, 5)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <Card className="glass-card border-none bg-indigo-600/10 p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <BrainCircuit size={150} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-indigo-600 text-white border-none text-[10px] font-black uppercase italic px-3">
                    Project Analysis
                  </Badge>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentQ.context}</span>
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tight leading-tight">
                  "{currentQ.text}"
                </h2>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <MessageSquare size={14} /> Technical Defense
                </h3>
                <span className="text-[10px] font-bold text-slate-600 uppercase italic">Describe your reasoning & implementation details</span>
              </div>
              <Textarea 
                placeholder="Explain the technical implementation, why you chose the stack, and how you handled the mentioned challenge..."
                className="min-h-[300px] bg-slate-900/40 border-white/5 focus:border-indigo-500/50 text-lg leading-relaxed p-8 rounded-3xl resize-none"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={!!evalResult}
              />
              <div className="flex justify-end pt-4">
                {!evalResult ? (
                  <Button 
                    onClick={handleEvaluate}
                    disabled={isEvaluating || !answer.trim()}
                    className="h-16 px-12 bg-indigo-600 hover:bg-indigo-500 text-xl font-black italic rounded-2xl shadow-xl shadow-indigo-500/20 group"
                  >
                    {isEvaluating ? (
                      <><Loader2 className="mr-2 animate-spin" /> EVALUATING DEPTH...</>
                    ) : (
                      <><Zap className="mr-2 group-hover:animate-pulse" /> SUBMIT RESPONSE</>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={nextQuestion}
                    className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-xl font-black italic rounded-2xl group"
                  >
                    CONTINUE MISSION <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {evalResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Bot size={20} />
                        <h3 className="text-sm font-black uppercase tracking-widest italic">Interviewer Feedback</h3>
                      </div>
                      <Badge className={cn(
                        "text-[9px] font-black uppercase italic",
                        evalResult.technicalDepth === 'Expert' || evalResult.technicalDepth === 'High' ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      )}>
                        Depth: {evalResult.technicalDepth}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                        <span className="text-slate-400">Ownership Score</span>
                        <span className="text-white">{evalResult.score}/10</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${evalResult.score * 10}%` }}
                          className="h-full bg-indigo-500" 
                        />
                      </div>
                    </div>

                    <p className="p-6 rounded-2xl bg-white/5 border border-white/5 italic text-sm text-slate-300 leading-relaxed">
                      "{evalResult.feedback}"
                    </p>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        <Target size={14} /> Mastery Suggestions
                      </h4>
                      <div className="space-y-2">
                        {evalResult.suggestions.map((s, i) => (
                          <div key={i} className="flex gap-3 text-xs text-slate-400 bg-black/20 p-3 rounded-xl border border-white/5">
                            <span className="text-emerald-400 font-bold">•</span>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 border-2 border-dashed border-white/5 rounded-[40px]">
                  <div className="h-20 w-20 rounded-full bg-indigo-500/5 flex items-center justify-center text-indigo-500/20">
                    <Bot size={48} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-500 font-bold uppercase italic text-sm">Waiting for Defense</p>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-[200px] mx-auto">
                      Explain your technical reasoning to receive a depth analysis and ownership score.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
