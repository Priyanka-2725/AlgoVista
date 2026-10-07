import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
'use client';
// @ts-nocheck

import React from 'react';

import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileStatsGrid } from '@/features/profile/components/ProfileStatsGrid';
import { AchievementsGrid } from '@/features/profile/components/AchievementsGrid';
import { LearningProgress } from '@/features/profile/components/LearningProgress';
import { RecentActivityList } from '@/features/profile/components/RecentActivityList';
import { SkillRadarChart } from '@/features/profile/components/SkillRadarChart';
import { ActivityHeatmap } from '@/features/profile/components/ActivityHeatmap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Trophy, History, TrendingUp } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  

  
  const { data: userData } = (({} as any));

  
  const { data: activities } = (([] as any));

  
  const { data: dailyActivity } = (([] as any));

  
  const { data: achievements } = (([] as any));

  
  const { data: duels } = (([] as any));

  
  const { data: bosses } = (([] as any));

  
  const { data: sprints } = (([] as any));

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto space-y-10 pb-24">
        <ProfileHeader userData={userData} user={user} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <SkillRadarChart activities={activities} />
            
            <Card className="glass-card border-none bg-slate-900/40 p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={16} /> Mastery Levels
              </h3>
              <LearningProgress activities={activities} />
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <ProfileStatsGrid 
              userData={userData} 
              duels={duels} 
              bosses={bosses} 
              sprints={sprints} 
            />

            <ActivityHeatmap activityData={dailyActivity} />

            <Tabs defaultValue="achievements" className="space-y-6">
              <TabsList className="bg-slate-900/50 border border-white/5 p-1 h-12">
                <TabsTrigger value="achievements" className="gap-2 px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white uppercase font-black text-[10px] italic">
                  <Trophy size={14} /> Achievements
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2 px-6 data-[state=active]:bg-indigo-600 data-[state=active]:text-white uppercase font-black text-[10px] italic">
                  <History size={14} /> Match History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="achievements">
                <Card className="glass-card border-none bg-slate-900/40 p-8">
                  <AchievementsGrid achievements={achievements} />
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="glass-card border-none bg-slate-900/40 p-8">
                  <RecentActivityList activities={activities?.slice(0, 20) || []} />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
