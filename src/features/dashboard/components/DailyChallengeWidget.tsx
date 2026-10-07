'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Zap, ChevronRight, CheckCircle2, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayChallenge, isChallengeCompleted, DailyChallenge } from '@/features/dashboard/services/dailyChallengeService';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function DailyChallengeWidget() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const c = await getTodayChallenge();
        setChallenge(c);
        const done = await isChallengeCompleted(user.id);
        setIsCompleted(done);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user]);

  if (loading) return null;
  if (!challenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="glass-card border-none bg-indigo-600/10 border-l-4 border-l-indigo-500 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Calendar size={100} />
        </div>
        
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Calendar size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Daily Directive</span>
          </div>
          {isCompleted && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px] font-black italic">
              COMPLETED
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                {challenge.title}
              </h3>
              <Badge variant="outline" className="text-[8px] border-indigo-500/30 text-indigo-400">
                {challenge.difficulty}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Master today's focused challenge to earn massive XP and maintain your streak.</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                <Zap size={12} className="fill-amber-400" />
                +{challenge.difficulty === 'Easy' ? 30 : challenge.difficulty === 'Medium' ? 50 : 80} XP BONUS
              </div>
            </div>
            
            {isCompleted ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 size={14} /> Mission Clear
              </div>
            ) : (
              <Link href="/battles/practice">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase h-8 shadow-lg">
                  START MISSION <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
