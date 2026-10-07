'use client';
// @ts-nocheck

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  Zap, 
  Clock, 
  Code2, 
  History, 
  BrainCircuit, 
  MessageSquare,
  Bot,
  AlertCircle,
  TrendingUp,
  Activity,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Editor } from '@monaco-editor/react';
import { getReplayCritique, ReplayCritiqueResponse } from '@/ai/flows/interview-replay-critique-flow';
import { cn } from '@/lib/utils';
import { AppShell } from '@/components/layout/AppShell';

export default function InterviewReplayPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  

  
  const [session, set_session] = React.useState<any>(null);
  const [isSnapsLoading, setIsSnapsLoading] = React.useState(true);
  
  useEffect(() => {
    if (sessionId) {
      apiClient.get(`/api/arena/${sessionId}`).then(res => {
        set_session(res.data);
      }).catch(console.error);
      
      // Mocking snapshots since backend doesn't store them yet
      setTimeout(() => {
        set_snapshots([
          { timestamp: 0, code: '# Start coding here', language: 'python', event: 'start', codeLength: 20 },
          { timestamp: 15000, code: '# Start coding here\ndef solve():\n    pass', language: 'python', event: 'typing', codeLength: 40 }
        ]);
        setIsSnapsLoading(false);
      }, 1000);
    }
  }, [sessionId]);

  
    

  const [snapshots, set_snapshots] = React.useState<any[]>([]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [critique, setCritique] = useState<ReplayCritiqueResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && snapshots && currentIdx < snapshots.length - 1) {
      const nextDelay = (snapshots[currentIdx + 1].timestamp - snapshots[currentIdx].timestamp) / playbackSpeed;
      timerRef.current = setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, Math.max(100, nextDelay));
    } else {
      setIsPlaying(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentIdx, snapshots, playbackSpeed]);

  const analyzeSession = async () => {
    if (!snapshots || snapshots.length === 0 || isAnalyzing || critique) return;
    setIsAnalyzing(true);
    try {
      const timeline = snapshots.map(s => ({
        timestamp: s.timestamp,
        codeLength: s.codeLength || 0,
        event: s.event
      }));

      const res = await getReplayCritique({
        problemTitle: "Mock Arena Session",
        finalCode: snapshots[snapshots.length - 1].code,
        language: snapshots[snapshots.length - 1].language || 'python',
        timeline
      });
      setCritique(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (snapshots && snapshots.length > 0 && !critique && !isAnalyzing) {
      analyzeSession();
    }
  }, [snapshots]);

  if (isSnapsLoading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <Zap className="text-indigo-500 animate-spin" size={48} />
        <p className="text-slate-500 font-black uppercase italic tracking-widest">Retrieving Timeline Intel...</p>
      </div>
    );
  }

  const currentSnap = snapshots?.[currentIdx];
  const progress = snapshots ? (currentIdx / (snapshots.length - 1)) * 100 : 0;

  return (
    <AppShell>
      <div className="h-screen flex flex-col bg-[#020617] overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-slate-900/80 border-b border-indigo-500/20 px-8 flex items-center justify-between backdrop-blur-md relative z-20">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500 hover:text-white">
              <ChevronLeft size={24} />
            </Button>
            <div className="h-10 w-px bg-white/5" />
            <div>
              <h1 className="text-xl font-black italic uppercase text-white tracking-tight">Post-Mission Debrief</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Session Replay Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-indigo-400 uppercase italic">Session Time</span>
              <span className="text-2xl font-mono font-black text-white tabular-nums">
                {currentSnap ? Math.floor(currentSnap.timestamp / 60000) : 0}:
                {currentSnap ? (Math.floor(currentSnap.timestamp / 1000) % 60).toString().padStart(2, '0') : '00'}
              </span>
            </div>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 h-10 px-6 uppercase font-black italic">
              {session?.problemIds?.length || 0} CHALLENGES
            </Badge>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {/* Main Replay Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 bg-[#1e1e1e] relative">
              <Editor
                height="100%"
                theme="vs-dark"
                language={currentSnap?.language || 'python'}
                value={currentSnap?.code || ""}
                options={{ fontSize: 14, fontFamily: 'Fira Code', readOnly: true, minimap: { enabled: false }, padding: { top: 20 } }}
              />
              
              <AnimatePresence>
                {currentSnap?.event && currentSnap.event !== 'typing' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute top-10 right-10 z-30"
                  >
                    <Badge className="bg-amber-500 text-slate-900 border-none px-4 py-2 font-black italic shadow-2xl">
                      EVENT: {currentSnap.event.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls Bar */}
            <div className="h-24 bg-slate-900 border-t border-indigo-500/20 flex flex-col justify-center px-10 space-y-4">
              <Slider
                value={[currentIdx]}
                max={snapshots ? snapshots.length - 1 : 0}
                step={1}
                onValueChange={(val) => { setIsPlaying(false); setCurrentIdx(val[0]); }}
                className="w-full"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause /> : <Play className="ml-1 fill-current" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentIdx(0)} className="text-slate-500 hover:text-white">
                    <RotateCcw size={20} />
                  </Button>
                  <div className="flex gap-2 p-1 bg-white/5 rounded-lg ml-4">
                    {[1, 2, 5].map(speed => (
                      <button 
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={cn(
                          "px-3 py-1 rounded text-[10px] font-black uppercase transition-all",
                          playbackSpeed === speed ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</p>
                    <p className="text-sm font-black text-indigo-400">{Math.round(progress)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Critique Area */}
          <aside className="w-96 bg-slate-950/40 border-l border-white/5 overflow-y-auto p-8 space-y-10 scrollbar-hide">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <BrainCircuit size={16} /> AI Timeline Intel
                </h3>
                {isAnalyzing && <Loader2 className="animate-spin text-indigo-500" size={14} />}
              </div>

              {!critique ? (
                <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center space-y-4">
                  <Bot size={40} className="mx-auto text-slate-800" />
                  <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-relaxed">
                    Analyzing logical patterns and decision speed...
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-indigo-400 uppercase italic">Efficiency Score</span>
                      <span className="text-2xl font-black text-white">{critique.timeEfficiencyScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${critique.timeEfficiencyScore}%` }} className="h-full bg-indigo-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">"{critique.summary}"</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <Zap size={12} className="text-amber-400" /> Behavioral Timeline
                    </h4>
                    <div className="space-y-3">
                      {critique.behavioralInsights.map((insight, i) => (
                        <div 
                          key={i} 
                          onClick={() => {
                            const snapIdx = snapshots?.findIndex(s => s.timestamp >= insight.timestamp);
                            if (snapIdx !== -1) setCurrentIdx(snapIdx!);
                          }}
                          className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <Badge className={cn(
                              "text-[8px] font-black uppercase border-none",
                              insight.severity === 'High' ? "bg-red-500/20 text-red-400" : "bg-indigo-500/20 text-indigo-400"
                            )}>
                              {insight.label}
                            </Badge>
                            <span className="text-[9px] font-mono text-slate-600 font-bold">
                              {Math.floor(insight.timestamp / 60000)}:{(Math.floor(insight.timestamp / 1000) % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed group-hover:text-white transition-colors">{insight.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <AlertCircle size={12} className="text-red-400" /> Critical Stagnation Points
                    </h4>
                    <div className="space-y-2">
                      {critique.stagnationPoints.map((point, i) => (
                        <div key={i} className="flex gap-3 text-[10px] text-slate-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10 italic">
                          <span className="text-red-400 font-bold">•</span>
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </AppShell>
  );
}
