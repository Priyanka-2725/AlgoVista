
"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Database, 
  Terminal,
  AlertTriangle,
  Play,
  ChevronRight,
  Code,
  Sparkles,
  Bot
} from 'lucide-react';
import { SubmissionResult } from '@/lib/services/judgeService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getMentorAdvice } from '@/ai/flows/ai-mentor-flow';
import { useToast } from '@/hooks/use-toast';

interface TestCasePanelProps {
  result: SubmissionResult | null;
  isRunning: boolean;
  type: 'run' | 'submit';
  problemId?: string;
  code?: string;
  language?: string;
}

export function TestCasePanel({ result, isRunning, type, problemId, code, language }: TestCasePanelProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [isExplaining, setIsExplaining] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (result && result.results.length > 0) {
      const failedIdx = result.results.findIndex(r => r.status !== 'Accepted');
      setSelectedIdx(failedIdx !== -1 ? failedIdx : 0);
    }
  }, [result]);

  const handleExplainError = async () => {
    if (!result || isExplaining) return;
    setIsExplaining(true);
    try {
      const advice = await getMentorAdvice({
        type: 'review',
        code,
        language,
        problemTitle: "Current Challenge",
        problemDescription: result.errorMessage || result.results[selectedIdx].error || "Logical error in test case"
      });
      toast({
        title: "AI Error Analysis",
        description: advice.message,
        duration: 8000
      });
    } catch (e) {
      toast({ variant: "destructive", title: "Mentor Offline" });
    } finally {
      setIsExplaining(false);
    }
  };

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-indigo-400 space-y-4">
        <Play className="animate-pulse" size={32} />
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest">Executing Solution...</p>
          <p className="text-[10px] text-slate-500 mt-1 italic">Unified OJS Pipeline Active</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2 italic">
        <Terminal size={32} className="opacity-10" />
        <p>Run your code to see output and test results.</p>
      </div>
    );
  }

  const activeResult = result.results[selectedIdx];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 text-sm font-black uppercase tracking-tighter",
            result.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'
          )}>
            {result.status === 'Accepted' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            {result.status}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
            Passed {result.passedCount} / {result.totalTestCases} Cases
          </div>
        </div>
        
        {result.status !== 'Accepted' && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleExplainError}
            disabled={isExplaining}
            className="h-8 text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 gap-2 border border-indigo-500/20"
          >
            {isExplaining ? <Sparkles className="animate-spin" size={12} /> : <Bot size={12} />}
            Explain Error
          </Button>
        )}
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Test Case Grid/List */}
        <div className="w-48 flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Test Results</p>
          {result.results.map((r, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg border text-left transition-all",
                selectedIdx === i 
                  ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                  : "bg-white/5 border-transparent hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-2">
                {r.status === 'Accepted' ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                  <XCircle size={12} className="text-red-400" />
                )}
                <span className={cn(
                  "text-[10px] font-bold",
                  selectedIdx === i ? "text-indigo-400" : "text-slate-400"
                )}>
                  Case {i + 1}
                </span>
              </div>
              {selectedIdx === i && <ChevronRight size={12} className="text-indigo-500" />}
            </button>
          ))}
        </div>

        {/* Detailed View */}
        <div className="flex-1 overflow-y-auto pr-2">
          <AnimatePresence mode="wait">
            {activeResult ? (
              <motion.div 
                key={selectedIdx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className={cn(
                  "p-4 rounded-xl border flex items-center justify-between",
                  activeResult.status === 'Accepted' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                )}>
                  <div className="space-y-1">
                    <p className={cn(
                      "text-xs font-black uppercase italic",
                      activeResult.status === 'Accepted' ? "text-emerald-400" : "text-red-400"
                    )}>
                      {activeResult.status}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      Runtime: {activeResult.time?.toFixed(0)}ms
                    </p>
                  </div>
                  {activeResult.status !== 'Accepted' && <AlertTriangle className="text-red-500" size={24} />}
                </div>

                {activeResult.error && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-red-400 uppercase font-black tracking-widest flex items-center gap-2">
                      <Code size={12} /> Execution Fault
                    </p>
                    <pre className="text-xs font-mono bg-red-500/10 p-4 rounded-xl text-red-300 border border-red-500/20 overflow-x-auto whitespace-pre-wrap">
                      {activeResult.error}
                    </pre>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Input Pattern</p>
                    <pre className="text-xs font-mono bg-black/40 p-3 rounded-xl text-slate-300 border border-white/5 whitespace-pre-wrap">
                      {activeResult.input || '[No Input]'}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Expected Output</p>
                      <pre className="text-xs font-mono bg-emerald-500/5 p-3 rounded-xl text-emerald-400/80 border border-emerald-500/10 whitespace-pre-wrap">
                        {activeResult.expectedOutput}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Your Result</p>
                      <pre className={cn(
                        "text-xs font-mono p-3 rounded-xl overflow-x-auto border min-h-[40px] whitespace-pre-wrap",
                        activeResult.status === 'Accepted' 
                          ? "bg-emerald-500/5 text-emerald-400/80 border-emerald-500/10" 
                          : "bg-red-500/5 text-red-400/80 border-red-500/10"
                      )}>
                        {activeResult.actualOutput || '[No Output]'}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Select a test case to view details.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
