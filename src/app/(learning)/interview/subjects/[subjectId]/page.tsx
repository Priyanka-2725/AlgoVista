'use client';
// @ts-nocheck

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Zap, 
  RotateCcw,
  MessageSquare,
  Bot,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { SUBJECTS, InterviewQuestion } from '@/lib/subjects-data';
import { getConceptExplanation } from '@/ai/flows/concept-explanation-flow';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SubjectDetailPage() {
  const { subjectId } = useParams();
  const router = useRouter();
  const subject = SUBJECTS[subjectId as string];

  if (!subject) return null;

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-10 pb-32">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/interview/subjects')}
            className="text-slate-500 hover:text-white p-0 gap-2 font-black uppercase text-[10px] tracking-widest"
          >
            <ChevronLeft size={14} /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-6">
            <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5", subject.color)}>
              <BrainCircuit size={40} />
            </div>
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{subject.title} Arena</h1>
              <p className="text-slate-400 text-lg">{subject.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {subject.questions.map((q, idx) => (
            <QuestionCard key={q.id} question={q} index={idx} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function QuestionCard({ question, index }: { question: InterviewQuestion, index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { user } = useAuth();
  
  const { toast } = useToast();

  const handleAiAction = async (type: 'simple' | 'example') => {
    setAiLoading(true);
    setIsOpen(true);
    try {
      const res = await getConceptExplanation({
        concept: question.question,
        type
      });
      setAiResponse(res.explanation);
      
      // Award XP for studying
      if (user) {
        
        apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
        toast({ title: "XP Awarded!", description: "+10 XP for conceptual deep-dive." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Concept engine is busy." });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Card className="glass-card border-none bg-slate-900/40 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex gap-6 items-start">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 font-black italic shrink-0">
              {index + 1}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-white/5 text-slate-500 text-[8px] uppercase tracking-widest px-2">
                  {question.category}
                </Badge>
                <Badge className={cn(
                  "text-[8px] font-black uppercase border-none h-5",
                  question.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-400" :
                  question.difficulty === 'Medium' ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-400"
                )}>
                  {question.difficulty}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-white italic tracking-tight">{question.question}</h3>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 hover:text-white"
          >
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 space-y-6">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                    <Bot size={14} /> Expert Definition
                  </p>
                  <p className="text-slate-300 leading-relaxed text-sm">
                    {question.answer}
                  </p>
                </div>

                {aiResponse && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 space-y-2">
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                      <Sparkles size={14} /> AI Intel Deep-Dive
                    </p>
                    <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
                      {aiResponse}
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAiAction('simple')}
                    disabled={aiLoading}
                    className="bg-white/5 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase h-9 rounded-lg"
                  >
                    {aiLoading ? <Loader2 className="animate-spin mr-2" /> : <Zap size={12} className="mr-2" />}
                    Explain Simply
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleAiAction('example')}
                    disabled={aiLoading}
                    variant="outline"
                    className="border-white/5 hover:bg-white/5 text-[10px] font-black uppercase h-9 rounded-lg text-slate-400"
                  >
                    <MessageSquare size={12} className="mr-2" />
                    Real-World Example
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
