'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Network, 
  Dna,
  Zap,
  TrendingUp,
  LayoutGrid,
  BrainCircuit,
  Cpu,
  Database,
  Globe,
  ListChecks,
  ChevronRight,
  Sparkles,
  History,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { SUBJECTS_HUB } from '@/lib/concepts-data';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  BrainCircuit,
  Cpu,
  Database,
  Network,
  Globe,
  Zap,
  ListChecks
};

export default function LearningDashboard() {
  const { user } = useAuth();
  const [revisionItems, setRevisionItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (user) {
      apiClient.get('/learning/revision').then(res => setRevisionItems(res.data)).catch(console.error);
    }
  }, [user]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <Sparkles className="text-indigo-500" size={32} />
              </div>
              <div>
                <h1 className="text-5xl font-black font-headline tracking-tighter uppercase italic text-white leading-none">Concept Hub</h1>
                <p className="text-slate-400 text-lg mt-2">Gamified mastery modules for core Computer Science theory.</p>
              </div>
            </div>
          </div>

          {revisionItems && revisionItems.length > 0 && (
            <Link href={`/learn/concept/${revisionItems[0].conceptId}`}>
              <Card className="glass-card border-none bg-amber-500/10 border-l-4 border-l-amber-500 px-6 py-4 flex items-center gap-6 group cursor-pointer animate-pulse-slow">
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Spaced Repetition Active</p>
                  <h4 className="text-sm font-black text-white uppercase italic">Daily Revision: {revisionItems[0].title}</h4>
                </div>
                <ChevronRight className="text-amber-500 group-hover:translate-x-1 transition-transform" />
              </Card>
            </Link>
          )}
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {(Object.values(SUBJECTS_HUB) as any[]).map((subject) => {
            const Icon = iconMap[subject.icon] || BrainCircuit;
            
            return (
              <motion.div key={subject.id} variants={item}>
                <Link href={`/learn/subject/${subject.id}`}>
                  <Card className="glass-card border-none bg-slate-900/40 h-full hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] transition-all group cursor-pointer overflow-hidden relative flex flex-col">
                    <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", subject.color.replace('text', 'from'), "to-transparent")} />
                    <CardHeader className="pt-10">
                      <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5 w-fit group-hover:scale-110 transition-transform shadow-lg", subject.color)}>
                        <Icon size={32} />
                      </div>
                      <div className="mt-4 space-y-1">
                        <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tight">{subject.title}</CardTitle>
                        <CardDescription className="text-slate-400 text-sm leading-relaxed">
                          {subject.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <Badge variant="outline" className="border-white/5 text-slate-500 font-bold uppercase text-[9px]">
                          {subject.concepts.length} Interactive Cards
                        </Badge>
                        <div className="flex items-center text-indigo-400 font-black uppercase text-[10px] tracking-widest italic group-hover:translate-x-1 transition-transform">
                          Deploy Module <ChevronRight size={14} className="ml-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <Card className="glass-card border-none bg-indigo-600/10 p-10 flex items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap size={160} />
          </div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <History size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase italic">Retention Engine</h3>
              <p className="text-slate-400 text-sm max-w-xl">Our spaced repetition logic automatically calculates when you should revisit difficult concepts to maximize long-term retention. Mastered items will resurface after 1, 3, and 7 days.</p>
            </div>
          </div>
          <Badge className="bg-indigo-600 text-white font-black italic px-6 py-2 uppercase text-xs tracking-widest shadow-xl">REAL-TIME MONITORING</Badge>
        </Card>
      </div>
    </AppShell>
  );
}
