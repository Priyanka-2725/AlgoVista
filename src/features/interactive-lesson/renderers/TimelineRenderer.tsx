"use client";

import React from 'react';

export interface TimelineState {
  lanes: {
    id: string;
    label: string;
    events: {
      type: 'acquire' | 'release' | 'wait' | 'compute';
      resourceId?: string;
      resourceLabel?: string;
      duration: number; // relative width
      status: 'success' | 'blocked' | 'pending';
    }[];
  }[];
  globalStatus: 'running' | 'deadlock' | 'success';
}

interface TimelineRendererProps {
  state: TimelineState;
}

export function TimelineRenderer({ state }: TimelineRendererProps) {
  return (
    <div className="w-full h-64 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-slate-300">Process Timeline</h3>
        {state.globalStatus === 'deadlock' && (
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold animate-pulse">
            DEADLOCK DETECTED
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {state.lanes.map((lane) => (
          <div key={lane.id} className="flex items-center gap-4">
            <div className="w-24 text-right text-xs font-mono text-slate-400 font-bold truncate">
              {lane.label}
            </div>
            <div className="flex-1 bg-slate-950 h-8 rounded border border-slate-800 flex overflow-hidden">
              {lane.events.map((ev, i) => {
                let bgClass = "bg-slate-700";
                if (ev.type === 'acquire' && ev.status === 'success') bgClass = "bg-emerald-500/80 border-r border-emerald-700";
                if (ev.type === 'wait' || ev.status === 'blocked') bgClass = "bg-amber-500/80 border-r border-amber-700 strip-pattern";
                if (ev.globalStatus === 'deadlock' || ev.status === 'blocked') {
                   if (state.globalStatus === 'deadlock') bgClass = "bg-red-500/80 border-r border-red-700 strip-pattern";
                }
                
                return (
                  <div 
                    key={i} 
                    className={`h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-300 ${bgClass}`}
                    style={{ flex: ev.duration }}
                    title={`${ev.type} ${ev.resourceLabel || ''} (${ev.status})`}
                  >
                    {ev.resourceLabel || ev.type}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .strip-pattern {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.2) 5px, rgba(0,0,0,0.2) 10px);
        }
      `}} />
    </div>
  );
}
