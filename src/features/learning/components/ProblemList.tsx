
"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, CheckCircle2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<string, string>;
  sampleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  timeLimit: number; // ms
  memoryLimit: number; // MB
}

interface ProblemListProps {
  problems: Problem[];
  selectedProblemId: string | null;
  onSelect: (problem: Problem) => void;
  solvedIds?: string[];
}

export function ProblemList({ problems, selectedProblemId, onSelect, solvedIds = [] }: ProblemListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "solved" | "unsolved">("all");

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "solved") return matchesSearch && solvedIds.includes(p.id);
    if (filter === "unsolved") return matchesSearch && !solvedIds.includes(p.id);
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <Input 
          placeholder="Search challenges..." 
          className="pl-10 bg-slate-900/50 border-white/5 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)} className="w-full">
        <TabsList className="bg-slate-900/50 border border-white/5 p-1 h-9 w-full">
          <TabsTrigger value="all" className="flex-1 text-[10px] uppercase font-bold">All</TabsTrigger>
          <TabsTrigger value="solved" className="flex-1 text-[10px] uppercase font-bold">Solved</TabsTrigger>
          <TabsTrigger value="unsolved" className="flex-1 text-[10px] uppercase font-bold">New</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3">
          {filteredProblems.map((problem) => {
            const isSolved = solvedIds.includes(problem.id);
            
            return (
              <Card 
                key={problem.id}
                onClick={() => onSelect(problem)}
                className={`cursor-pointer transition-all border-none relative overflow-hidden ${
                  selectedProblemId === problem.id 
                  ? 'bg-indigo-600/20 ring-1 ring-indigo-500' 
                  : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {isSolved && (
                  <div className="absolute top-0 right-0 p-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                )}
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-white truncate pr-4">{problem.title}</h4>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-none uppercase flex-shrink-0 ${
                      problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                      problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{problem.category}</p>
                    {isSolved && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter italic">Completed</span>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredProblems.length === 0 && (
            <div className="text-center py-10 text-slate-600 text-xs italic">
              No challenges found matching filters.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
