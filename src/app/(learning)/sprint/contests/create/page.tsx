// @ts-nocheck

"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { Badge } from '@/components/ui/badge';
import { X, Check, Code2, Globe, Lock, School, Settings } from 'lucide-react';

export default function CreateContestPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 60,
    difficulty: 'Medium',
    visibility: 'public'
  });

  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  const toggleProblem = (id: string) => {
    setSelectedProblems(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!user || !db) return;
    if (!formData.title || selectedProblems.length === 0) {
      toast({ variant: "destructive", title: "Validation Error", description: "Title and at least one problem are required." });
      return;
    }

    setLoading(true);
    try {
      const startTimeDate = new Date(formData.startTime);
      const endTimeDate = new Date(startTimeDate.getTime() + formData.duration * 60000);

      apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);

      toast({ title: "Contest Published", description: "Your arena is now live for registration." });
      router.push('/sprint/contests');
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to host contest." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Setup Contest Arena</h1>
            <p className="text-slate-400">Configure your parameters and deploy challenges to the universe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-widest">Arena Title</Label>
                    <Input 
                      placeholder="e.g. Binary Blitz #1"
                      className="bg-black/40 border-white/5 h-12"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-widest">Mission Objective</Label>
                    <Textarea 
                      placeholder="Describe the goals of this contest..."
                      className="bg-black/40 border-white/5 h-32 resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-widest">Start Time</Label>
                    <Input 
                      type="datetime-local"
                      className="bg-black/40 border-white/5 h-12 text-white"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-indigo-400 tracking-widest">Duration (Mins)</Label>
                    <Input 
                      type="number"
                      className="bg-black/40 border-white/5 h-12"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </Card>

              <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Select Challenges</h3>
                  <Badge className="bg-indigo-600/20 text-indigo-400 border-none">{selectedProblems.length} Selected</Badge>
                </div>
                <div className="space-y-3">
                  {ARENA_PROBLEMS.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => toggleProblem(p.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedProblems.includes(p.id) ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedProblems.includes(p.id) ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                          <Code2 size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{p.title}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black">{p.category} • {p.difficulty}</p>
                        </div>
                      </div>
                      {selectedProblems.includes(p.id) && <Check size={16} className="text-indigo-400" />}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-6">
                <h3 className="text-xs font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                  <Settings size={14} /> Deployment Params
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Target Difficulty</Label>
                    <Select onValueChange={(v) => setFormData({...formData, difficulty: v})} defaultValue={formData.difficulty}>
                      <SelectTrigger className="bg-black/40 border-white/5 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="Easy">Easy Tier</SelectItem>
                        <SelectItem value="Medium">Medium Tier</SelectItem>
                        <SelectItem value="Hard">Hard Tier</SelectItem>
                        <SelectItem value="Mixed">Mixed Challenge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Arena Visibility</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'public', label: 'Public', icon: Globe, desc: 'Anyone can join' },
                        { id: 'private', label: 'Private', icon: Lock, desc: 'Invite only' },
                        { id: 'college', label: 'College', icon: School, desc: 'Student filter active' }
                      ].map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setFormData({...formData, visibility: v.id})}
                          className={`p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${formData.visibility === v.id ? 'bg-indigo-600/10 border-indigo-500' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                        >
                          <v.icon size={18} className={formData.visibility === v.id ? 'text-indigo-400' : 'text-slate-500'} />
                          <div>
                            <p className="text-xs font-bold text-white uppercase">{v.label}</p>
                            <p className="text-[9px] text-slate-500">{v.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-lg font-black italic uppercase shadow-xl shadow-indigo-500/20"
                  >
                    {loading ? 'Initializing...' : 'DEPLOY CONTEST'}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
