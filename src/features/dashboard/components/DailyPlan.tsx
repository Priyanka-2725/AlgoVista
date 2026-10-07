'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Swords, 
  Bot,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { generateDailyPlan, getDailyPlan, toggleObjective, DailyPlan as DailyPlanType } from '@/features/dashboard/services/dailyPlanService';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function DailyPlan() {
  const { user } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<DailyPlanType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const fetchPlan = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getDailyPlan(todayStr);
      setPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [user]);

  useEffect(() => {
    if (!isLoading && !plan && user) {
      handleGenerate();
    }
  }, [plan, isLoading, user]);

  const handleGenerate = async () => {
    if (!user) return;
    setIsGenerating(true);
    const newPlan = await generateDailyPlan(user.id);
    setPlan(newPlan);
    setIsGenerating(false);
  };

  const handleTaskClick = (task: any) => {
    if (task.completed) return;
    if (task.type === 'topic') router.push(`/learn/concept/${task.linkedId}`);
    else if (task.type === 'problem') router.push(`/battles/practice?id=${task.linkedId}`);
    else if (task.type === 'mock') router.push('/interview/mock');
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'problem': return <BrainCircuit size={16} className="text-emerald-400" />;
      case 'topic': return <MessageSquare size={16} className="text-indigo-400" />;
      case 'mock': return <Swords size={16} className="text-red-400" />;
      default: return <Zap size={16} className="text-amber-400" />;
    }
  };

  return (
    <Card className="glass-card border-none bg-slate-900/40 overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
      
      <CardHeader className="flex flex-row items-center justify-between bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Calendar className="text-indigo-400" size={18} />
          <CardTitle className="text-sm font-black uppercase tracking-widest italic text-white">Daily Directive</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="h-8 text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400"
        >
          <RotateCcw className={cn("mr-1.5", isGenerating && "animate-spin")} size={12} />
          Resynthesize
        </Button>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {plan?.tasks.map((obj, idx) => (
              <motion.div
                key={obj.id || obj._id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex items-center gap-4 group cursor-pointer",
                  obj.isCompleted ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" : "bg-black/20 border-white/5 hover:border-indigo-500/30"
                )}
                onClick={() => handleTaskClick(obj)}
              >
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (user) {
                      const res = await toggleObjective(user.id, obj.id, plan.tasks, todayStr);
                      setPlan(res); // assuming toggle returns updated plan
                    }
                  }}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all",
                    obj.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-700 text-slate-700 hover:border-indigo-500"
                  )}
                >
                  {obj.isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {getIcon(obj.type)}
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{obj.type}</span>
                  </div>
                  <h4 className={cn(
                    "font-bold text-sm tracking-tight truncate",
                    obj.isCompleted ? "text-slate-500 line-through" : "text-white"
                  )}>
                    {obj.title}
                  </h4>
                </div>

                {!obj.isCompleted && <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Bot size={80} />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Coach Mode: Directive</span>
            </div>
            <p className="text-xs text-indigo-100 italic leading-relaxed">
              "{plan?.coachMessage || "Analyzing performance vectors... stand by for synchronization."}"
            </p>
            {plan?.isCompleted && (
              <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase pt-2">
                <Zap size={12} className="fill-emerald-400" /> Mission Complete! +50 XP Awarded
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
