
"use client"

import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';

interface SkillRadarChartProps {
  activities: any[] | null;
}

const CATEGORIES = ['Arrays', 'Searching', 'Sorting', 'Graph', 'Dynamic Programming', 'Strings', 'Greedy'];

export function SkillRadarChart({ activities }: SkillRadarChartProps) {
  const chartData = React.useMemo(() => {
    const stats: Record<string, { solved: number; attempted: number }> = {};
    CATEGORIES.forEach(cat => stats[cat] = { solved: 0, attempted: 0 });

    activities?.forEach(act => {
      if (!act.category) return;
      const cat = CATEGORIES.find(c => act.category.toLowerCase().includes(c.toLowerCase()));
      if (cat) {
        stats[cat].attempted++;
        if (act.result === 'correct' || act.result === 'completed') {
          stats[cat].solved++;
        }
      }
    });

    return CATEGORIES.map(cat => {
      const s = stats[cat];
      // Score calculation: (solved * 10) + (successRate * 0.5)
      const successRate = s.attempted > 0 ? (s.solved / s.attempted) * 100 : 0;
      const score = Math.min(100, (s.solved * 15) + (successRate * 0.2));
      
      return {
        subject: cat,
        value: score === 0 ? 10 : score, // Give a small base for visual balance
        fullMark: 100,
      };
    });
  }, [activities]);

  return (
    <Card className="glass-card border-none bg-slate-900/40 h-full">
      <CardHeader>
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400 uppercase tracking-widest">
          <BrainCircuit size={16} /> Algorithm Proficiency
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
