// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  X, 
  Users, 
  ShieldCheck, 
  Globe, 
  Zap,
  Swords
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export default function MatchmakingQueuePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<'searching' | 'matching' | 'ready'>('searching');
  
  
  const [userData , set_userData ] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => set_userData(res.data)).catch(console.error);
    }
  }, [user]);


  useEffect(() => {
    if (!user || !userData) return;

    // Check Energy
    const currentEnergy = userData.battleEnergy ?? 10;
    if (currentEnergy <= 0) {
      toast({
        variant: "destructive",
        title: "No Energy",
        description: "Your battle energy has depleted. Wait for it to recover.",
      });
      router.push('/battles');
      return;
    }

    // Consume Energy immediately upon entering queue
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);

    // 1. Enter Queue
    let queueDocRef: any = null;
    const enterQueue = async () => {
      
      queueDocRef = apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    };

    enterQueue();

    // 2. Timer
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // 3. Listen for Match
    const battlesQuery = query(
      
      where('players', 'array-contains', user.uid),
      where('status', '==', 'active'),
      limit(1)
    );

    const unsubscribeMatch = onSnapshot(battlesQuery, (snapshot) => {
      if (!snapshot.empty) {
        const battle = snapshot.docs[0];
        setStatus('ready');
        setTimeout(() => {
          router.push(`/battles/match/${battle.id}`);
        }, 2000);
      }
    });

    // 4. Matchmaking Simulation (Enhanced logic)
    const matchmakerSimulation = setTimeout(async () => {
      if (status !== 'searching') return;
      
      
      const qSnap = await getDocs(q);
      
      if (!qSnap.empty && queueDocRef) {
        const opponent = qSnap.docs[0].data();
        const opponentDocId = qSnap.docs[0].id;
        
        const battleData = {
          players: [user.uid, opponent.userId],
          playerNames: { 
            [user.uid]: userData?.name || 'Explorer', 
            [opponent.userId]: opponent.userName || 'Opponent' 
          },
          playerRatings: { 
            [user.uid]: userData?.skillRating || 1000, 
            [opponent.userId]: opponent.rating || 1000 
          },
          problemId: 'binary-search',
          startTime: serverTimestamp(),
          status: 'active',
          submissions: []
        };
        
        apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
        await deleteDoc(queueDocRef);
        
      }
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(matchmakerSimulation);
      unsubscribeMatch();
      // Cleanup queue if component unmounts and search isn't ready
      if (queueDocRef) deleteDoc(queueDocRef);
    };
  }, [user, userData, router, status, toast, userDocRef]);

  const handleCancel = () => {
    // Refund energy if user cancels manually
    if (userDocRef) {
      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    }
    router.push('/battles');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/10 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="glass-card border-none bg-slate-900/60 shadow-2xl overflow-hidden">
          <CardContent className="p-12 flex flex-col items-center text-center space-y-8">
            <AnimatePresence mode="wait">
              {status === 'searching' ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 w-full"
                >
                  <div className="relative mx-auto w-32 h-32">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Users size={40} className="text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black font-headline text-white tracking-tighter uppercase">Finding Opponent</h2>
                    <p className="text-slate-400">Rank: {userData?.skillRating || 1000} • Level {Math.floor(Math.sqrt((userData?.xp || 0)/50)) || 1}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="flex flex-col items-center gap-1">
                      <Globe size={16} className="text-slate-500" />
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Global</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ShieldCheck size={16} className="text-indigo-400" />
                      <span className="text-[10px] text-indigo-400 uppercase font-bold">Fair Play</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Zap size={16} className="text-amber-500" />
                      <span className="text-[10px] text-amber-500 uppercase font-bold">Priority</span>
                    </div>
                  </div>

                  <div className="pt-8">
                    <p className="text-4xl font-mono font-bold text-indigo-500">
                      {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-2">Queue Time</p>
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={handleCancel}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 gap-2"
                  >
                    <X size={16} /> Cancel Search
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="w-40 h-40 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] mx-auto border-4 border-white/20">
                    <Swords size={64} className="text-white animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black font-headline text-white tracking-tighter italic uppercase">Match Ready!</h2>
                    <p className="text-indigo-400 font-bold uppercase tracking-widest animate-pulse">Initializing Arena...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
