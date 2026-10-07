'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Zap } from 'lucide-react';

/**
 * ProtectedRoute
 * Ensures that the user is authenticated before rendering children.
 * Redirects to /login if unauthenticated.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#020617] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
          <Zap className="text-indigo-500 animate-bounce relative z-10" size={64} />
        </div>
        <div className="text-center space-y-2">
          <p className="text-white font-black uppercase tracking-[0.3em] text-xl italic">
            Authenticating
          </p>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            Synchronizing with Algo Vista Logic Core
          </p>
        </div>
      </div>
    );
  }

  // Prevent render if not logged in (redirecting)
  if (!user) return null;

  return <>{children}</>;
}
