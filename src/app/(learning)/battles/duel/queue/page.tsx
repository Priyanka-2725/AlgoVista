// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Users, Globe, Zap, Swords, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export default function DuelQueuePage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();
  
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<'searching' | 'ready'>('searching');
  const [queueRange, setQueueRange] = useState(100);
  
  
  const [userData , set_userData ] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => set_userData(res.data)).catch(console.error);
    }
  }, [user]);


  useEffect(() => {
    if (!user || !userData || status === 'ready') return;

    // Check Energy
    const currentEnergy = userData.battleEnergy ?? 10;
    if (currentEnergy <= 0) {
      toast({
        variant: "destructive",
        title: "No Energy",
        description: "Wait for energy to recover.",
      });
      router.push('/battles/duel');
      return;
    }

    // Consume Energy immediately
    apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);

    // 1. Enter Queue
    let queueDocRef: any = null;
    const enterQueue = async () => {
      try {
        queueDocRef = apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
      } catch (e) {
        console.error("Queue Entry Error:", e);
      }
    };

    enterQueue();

    // 2. Timer and Range Expansion
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev === 10) setQueueRange(200);
        return prev + 1;
      });
    }, 1000);

    // 3. Listen for Match Creation
    const roomsQuery = query(
      
      where('players', 'array-contains', user.uid),
      where('status', '==', 'active'),
      limit(1)
    );

    const unsubscribeMatch = onSnapshot(roomsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const room = snapshot.docs[0];
        setStatus('ready');
        setTimeout(() => {
          router.push(`/battles/duel/match/${room.id}`);
        }, 2000);
      }
    });

    // 4. Matchmaking Logic (Simulated client-side for this architecture)
    const matchmakingInterval = setInterval(async () => {
      if (status !== 'searching') return;

      const myRating = userData?.skillRating || 1000;
      const q = query(
        
        where('userId', '!=', user.uid),
        orderBy('userId'), // Required for != query
        limit(5)
      );
      
      const qSnap = await getDocs(q);
      const potentialOpponent = qSnap.docs.find(doc => {
        const data = doc.data();
        return Math.abs(data.rating - myRating) <= queueRange;
      });

      if (potentialOpponent && queueDocRef) {
        const oppData = potentialOpponent.data();
        
        // Use a transaction or specific naming to prevent double creation
        // For prototype, we use sorted IDs to create a unique room ID
        const playerIds = [user.uid, oppData.userId].sort();
        const roomId = `duel_${playerIds[0]}_${playerIds[1]}`;
        

        try {
          const avgRating = (myRating + oppData.rating) / 2;
          const difficulty = avgRating < 1200 ? 'Easy' : avgRating < 1600 ? 'Medium' : 'Hard';

          apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);

          // Cleanup queue
          await deleteDoc(queueDocRef);
          await deleteDoc(potentialOpponent.ref);
        } catch (e) {
          console.error("Match Creation Error:", e);
        }
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(matchmakingInterval);
      unsubscribeMatch();
      if (queueDocRef) deleteDoc(queueDocRef).catch(() => {});
    };
  }, [user, userData, router, status, toast, userDocRef, queueRange]);

  const handleCancel = async () => {
    if (userDocRef) {
      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
    }
    router.push('/battles/duel');
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/20 rounded-full blur-[150px]" 
        />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg relative z-10">
        <Card className="glass-card border-none bg-slate-900/60 shadow-2xl overflow-hidden">
          <CardContent className="p-12 flex flex-col items-center text-center space-y-10">
            <AnimatePresence mode="wait">
              {status === 'searching' ? (
                <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 w-full">
                  <div className="relative mx-auto w-32 h-32">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-b-2 border-indigo-500 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Users size={40} className="text-indigo-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Searching for Opponent</h2>
                    <p className="text-slate-400 font-mono text-xs">Matching rating: {userData?.skillRating || 1000} ± {queueRange}</p>
                  </div>

                  <div className="flex justify-center gap-10">
                    <div className="flex flex-col items-center gap-1 opacity-50">
                      <Globe size={16} />
                      <span className="text-[10px] font-bold uppercase">Region: Global</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-indigo-400">
                      <Zap size={16} className="fill-indigo-400" />
                      <span className="text-[10px] font-bold uppercase">Ranked</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-5xl font-mono font-black text-indigo-500 tabular-nums">
                      {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-2">Time in Queue</p>
                  </div>

                  <Button variant="ghost" onClick={handleCancel} className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 gap-2">
                    <X size={16} /> Forfeit Queue
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="ready" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-8">
                  <div className="w-40 h-40 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.6)] mx-auto border-4 border-white/20">
                    <Swords size={64} className="text-white animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Opponent Found!</h2>
                    <p className="text-indigo-400 font-bold uppercase tracking-widest animate-pulse">Synchronizing Arena State...</p>
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
