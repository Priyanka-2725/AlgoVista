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

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
    }
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', { name, email, password });
      auth.login(res.data.token, res.data.user);
      toast({ title: "Account Created", description: "Welcome to Algo Vista!" });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Signup Failed", description: error.response?.data?.error || error.message });
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
              <CardTitle className="text-3xl font-bold font-headline bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">Join the Universe</CardTitle>
              <CardDescription className="text-slate-400">Create your profile and start competing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" placeholder="John Doe" className="bg-slate-950/50 border-white/5" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="name@example.com" className="bg-slate-950/50 border-white/5" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" className="bg-slate-950/50 border-white/5" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm</Label><Input id="confirmPassword" type="password" className="bg-slate-950/50 border-white/5" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                </div>
                <Button type="submit" className="w-full btn-glow bg-indigo-600 hover:bg-indigo-500 py-6 text-lg font-bold" disabled={loading}>{loading ? "Creating Profile..." : "Sign Up"}</Button>
              </form>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-slate-400 text-center w-full">Already have an account? <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Login</Link></div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PublicOnlyRoute>
  );
}
