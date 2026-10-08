"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CallStackState {
  frames: {
    id: string;
    funcName: string;
    args: string;
    status: 'active' | 'done' | 'memoized' | 'error';
    returnValue?: string;
  }[];
  stats?: Record<string, string | number>;
}

interface CallStackRendererProps {
  state: CallStackState;
}

export function CallStackRenderer({ state }: CallStackRendererProps) {
  // We want to show the stack growing from the bottom up, 
  // so we reverse the frames for rendering (index 0 = top of stack)
  const renderedFrames = [...state.frames].reverse();

  return (
    <div className="w-full bg-[#020617] rounded-2xl relative min-h-[400px] flex flex-col overflow-hidden">
      {/* Stats overlay */}
      {state.stats && (
        <div className="absolute top-4 right-4 bg-slate-900/90 p-4 rounded-xl border border-white/10 z-10 flex flex-col gap-3 shadow-2xl backdrop-blur-md">
          {Object.entries(state.stats).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 items-center">
              <span className="text-slate-500 uppercase text-[10px] font-black tracking-widest">{k}</span>
              <span className="font-mono text-indigo-400 font-bold text-lg">{v}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 p-8 flex flex-col justify-end items-center gap-2 overflow-y-auto relative">
        {/* Background grid/guides for the stack */}
        <div className="absolute inset-x-10 inset-y-8 border-x-2 border-dashed border-white/5 pointer-events-none" />
        
        <AnimatePresence mode="popLayout">
          {renderedFrames.map((frame, idx) => {
            let bgClass = "bg-slate-800 border-slate-600";
            let textClass = "text-slate-300";
            let icon = null;

            if (frame.status === 'active') {
              bgClass = "bg-indigo-600/20 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]";
              textClass = "text-indigo-100";
            } else if (frame.status === 'done') {
              bgClass = "bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]";
              textClass = "text-emerald-400";
            } else if (frame.status === 'memoized') {
              bgClass = "bg-purple-900/40 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]";
              textClass = "text-purple-300";
              icon = <span className="text-[10px] uppercase font-black tracking-widest bg-purple-500/20 px-2 py-1 rounded ml-3">Cache Hit</span>;
            } else if (frame.status === 'error') {
              bgClass = "bg-red-950/40 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
              textClass = "text-red-400";
              icon = <span className="text-[10px] uppercase font-black tracking-widest bg-red-500/20 px-2 py-1 rounded ml-3">Recalculating</span>;
            }

            const isTop = idx === 0;

            return (
              <motion.div
                key={frame.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: isTop ? 1.05 : 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`w-full max-w-md p-4 rounded-xl border-2 flex items-center justify-between ${bgClass} z-${50 - idx}`}
              >
                <div className="flex items-center">
                  <div className={`font-mono text-lg font-bold ${textClass}`}>
                    {frame.funcName}(<span className="text-white">{frame.args}</span>)
                  </div>
                  {icon}
                </div>
                
                {frame.returnValue !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-black italic text-xs uppercase">Returns</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">
                      {frame.returnValue}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {renderedFrames.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-700 font-black italic uppercase tracking-widest text-2xl">Call Stack Empty</span>
          </div>
        )}
      </div>
      
      {/* Base platform */}
      <div className="h-4 w-full max-w-lg mx-auto bg-slate-800 rounded-t-xl border-t border-x border-white/10 shrink-0" />
    </div>
  );
}
