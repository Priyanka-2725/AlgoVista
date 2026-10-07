import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Complexity } from '@/lib/algorithms-data';

export function ComplexityTable({ complexity }: { complexity: Complexity }) {
  const metrics = [
    { label: 'Best Case', value: complexity.best, color: 'text-emerald-400' },
    { label: 'Average Case', value: complexity.average, color: 'text-indigo-400' },
    { label: 'Worst Case', value: complexity.worst, color: 'text-red-400' },
    { label: 'Space Complexity', value: complexity.space, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((m) => (
        <Card key={m.label} className="glass-card bg-slate-900/40 border-none text-center p-6">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{m.label}</p>
          <p className={`text-2xl font-mono font-bold ${m.color}`}>{m.value}</p>
        </Card>
      ))}
      <div className="md:col-span-4 bg-white/5 border border-white/5 p-4 rounded-xl">
        <p className="text-sm text-slate-400 italic">
          <span className="text-indigo-400 font-bold not-italic">Note:</span> {complexity.explanation}
        </p>
      </div>
    </div>
  );
}
