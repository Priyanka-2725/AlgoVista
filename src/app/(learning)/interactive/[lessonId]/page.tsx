"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LessonEngine } from '@/features/interactive-lesson/components/LessonEngine';
import { deadlockLesson } from '@/lib/interactive-lessons/os/deadlock';
import { processVsThreadLesson } from '@/lib/interactive-lessons/os/process-vs-thread';
import { cpuSchedulingLesson } from '@/lib/interactive-lessons/os/cpu-scheduling';
import { pagingLesson } from '@/lib/interactive-lessons/os/paging';
import { binarySearchLesson } from '@/lib/interactive-lessons/dsa/binary-search';
import { bfsLesson } from '@/lib/interactive-lessons/dsa/bfs';
import { fibonacciLesson } from '@/lib/interactive-lessons/dsa/fibonacci';
import { nQueensLesson } from '@/lib/interactive-lessons/dsa/n-queens';
import { acidPropertiesLesson } from '@/lib/interactive-lessons/dbms/acid';
import { bplusTreeLesson } from '@/lib/interactive-lessons/dbms/bplus-tree';
import { normalizationLesson } from '@/lib/interactive-lessons/dbms/normalization';
import { isolationLevelsLesson } from '@/lib/interactive-lessons/dbms/isolation';
import { tcpUdpLesson } from '@/lib/interactive-lessons/cn/tcp-udp';
import { dnsLesson } from '@/lib/interactive-lessons/cn/dns';
import { osiLesson } from '@/lib/interactive-lessons/cn/osi-model';
import { loadBalancerLesson } from '@/lib/interactive-lessons/sd/load-balancer';
import { capTheoremLesson } from '@/lib/interactive-lessons/sd/cap-theorem';
import { eventLoopLesson } from '@/lib/interactive-lessons/web/event-loop';
import { domTreeLesson } from '@/lib/interactive-lessons/web/dom-tree';
import { solidLesson } from '@/lib/interactive-lessons/oops/solid';
import { gradientDescentLesson } from '@/lib/interactive-lessons/aiml/gradient-descent';
import { dfaLesson } from '@/lib/interactive-lessons/automata/dfa';
import { InteractiveLesson } from '@/features/interactive-lesson/types';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

const lessons: Record<string, InteractiveLesson<any>> = {
  'os_deadlock': deadlockLesson,
  'os_process_thread': processVsThreadLesson,
  'os_cpu_scheduling': cpuSchedulingLesson,
  'os_paging': pagingLesson,
  'dsa_binary_search': binarySearchLesson,
  'dsa_bfs': bfsLesson,
  'dsa_dp_fibonacci': fibonacciLesson,
  'dsa_n_queens': nQueensLesson,
  'dbms_acid': acidPropertiesLesson,
  'dbms_bplus_tree': bplusTreeLesson,
  'dbms_normalization': normalizationLesson,
  'dbms_isolation': isolationLevelsLesson,
  'cn_tcp_udp': tcpUdpLesson,
  'cn_dns_resolution': dnsLesson,
  'cn_osi_model': osiLesson,
  'sd_load_balancer': loadBalancerLesson,
  'sd_cap_theorem': capTheoremLesson,
  'web_event_loop': eventLoopLesson,
  'web_dom_tree': domTreeLesson,
  'oops_solid': solidLesson,
  'aiml_gradient_descent': gradientDescentLesson,
  'automata_dfa': dfaLesson
};

export default function InteractiveLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  const [lesson, setLesson] = useState<InteractiveLesson<any> | null>(null);

  useEffect(() => {
    if (lessons[lessonId]) {
      setLesson(lessons[lessonId]);
    }
  }, [lessonId]);

  if (!lesson) {
    return <div className="p-8 text-center text-white">Loading or Lesson Not Found...</div>;
  }

  const handleComplete = (xpEarned: number) => {
    toast({
      title: "Mission Completed!",
      description: `You earned +${xpEarned} XP!`,
      variant: "default",
    });
    // In real app, call XP service here
    setTimeout(() => {
      router.push('/learn');
    }, 2000);
  };

  return (
    <AppShell>
      <div className="h-screen flex flex-col bg-[#020617] overflow-hidden">
        {/* Header */}
        <div className="h-20 bg-slate-900/80 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500 hover:text-white">
              <ChevronLeft />
            </Button>
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{lesson.title}</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lesson.subject}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 rounded-full border border-indigo-500/20 text-indigo-400 font-black italic text-xs uppercase">{lesson.difficulty}</div>
             <div className="h-8 w-px bg-white/5" />
             <div className="px-3 py-1 rounded-full bg-slate-900 border border-white/5 text-slate-400 text-xs font-bold uppercase">{lesson.estMinutes} MINS</div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-10 relative">
          <LessonEngine lesson={lesson} onComplete={handleComplete} />
        </main>
      </div>
    </AppShell>
  );
}
