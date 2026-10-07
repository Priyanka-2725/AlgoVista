'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { LearningStep, getDefaultPath, generateLearningPath, getLearningPath, LearningPathData } from '@/features/learning/services/learningPathGenerator';
import { Sparkles, BrainCircuit, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LearningStepList } from '@/features/learning/components/LearningStepList';
import { LearningProgressTracker } from '@/features/learning/components/LearningProgressTracker';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LearningPathsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showDefault, setShowDefault] = useState(false);
  const [pathData, setPathData] = useState<LearningPathData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchPath = async () => {
      try {
        setIsLoading(true);
        const data = await getLearningPath();
        setPathData(data);
      } catch (e) {
        console.error(e);
        setShowDefault(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPath();
  }, [user]);

  const handleRegenerate = async () => {
    if (!user) return;
    setIsRegenerating(true);
    try {
      await generateLearningPath();
      const updated = await getLearningPath();
      setPathData(updated);
      toast({ title: "Roadmap Updated", description: "AI has generated a new learning path based on your latest activity." });
    } catch (e) {
      console.error(e);
    } finally {
      setIsRegenerating(false);
    }
  };

  const steps = pathData?.recommendedSteps || (showDefault ? getDefaultPath() : []);
  const currentIdx = pathData?.currentStepIndex ?? 0;
  const completedIndices = pathData?.completedStepIndices ?? [];

  if (isLoading && !showDefault) {
    return (
      <div className="flex h-screen bg-[#020617] overflow-hidden">
        <NavigationSidebar />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Sparkles className="text-indigo-500 animate-pulse" size={48} />
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Synthesizing Roadmap...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black font-headline tracking-tighter italic text-white flex items-center gap-4 uppercase">
                <BrainCircuit className="text-indigo-500" size={48} />
                Algorithm Roadmap
              </h1>
              <p className="text-slate-400 text-lg">AI-powered progression strategy tailored to your performance.</p>
            </div>
            <Button 
              onClick={handleRegenerate} 
              disabled={isRegenerating}
              variant="outline" 
              className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 font-bold uppercase"
            >
              <RotateCcw className={cn("mr-2", isRegenerating && "animate-spin")} size={16} />
              {isRegenerating ? "Synthesizing..." : "Refresh Strategy"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-indigo-400" /> Recommended Steps
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Master tasks to unlock rewards</span>
                </div>
                <LearningStepList 
                  steps={steps} 
                  currentStepIndex={currentIdx}
                  completedStepIndices={completedIndices}
                />
              </Card>

              {showDefault && !pathData && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 flex gap-4">
                  <AlertCircle className="text-amber-500 shrink-0" size={24} />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-200">Default Roadmap Active</p>
                    <p className="text-xs text-slate-400">We're still analyzing your profile. In the meantime, follow this standard progression path to get started.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <LearningProgressTracker completed={completedIndices.length} total={steps.length || 5} />
              
              <Card className="glass-card border-none bg-slate-900/40 p-6 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Weekly Focus</h4>
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs text-indigo-300 font-bold mb-1 uppercase">Foundation Building</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Start by mastering Search and Array patterns to build a solid foundation for complex Graph algorithms.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
