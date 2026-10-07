'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, X, Sparkles, ArrowUpRight, Loader2, Zap, Terminal, BrainCircuit } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AIMentorPanelProps {
  problemTitle?: string;
  problemDescription?: string;
  currentCode?: string;
  language?: string;
  problemId?: string;
  mode?: 'vista' | 'arena' | 'contest';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  actions?: { label: string, link: string }[];
}

export function AIMentorPanel({ 
  problemTitle, 
  problemDescription, 
  currentCode, 
  language = 'python',
  problemId,
  mode = 'arena'
}: AIMentorPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const { user, setUser } = useAuth();
  
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleAction = async (type: 'hint' | 'review' | 'recommendation' | 'coaching') => {
    if (!user) return;

    if (type === 'hint') {
      const currentXP = user.xp || 0;
      if (currentXP < 10) {
        toast({
          variant: "destructive",
          title: "Insufficient XP",
          description: "Hints cost 10 XP. Solve more problems to earn energy!"
        });
        return;
      }
    }

    setIsLoading(true);
    const userQuery = type === 'hint' ? "I need a conceptual hint." : 
                     type === 'review' ? "Review my code efficiency." : 
                     "Give me a data-driven battle plan.";
    
    setChatHistory(prev => [...prev, { role: 'user', text: userQuery }]);

    try {
      const res = await apiClient.post('/ai-mentor/chat', {
        type,
        code: currentCode,
        problemTitle,
        problemDescription,
        language
      });

      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: res.data.message || "I've reviewed your request.",
        actions: res.data.suggestedActions 
      }]);

      if (type === 'hint') {
        const newXp = (user.xp || 0) - 10;
        console.log({ ...user, xp: newXp });
        toast({ title: "Logic Refined", description: "-10 XP deducted for mentor advice." });
      }

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Logic Core Unstable", description: "The mentor is recalibrating. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4"
          >
            <Card className="w-80 md:w-96 glass-card bg-slate-900/95 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden flex flex-col h-[550px]">
              <CardHeader className="bg-indigo-600/10 border-b border-indigo-500/20 p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">AI Coach</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Feedback Active
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-slate-500 hover:text-white">
                  <X size={16} />
                </Button>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-indigo-500/20"
                >
                  {chatHistory.length === 0 && (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/5 flex items-center justify-center mx-auto border border-indigo-500/10">
                        <Sparkles className="text-indigo-500/40" size={32} />
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase italic max-w-[200px] mx-auto">
                        "Ready to stabilize your logic core, Explorer."
                      </p>
                    </div>
                  )}

                  {chatHistory.map((msg, i) => (
                    <div key={i} className={cn(
                      "flex flex-col gap-2",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-indigo-600 text-white rounded-br-none font-bold" 
                          : "bg-white/5 border border-white/10 text-slate-300 rounded-bl-none whitespace-pre-wrap shadow-xl"
                      )}>
                        {msg.text}
                      </div>
                      
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {msg.actions.map((action, idx) => (
                            <Button 
                              key={idx} 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                if (action.link.startsWith('http')) window.open(action.link, '_blank');
                                else router.push(action.link);
                              }}
                              className="h-8 text-[10px] font-black uppercase border-indigo-500/30 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 gap-1.5"
                            >
                              {action.label} <ArrowUpRight size={10} />
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                        <Loader2 size={16} className="animate-spin text-indigo-400" />
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Syncing Context...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-black/40 border-t border-white/10 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleAction('hint')}
                      disabled={isLoading || mode === 'contest'}
                      className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase h-10 gap-2 shadow-lg"
                    >
                      <Zap size={14} className="fill-current" /> Concept Hint
                    </Button>
                    <Button 
                      onClick={() => handleAction('review')}
                      disabled={isLoading}
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 text-[10px] font-black uppercase h-10 gap-2"
                    >
                      <Terminal size={14} /> Review Logic
                    </Button>
                  </div>
                  <Button 
                    onClick={() => handleAction('coaching')}
                    disabled={isLoading}
                    variant="ghost"
                    className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 text-[10px] font-black uppercase h-10 gap-2 border border-dashed border-indigo-500/20"
                  >
                    <BrainCircuit size={16} /> Request Action Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 w-16 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all duration-500 group",
          isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-indigo-600 hover:bg-indigo-500 hover:scale-110"
        )}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} className="group-hover:animate-bounce" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[9px] font-black shadow-lg">
            AI
          </div>
        )}
      </Button>
    </div>
  );
}
