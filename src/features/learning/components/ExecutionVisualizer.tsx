'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Zap, 
  Database,
  Code2,
  Sparkles,
  Bot,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EXECUTION_DATA, ExecutionStep } from '@/lib/execution-steps';
import { cn } from '@/lib/utils';
import { getMentorAdvice } from '@/ai/flows/ai-mentor-flow';
import { useToast } from '@/hooks/use-toast';

interface ExecutionVisualizerProps {
  problemId: string;
  onClose?: () => void;
}

export function ExecutionVisualizer({ problemId, onClose }: ExecutionVisualizerProps) {
  const data = EXECUTION_DATA[problemId];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const [isExplaining, setIsExplaining] = useState(false);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle className="text-slate-700" size={48} />
        <p className="text-slate-500 font-bold uppercase italic">Execution trace not available for this problem.</p>
        <Button variant="outline" onClick={onClose} className="border-white/10 text-slate-400">Return to Editor</Button>
      </div>
    );
  }

  const step = data.steps[currentIdx];
  const lines = data.code.split('\n');

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIdx((prev) => {
          if (prev >= data.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500 - speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, speed, data.steps.length]);

  const handleExplain = async () => {
    if (isExplaining) return;
    setIsExplaining(true);
    try {
      const res = await getMentorAdvice({
        type: 'review',
        code: data.code,
        problemTitle: problemId,
        problemDescription: `Currently at line ${step.line}: ${step.description}. Current variables: ${JSON.stringify(step.variables)}`,
        language: data.language
      });
      toast({
        title: "AI Step Insight",
        description: res.message,
        duration: 6000
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Coach Offline" });
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-hidden">
      {/* Visual Canvas */}
      <div className="flex-1 min-h-[300px] bg-slate-950/50 rounded-3xl border border-white/5 p-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Zap size={18} />
            </div>
            <h3 className="text-sm font-black uppercase italic tracking-widest text-white">Live Execution Buffer</h3>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-[10px] font-black text-indigo-400 uppercase italic">STEP {currentIdx + 1} / {data.steps.length}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-12">
          {/* Data Structure View */}
          <div className="flex flex-wrap justify-center gap-4">
            {step.array.map((val, idx) => (
              <motion.div
                key={idx}
                layout
                className={cn(
                  "w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black text-xl transition-all duration-300",
                  step.highlights.includes(idx) 
                    ? "border-indigo-500 bg-indigo-500/20 text-white scale-110 shadow-[0_0_30px_rgba(99,102,241,0.4)]" 
                    : "border-slate-800 bg-slate-900/50 text-slate-500"
                )}
              >
                {val}
                <div className="absolute -bottom-6 text-[10px] font-bold text-slate-600">idx {idx}</div>
              </motion.div>
            ))}
          </div>

          {/* Explanation Banner */}
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-600/10 border-l-4 border-indigo-500 p-6 rounded-r-2xl min-h-[80px] flex items-center shadow-xl relative group"
          >
            <div className="flex gap-4 items-center w-full">
              <Info className="text-indigo-400 shrink-0" size={24} />
              <p className="text-sm text-indigo-100 italic font-medium leading-relaxed flex-1">{step.description}</p>
              <Button 
                onClick={handleExplain}
                disabled={isExplaining}
                size="sm" 
                variant="ghost" 
                className="h-8 text-[10px] font-black uppercase text-indigo-400 hover:bg-indigo-500/10 gap-2 shrink-0"
              >
                {isExplaining ? <Loader2 className="animate-spin" size={12} /> : <Bot size={14} />}
                Why this?
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-72">
        {/* Code Panel */}
        <div className="lg:col-span-7 bg-[#1e1e1e] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          <div className="h-10 bg-slate-900/80 border-b border-white/5 flex items-center px-4 gap-2">
            <Code2 size={14} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Source Trace ({data.language})</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed scrollbar-hide">
            {lines.map((line, i) => (
              <div 
                key={i} 
                className={cn(
                  "px-4 py-0.5 rounded transition-colors whitespace-pre",
                  step.line === i + 1 ? "bg-indigo-500/20 text-white font-bold border-l-2 border-indigo-500 -ml-4 pl-6" : "text-slate-500"
                )}
              >
                <span className="inline-block w-6 text-slate-700 select-none mr-2">{i + 1}</span>
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Variables Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex-1 bg-slate-900/40 rounded-2xl border border-white/5 p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Database size={14} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Memory Stack</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(step.variables).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <p className="text-[9px] text-slate-600 font-bold uppercase mb-1">{key}</p>
                  <p className="text-sm font-mono text-indigo-400 font-black">{String(val)}</p>
                </div>
              ))}
              {Object.keys(step.variables).length === 0 && (
                <p className="text-[10px] text-slate-700 italic uppercase font-bold">No active local variables</p>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="h-16 bg-slate-900/80 rounded-2xl border border-white/5 flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-500" 
                onClick={() => { setIsPlaying(false); setCurrentIdx(0); }}
              >
                <RotateCcw size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-500" 
                disabled={currentIdx === 0}
                onClick={() => { setIsPlaying(false); setCurrentIdx(prev => prev - 1); }}
              >
                <ChevronLeft size={18} />
              </Button>
              <Button 
                className="h-10 w-10 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg" 
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-500" 
                disabled={currentIdx === data.steps.length - 1}
                onClick={() => { setIsPlaying(false); setCurrentIdx(prev => prev + 1); }}
              >
                <ChevronRight size={18} />
              </Button>
            </div>
            <Button variant="outline" onClick={onClose} className="h-8 border-white/5 text-[10px] font-black uppercase italic">
              Close Trace
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { AlertCircle } from 'lucide-react';
