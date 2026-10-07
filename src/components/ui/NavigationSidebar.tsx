'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Sparkles, 
  BookOpen, 
  ListTodo, 
  Swords, 
  Briefcase, 
  Trophy, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  LogOut 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Mentor', href: '/dashboard/ai-mentor', icon: Sparkles },
  { name: 'Concept Hub', href: '/learn', icon: BookOpen },
  { name: 'Mission Log', href: '/todo', icon: ListTodo },
  { name: 'Sprint Universe', href: '/battles', icon: Swords },
  { name: 'Interview Hub', href: '/interview', icon: Briefcase },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Profile', href: '/profile', icon: User },
];

export function NavigationSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="relative h-screen flex flex-col glass-card m-2 border-none bg-slate-900/50 z-[100]"
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent font-headline"
          >
            Algo Vista
          </motion.h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-indigo-500/20 text-indigo-400"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center p-3 rounded-lg transition-all duration-200 group relative",
                isActive ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "text-slate-400 hover:text-white hover:bg-white/5",
                collapsed ? "justify-center" : ""
              )}>
                <item.icon size={22} className={cn(isActive ? "text-indigo-400" : "group-hover:text-white")} />
                {!collapsed && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
                {collapsed && (
                   <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {!collapsed && user?.streakDays !== undefined && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={cn("text-orange-500", user.streakDays > 0 && "fill-orange-500")} size={18} />
            <span className="text-xs font-bold text-white uppercase tracking-tighter">Current Streak</span>
          </div>
          <span className="text-xl font-black text-orange-500 italic">{user.streakDays}</span>
        </div>
      )}

      <div className="p-4 border-t border-white/5">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </motion.div>
  );
}
