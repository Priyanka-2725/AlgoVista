'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Flame, 
  BrainCircuit, 
  Swords, 
  Trophy,
  History,
  TrendingUp,
  Target,
  Dice5,
  Coffee,
  CheckCircle2,
  Activity as ActivityIcon,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateLevel } from '@/lib/services/xpService';
import { XPHistoryPopover } from '@/components/ui/XPHistoryPopover';
import Link from 'next/link';
import { formatDistanceToNow, format, subDays, startOfDay } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DailyChallengeWidget } from '@/features/dashboard/components/DailyChallengeWidget';
import { DailyPlan } from '@/features/dashboard/components/DailyPlan';
import { cn } from '@/lib/utils';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { useRouter } from 'next/navigation';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis
} from 'recharts';
import { getActivities } from '@/features/dashboard/services/activityService';
import { analyzeUserPerformance, PerformanceSummary } from '@/features/ai-mentor/services/aiMentor';

const MOODS = [
  { id: 'chill', icon: Coffee, label: 'Chill', color: 'text-emerald-400' },
  { id: 'competitive', icon: Swords, label: 'Ranked', color: 'text-indigo-400' },
  { id: 'focus', icon: Target, label: 'Focus', color: 'text-amber-400' }
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState('chill');
  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getActivities().then(setActivities);
      // Stubbing AI mentor until it's migrated
      // analyzeUserPerformance(user.id).then(setPerformance);
    }
  }, [user]);

  const handleMoodSelect = (id: string) => {
    setSelectedMood(id);
    // TODO: Update user mood on backend
  };

  const handleSurpriseMe = () => {
    const random = ARENA_PROBLEMS[Math.floor(Math.random() * ARENA_PROBLEMS.length)];
    router.push(`/battles/practice?id=${random.id}`);
  };

  // XP Trend Data for Chart
  const xpChartData = React.useMemo(() => {
    if (!activities) return [];
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(startOfDay(new Date()), i);
      return {
        date: format(date, 'MMM d'),
        timestamp: date.getTime(),
        xp: 0
      };
    }).reverse();

    activities.forEach(act => {
      if (act.timestamp) {
        const actDate = new Date(act.timestamp);
        const dayKey = format(actDate, 'MMM d');
        const day = last14Days.find(d => d.date === dayKey);
        if (day) {
          let xp = 10; 
          if (act.eventType === 'problem_solved') xp = 20;
          if (act.eventType.includes('won')) xp = 100;
          day.xp += xp;
        }
      }
    });

    return last14Days;
  }, [activities]);

  const radarData = React.useMemo(() => {
    if (!performance) return [];
    return performance.topicStats.map(s => ({
      subject: s.category,
      A: s.accuracy,
      fullMark: 100
    }));
  }, [performance]);

  const sortedStats = React.useMemo(() => {
    if (!performance) return [];
    return [...performance.topicStats].sort((a, b) => {
      // Sort level priority: weak -> medium -> strong
      const priority = { weak: 0, medium: 1, strong: 2 };
      if (priority[a.level] !== priority[b.level]) {
        return priority[a.level] - priority[b.level];
      }
      return a.accuracy - b.accuracy;
    });
  }, [performance]);

  const currentLevel = user ? calculateLevel(user.xp) : 1;
  const isStreakWarning = user?.lastSolvedDate !== format(new Date(), 'yyyy-MM-dd');

  return (
    <AppShell>
      <div className="p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-8 pb-20">
          
          {isStreakWarning && (user?.streakDays || 0) > 0 && (
            <Alert className="bg-orange-500/10 border-orange-500/20 text-orange-400 animate-pulse">
              <Flame className="h-4 w-4" />
              <AlertTitle className="font-black uppercase text-xs italic">Streak Warning</AlertTitle>
              <AlertDescription className="text-xs">
                Solve a problem today to maintain your {user.streakDays} day streak!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black font-headline tracking-tighter uppercase italic text-white">
                Command Center
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                  {MOODS.map(mood => (
                    <button
                      key={mood.id}
                      onClick={() => handleMoodSelect(mood.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all",
                        selectedMood === mood.id ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      <mood.icon size={12} className={selectedMood === mood.id ? "text-white" : mood.color} />
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleSurpriseMe} variant="outline" className="border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase italic text-xs gap-2">
                <Dice5 size={16} /> Surprise Me
              </Button>
              <XPHistoryPopover>
                <div className="glass-card px-4 py-2 flex items-center gap-2 border-yellow-500/20 hover:border-yellow-500/50 transition-colors">
                  <Trophy className="text-yellow-500" size={20} />
                  <span className="font-black italic">{user?.xp || 0} XP</span>
                </div>
              </XPHistoryPopover>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DailyPlan />

              <Card className="glass-card border-none bg-slate-900/40 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="text-indigo-400" /> Growth Vector
                  </h3>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 uppercase font-black text-[9px]">Last 14 Days</Badge>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={xpChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="glass-card border-none bg-slate-900/40 p-8">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BrainCircuit size={16} /> Domain Radar
                  </h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                        <Radar name="Accuracy" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="glass-card border-none bg-slate-900/40 p-8 flex flex-col justify-center space-y-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Target size={16} className="text-red-400" /> Focus Suggestions
                  </h3>
                  <div className="space-y-4">
                    {performance?.weakCategories.slice(0, 2).map(cat => (
                      <div key={cat} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black uppercase text-red-400">{cat}</p>
                          <Badge className="bg-red-500 text-white text-[8px] uppercase">Critical Weakness</Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                          "Your accuracy in {cat} is below 50%. Master the theory in the Concept Hub before next attempt."
                        </p>
                        <Button variant="ghost" onClick={() => router.push('/learn')} className="h-7 w-full text-[9px] font-black uppercase text-red-400 hover:bg-red-500/10 border border-red-500/20">
                          Resolve Now <ArrowUpRight size={10} className="ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-8">
              <DailyChallengeWidget />

              <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" /> Strength Map
                </h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {sortedStats.map(stat => (
                    <div 
                      key={stat.category} 
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between group transition-all cursor-default",
                        stat.level === 'weak' ? "bg-red-500/5 border-red-500/20" : 
                        stat.level === 'medium' ? "bg-yellow-500/5 border-yellow-500/20" : 
                        "bg-emerald-500/5 border-emerald-500/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          stat.level === 'weak' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                          stat.level === 'medium' ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : 
                          "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        )} />
                        <div>
                          <p className="text-xs font-black text-white uppercase italic tracking-tight">{stat.category}</p>
                          <p className="text-[8px] text-slate-500 font-bold uppercase">{Math.round(stat.accuracy)}% Accuracy • {stat.daysSinceLastAttempt === 999 ? 'No attempts' : `${stat.daysSinceLastAttempt}d ago`}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-[9px] font-black uppercase italic",
                          stat.level === 'weak' ? "text-red-400" : 
                          stat.level === 'medium' ? "text-yellow-400" : 
                          "text-emerald-400"
                        )}>
                          {stat.level}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History size={16} /> Data Stream
                </h3>
                <div className="space-y-4">
                  {activities?.slice(0, 5).map((act, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="bg-white/5 p-2 rounded-lg">
                        {act.eventType === 'problem_solved' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <ActivityIcon size={14} className="text-indigo-400" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-white truncate uppercase italic">{act.eventType.replace('_', ' ')}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase">{formatDistanceToNow(act.timestamp?.toDate ? act.timestamp.toDate() : new Date(), { addSuffix: true })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
