'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Swords, 
  Zap, 
  Trophy, 
  History, 
  Flame,
  Users,
  Bot,
  Dumbbell
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { XPHistoryPopover } from '@/components/ui/XPHistoryPopover';

const BATTLE_MODES = [
  {
    id: '1v1',
    name: '1v1 Ranked Duel',
    description: 'Face off against another explorer in real-time. First correct solution wins.',
    difficulty: 'Competitive',
    icon: Users,
    color: 'from-indigo-600 to-purple-600',
    rewards: '+100 XP | Rated',
    href: '/battles/duel'
  },
  {
    id: 'sprint',
    name: 'Speed Sprint',
    description: 'Solve as many problems as possible in 5 minutes.',
    difficulty: 'Time Trial',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    rewards: 'XP based on solutions',
    href: '/battles/sprint'
  },
  {
    id: 'boss',
    name: 'Boss Battle',
    description: 'Challenge high-tier AI algorithms in a test of efficiency.',
    difficulty: 'Legendary',
    icon: Bot,
    color: 'from-red-600 to-rose-700',
    rewards: 'Unique Achievements',
    href: '/battles/boss-arena'
  },
  {
    id: 'practice',
    name: 'Practice Arena',
    description: 'Warm up your skills without affecting your global ranking.',
    difficulty: 'Casual',
    icon: Dumbbell,
    color: 'from-emerald-500 to-teal-600',
    rewards: '+20 XP per solve',
    href: '/battles/practice'
  }
];

export default function BattlesLobbyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [userData, setUserData] = React.useState<any>(null);

  useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => setUserData(res.data)).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!userData) return;

    const REGEN_TIME = 600; 
    const MAX_ENERGY = 10;

    let lastUpdate: number;
    if (typeof userData.lastEnergyUpdate === 'string') {
      lastUpdate = new Date(userData.lastEnergyUpdate).getTime();
    } else {
      lastUpdate = Date.now();
    }

    const now = Date.now();
    const secondsPassed = Math.floor((now - lastUpdate) / 1000);
    const regenAmount = Math.floor(secondsPassed / REGEN_TIME);

    if (regenAmount > 0 && (userData.battleEnergy || 0) < MAX_ENERGY) {
      const currentEnergy = userData.battleEnergy ?? 10;
      const newEnergy = Math.min(MAX_ENERGY, currentEnergy + regenAmount);
      
      apiClient.post('/users/energy', { battleEnergy: newEnergy }).catch(console.error);
      setUserData({ ...userData, battleEnergy: newEnergy, lastEnergyUpdate: new Date().toISOString() });
      
      if (regenAmount >= 1) {
        toast({
          title: "Energy Regenerated",
          description: `You've recovered ${Math.min(regenAmount, MAX_ENERGY - currentEnergy)} battle energy.`,
        });
      }
    }
  }, [userData, toast]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black font-headline tracking-tighter flex items-center gap-4 italic text-white uppercase">
              <Swords size={48} className="text-indigo-500" />
              Sprint Universe
            </h1>
            <p className="text-slate-400 text-lg">Where algorithms are forged in the heat of competition.</p>
          </div>
          
          <div className="flex gap-4">
            <XPHistoryPopover>
              <div className="glass-card px-6 py-3 flex flex-col items-center border-indigo-500/20 bg-indigo-500/10 min-w-[140px] hover:border-indigo-500/50 transition-colors">
                <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Skill Rating (XP)</span>
                <span className="text-2xl font-black text-white">{userData?.xp ?? 0}</span>
              </div>
            </XPHistoryPopover>
            <div className="glass-card px-6 py-3 flex flex-col items-center border-amber-500/20 bg-amber-500/10 min-w-[140px]">
              <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Battle Energy</span>
              <div className="flex items-center gap-1">
                <Flame size={16} className={`${(userData?.battleEnergy ?? 10) > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-600'}`} />
                <span className="text-2xl font-black text-white">{userData?.battleEnergy ?? 10}/10</span>
              </div>
            </div>
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {BATTLE_MODES.map((mode) => {
            const currentEnergy = userData?.battleEnergy ?? 10;
            const hasEnergy = currentEnergy > 0;
            const isPractice = mode.id === 'practice';
            const canEnter = isPractice || hasEnergy;

            return (
              <motion.div key={mode.id} variants={item}>
                <Link href={canEnter ? mode.href : '#'} onClick={(e) => {
                  if (!canEnter) {
                    e.preventDefault();
                    toast({ variant: "destructive", title: "Out of Energy", description: "Wait for regeneration." });
                  }
                }}>
                  <Card className={`group glass-card border-none bg-slate-900/40 h-full cursor-pointer transition-all overflow-hidden relative ${!canEnter && 'opacity-50 grayscale cursor-not-allowed'}`}>
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${mode.color}`} />
                    <CardHeader className="relative">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${mode.color} w-fit shadow-lg group-hover:scale-110 transition-transform`}>
                        <mode.icon size={32} className="text-white" />
                      </div>
                      <div className="mt-4">
                        <Badge variant="outline" className="border-white/10 text-[10px] uppercase tracking-widest mb-2">{mode.difficulty}</Badge>
                        <CardTitle className="text-2xl font-bold group-hover:text-indigo-400 transition-colors uppercase italic tracking-tighter">{mode.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-400 text-sm">{mode.description}</p>
                      <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Rewards</p>
                        <p className="text-xs text-slate-300 font-medium">{mode.rewards}</p>
                      </div>
                      <Button disabled={!canEnter} className={`w-full bg-gradient-to-r ${mode.color} hover:brightness-110 border-none font-bold mt-2 shadow-[0_4px_15px_rgba(0,0,0,0.3)] uppercase italic`}>
                        {canEnter ? 'Enter Arena' : 'No Energy'}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <Card className="lg:col-span-2 glass-card border-none bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="text-amber-500" />
                <div>
                  <CardTitle className="text-xl uppercase italic">Championship Arena</CardTitle>
                  <CardDescription>Competitive ranked seasons</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl italic shadow-lg">S1</div>
                  <div>
                    <p className="font-bold text-lg text-white">Ranked Season 1: Alpha</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active for 45 more days</p>
                  </div>
                </div>
                <Link href="/battles/duel">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 font-black italic px-8">DUEL NOW</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none bg-slate-900/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <History className="text-indigo-400" />
                <CardTitle className="text-xl uppercase italic">Battle Logs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs text-slate-400 uppercase font-black tracking-widest">Ranked Wins</span>
                  <span className="text-2xl font-black text-white">{userData?.problemsSolved || 0}</span>
               </div>
               <Link href="/battles/duel/history">
                <Button variant="outline" className="w-full border-white/10 text-xs font-black uppercase tracking-widest h-12 hover:bg-indigo-500/10">
                  View Full History
                </Button>
               </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
