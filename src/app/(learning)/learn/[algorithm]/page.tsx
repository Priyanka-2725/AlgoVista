
"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Zap, 
  Info, 
  Terminal, 
  Play, 
  Lightbulb,
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';
import { ALGORITHMS } from '@/lib/algorithms-data';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import { completeLearningStep, getLearningPath, LearningPathData } from '@/features/learning/services/learningPathGenerator';
import { apiClient } from '@/lib/apiClient';

import { AlgorithmVisualizer } from '@/features/learning/components/AlgorithmVisualizer';
import { CodeViewer } from '@/features/learning/components/CodeViewer';
import { ComplexityTable } from '@/features/learning/components/ComplexityTable';
import { QuizComponent } from '@/features/learning/components/QuizComponent';

export default function AlgorithmDetailPage() {
  const { algorithm: algoId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  
  const algorithm = ALGORITHMS[algoId as string];
  const [hasAwardedXP, setHasAwardedXP] = useState(false);
  const [pathData, setPathData] = useState<LearningPathData | null>(null);

  useEffect(() => {
    if (user) {
      getLearningPath().then(setPathData).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!algorithm) {
      router.push('/learn');
      return;
    }
    trackEvent('algorithm_viewed', { problemDifficulty: algorithm.difficulty });
  }, [algorithm, router, trackEvent]);

  const handleComplete = async () => {
    if (hasAwardedXP || !user) return;

    try {
      await apiClient.post('/dashboard/activities', {
        eventType: 'algorithm_mastered',
        xpAmount: 10
      });

      // Check and update roadmap progress
      if (pathData) {
        const currentIdx = pathData.currentStepIndex ?? 0;
        const currentTask = pathData.recommendedSteps?.[currentIdx];
        if (currentTask?.type === 'visualization' && algorithm.category.includes(currentTask.category)) {
          await completeLearningStep(currentIdx);
        }
      }

      setHasAwardedXP(true);
      toast({
        title: "Achievement Unlocked!",
        description: `You've learned ${algorithm.name} and earned 10 XP!`,
      });
    } catch (e) {
      console.error("Error logging progress:", e);
    }
  };

  if (!algorithm) return null;

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 space-y-12 pb-32">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/learn')}
              className="text-slate-400 hover:text-white gap-2"
            >
              <ChevronLeft size={16} /> Back to Library
            </Button>
            <div className="flex gap-2">
               <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5">
                {algorithm.category}
              </Badge>
              <Badge variant="outline" className="border-slate-700 text-slate-400">
                {algorithm.difficulty}
              </Badge>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-black font-headline tracking-tighter text-white uppercase italic">
              {algorithm.name}
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
              {algorithm.shortDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card bg-slate-900/40 border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-400">
                  <Info size={20} /> Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Use Case</p>
                  <p className="text-slate-200">{algorithm.useCase}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card bg-slate-900/40 border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <Terminal size={20} /> Specs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-200">{algorithm.problemStatement.description}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card bg-slate-900/40 border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-400">
                <LayoutGrid size={20} /> Core Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {algorithm.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/20">
                      {idx + 1}
                    </span>
                    <p className="text-slate-300 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Zap size={24} className="text-yellow-400" /> Complexity
            </h3>
            <ComplexityTable complexity={algorithm.complexity} />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Terminal size={24} className="text-slate-400" /> Implementations
            </h3>
            <CodeViewer code={algorithm.code} />
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Play size={24} className="text-indigo-400" /> Visualization
            </h3>
            <AlgorithmVisualizer algorithm={algorithm} />
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-tighter">
              <Lightbulb size={24} className="text-yellow-400" /> Mastery Test
            </h3>
            <QuizComponent 
              questions={algorithm.quiz} 
              onComplete={handleComplete} 
              completed={hasAwardedXP} 
            />
          </div>

          {hasAwardedXP && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-emerald-500/20">
                <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <h4 className="text-2xl font-bold text-white uppercase italic">Algorithm Mastered</h4>
              <Button onClick={() => router.push('/learn')} className="bg-emerald-600 hover:bg-emerald-500">
                Explore More
              </Button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
