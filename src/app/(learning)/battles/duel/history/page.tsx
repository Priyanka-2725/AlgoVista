// @ts-nocheck

"use client"

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, Swords, Trophy, Activity, Calendar, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DuelHistoryPage() {
  const { user } = useAuth();
  

  
    

  const [rawHistory, set_rawHistory] = React.useState<any[]>([]);

  // Client-side sorting to bypass composite index requirement
  const history = useMemo(() => {
    if (!rawHistory) return [];
    return [...rawHistory].sort((a, b) => {
      const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return tB - tA;
    }).slice(0, 50);
  }, [rawHistory]);

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black font-headline flex items-center gap-4 text-white uppercase italic">
                <History className="text-indigo-400" size={36} /> 
                Duel Archives
              </h2>
              <p className="text-slate-400">Your legacy in the Ranked Sprint Arena.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="glass-card border-none bg-slate-900/40 p-6 text-center space-y-2">
               <Swords className="mx-auto text-indigo-400 mb-2" size={32} />
               <p className="text-4xl font-black text-white">{history?.length || 0}</p>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Duels</p>
             </Card>
             <Card className="glass-card border-none bg-slate-900/40 p-6 text-center space-y-2">
               <Trophy className="mx-auto text-amber-400 mb-2" size={32} />
               <p className="text-4xl font-black text-white">
                 {history?.filter(h => h.result === 'victory').length || 0}
               </p>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Ranked Victories</p>
             </Card>
             <Card className="glass-card border-none bg-slate-900/40 p-6 text-center space-y-2">
               <Zap className="mx-auto text-emerald-400 mb-2" size={32} />
               <p className="text-4xl font-black text-white">
                 {history && history.length > 0 
                  ? Math.round((history.filter(h => h.result === 'victory').length / history.length) * 100)
                  : 0}%
               </p>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Efficiency Rating</p>
             </Card>
          </div>

          <Card className="glass-card border-none bg-slate-900/40 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400 uppercase font-black text-[10px] tracking-widest">Opponent</TableHead>
                  <TableHead className="text-slate-400 uppercase font-black text-[10px] tracking-widest">Result</TableHead>
                  <TableHead className="text-slate-400 uppercase font-black text-[10px] tracking-widest">Rating Change</TableHead>
                  <TableHead className="text-slate-400 uppercase font-black text-[10px] tracking-widest">Challenge</TableHead>
                  <TableHead className="text-right text-slate-400 uppercase font-black text-[10px] tracking-widest">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history?.map((h) => (
                  <TableRow key={h.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-indigo-600/20 flex items-center justify-center font-black text-indigo-400 text-xs italic">VS</div>
                        <span className="font-bold text-slate-200">{h.opponentName || 'Shadow Challenger'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase italic ${h.result === 'victory' ? 'bg-emerald-500/10 text-emerald-400' : h.result === 'draw' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-400'}`}>
                        {h.result}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-black ${h.ratingChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.ratingChange >= 0 ? '+' : ''}{h.ratingChange}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs font-bold uppercase">{h.problemId?.replace('-', ' ')}</TableCell>
                    <TableCell className="text-right text-slate-500 text-xs font-mono">
                      {h.timestamp ? formatDistanceToNow(h.timestamp.toDate(), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                {(!history || history.length === 0) && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-slate-600 font-black italic">
                      No ranked records found in the duel archives.
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
