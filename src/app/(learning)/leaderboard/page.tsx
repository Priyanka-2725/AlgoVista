'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { RankBadge } from '@/components/ui/RankBadge';

export default function LeaderboardPage() {
  

  
    

  const [leaders, set_leaders] = React.useState<any[]>([]);
  React.useEffect(() => {
    apiClient.get('/leaderboard').then(res => set_leaders(res.data)).catch(console.error);
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="text-yellow-400" size={24} />;
    if (rank === 1) return <Medal className="text-slate-300" size={24} />;
    if (rank === 2) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-slate-500 font-mono font-bold w-6 text-center">{rank + 1}</span>;
  };

  const safeLeaders = Array.isArray(leaders) ? leaders : [];

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-10">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
            <Trophy className="text-yellow-400" size={40} /> 
            Global Rankings
          </h2>
          <p className="text-slate-400 text-lg">The top 50 explorers in the Algo Vista universe.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safeLeaders.slice(0, 3).map((leader, index) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-card border-none bg-slate-900/40 relative overflow-hidden h-full ${index === 0 ? 'ring-2 ring-yellow-500/50 scale-105 z-10' : ''}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'}`} />
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                     <div className="relative">
                      <div className="absolute inset-0 bg-white/5 rounded-full blur-xl animate-pulse" />
                      <Avatar className="h-24 w-24 border-4 border-slate-900 shadow-2xl relative z-10">
                        <AvatarImage src={leader.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${leader.id}`} className="bg-slate-800" />
                        <AvatarFallback>{leader.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1 border border-white/10 shadow-lg z-20">
                        {getRankIcon(index)}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-black uppercase italic tracking-tight truncate">{leader.name}</CardTitle>
                  <div className="mt-2 flex justify-center">
                    <RankBadge rating={leader.skillRating || 1000} />
                  </div>
                </CardHeader>
                <CardContent className="text-center pt-4">
                  <div className="flex items-center justify-center gap-2 text-2xl font-black text-white tabular-nums">
                    <Zap size={18} className="text-indigo-400 fill-indigo-400" />
                    {leader.xp?.toLocaleString() || 0}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total Experience</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-none bg-slate-900/40 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent bg-indigo-500/5">
                  <TableHead className="w-[100px] text-slate-400 font-black uppercase text-[10px]">Rank</TableHead>
                  <TableHead className="text-slate-400 font-black uppercase text-[10px]">User</TableHead>
                  <TableHead className="text-slate-400 font-black uppercase text-[10px]">Tier</TableHead>
                  <TableHead className="text-right text-slate-400 font-black uppercase text-[10px]">Total XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeLeaders.map((leader, index) => (
                  <TableRow key={leader.id} className="border-white/5 hover:bg-white/5 group transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex justify-center items-center w-10 h-10 rounded-xl bg-white/5 font-black italic">
                        {getRankIcon(index)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10 border-2 border-white/10 ring-1 ring-white/5">
                          <AvatarImage src={leader.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${leader.id}`} className="bg-slate-800" />
                          <AvatarFallback>{leader.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                          {leader.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RankBadge rating={leader.skillRating || 1000} showIcon={false} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 font-black italic text-indigo-400 text-lg">
                        {leader.xp?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
