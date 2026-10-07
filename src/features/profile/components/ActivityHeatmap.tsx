
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays, startOfDay, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from 'lucide-react';

interface ActivityHeatmapProps {
  activityData: any[] | null;
}

export function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  // Generate last 365 days grouped by weeks
  const gridData = React.useMemo(() => {
    const today = startOfDay(new Date());
    const startDate = subDays(today, 364);
    const startOfGrid = startOfWeek(startDate);
    const endOfGrid = endOfWeek(today);

    const allDays = eachDayOfInterval({ start: startOfGrid, end: endOfGrid });
    
    // Group into weeks (7 days each)
    const weeks = [];
    let currentWeek = [];

    for (const day of allDays) {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = activityData?.find(d => d.date === dayStr)?.count || 0;
      
      currentWeek.push({ day, count });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  }, [activityData]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-800/40';
    if (count === 1) return 'bg-indigo-900/60';
    if (count === 2) return 'bg-indigo-700/80';
    if (count === 3) return 'bg-indigo-500';
    return 'bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]';
  };

  return (
    <Card className="glass-card border-none bg-slate-900/40 overflow-hidden">
      <CardHeader className="pb-6 border-b border-white/5 bg-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black flex items-center gap-2 text-indigo-400 uppercase tracking-widest italic">
            <Calendar size={16} /> Activity Universe
          </CardTitle>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase">
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-slate-800/40" />
              <div className="w-3 h-3 rounded-sm bg-indigo-900/60" />
              <div className="w-3 h-3 rounded-sm bg-indigo-700/80" />
              <div className="w-3 h-3 rounded-sm bg-indigo-500" />
              <div className="w-3 h-3 rounded-sm bg-indigo-400" />
              <span>More</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
          <TooltipProvider>
            {gridData.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1 shrink-0">
                {week.map((day, dayIdx) => (
                  <Tooltip key={dayIdx}>
                    <TooltipTrigger asChild>
                      <div 
                        className={`w-3.5 h-3.5 rounded-[2px] transition-all hover:scale-125 hover:z-10 cursor-pointer ${getColor(day.count)}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 border-indigo-500/30 text-[10px] font-bold p-2 shadow-2xl">
                      <p className="text-indigo-400 uppercase italic mb-0.5">{day.count} Problems Mastered</p>
                      <p className="text-slate-500">{format(day.day, 'MMMM d, yyyy')}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </TooltipProvider>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
          <span>Contribution Year {new Date().getFullYear()}</span>
          <span>Verified by Logic Core</span>
        </div>
      </CardContent>
    </Card>
  );
}
