'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  Zap, 
  AlertTriangle, 
  Sparkles, 
  Bot,
  Filter,
  ChevronRight,
  ListTodo,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getTasks, addTask, toggleTaskStatus, deleteTask, checkTaskDelay, generateSuggestedMissions, TaskType, TaskPriority, Task } from '@/features/dashboard/services/todoService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function MissionLogPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'delayed'>('all');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getTasks();
      setRawTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const tasks = React.useMemo(() => {
    if (!rawTasks) return [];
    return rawTasks.map(t => ({
      ...t,
      delayed: checkTaskDelay(t.createdAt, t.status)
    }));
  }, [rawTasks]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'delayed') return t.delayed;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    delayed: tasks.filter(t => t.delayed).length
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    try {
      await addTask(user.uid, {
        title: newTaskTitle,
        type: 'general',
        
        priority: 'medium',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      fetchTasks();
      setNewTaskTitle("");
      toast({ title: "Mission Active", description: "Task deployed to log." });
    } catch (e) {
      toast({ variant: "destructive", title: "Deployment Failed" });
    }
  };

  const handleSuggest = async () => {
    if (!user) return;
    setIsSuggesting(true);
    await generateSuggestedMissions(user.uid);
    fetchTasks();
    setIsSuggesting(false);
    toast({ title: "Intel Synchronized", description: "AI has suggested new missions based on your profile." });
  };

  const handleTaskClick = (task: any) => {
    if (task.status === 'completed') return;
    if (task.type === 'topic' || task.type === 'revision') {
      router.push(`/learn/concept/${task.linkedId}`);
    } else if (task.type === 'problem') {
      router.push(`/battles/practice?id=${task.linkedId}`);
    } else if (task.type === 'mock') {
      router.push('/interview/mock');
    }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-10 pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
              <ListTodo className="text-indigo-500" size={48} />
              Mission Log
            </h1>
            <p className="text-slate-400 text-lg">Deploy and manage your algorithmic objectives.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={handleSuggest} 
              disabled={isSuggesting}
              variant="outline" 
              className="border-indigo-500/20 bg-indigo-500/5 text-indigo-400 font-black uppercase italic text-xs gap-2"
            >
              <Sparkles size={16} /> {isSuggesting ? 'Analyzing...' : 'Suggest Missions'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleAddTask} className="flex gap-4">
              <Input 
                placeholder="Declare new mission objective..." 
                className="h-14 bg-slate-900/50 border-white/5 text-lg pl-6 rounded-2xl focus:border-indigo-500/50 transition-all"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <Button type="submit" className="h-14 w-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20">
                <Plus size={24} />
              </Button>
            </form>

            <div className="flex gap-2 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 w-fit">
              {['all', 'pending', 'completed', 'delayed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === f ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <Card className={cn(
                      "glass-card border-none overflow-hidden transition-all group",
                      task.status === 'completed' ? "bg-white/5 opacity-50 grayscale" : "bg-slate-900/40 hover:bg-white/5",
                      task.delayed && task.status === 'pending' && "border-l-4 border-l-red-500"
                    )}>
                      <CardContent className="p-6 flex items-center gap-6">
                        <button 
                          onClick={async () => {
                            await toggleTaskStatus(user!.uid, task.id!, task.status);
                            fetchTasks();
                          }}
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                            task.status === 'completed' ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-700 text-slate-700 hover:border-indigo-500"
                          )}
                        >
                          {task.status === 'completed' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </button>

                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleTaskClick(task)}
                        >
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className={cn(
                              "text-lg font-black uppercase italic tracking-tight truncate",
                              task.status === 'completed' && "line-through text-slate-500"
                            )}>
                              {task.title}
                            </h4>
                            {task.delayed && task.status === 'pending' && (
                              <Badge className="bg-red-500/20 text-red-400 border-none text-[8px] font-black italic">DELAYED</Badge>
                            )}
                            <Badge className="bg-white/5 text-slate-500 text-[8px] font-bold border-none uppercase">
                              {task.type}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{task.description}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          {task.linkedId && task.status === 'pending' && (
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-400 hover:bg-indigo-500/10">
                              <ExternalLink size={14} />
                            </Button>
                          )}
                          <Button 
                            onClick={async () => {
                              await deleteTask(user!.uid, task.id!);
                              fetchTasks();
                            }}
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTasks.length === 0 && !isLoading && (
                <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl space-y-4">
                  <ListTodo className="mx-auto text-slate-800" size={48} />
                  <p className="text-slate-500 font-bold italic uppercase tracking-widest">No active missions in this sector.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <Card className="glass-card border-none bg-indigo-600/10 p-8 space-y-6">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                <Zap size={20} className="text-indigo-400" /> Goal Efficiency
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-slate-400">Completion</span>
                    <span className="text-white">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} className="h-2 bg-slate-800" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Delayed</p>
                    <p className="text-2xl font-black text-red-400">{stats.delayed}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Rewards</p>
                    <p className="text-xl font-black text-indigo-400">+{stats.completed * 10} XP</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
              <div className="flex items-center gap-3 text-indigo-400">
                <Bot size={24} />
                <h3 className="text-lg font-black uppercase italic">AI Nudge Core</h3>
              </div>
              <div className="p-6 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <AnimatePresence mode="wait">
                  {stats.delayed > 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <p className="text-sm text-indigo-100 italic leading-relaxed">
                        "Explorer, your performance log shows <span className="text-red-400 font-bold">{stats.delayed} missions</span> are lagging behind schedule. Small steps build large universes. Resolve one now."
                      </p>
                      <Button size="sm" onClick={() => setFilter('delayed')} className="w-full bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase">
                        View Delayed
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <p className="text-sm text-slate-400 italic">
                        "Your log is clean. Synchronize with the Suggester to find your next objective."
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
