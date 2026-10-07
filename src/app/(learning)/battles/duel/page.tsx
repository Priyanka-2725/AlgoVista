
"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Trophy, Zap, Users, History, Flame, ShieldCheck, Crown, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { RankBadge } from '@/components/ui/RankBadge';

export default function DuelLobbyPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();
  
  
  const [userData , set_userData ] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => set_userData(res.data)).catch(console.error);
    }
  }, [user]);


  const handleEnterArena = () => {
    const energy = userData?.battleEnergy ?? 10;
    if (energy <= 0) {
      toast({
        variant: "destructive",
        title: "No Energy",
        description: "Your battle energy is depleted. It regenerates every 10 minutes.",
      });
      return;
    }
    router.push('/battles/duel/queue');
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <Users size={40} className="text-indigo-500" />
              </div>
              <div>
                <h1 className="text-5xl font-black font-headline tracking-tighter text-white uppercase italic">Ranked Duel Arena</h1>
                <p className="text-slate-400 text-lg">Face off against another explorer. First correct submission wins.</p>
              </div>
            </div>
            <Button onClick={() => router.push('/battles/duel/tournaments')} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black italic px-8 h-14 rounded-xl gap-2 shadow-lg shadow-amber-500/20">
              <Crown size={20} /> TOURNAMENTS
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card border-none bg-slate-900/40 p-8 flex flex-col items-center text-center space-y-4">
              <Trophy className="text-amber-500" size={48} />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Competitive Standing</p>
                <p className="text-4xl font-black text-white">{userData?.skillRating ?? 1000}</p>
              </div>
              <RankBadge rating={userData?.skillRating ?? 1000} className="scale-125" />
            </Card>

            <Card className="glass-card border-none bg-slate-900/40 p-8 flex flex-col items-center text-center space-y-4">
              <Flame className={(userData?.battleEnergy ?? 10) > 0 ? "text-orange-500 fill-orange-500" : "text-slate-700"} size={48} />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Battle Energy</p>
                <p className="text-4xl font-black text-white">{userData?.battleEnergy ?? 10}/10</p>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">Consumes 1 energy per match</p>
            </Card>

            <Card className="glass-card border-none bg-slate-900/40 p-8 flex flex-col items-center text-center space-y-4">
              <ShieldCheck className="text-emerald-500" size={48} />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Global Integrity</p>
                <p className="text-4xl font-black text-white">{userData?.integrityScore ?? 100}%</p>
              </div>
              <p className="text-xs text-slate-400">Fair play monitoring active</p>
            </Card>
          </div>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Button 
              onClick={handleEnterArena}
              className="h-20 w-full max-w-xl text-2xl font-black italic bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.3)] rounded-2xl group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Swords size={28} className="mr-4" /> ENTER ARENA
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="text-indigo-400" /> Recent Duels
                </h3>
                <Button variant="ghost" size="sm" onClick={() => router.push('/battles/duel/history')} className="text-indigo-400">View All</Button>
              </div>
              <div className="space-y-4">
                <p className="text-slate-500 text-sm italic text-center py-10">Select "View All" to see your full competitive history.</p>
              </div>
            </Card>

            <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <LayoutGrid className="text-amber-500" /> Seasonal Tiers
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legend'].map((tier, idx) => (
                  <div key={tier} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                    <RankBadge rating={[800, 1000, 1200, 1500, 1800, 2100][idx]} showIcon={true} />
                    <span className="text-[10px] text-slate-500 font-bold">Starts at {[800, 1000, 1200, 1500, 1800, 2100][idx]}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
