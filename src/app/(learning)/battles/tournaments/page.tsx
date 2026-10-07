"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Timer, Zap, Swords, ChevronRight } from 'lucide-react';

const TOURNAMENTS = [
  {
    id: 't1',
    name: 'Weekly Sorting Sprint',
    description: 'Master the art of sorting in this multi-round elimination bracket.',
    type: 'Single Elimination',
    status: 'Active',
    participants: 1240,
    endsIn: '2d 14h',
    prize: '5,000 XP + Unique Banner',
    difficulty: 'Medium',
    color: 'border-indigo-500/30'
  },
  {
    id: 't2',
    name: 'Graph Strategy Open',
    description: 'Solve complex pathfinding and traversal problems against top-tier players.',
    type: 'Round Robin',
    status: 'Registering',
    participants: 856,
    startsIn: '4d 1h',
    prize: '10,000 XP + Master Badge',
    difficulty: 'Hard',
    color: 'border-amber-500/30'
  },
  {
    id: 't3',
    name: 'Beginner’s Blitz',
    description: 'A friendly arena for those just starting their Sprint journey.',
    type: 'Quick Bracket',
    status: 'Completed',
    participants: 2100,
    prize: '1,000 XP',
    difficulty: 'Easy',
    color: 'border-emerald-500/30'
  }
];

export default function TournamentsPage() {
  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
          <div className="relative">
            <h2 className="text-4xl font-black font-headline tracking-tighter italic text-white flex items-center gap-4">
              <Trophy className="text-amber-500" size={40} />
              TOURNAMENTS
            </h2>
            <p className="text-slate-400 text-lg">Grand arenas where legends are made.</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {TOURNAMENTS.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`relative overflow-hidden glass-card p-1 border-none ${t.status === 'Completed' ? 'opacity-60' : ''}`}
              >
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${t.id === 't1' ? 'from-indigo-500' : t.id === 't2' ? 'from-amber-500' : 'from-emerald-500'} to-transparent`} />
                <div className="p-8 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                   <div className="w-full lg:w-1/4 space-y-4 text-center lg:text-left">
                      <div className={`inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-2`}>
                        <Swords className={t.id === 't1' ? 'text-indigo-400' : t.id === 't2' ? 'text-amber-400' : 'text-emerald-400'} size={32} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{t.name}</h3>
                      <div className="flex items-center justify-center lg:justify-start gap-2">
                        <Badge variant="outline" className="border-white/10 text-slate-400">{t.difficulty}</Badge>
                        <Badge variant="outline" className="border-white/10 text-slate-400">{t.type}</Badge>
                      </div>
                   </div>

                   <div className="flex-1 space-y-6">
                      <p className="text-slate-400">{t.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Prize Pool</p>
                            <p className="text-sm font-bold text-amber-400">{t.prize}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Participants</p>
                            <p className="text-sm font-bold text-white">{t.participants.toLocaleString()}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Time Remaining</p>
                            <p className="text-sm font-bold text-white">{t.endsIn || t.startsIn || 'Finished'}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Status</p>
                            <p className={`text-sm font-bold ${t.status === 'Active' ? 'text-emerald-400' : t.status === 'Registering' ? 'text-indigo-400' : 'text-slate-500'}`}>
                              {t.status}
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="w-full lg:w-auto flex flex-col gap-3">
                      <Button className="w-full lg:w-48 bg-indigo-600 hover:bg-indigo-500 font-bold h-12" disabled={t.status === 'Completed'}>
                        {t.status === 'Active' ? 'Join Match' : t.status === 'Registering' ? 'Register Now' : 'View Bracket'}
                      </Button>
                      <Button variant="outline" className="w-full lg:w-48 border-white/10 h-12">Tournament Rules</Button>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
