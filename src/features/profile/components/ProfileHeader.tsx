'use client';
// @ts-nocheck


type Firestore = any;
type DocumentData = any;
class FirestorePermissionError extends Error {}
const errorEmitter = { emit: () => {} };



import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Mail, Zap, Trophy, Flame, Edit2, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { RankBadge } from '@/components/ui/RankBadge';
import { EditProfileModal } from './EditProfileModal';
import { } from '@/firebase';

const getCountFromServer = async (...args: any[]) => ({ data: () => ({ count: 0 }) });
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  userData: any;
  user: any;
}

export function ProfileHeader({ userData, user }: ProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  

  useEffect(() => {
    if (!userData?.xp) return;
    
    const fetchRank = async () => {
      const q = null;
      const snapshot = await (() => ({ data: () => ({ count: 0 }) }))();
      setGlobalRank(snapshot.data().count + 1);
    };
    
    fetchRank();
  }, [userData?.xp]);

  const joinDate = userData?.joinedAt 
    ? (typeof userData.joinedAt === 'string' ? new Date(userData.joinedAt) : userData.joinedAt.toDate())
    : new Date();

  return (
    <Card className="glass-card border-none bg-slate-900/40 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 blur-3xl opacity-50" />
      
      <CardContent className="p-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/40 transition-all" />
            <Avatar className="h-32 w-32 border-4 border-slate-900 shadow-2xl relative z-10 ring-2 ring-indigo-500/20">
              <AvatarImage 
                src={userData?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.uid}`} 
                className="bg-slate-800"
              />
              <AvatarFallback className="text-4xl bg-indigo-600 text-white font-black italic">
                {userData?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 z-20">
              <RankBadge rating={userData?.skillRating || 1000} className="scale-125 shadow-xl" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                    {userData?.name || 'Explorer'}
                  </h1>
                  {globalRank && (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black italic">
                      RANK #{globalRank}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-400 text-sm font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} className="text-indigo-400" /> {userData?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-400" /> Joined {format(joinDate, 'MMMM yyyy')}
                  </span>
                </div>
              </div>
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                variant="outline" 
                className="border-white/10 hover:bg-white/5 gap-2 font-bold uppercase italic"
              >
                <Edit2 size={14} /> Edit Profile
              </Button>
            </div>

            <p className="text-slate-400 max-w-2xl leading-relaxed text-sm italic">
              {userData?.bio || "This explorer hasn't shared their mission objective yet. But they are ready to master the universe of algorithms."}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Zap className="text-indigo-400" size={18} />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Experience</p>
                  <p className="text-lg font-black text-white">{userData?.xp?.toLocaleString() || 0} XP</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Trophy className="text-amber-500" size={18} />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Rating</p>
                  <p className="text-lg font-black text-white">{userData?.skillRating || 1000}</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-center gap-3">
                <Flame className={cn("text-orange-500", (userData?.streakDays || 0) > 0 && "fill-orange-500")} size={18} />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Current Streak</p>
                  <p className="text-lg font-black text-white">{userData?.streakDays || 0} Days</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                <Trophy className="text-amber-500" size={18} />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Max Streak</p>
                  <p className="text-lg font-black text-white">{userData?.maxStreak || 0} Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        userData={userData} 
        userId={user?.uid}
      />
    </Card>
  );
}
