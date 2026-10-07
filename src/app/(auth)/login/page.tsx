'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PublicOnlyRoute } from '@/features/auth/components/PublicOnlyRoute';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      auth.login(res.data.token, res.data.user);
      toast({ title: "Welcome Back", description: "Successfully logged in." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicOnlyRoute>
      <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
          <Card className="glass-card bg-slate-900/40 border-white/5 shadow-2xl backdrop-blur-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold font-headline bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400">Enter your credentials to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <Input id="email" type="email" placeholder="name@example.com" className="pl-10 bg-slate-950/50 border-white/5" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <Input id="password" type="password" className="pl-10 bg-slate-950/50 border-white/5" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full btn-glow bg-indigo-600 hover:bg-indigo-500 py-6 text-lg font-bold" disabled={loading}>{loading ? "Authenticating..." : "Sign In"}</Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-slate-400 text-center w-full">Don't have an account? <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">Sign Up</Link></div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PublicOnlyRoute>
  );
}
