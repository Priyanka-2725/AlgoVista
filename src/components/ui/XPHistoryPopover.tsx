"use client"

import React, { useEffect, useState } from 'react';
import { Trophy, Zap, BrainCircuit, Code2, Swords, Timer, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

interface XPHistoryPopoverProps {
  children: React.ReactNode;
}

export function XPHistoryPopover({ children }: XPHistoryPopoverProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      setIsLoading(true);
      apiClient.get('/dashboard/activities')
        .then((res) => {
          setActivities(res.data || []);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, user?.id]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'algorithm_viewed': return <BrainCircuit size={14} className="text-indigo-400" />;
      case 'problem_solved': return <Code2 size={14} className="text-emerald-400" />;
      case 'duel_won':
      case 'boss_battle_won': return <Trophy size={14} className="text-yellow-400" />;
      case 'sprint_completed': return <Timer size={14} className="text-amber-400" />;
      case 'duel_lost':
      case 'duel_draw': return <Swords size={14} className="text-slate-400" />;
      default: return <Zap size={14} className="text-indigo-400" />;
    }
  };

  const getXPValue = (activity: any) => {
    if (activity.xpAmount) return activity.xpAmount;
    // Fallback logic for legacy activities
    switch (activity.eventType) {
      case 'algorithm_viewed': return 10;
      case 'problem_solved': return 20;
      case 'duel_won': return 100;
      case 'duel_draw': return 40;
      case 'duel_lost': return 20;
      case 'boss_battle_won': return 50;
      case 'sprint_completed': return Math.floor((activity.score || 0) / 20);
      default: return 0;
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Just now';
    try {
      const date = new Date(ts);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="outline-none hover:scale-105 transition-transform active:scale-95">
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card bg-slate-900/95 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
        <div className="p-4 border-b border-white/5 bg-indigo-500/5">
          <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
            <Zap size={16} className="fill-indigo-400" /> XP Transaction Logs
          </h3>
        </div>
        <ScrollArea className="h-72">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500"></div>
              </div>
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => {
                const xp = getXPValue(activity);
                if (xp === 0 && activity.eventType === 'profile_created') return null;
                
                return (
                  <div key={activity._id || activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border-l-2 border-indigo-500/30">
                    <div className="bg-white/5 p-2 rounded-md">
                      {getActivityIcon(activity.eventType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate uppercase tracking-tight">
                        {activity.eventType.replace('_', ' ')}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar size={10} /> {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <div className={`text-sm font-black italic ${xp >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {xp >= 0 ? '+' : ''}{xp}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-600 italic text-xs">
                No recent XP changes detected.
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-white/5 bg-black/20 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            Data synced with Global Master Judge
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
