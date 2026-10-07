'use client';
import React from 'react';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { NavigationSidebar } from '@/components/ui/NavigationSidebar';
import { AIMentorPanel } from '@/features/ai-mentor/components/AIMentorPanel';

/**
 * AppShell
 * A unified wrapper for all authenticated pages.
 * Provides sidebar navigation and authentication protection.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#020617] overflow-hidden">
        <NavigationSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        {/* Global Floating AI Mentor Assistant */}
        <AIMentorPanel mode="vista" />
      </div>
    </ProtectedRoute>
  );
}
