// @ts-nocheck

"use client"

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { History, Swords, Trophy, Activity, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function BattleHistoryPage() {
  const { user } = useAuth();
  

  
    

  const [rawBattles, set_rawBattles] = React.useState<any[]>([]);

  const battles = useMemo(() => {
    if (!rawBattles) return [];
    return [...rawHistory].sort((a, b) => {
      const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return tB - tA;
    }).slice(0, 50);
  }, [rawBattles]);

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold font-headline flex items-center gap-3 text-white italic">
              <History className="text-indigo-400" /> 
              BATTLE ARCHIVE
            </h2>
            <p className="text-slate-400">Your competitive legacy in the Sprint Universe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="glass-card border-none bg-slate-900/40">
               <CardContent className="pt-6 text-center">
                 <Swords className="mx-auto text-indigo-400 mb-2" size={32} />
                 <p className="text-4xl font-black text-white">{battles?.length || 0}</p>
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Total Duels</p>
               </CardContent>
             </Card>
             <Card className="glass-card border-none bg-slate-900/40">
               <CardContent className="pt-6 text-center">
                 <Trophy className="mx-auto text-emerald-400 mb-2" size={32} />
                 <p className="text-4xl font-black text-white">
                   {battles?.filter(b => b.result === 'victory').length || 0}
                 </p>
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Victories</p>
               </CardContent>
             </Card>
             <Card className="glass-card border-none bg-slate-900/40">
               <CardContent className="pt-6 text-center">
                 <Activity className="mx-auto text-amber-400 mb-2" size={32} />
                 <p className="text-4xl font-black text-white">
                   {battles && battles.length > 0 
                    ? Math.round((battles.filter(b => b.result === 'victory').length / battles.length) * 100)
                    : 0}%
                 </p>
                 <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Win Rate</p>
               </CardContent>
             </Card>
          </div>

          <Card className="glass-card border-none bg-slate-900/40">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400">Opponent</TableHead>
                  <TableHead className="text-slate-400">Outcome</TableHead>
                  <TableHead className="text-slate-400">Challenge</TableHead>
                  <TableHead className="text-slate-400">Rating Change</TableHead>
                  <TableHead className="text-right text-slate-400">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {battles?.map((battle) => {
                  return (
                    <TableRow key={battle.id} className="border-white/5 hover:bg-white/5 group transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded bg-red-600/20 flex items-center justify-center font-bold text-red-400 text-xs italic`}>VS</div>
                          <span className="font-medium text-slate-200">
                            {battle.opponentName || 'Challenger'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${battle.result === 'victory' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {battle.result}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-400 text-sm">{battle.problemId?.replace('-', ' ')}</span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("font-bold text-sm", battle.ratingChange >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {battle.ratingChange >= 0 ? '+' : ''}{battle.ratingChange}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-xs">
                        <div className="flex items-center justify-end gap-2">
                           <Calendar size={12} />
                           {battle.timestamp ? formatDistanceToNow(battle.timestamp.toDate(), { addSuffix: true }) : 'Recent'}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!battles || battles.length === 0) && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-slate-600">
                      No battle records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
