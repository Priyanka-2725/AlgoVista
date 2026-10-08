"use client";

import React from 'react';

export interface TreeState {
  nodes: { 
    id: string; 
    label: string; 
    x: number; 
    y: number; 
    status: 'pending' | 'active' | 'done' | 'pruned' | 'error' | 'memoized'; 
  }[];
  edges: { source: string; target: string; isDirected?: boolean }[];
  stats?: Record<string, string | number>;
}

interface TreeRendererProps {
  state: TreeState;
}

export function TreeRenderer({ state }: TreeRendererProps) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg relative min-h-[400px] overflow-hidden flex flex-col">
      {state.stats && (
        <div className="absolute top-4 right-4 bg-slate-950/80 p-3 rounded border border-slate-800 text-sm font-medium text-slate-300 z-10 flex flex-col gap-2 shadow-lg">
          {Object.entries(state.stats).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <span className="text-slate-500 uppercase text-[10px]">{k}</span>
              <span className="font-mono text-amber-400 font-bold">{v}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 relative">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {state.edges.map((edge, i) => {
            const source = state.nodes.find(n => n.id === edge.source);
            const target = state.nodes.find(n => n.id === edge.target);
            if (!source || !target) return null;
            return (
              <line 
                key={i} 
                x1={`${source.x}%`} 
                y1={`${source.y}%`} 
                x2={`${target.x}%`} 
                y2={`${target.y}%`} 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-slate-700"
              />
            );
          })}
        </svg>

        {state.nodes.map(node => {
          let bg = "bg-slate-800 border-slate-600 text-slate-400";
          if (node.status === 'active') bg = "bg-amber-500 border-amber-300 text-slate-900 scale-110 shadow-lg shadow-amber-500/20";
          else if (node.status === 'done') bg = "bg-emerald-950 border-emerald-500 text-emerald-400";
          else if (node.status === 'pruned') bg = "bg-slate-900/50 border-dashed border-red-500/50 text-red-500/50";
          else if (node.status === 'error') bg = "bg-red-500 border-red-300 text-white animate-pulse";
          else if (node.status === 'memoized') bg = "bg-purple-900 border-purple-400 text-purple-300";

          return (
            <div 
              key={node.id}
              className={`absolute w-14 h-10 -ml-7 -mt-5 rounded border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${bg}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
