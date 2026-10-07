
"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Trophy, Lock, Zap, Bot, Shield, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BOSSES, Boss } from '@/lib/boss-data';
import { calculateLevel } from '@/lib/services/xpService';
import { apiClient } from '@/lib/apiClient';
export default function BossArenaLobby() {
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => setUserData(res.data)).catch(console.error);
    }
  }, [user]);

  const currentLevel = userData ? calculateLevel(userData.xp) : 1;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h1 className="text-5xl font-black font-headline tracking-tighter flex items-center gap-4 italic text-white uppercase">
              <Bot size={48} className="text-red-500" />
              Boss Arena
            </h1>
            <p className="text-slate-400 text-lg">Challenge the universe's most advanced AI algorithms.</p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {BOSSES.map((boss) => {
              const isLocked = currentLevel < boss.unlockLevel;
              
              return (
                <motion.div key={boss.id} variants={item}>
                  <Card className={`relative overflow-hidden glass-card border-none bg-slate-900/40 h-full flex flex-col transition-all group ${isLocked ? 'opacity-60 grayscale' : 'hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]'}`}>
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${boss.color}`} />
                    
                    <CardHeader className="text-center space-y-4 pt-10">
                      <div className="relative mx-auto">
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${boss.color} flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                          {boss.avatar}
                        </div>
                        {isLocked && (
                          <div className="absolute -top-2 -right-2 bg-slate-950 p-2 rounded-full border border-white/10 text-amber-500 shadow-xl">
                            <Lock size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black text-white italic uppercase tracking-tight">{boss.name}</CardTitle>
                        <Badge variant="outline" className="mt-2 border-white/10 text-slate-400 uppercase tracking-widest text-[10px]">
                          {boss.difficulty} Tier
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col space-y-6 text-center">
                      <p className="text-slate-400 text-sm leading-relaxed italic">"{boss.description}"</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Reward</p>
                          <p className="text-sm font-bold text-indigo-400">+{boss.rewardXP} XP</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Speed</p>
                          <p className="text-sm font-bold text-emerald-400">{boss.solveTimeRange[0]}s - {boss.solveTimeRange[1]}s</p>
                        </div>
                      </div>

                      <div className="pt-4">
                        {isLocked ? (
                          <div className="bg-white/5 rounded-lg p-3 text-xs font-bold text-amber-500 uppercase tracking-widest">
                            Unlocks at Level {boss.unlockLevel}
                          </div>
                        ) : (
                          <Button 
                            onClick={() => router.push(`/battles/boss-arena/${boss.id}`)}
                            className={`w-full bg-gradient-to-r ${boss.color} hover:brightness-110 border-none font-black italic h-12 shadow-lg`}
                          >
                            <Swords size={18} className="mr-2" /> CHALLENGE BOSS
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Trophy className="text-amber-500" />
                <h3 className="text-xl font-bold text-white">Boss Achievements</h3>
              </div>
              <div className="space-y-4">
                {userData?.achievements?.length > 0 ? (
                  userData.achievements.map((ach: string, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <Crown size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase tracking-tight">{ach}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Legendary Milestone</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic py-4 text-center">No boss achievements earned yet. Defeat a boss to start your collection.</p>
                )}
              </div>
            </Card>

            <Card className="glass-card border-none bg-slate-900/40 p-8 flex flex-col justify-center text-center space-y-4">
              <Zap className="mx-auto text-indigo-400" size={48} />
              <h3 className="text-2xl font-bold text-white">Combat Training</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Bosses are simulated based on real competitive patterns. Winning grants high XP rewards and rare profile badges.
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <div className="px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Current Level</span>
                  <span className="text-xl font-black text-white">{currentLevel}</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Bosses Slain</span>
                  <span className="text-xl font-black text-white">{userData?.achievements?.length || 0}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
