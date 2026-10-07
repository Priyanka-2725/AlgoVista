
"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calendar, Timer, Users, Plus, Swords, ChevronRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function ContestsDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  

  
    

  const [contests, set_contests] = React.useState<any[]>([]);

  const upcomingContests = contests?.filter(c => c.status === 'upcoming') || [];
  const liveContests = contests?.filter(c => c.status === 'live') || [];
  const pastContests = contests?.filter(c => c.status === 'ended') || [];

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                <Trophy className="text-amber-500" size={48} />
                Contest Arena
              </h1>
              <p className="text-slate-400 text-lg">Real-time competitive programming challenges.</p>
            </div>
            <Button 
              onClick={() => router.push('/sprint/contests/create')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black italic px-8 h-14 rounded-xl gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus size={20} /> HOST CONTEST
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <Input 
              placeholder="Filter contests by title or technology..." 
              className="h-14 pl-12 bg-slate-900/50 border-white/5 text-lg"
            />
          </div>

          <Tabs defaultValue="live" className="space-y-8">
            <TabsList className="bg-slate-900/50 border border-white/5 p-1 h-14 w-full md:w-auto">
              <TabsTrigger value="live" className="px-10 h-12 data-[state=active]:bg-indigo-600 uppercase font-black italic text-xs">
                Live Now ({liveContests.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="px-10 h-12 data-[state=active]:bg-indigo-600 uppercase font-black italic text-xs">
                Upcoming ({upcomingContests.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="px-10 h-12 data-[state=active]:bg-indigo-600 uppercase font-black italic text-xs">
                Archives ({pastContests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-6">
              {liveContests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {liveContests.map((c) => <ContestCard key={c.id} contest={c} />)}
                </div>
              ) : (
                <EmptyState message="No live contests currently active. Check upcoming events!" />
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              {upcomingContests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {upcomingContests.map((c) => <ContestCard key={c.id} contest={c} />)}
                </div>
              ) : (
                <EmptyState message="No upcoming contests scheduled. Host your own!" />
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-6">
              {pastContests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {pastContests.map((c) => <ContestCard key={c.id} contest={c} />)}
                </div>
              ) : (
                <EmptyState message="The archives are empty. History is being written." />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function ContestCard({ contest }: { contest: any }) {
  const router = useRouter();
  const startTime = contest.startTime?.toDate ? contest.startTime.toDate() : new Date(contest.startTime);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card border-none bg-slate-900/40 overflow-hidden group">
        <div className={`absolute left-0 top-0 w-1.5 h-full bg-indigo-500`} />
        <CardContent className="p-8 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/30 uppercase font-black italic text-[10px]">
                {contest.difficulty} TIER
              </Badge>
              <Badge variant="outline" className="border-white/10 text-slate-500 uppercase font-bold text-[10px]">
                {contest.visibility}
              </Badge>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
                {contest.title}
              </h3>
              <p className="text-slate-400 mt-1 line-clamp-2">{contest.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Calendar size={12} /> Starts At
                </p>
                <p className="text-sm font-bold text-white">{format(startTime, 'MMM d, HH:mm')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Timer size={12} /> Duration
                </p>
                <p className="text-sm font-bold text-white">{contest.duration} Minutes</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Users size={12} /> Participants
                </p>
                <p className="text-sm font-bold text-white">{contest.participants?.length || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1.5">
                  <Swords size={12} /> Problems
                </p>
                <p className="text-sm font-bold text-indigo-400">{contest.problemIds?.length || 0} Challenges</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-auto">
            <Button 
              onClick={() => router.push(`/sprint/contests/${contest.id}`)}
              className="w-full lg:w-48 h-16 bg-white/5 hover:bg-indigo-600 border border-white/10 group-hover:border-indigo-500/50 text-white font-black italic uppercase shadow-xl transition-all"
            >
              {contest.status === 'live' ? 'ENTER ARENA' : contest.status === 'upcoming' ? 'REGISTER' : 'VIEW RESULTS'}
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-20 text-center glass-card bg-slate-900/20 border-dashed border-white/5 rounded-3xl">
      <Swords className="mx-auto text-slate-800 mb-4" size={64} />
      <p className="text-slate-500 font-bold italic uppercase tracking-widest">{message}</p>
    </div>
  );
}
