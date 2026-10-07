
"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Crown, Zap, Swords, ChevronLeft, Calendar, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TOURNAMENTS = [
  {
    id: 'weekly-elite',
    name: 'Weekly Elite Bracket',
    description: 'The highest tier of competitive algorithm duels. 32 players enter, one Legend leaves.',
    prize: '500 XP + Legendary Badge',
    status: 'Registering',
    startTime: 'Saturday, 18:00 UTC',
    participants: 24,
    maxParticipants: 32,
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'sprint-open',
    name: 'Sprint Open #12',
    description: 'A round-robin style event for all skill levels. Great for testing new strategies.',
    prize: '200 XP + Master Banner',
    status: 'Active',
    startTime: 'Happening Now',
    participants: 128,
    maxParticipants: 256,
    color: 'from-indigo-500 to-purple-600'
  }
];

export default function TournamentsLobbyPage() {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" onClick={() => router.push('/battles/duel')} className="text-slate-400">
                <ChevronLeft size={20} />
              </Button>
              <div>
                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                  <Crown className="text-amber-500" size={48} />
                  Pro Tournaments
                </h1>
                <p className="text-slate-400 text-lg">Grand arenas where the Sprint Universe legends are born.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {TOURNAMENTS.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative group"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-r opacity-5 blur-2xl group-hover:opacity-10 transition-opacity", t.color)} />
                <Card className="glass-card border-none bg-slate-900/40 p-8 flex flex-col lg:flex-row gap-8 items-center relative overflow-hidden">
                  <div className={cn("absolute left-0 top-0 w-2 h-full bg-gradient-to-b", t.color)} />
                  
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-amber-500 text-slate-900 font-black italic">{t.status}</Badge>
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
                        <Calendar size={14} />
                        {t.startTime}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase italic">{t.name}</h3>
                      <p className="text-slate-400 max-w-2xl mt-2">{t.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-8 pt-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Prize Pool</p>
                        <p className="text-sm font-bold text-amber-400">{t.prize}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Combatants</p>
                        <p className="text-sm font-bold text-white">{t.participants} / {t.maxParticipants}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Entry Fee</p>
                        <p className="text-sm font-bold text-emerald-400">Free Entry</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto flex flex-col gap-3">
                    <Button className="w-full lg:w-56 h-14 bg-indigo-600 hover:bg-indigo-500 text-lg font-black italic shadow-xl shadow-indigo-500/20">
                      {t.status === 'Registering' ? 'Register Profile' : 'View Live Bracket'}
                    </Button>
                    <Button variant="outline" className="w-full lg:w-56 border-white/10 text-xs font-bold uppercase tracking-widest">
                      Tournament Rules
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
              <div className="flex items-center gap-3 text-amber-500">
                <Trophy size={24} />
                <h3 className="text-xl font-bold text-white uppercase italic">Hall of Champions</h3>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-500">#{i}</div>
                      <div>
                        <p className="font-bold text-white">Challenger_{i}42</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">2x Weekly Champion</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-purple-500/20 text-purple-400">LEGEND</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card border-none bg-slate-900/40 p-8 flex flex-col justify-center text-center space-y-6">
              <Timer className="mx-auto text-indigo-400" size={48} />
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic">Automatic Seeding</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mt-2">
                  Tournaments use your Global Skill Rating for bracket seeding. Maintain a high rank to ensure priority registration.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-4">
                <div className="px-6 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Next Event</span>
                  <span className="text-lg font-black text-white">Elite Bracket</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
