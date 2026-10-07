'use client';
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  MessageSquare, 
  Send, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Trophy,
  History,
  RotateCcw,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { evaluateBehavioralResponse, BehavioralEvalResponse } from '@/ai/flows/behavioral-eval-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const QUESTIONS = [
  { id: 'intro', category: 'HR Essentials', question: 'Tell me about yourself and your journey as a developer.' },
  { id: 'challenge', category: 'Conflict & Challenge', question: 'Describe a difficult technical challenge you faced and how you overcame it.' },
  { id: 'teamwork', category: 'Teamwork', question: 'Tell me about a time you had a disagreement with a team member. How did you handle it?' },
  { id: 'why-us', category: 'HR Essentials', question: 'Why do you want to join our engineering team specifically?' },
  { id: 'failure', category: 'Growth Mindset', question: 'Tell me about a time you failed at something. What did you learn?' }
];

export default function BehavioralPracticePage() {
  const { user } = useAuth();
  
  const { toast } = useToast();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<BehavioralEvalResponse | null>(null);
  const [sessionResults, setSessionResults] = useState<BehavioralEvalResponse[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUESTIONS[currentIdx];

  const handleEvaluate = async () => {
    if (!answer.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateBehavioralResponse({
        question: currentQ.question,
        answer: answer
      });
      setEvalResult(result);
      setSessionResults(prev => [...prev, result]);
      toast({ title: "Analysis Complete", description: "The AI Coach has evaluated your response." });
    } catch (e) {
      toast({ variant: "destructive", title: "Coach Offline", description: "AI evaluation failed. Please try again." });
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < QUESTIONS.length - 1) {
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

    const avgClarity = sessionResults.reduce((acc, r) => acc + r.score.clarity, 0) / sessionResults.length;
    const avgStructure = sessionResults.reduce((acc, r) => acc + r.score.structure, 0) / sessionResults.length;
    const finalScore = Math.round(((avgClarity + avgStructure) / 2) * 10);

    // Reward XP
    
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);

    // Log activity
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
  };

  if (isFinished) {
    const totalScore = Math.round(sessionResults.reduce((acc, r) => acc + (r.score.clarity + r.score.structure + r.score.relevance) / 3, 0) / sessionResults.length * 10);
    
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
                <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter">Session Complete</h1>
                <p className="text-slate-400 uppercase font-bold tracking-[0.2em] text-xs">Behavioral Mastery Rating</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">XP Earned</p>
                  <p className="text-3xl font-black text-indigo-400">+50</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Verdict</p>
                  <p className="text-xl font-black text-white uppercase italic">
                    {totalScore >= 80 ? 'Excellent' : totalScore >= 60 ? 'Good' : 'Needs Work'}
                  </p>
                </div>
              </div>
              <Button onClick={() => window.location.reload()} className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-xl font-black italic">
                PRACTICE AGAIN
              </Button>
            </Card>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto space-y-10 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">AI Behavioral Coach</h1>
            <p className="text-slate-400 text-lg">Master your communication and project professional confidence.</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 px-6 py-2 h-10 uppercase font-black italic">
              Question {currentIdx + 1} of {QUESTIONS.length}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Question & Input Area */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="glass-card border-none bg-indigo-600/10 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <MessageSquare size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-indigo-600 text-white border-none text-[10px] font-black uppercase italic px-3">
                    {currentQ.category}
                  </Badge>
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tight leading-tight">
                  "{currentQ.question}"
                </h2>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <RotateCcw size={14} /> Your Response
                </h3>
                <span className="text-[10px] font-bold text-slate-600 uppercase italic">Minimum 50 words recommended</span>
              </div>
              <Textarea 
                placeholder="Type your response here. Use the STAR method: Situation, Task, Action, Result..."
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
                      <><Loader2 className="mr-2 animate-spin" /> ANALYZING...</>
                    ) : (
                      <><Sparkles className="mr-2 group-hover:animate-pulse" /> EVALUATE RESPONSE</>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={nextQuestion}
                    className="h-16 px-12 bg-emerald-600 hover:bg-emerald-500 text-xl font-black italic rounded-2xl group"
                  >
                    NEXT QUESTION <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Area */}
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
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Bot size={20} />
                      <h3 className="text-sm font-black uppercase tracking-widest italic">Coach Analysis</h3>
                    </div>

                    <div className="space-y-6">
                      {[
                        { label: 'Clarity', score: evalResult.score.clarity, color: 'bg-emerald-500' },
                        { label: 'Structure', score: evalResult.score.structure, color: 'bg-indigo-500' },
                        { label: 'Relevance', score: evalResult.score.relevance, color: 'bg-amber-500' }
                      ].map((s) => (
                        <div key={s.label} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-slate-400">{s.label}</span>
                            <span className="text-white">{s.score}/10</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${s.score * 10}%` }}
                              className={cn("h-full", s.color)} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 italic text-sm text-slate-300 leading-relaxed">
                      "{evalResult.feedback}"
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                        <Lightbulb size={14} /> Tactical Improvements
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
                    <p className="text-slate-500 font-bold uppercase italic text-sm">Waiting for Response</p>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">
                      The AI Coach will evaluate your answer for structure and professional tone once submitted.
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
