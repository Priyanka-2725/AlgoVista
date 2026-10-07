'use client';
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { apiClient } from '@/lib/apiClient';
import { 
  Sparkles, 
  TrendingUp, 
  History, 
  RotateCcw,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export default function AiMentorPage() {
  const [performance, setPerformance] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInsightsLoading, setIsInsightsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const perfReq = await apiClient.get('/ai-mentor/performance');
      setPerformance(perfReq.data);

      // We should ideally have a GET /api/ai-mentor/insights endpoint.
      // But since we didn't add it, let's just show local state or fetch from where it makes sense.
      // For now, let's just clear or show generated insights.
      setIsInsightsLoading(false);
    } catch (err) {
      console.error('Failed to load performance data', err);
      setIsInsightsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const newAdvice = await apiClient.post('/ai-mentor/generate-advice');
      setInsights(prev => [newAdvice.data, ...prev].slice(0, 10));
      await fetchData();
    } catch (err) {
      console.error('Failed to refresh guidance', err);
    }
    setIsRefreshing(false);
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <NavigationSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-black font-headline tracking-tighter italic text-white flex items-center gap-4 uppercase">
                <Sparkles className="text-indigo-500" size={48} />
                AI Mentor
              </h1>
              <p className="text-slate-400 text-lg">Personalized algorithmic coaching and behavioral analysis.</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="outline" 
              className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 font-bold uppercase"
            >
              <RotateCcw className={isRefreshing ? "animate-spin mr-2" : "mr-2"} size={16} />
              {isRefreshing ? "Consulting..." : "Refresh Guidance"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-none bg-slate-900/40 p-8 space-y-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-emerald-400" /> Performance Profile
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Success Rate</span>
                    <span className="font-bold text-emerald-400">{Math.round(performance?.successRate || 0)}%</span>
                  </div>
                  <Progress value={performance?.successRate || 0} className="h-2 bg-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Streak</p>
                    <p className="text-2xl font-black text-white">{performance?.streakDays || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Activity</p>
                    <p className="text-sm font-black text-indigo-400">{performance?.activityLevel || '...'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {performance?.weakCategories?.map((cat: string) => (
                      <Badge key={cat} variant="outline" className="border-red-500/20 text-red-400 bg-red-500/5 uppercase text-[10px]">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="text-indigo-400" /> Guidance Logs
              </h3>
              
              <div className="space-y-4">
                {isInsightsLoading ? (
                  <div className="text-center py-20 text-slate-500 italic">Consulting archives...</div>
                ) : insights?.map((insight, idx) => (
                  <motion.div 
                    key={insight._id || idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/5 flex gap-6 items-start hover:bg-white/10 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <MessageCircle size={24} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-white uppercase italic">{insight.title}</h4>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          {insight.generatedAt ? formatDistanceToNow(new Date(insight.generatedAt), { addSuffix: true }) : 'Recent'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{insight.message}</p>
                      <div className="pt-2 flex items-center gap-4">
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[10px]">{insight.category}</Badge>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter italic">Suggested Action: {insight.recommendedAction}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {insights?.length === 0 && !isInsightsLoading && (
                  <div className="p-12 rounded-2xl border-2 border-dashed border-white/5 text-center space-y-4">
                    <Sparkles className="mx-auto text-slate-700" size={40} />
                    <p className="text-slate-500 italic">The AI Mentor is still observing your behavior. Click "Refresh Guidance" to generate your first insight.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
