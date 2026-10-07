'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight,
  Sparkles, 
  Zap, 
  BrainCircuit, 
  CheckCircle2,
  XCircle,
  RotateCcw,
  Info,
  Target,
  Trophy,
  Loader2,
  BookOpen,
  MessageSquare,
  Swords,
  Play
} from 'lucide-react';
import { SUBJECTS_HUB, Concept } from '@/lib/concepts-data';
import { ALGORITHMS } from '@/lib/algorithms-data';
import { useAuth } from '@/contexts/AuthContext';
import { getConceptExplanation } from '@/ai/flows/concept-explanation-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlgorithmVisualizer } from '@/features/learning/components/AlgorithmVisualizer';
import { apiClient } from '@/lib/apiClient';

type StudyStage = 'learn' | 'visualize' | 'quiz' | 'practice' | 'interview';

export default function ConceptMasteryPage() {
  const { conceptId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeStage, setActiveStage] = useState<StudyStage>('learn');
  const [unlockedStages, setUnlockedStages] = useState<StudyStage[]>(['learn']);
  
  // Learn state
  const [isMarkedLearned, setIsMarkedLearned] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSimpleExplanation, setAiSimpleExplanation] = useState<string | null>(null);

  // Quiz state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const concept = Object.values(SUBJECTS_HUB).flatMap(s => s.concepts).find(c => c.id === conceptId);

  // Handle stage unlocking logic based on active stage
  useEffect(() => {
    if (!concept) return;

    // If user enters Visual Lab, automatically unlock the Quiz in the sidebar
    if (activeStage === 'visualize' && !unlockedStages.includes('quiz')) {
      setUnlockedStages(prev => Array.from(new Set([...prev, 'quiz'])) as StudyStage[]);
    }

    // If user enters Practice Lab, automatically unlock Interview in the sidebar
    if (activeStage === 'practice' && !unlockedStages.includes('interview')) {
      setUnlockedStages(prev => Array.from(new Set([...prev, 'interview'])) as StudyStage[]);
    }
  }, [activeStage, unlockedStages, concept]);

  if (!concept) return null;

  const currentCard = concept.cards[currentCardIdx];
  const algorithmData = concept.visualizerId ? ALGORITHMS[concept.visualizerId] : null;
  const interactableCards = concept.cards.filter(c => c.type === 'quiz' || c.type === 'prediction');
  const totalInteractable = interactableCards.length;

  const handleMarkLearned = () => {
    setIsMarkedLearned(true);
    const newUnlocked = [...unlockedStages];
    if (concept.visualizerId) {
      newUnlocked.push('visualize');
    }
    // Always unlock quiz after learn is done
    newUnlocked.push('quiz');
    
    setUnlockedStages(Array.from(new Set(newUnlocked)) as StudyStage[]);
    
    toast({ 
      title: "Intel Absorbed", 
      description: concept.visualizerId ? "Theory confirmed. Visual Lab is now active." : "Theory confirmed. Micro-Quiz is now active." 
    });

    // Auto transition to next stage
    const nextStep = concept.visualizerId ? 'visualize' : 'quiz';
    setActiveStage(nextStep as StudyStage);
  };

  const handleVisualsComplete = () => {
    if (!unlockedStages.includes('quiz')) {
      setUnlockedStages(prev => Array.from(new Set([...prev, 'quiz'])) as StudyStage[]);
    }
    toast({ title: "Validation Ready", description: "Visuals confirmed. Start the Micro-Quiz." });
    setActiveStage('quiz');
  };

  const handleOptionSelect = async (idx: number) => {
    if (isAnswered || !currentCard) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = (currentCard.type === 'quiz' && idx === currentCard.quiz?.correctIndex) ||
                      (currentCard.type === 'prediction' && idx === currentCard.prediction?.correctIndex);

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      if (user) {
        apiClient.post('/dashboard/activities', { eventType: 'concept_quiz_correct', xpAmount: 5 }).catch(console.error);
      }
    }
  };

  const nextCard = () => {
    if (currentCardIdx < concept.cards.length - 1) {
      setCurrentCardIdx(currentCardIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      // Unlock subsequent stages
      if (!unlockedStages.includes('practice')) {
        setUnlockedStages(prev => Array.from(new Set([...prev, 'practice', 'interview'])) as StudyStage[]);
        toast({ title: "Mastery Deepens", description: "Quiz cleared. Practice & Interview modules unlocked." });
      }
    }
  };

  const handleAiSimple = async () => {
    setAiLoading(true);
    try {
      const res = await getConceptExplanation({ concept: concept.title, type: 'simple' });
      setAiSimpleExplanation(res.explanation);
    } catch (e) {
      toast({ variant: "destructive", title: "AI Busy" });
    } finally {
      setAiLoading(false);
    }
  };

  const stages = [
    { id: 'learn', label: '1. Intel (Learn)', icon: BookOpen },
    ...(concept.visualizerId ? [{ id: 'visualize', label: '2. Visual Lab', icon: Play }] : []),
    { id: 'quiz', label: concept.visualizerId ? '3. Micro-Quiz' : '2. Micro-Quiz', icon: Zap },
    { id: 'practice', label: concept.visualizerId ? '4. Practice Lab' : '3. Practice Lab', icon: Play },
    { id: 'interview', label: concept.visualizerId ? '5. Interview Arena' : '4. Interview Arena', icon: Swords }
  ];

  return (
    <AppShell>
      <div className="h-screen flex flex-col bg-[#020617] overflow-hidden">
        {/* Progress Header */}
        <div className="h-20 bg-slate-900/80 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500">
              <ChevronLeft />
            </Button>
            <div>
              <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">{concept.title}</h2>
              <div className="flex items-center gap-4 mt-1">
                {stages.map((stage) => {
                  const isUnlocked = unlockedStages.includes(stage.id as StudyStage);
                  const isActive = activeStage === stage.id;
                  return (
                    <div key={stage.id} className="flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 w-8 rounded-full transition-all",
                        isActive ? "bg-indigo-500 w-12" : isUnlocked ? "bg-emerald-500/50" : "bg-slate-800"
                      )} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 font-black italic">{concept.difficulty}</Badge>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Mastery</span>
              <span className="text-xl font-black text-indigo-400">{Math.round((unlockedStages.length / stages.length) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Rail */}
          <aside className="w-64 bg-slate-950/20 border-r border-white/5 p-6 flex flex-col gap-3">
            {stages.map((s) => {
              const isUnlocked = unlockedStages.includes(s.id as StudyStage);
              const isActive = activeStage === s.id;
              
              return (
                <button
                  key={s.id}
                  disabled={!isUnlocked}
                  onClick={() => setActiveStage(s.id as StudyStage)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl transition-all text-left w-full",
                    isActive ? "bg-indigo-600 text-white shadow-lg" : isUnlocked ? "text-slate-400 hover:bg-white/5" : "text-slate-700 opacity-50 cursor-not-allowed"
                  )}
                >
                  <s.icon size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">{s.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-10 relative">
            <AnimatePresence mode="wait">
              {activeStage === 'learn' && (
                <motion.div key="learn" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-3xl mx-auto space-y-10 pb-20">
                  <div className="space-y-4">
                    <Badge className="bg-indigo-600/20 text-indigo-400 border-none uppercase font-black px-3 py-1">CORE THEORY</Badge>
                    <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter">Understanding {concept.title}</h1>
                    <p className="text-xl text-slate-400 leading-relaxed italic border-l-4 border-indigo-500 pl-6">
                      {concept.analogy}
                    </p>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {concept.longExplanation}
                    </p>
                  </div>

                  <Card className="glass-card border-none bg-indigo-600/10 p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-indigo-400">
                        <Sparkles size={24} />
                        <h3 className="text-xl font-black uppercase italic">AI Logical Simplifier</h3>
                      </div>
                      <Button 
                        onClick={handleAiSimple} 
                        disabled={aiLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 font-black italic h-10 px-6 rounded-xl shadow-lg"
                      >
                        {aiLoading ? <Loader2 className="animate-spin" /> : 'DECODE JARGON'}
                      </Button>
                    </div>
                    {aiSimpleExplanation && (
                      <p className="text-sm text-indigo-100 italic leading-relaxed bg-black/20 p-6 rounded-2xl border border-white/5">
                        "{aiSimpleExplanation}"
                      </p>
                    )}
                  </Card>

                  <div className="flex justify-center pt-10">
                    <Button 
                      onClick={handleMarkLearned}
                      className={cn(
                        "h-20 w-full max-w-lg text-2xl font-black italic rounded-2xl transition-all shadow-2xl",
                        isMarkedLearned ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"
                      )}
                    >
                      {isMarkedLearned ? <><CheckCircle2 className="mr-3" /> INTEL ABSORBED</> : 'MARK AS LEARNED'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeStage === 'visualize' && algorithmData && (
                <motion.div key="visualize" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-10 pb-20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Badge className="bg-indigo-600/20 text-indigo-400 border-none uppercase font-black px-3 py-1">VISUAL LAB</Badge>
                      <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Observing {concept.title}</h1>
                    </div>
                    <Button onClick={handleVisualsComplete} className="bg-indigo-600 hover:bg-indigo-500 font-black italic shadow-lg">
                      CONTINUE TO QUIZ <ChevronRight size={16} className="ml-2" />
                    </Button>
                  </div>
                  <AlgorithmVisualizer algorithm={algorithmData} />
                </motion.div>
              )}

              {activeStage === 'quiz' && (
                <motion.div key="quiz" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center h-full">
                  {!quizFinished ? (
                    <Card className="glass-card border-none bg-slate-900/40 p-10 max-w-2xl w-full space-y-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      {currentCard ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Card {currentCardIdx + 1} / {concept.cards.length}</span>
                            <Badge className="bg-indigo-600/20 text-indigo-400 uppercase font-black italic">{currentCard.type}</Badge>
                          </div>
                          <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">{currentCard.title}</h3>
                          <p className="text-lg text-slate-300">{currentCard.content}</p>

                          {(currentCard.type === 'quiz' || currentCard.type === 'prediction') && (
                            <div className="grid grid-cols-1 gap-3 pt-4">
                              {(currentCard.type === 'quiz' ? currentCard.quiz?.options : currentCard.prediction?.options)?.map((opt, i) => {
                                const correctIdx = currentCard.type === 'quiz' ? currentCard.quiz?.correctIndex : currentCard.prediction?.correctIndex;
                                const isCorrect = i === correctIdx;
                                const isSelected = i === selectedOption;
                                return (
                                  <button
                                    key={i}
                                    onClick={() => handleOptionSelect(i)}
                                    disabled={isAnswered}
                                    className={cn(
                                      "w-full p-5 rounded-2xl border-2 text-left transition-all font-bold",
                                      !isAnswered ? "bg-white/5 border-white/5 hover:border-indigo-500/50 hover:bg-white/10" :
                                      isCorrect ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                                      isSelected ? "bg-red-500/20 border-red-500 text-red-400" :
                                      "bg-white/5 border-white/5 opacity-40"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {isAnswered && (currentCard.quiz?.explanation || currentCard.prediction?.scenario) && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 italic">
                              <p className="font-black uppercase text-[8px] mb-1 tracking-widest text-indigo-400">Expert Logic</p>
                              {currentCard.type === 'quiz' ? currentCard.quiz?.explanation : currentCard.prediction?.scenario}
                            </motion.div>
                          )}
                          
                          {(currentCard.type === 'theory' || isAnswered) && (
                            <div className="flex justify-end pt-4">
                              <Button onClick={nextCard} className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 font-black italic rounded-xl group shadow-xl">
                                CONTINUE <ChevronRight className="ml-2 group-hover:translate-x-1" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-10 space-y-6">
                          <p className="text-slate-500 italic">No validation cards found for this concept.</p>
                          <Button onClick={() => setQuizFinished(true)} className="bg-indigo-600">Complete Stage</Button>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <Card className="glass-card border-none bg-slate-900/60 p-12 text-center space-y-8 shadow-2xl max-w-md">
                      <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(99,102,241,0.4)]">
                        <Trophy size={64} className="text-white" />
                      </div>
                      <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Validation Complete</h2>
                      <div className="space-y-1">
                        <p className="text-4xl font-black text-indigo-400 italic">
                          {totalInteractable > 0 ? `${quizScore} / ${totalInteractable}` : 'Clear'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Logic Accuracy</p>
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Micro-Quiz cleared. Practice & Interview modules are now live.</p>
                      <Button onClick={() => setActiveStage('practice')} className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-xl font-black italic rounded-2xl">
                        ENTER LAB
                      </Button>
                    </Card>
                  )}
                </motion.div>
              )}

              {activeStage === 'practice' && (
                <motion.div key="practice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto space-y-10 pb-20">
                  <div className="space-y-4">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none uppercase font-black px-3 py-1">PRACTICE LAB</Badge>
                    <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">Refining Application</h1>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {concept.practiceQuestions.length > 0 ? concept.practiceQuestions.map((pq, i) => (
                      <Card key={i} className="glass-card border-none bg-slate-900/40 p-8 space-y-4 group">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-black text-indigo-400 uppercase italic tracking-tight">Challenge {i + 1}</h4>
                          <Badge variant="outline" className="border-white/5 text-slate-500 text-[8px] uppercase">{pq.difficulty}</Badge>
                        </div>
                        <p className="text-lg text-white font-bold tracking-tight">"{pq.question}"</p>
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                          <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Expert Answer</p>
                          <p className="text-sm text-slate-300 leading-relaxed italic">{pq.answer}</p>
                        </div>
                      </Card>
                    )) : (
                      <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-slate-500 italic uppercase font-black">No practice challenges available for this sector.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeStage === 'interview' && (
                <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center space-y-8">
                  <div className="h-24 w-24 bg-red-600 rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.3)] border-4 border-white/10">
                    <Swords size={48} className="text-white -rotate-12" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">Interview Arena</h2>
                    <p className="text-slate-400 max-w-md mx-auto">Justify your architecture and project decisions to the AI logic core in real-time.</p>
                  </div>
                  <Button 
                    onClick={() => router.push(`/interview/subjects`)}
                    className="h-20 w-full max-w-sm bg-red-600 hover:bg-red-500 text-2xl font-black italic rounded-2xl shadow-xl shadow-red-600/20"
                  >
                    START VIVA MODE
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
