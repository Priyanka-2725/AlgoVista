'use client';
// @ts-nocheck

import React from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ChevronRight, 
  Trophy, 
  Target,
  Zap,
  LayoutGrid,
  Search,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COMPANIES } from '@/lib/companies-data';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { ARENA_PROBLEMS } from '@/lib/arena-problems';
import { COMPANY_LEVEL_PROBLEMS } from '@/lib/sheets-data';
import { calculateCompanyReadiness } from '@/features/learning/services/companyService';
import { cn } from '@/lib/utils';

export default function CompaniesLobbyPage() {
  const router = useRouter();
  const { user } = useAuth();
  

  
  const [userData , set_userData ] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      apiClient.get('/users/profile').then(res => set_userData(res.data)).catch(console.error);
    }
  }, [user]);

  const solvedIds = userData?.solvedProblemIds || [];
  
  // Deduplicate problems by ID
  const allProblems = React.useMemo(() => {
    const map = new Map();
    [...ARENA_PROBLEMS, ...COMPANY_LEVEL_PROBLEMS].forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/interview')}
              className="text-slate-500 hover:text-white p-0 gap-2 font-black uppercase text-[10px] tracking-widest"
            >
              <ChevronLeft size={14} /> Back to Hub
            </Button>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <Building2 size={32} className="text-emerald-500" />
              </div>
              <div>
                <h1 className="text-5xl font-black font-headline tracking-tighter italic text-white uppercase">Company Prep</h1>
                <p className="text-slate-400 text-lg">Targeted preparation for top-tier technology firms.</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {COMPANIES.map((company) => {
            const readiness = calculateCompanyReadiness(company, solvedIds, allProblems);
            
            return (
              <motion.div key={company.id} variants={item}>
                <Link href={`/interview/companies/${company.id}`}>
                  <Card className="glass-card border-none bg-slate-900/40 h-full hover:shadow-[0_0_40px_rgba(16,185,129,0.1)] transition-all group cursor-pointer overflow-hidden relative">
                    <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r", company.color)} />
                    <CardHeader className="text-center pt-10">
                      <div className="mx-auto h-20 w-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center p-4 group-hover:scale-110 transition-transform">
                        <img src={company.logo} alt={company.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div className="mt-4 space-y-1">
                        <CardTitle className="text-2xl font-black text-white uppercase italic tracking-tight">{company.name}</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Global Tech Leader</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                      <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                        {company.description}
                      </p>
                      
                      <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase">Readiness</span>
                          <span className="text-sm font-black text-emerald-400 italic">{readiness}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${readiness}%` }}
                            className="h-full bg-emerald-500" 
                          />
                        </div>
                      </div>

                      <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest h-10 italic">
                        Enter Workspace <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 glass-card border-none bg-slate-900/40 p-8 flex items-center justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Target size={160} />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Target size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase italic">Pattern-Matching Engine</h3>
                <p className="text-slate-400 text-sm max-w-md">Our workspace algorithms automatically index your recent failures to highlight high-frequency company topics you need to master.</p>
              </div>
            </div>
            <Badge className="bg-indigo-600 text-white font-black italic px-4 py-1 relative z-10">AI DRIVEN</Badge>
          </Card>

          <Card className="glass-card border-none bg-indigo-600/10 p-8 text-center space-y-4 flex flex-col justify-center">
            <Zap className="mx-auto text-indigo-400" size={32} />
            <h3 className="text-lg font-black text-white uppercase italic">FAANG Ready?</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Achieve 80% readiness across all firms to unlock the "Master Architect" profile badge.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
