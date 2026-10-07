'use client';
// @ts-nocheck

import React from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  BookOpen, 
  Timer, 
  Bot, 
  ChevronRight, 
  Trophy, 
  Globe,
  Building2,
  Zap,
  MessageSquare,
  FileText,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

const INTERVIEW_MODULES = [
  {
    id: 'subjects',
    name: 'Subject Mastery',
    description: 'OS, DBMS, System Design, and Networks deep-dives with AI explanations.',
    icon: Cpu,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    href: '/interview/subjects',
    badge: 'NEW 🔥'
  },
  {
    id: 'sheets',
    name: 'Curated Study Sheets',
    description: 'Master the Blind 75, Striver’s SDE, and category-wise essentials.',
    icon: BookOpen,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    href: '/interview/subjects', // Shared with subjects for MVP
    badge: 'Standard'
  },
  {
    id: 'mock',
    name: 'Mock Interview Arena',
    description: 'Solve 2 problems in 45 minutes under pressure. Get AI feedback.',
    icon: Timer,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    href: '/interview/mock',
    badge: '+100 XP'
  },
  {
    id: 'companies',
    name: 'Company-Specific Prep',
    description: 'Targeted preparation for Google, Meta, Amazon, and more.',
    icon: Building2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    href: '/interview/companies',
    badge: 'Big Tech'
  },
  {
    id: 'resume',
    name: 'Resume-Based Interview',
    description: 'AI-driven project deep-dives tailored to your actual resume experience.',
    icon: FileText,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    href: '/interview/resume',
    badge: 'Personalized'
  },
  {
    id: 'behavioral',
    name: 'AI Behavioral Practice',
    description: 'Practice explaining your experiences to a simulated HR panel.',
    icon: MessageSquare,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    href: '/interview/behavioral',
    badge: '+50 XP'
  }
];

export default function InterviewHubPage() {
  const { user } = useAuth();
  
  
  
  const [userData , set_userData ] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => set_userData(res.data)).catch(console.error);
    }
  }, [user]);



  const overallProgress = ([] as any) && ([] as any).length > 0 
    ? Math.round(([] as any).reduce((acc, p) => acc + (p.progressPercent || 0), 0) / ([] as any).length)
    : 0;

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black font-headline tracking-tighter flex items-center gap-4 italic text-white uppercase">
              <Briefcase size={48} className="text-indigo-500" />
              Interview Hub
            </h1>
            <p className="text-slate-400 text-lg">Your technical career launchpad. Curated, timed, and AI-critiqued.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-card px-6 py-3 flex flex-col items-center border-indigo-500/20 bg-indigo-500/10 min-w-[140px]">
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Hub Readiness</span>
              <span className="text-2xl font-black text-white italic">{overallProgress}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INTERVIEW_MODULES.map((module, idx) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link href={module.href}>
                <Card className="glass-card border-none bg-slate-900/40 h-full hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] transition-all group cursor-pointer overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <module.icon size={120} />
                  </div>
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className={cn("p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform", module.bg, module.color)}>
                      <module.icon size={32} />
                    </div>
                    <Badge className={cn("border-none italic font-black text-[10px] uppercase", module.bg, module.color)}>
                      {module.badge}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tight">{module.name}</CardTitle>
                      <CardDescription className="text-slate-400 mt-2 text-sm">
                        {module.description}
                      </CardDescription>
                    </div>
                    <div className="pt-4 flex items-center text-indigo-400 font-bold uppercase text-xs tracking-widest">
                      Enter Module <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass-card border-none bg-slate-900/40 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase italic">
                <Trophy className="text-amber-500" /> Curated Progress
              </h3>
              <Link href="/interview/sheets">
                <Button variant="ghost" size="sm" className="text-indigo-400 uppercase font-black text-[10px] tracking-widest">View All Sheets</Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {([] as any) && ([] as any).length > 0 ? (
                ([] as any).slice(0, 2).map((p, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black italic">
                        {p.progressPercent}%
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase italic tracking-tight">{p.sheetId.replace('-', ' ')}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sheet Milestone</p>
                      </div>
                    </div>
                    <Link href={`/interview/sheets/${p.sheetId}`}>
                      <Button size="sm" variant="outline" className="border-white/10 text-[10px] font-black uppercase">Resume</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
                  <BookOpen className="mx-auto text-slate-800 mb-4" size={48} />
                  <p className="text-slate-500 font-bold italic uppercase tracking-widest">No active sheets. Start your FAANG journey today.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="glass-card border-none bg-slate-900/40 p-8 flex flex-col justify-center text-center space-y-4">
            <Globe className="mx-auto text-indigo-400" size={48} />
            <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Global Readiness</h3>
            <p className="text-slate-400 text-sm">
              You are currently in the top 15% of candidates preparing for SDE-1 roles in the Algo Vista universe.
            </p>
            <div className="pt-4">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 font-black italic uppercase">OPTIMIZE PROFILE</Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
