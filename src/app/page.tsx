"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Swords, Code2, BrainCircuit } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Hero background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 relative z-10 max-w-3xl"
      >
        <div className="inline-block p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <BrainCircuit size={48} className="text-indigo-500" />
        </div>
        <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
          ALGO VISTA
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 font-medium">
          Master algorithms through visualization and real-time competition. 
          The universe's most advanced gamified learning platform.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/login" className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-64 h-16 text-xl btn-glow bg-indigo-600 hover:bg-indigo-500 font-bold rounded-2xl">
              Enter Universe
            </Button>
          </Link>
          <Link href="/signup" className="w-full md:w-auto">
            <Button size="lg" variant="outline" className="w-full md:w-64 h-16 text-xl border-white/10 hover:bg-white/5 rounded-2xl">
              Create Profile
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-slate-900 border border-white/5">
              <BrainCircuit className="text-indigo-400" />
            </div>
            <h3 className="font-bold">Visualize</h3>
            <p className="text-sm text-slate-500">Interactive step-by-step algo visualizers.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-slate-900 border border-white/5">
              <Swords className="text-emerald-400" />
            </div>
            <h3 className="font-bold">Compete</h3>
            <p className="text-sm text-slate-500">Real-time 1v1 coding battles.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-slate-900 border border-white/5">
              <Code2 className="text-purple-400" />
            </div>
            <h3 className="font-bold">Level Up</h3>
            <p className="text-sm text-slate-500">Earn XP and climb the global ranks.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
