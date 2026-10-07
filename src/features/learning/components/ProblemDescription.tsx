
"use client"

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Code2, Info, ListChecks, AlertCircle, Clock, Database, CheckCircle2 } from 'lucide-react';
import { Problem } from './ProblemList';

interface ProblemDescriptionProps {
  problem: Problem | null;
  isSolved?: boolean;
}

export function ProblemDescription({ problem, isSolved }: ProblemDescriptionProps) {
  if (!problem) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 italic p-8 text-center">
        <Code2 size={48} className="mb-4 opacity-10" />
        <p>Select a challenge from the list to begin practicing.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-6">
      <div className="space-y-8 pb-10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-white">{problem.title}</h2>
              <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                {problem.category}
              </Badge>
              {isSolved && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none gap-1.5 font-black italic text-[10px] uppercase">
                  <CheckCircle2 size={12} /> Solved
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold">
                <Clock size={12} /> {problem.timeLimit}ms
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold">
                <Database size={12} /> {problem.memoryLimit}MB
              </div>
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed text-sm">{problem.description}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Info size={18} />
            <h3 className="font-bold uppercase tracking-wider text-xs">Format</h3>
          </div>
          <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/5">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Input Format</p>
              <p className="text-sm text-slate-300">{problem.inputFormat}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Output Format</p>
              <p className="text-sm text-slate-300">{problem.outputFormat}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <ListChecks size={18} />
            <h3 className="font-bold uppercase tracking-wider text-xs">Sample Cases</h3>
          </div>
          <div className="space-y-4">
            {problem.sampleTestCases.map((example, idx) => (
              <div key={idx} className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Sample Case {idx + 1}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Input</p>
                    <pre className="text-xs text-emerald-400 font-mono bg-black/20 p-2 rounded overflow-x-auto">{example.input}</pre>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Expected Output</p>
                    <pre className="text-xs text-indigo-400 font-mono bg-black/20 p-2 rounded overflow-x-auto">{example.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle size={18} />
            <h3 className="font-bold uppercase tracking-wider text-xs">Constraints</h3>
          </div>
          <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
            {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </div>
    </ScrollArea>
  );
}
