
"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Shield, Zap, Target, Swords, Bot, Crown } from 'lucide-react';
import { format } from 'date-fns';

interface AchievementsGridProps {
  achievements: any[] | null;
  compact?: boolean;
}

const badgeIcons: Record<string, any> = {
  'First Problem Solved': Target,
  '10 Problems Solved': Zap,
  '50 Problems Solved': Star,
  'First Duel Win': Swords,
  'Boss Battle Champion': Bot,
  'Speed Sprint Master': Crown,
  'Boss Slayer': Bot,
  'Strategist Conqueror': Shield,
  'Algorithm Overlord': Trophy
};

export function AchievementsGrid({ achievements, compact }: AchievementsGridProps) {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 italic space-y-4">
        <Trophy size={40} className="mx-auto opacity-20" />
        <p>No achievements earned yet. Your legendary journey begins today.</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      {achievements.map((ach, i) => {
        const Icon = badgeIcons[ach.badgeName] || Trophy;
        const earnedDate = ach.earnedAt 
          ? (typeof ach.earnedAt === 'string' ? new Date(ach.earnedAt) : ach.earnedAt.toDate())
          : new Date();

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-4 group hover:bg-indigo-600/10 hover:border-indigo-500/20 transition-all cursor-default">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                <Icon size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white uppercase text-sm italic tracking-tight truncate">
                  {ach.badgeName}
                </h4>
                <p className="text-[10px] text-slate-500 uppercase font-bold truncate">
                  Earned {format(earnedDate, 'MMM d, yyyy')}
                </p>
              </div>
              {!compact && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[8px] uppercase font-black">
                    LEGENDARY
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
