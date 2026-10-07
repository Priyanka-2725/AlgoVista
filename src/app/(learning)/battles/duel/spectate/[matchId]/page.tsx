// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Code2, Users, Eye, Swords, Trophy, Activity, Zap, ChevronLeft, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { Button } from '@/components/ui/button';
import { RankBadge } from '@/components/ui/RankBadge';
import { cn } from '@/lib/utils';

export default function SpectatorPage() {
  const { matchId } = useParams();
  const router = useRouter();
  
  
  
  const [roomData, set_roomData] = React.useState<any>(null);
  
  const [timeLeft, setTimeLeft] = useState(600);
  const problem = ARENA_PROBLEMS.find(p => p.id === roomData?.problemId) || ARENA_PROBLEMS[0];

  useEffect(() => {
    if (!roomData || roomData.status !== 'active') return;
    const start = roomData.startTime?.toMillis() || Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setTimeLeft(Math.max(0, 600 - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [roomData]);

  if (isLoading) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center">
      <Zap className="text-indigo-500 animate-spin" size={48} />
    </div>
  );

  if (!roomData) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center text-white">
      Match not found or already archived.
    </div>
  );

  return (
    <div className="h-screen bg-[#020617] flex flex-col overflow-hidden text-slate-200">
      <header className="h-20 bg-slate-900/80 border-b border-indigo-500/20 px-8 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-400">
            <ChevronLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <Eye className="text-indigo-400" size={24} />
            <h1 className="text-xl font-black italic uppercase tracking-tighter">Spectator Mode</h1>
          </div>
        </div>

        <div className="flex items-center gap-12 bg-black/40 px-8 py-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Player 1</p>
              <p className="text-sm font-black uppercase">{roomData.playerNames[roomData.players[0]]}</p>
            </div>
            <RankBadge rating={roomData.playerRatings[roomData.players[0]]} showIcon={false} />
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-2xl font-mono font-black text-amber-500 tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Match Timer</p>
          </div>

          <div className="flex items-center gap-4">
            <RankBadge rating={roomData.playerRatings[roomData.players[1]]} showIcon={false} />
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Player 2</p>
              <p className="text-sm font-black uppercase">{roomData.playerNames[roomData.players[1]]}</p>
            </div>
          </div>
        </div>

        <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 font-black px-4 py-1">
          {roomData.spectators?.length || 0} WATCHERS
        </Badge>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <section className="w-2/3 p-10 overflow-y-auto space-y-10 border-r border-white/5">
          <div className="space-y-4">
            <Badge variant="outline" className="border-indigo-500/20 text-indigo-400">{problem.category}</Badge>
            <h2 className="text-4xl font-black italic text-white uppercase tracking-tight">{problem.title}</h2>
            <p className="text-slate-400 leading-relaxed text-lg">{problem.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Input</p>
              <pre className="font-mono text-emerald-400 text-sm whitespace-pre-wrap">{problem.inputFormat}</pre>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Output</p>
              <pre className="font-mono text-indigo-400 text-sm whitespace-pre-wrap">{problem.outputFormat}</pre>
            </div>
          </div>
        </section>

        <section className="flex-1 bg-slate-950/50 p-8 space-y-8">
          <div className="flex items-center gap-2 text-indigo-400 mb-4">
            <LayoutGrid size={20} />
            <h3 className="font-black uppercase tracking-widest text-sm">Live Tracker</h3>
          </div>

          {roomData.players.map((pid: string, idx: number) => {
            const progress = roomData.progress?.[pid] || { attempts: 0, lastStatus: 'Idle' };
            const isWinner = roomData.winner === pid;
            
            return (
              <Card key={pid} className={cn(
                "glass-card border-none bg-slate-900/40 p-6 relative overflow-hidden",
                isWinner && "ring-2 ring-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              )}>
                {isWinner && <Trophy className="absolute top-4 right-4 text-emerald-400" size={24} />}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center font-black text-white italic", idx === 0 ? "bg-indigo-600" : "bg-red-600")}>
                      P{idx+1}
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase text-white">{roomData.playerNames[pid]}</p>
                      <RankBadge rating={roomData.playerRatings[pid]} showIcon={false} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Attempts</p>
                      <p className="text-2xl font-black text-white">{progress.attempts}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Last Status</p>
                      <p className={cn(
                        "text-xs font-black uppercase italic",
                        progress.lastStatus === 'Accepted' ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {progress.lastStatus}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <div className="bg-indigo-500/10 rounded-xl p-6 border border-indigo-500/20 text-center">
            <Zap className="mx-auto text-indigo-400 mb-2" size={24} />
            <p className="text-xs text-indigo-300 font-bold uppercase italic">Spectating Ranked Duel</p>
            <p className="text-[10px] text-slate-500 mt-1">Real-time judge updates enabled</p>
          </div>
        </section>
      </main>
    </div>
  );
}
