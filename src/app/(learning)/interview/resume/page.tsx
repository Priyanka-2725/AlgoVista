'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  BrainCircuit, 
  ChevronRight, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { analyzeResume, ResumeAnalysisOutput } from '@/ai/flows/resume-analysis-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ResumeInterviewLobby() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  
  const [resumeData, set_resumeData] = React.useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      if (selected.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Limit is 5MB." });
        return;
      }
      setFile(selected);
    } else {
      toast({ variant: "destructive", title: "Invalid format", description: "Please upload a PDF." });
    }
  };

  const processResume = async () => {
    if (!file || !user) return;
    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const dataUri = await base64Promise;
      const result = await analyzeResume({ pdfDataUri: dataUri });

      const payload = {
        ...result,
        fileName: file.name,
        parsedAt: new Date(),
        userId: user.uid
      };

      if (null) {
        apiClient.post('/dashboard/activities', { eventType: 'action' }).catch(console.error);
      }

      toast({ title: "Resume Synced", description: "AI has extracted your profile and generated questions." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Analysis Failed", description: "Logic core timed out. Please try again." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startInterview = () => {
    router.push('/interview/resume/arena');
  };

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto space-y-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Project Intel Center</h1>
            <p className="text-slate-400 text-lg">AI-driven technical deep-dives based on your real experience.</p>
          </div>
          <Badge className="bg-indigo-600 text-white border-none px-4 py-1.5 font-black uppercase italic animate-pulse">
            Resume Driven AI
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-8">
              <div className="flex items-center gap-3 text-indigo-400">
                <Upload size={24} />
                <h3 className="text-xl font-black uppercase italic tracking-tight">Deploy Resume</h3>
              </div>

              {!resumeData || isAnalyzing ? (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-white/5 rounded-3xl p-10 text-center space-y-4 hover:border-indigo-500/30 transition-colors group cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileChange}
                    />
                    <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400 group-hover:scale-110 transition-transform">
                      <FileText size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase italic">
                        {file ? file.name : "Select PDF Document"}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">MAX SIZE: 5MB</p>
                    </div>
                  </div>

                  <Button 
                    onClick={processResume}
                    disabled={!file || isAnalyzing}
                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-lg font-black italic rounded-2xl shadow-xl shadow-indigo-500/20"
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="mr-2 animate-spin" /> ANALYZING INTEL...</>
                    ) : (
                      <><Sparkles className="mr-2" /> INITIALIZE PROFILE</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 className="text-emerald-400" size={24} />
                      <div>
                        <p className="text-xs font-black text-emerald-400 uppercase italic">Intel Synchronized</p>
                        <p className="text-sm font-bold text-white truncate max-w-[150px]">{resumeData.fileName}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-[10px] font-black uppercase text-slate-500 hover:text-white">
                      <RotateCcw size={12} className="mr-1" /> Re-Upload
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2">
                      <Target size={14} className="text-indigo-400" /> Extracted Skillset
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.summary?.skills?.slice(0, 8).map((s: string) => (
                        <Badge key={s} variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[9px] uppercase">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={startInterview}
                    className="w-full h-20 bg-indigo-600 hover:bg-indigo-500 text-2xl font-black italic rounded-2xl shadow-2xl group"
                  >
                    START RESUME MOCK <Play size={20} className="ml-3 fill-current group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              )}
            </Card>

            <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 space-y-4">
              <div className="flex items-center gap-3 text-indigo-400">
                <Zap size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Why Resume Mock?</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Top-tier engineers aren't just tested on algorithms. They are tested on the decisions they made in their past work. This system forces you to justify your architecture, stack, and debugging processes."
              </p>
            </div>
          </div>

          {/* Questions/Preview Section */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
              <BrainCircuit className="text-indigo-400" /> AI-Generated Combat Prompts
            </h3>

            {!resumeData ? (
              <div className="h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-6 border-2 border-dashed border-white/5 rounded-[40px]">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700">
                  <BrainCircuit size={48} />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-500 font-bold uppercase italic text-sm">Awaiting Intel Deployment</p>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-[250px] mx-auto">
                    Upload your resume to generate high-signal interview questions based on your specific projects.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {resumeData.questions?.map((q: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="glass-card border-none bg-slate-900/40 p-6 group hover:bg-white/5 transition-colors cursor-default">
                      <div className="flex gap-6 items-start">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 font-black italic shrink-0">
                          {i + 1}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-white italic tracking-tight">"{q.text}"</p>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-white/5 text-slate-500 text-[8px] uppercase tracking-widest px-2">
                              {q.difficulty}
                            </Badge>
                            <span className="text-[9px] font-black text-indigo-500 uppercase italic">Context: {q.context}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
