"use client";

import React from 'react';

export interface GraphState {
  nodes: { 
    id: string; 
    label: string; 
    x: number; 
    y: number; 
    status: 'unvisited' | 'visited' | 'current' | 'queue' | 'broken'; 
    level?: number;
  }[];
  edges: { source: string; target: string; isDirected?: boolean }[];
  queue: string[];
  visited: string[];
  message?: string;
  isCycleWarning?: boolean;
}

interface GraphRendererProps {
  state: GraphState;
}

export function GraphRenderer({ state }: GraphRendererProps) {
  // Pre-calculate edge lines
  const getEdgeCoordinates = (sourceId: string, targetId: string) => {
    const source = state.nodes.find(n => n.id === sourceId);
    const target = state.nodes.find(n => n.id === targetId);
    if (!source || !target) return null;
    return { x1: source.x, y1: source.y, x2: target.x, y2: target.y };
  };

  const levelColors = ['border-emerald-400 text-emerald-400', 'border-blue-400 text-blue-400', 'border-purple-400 text-purple-400', 'border-pink-400 text-pink-400', 'border-amber-400 text-amber-400'];

  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      {/* Graph Canvas */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg relative min-h-[400px] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {state.edges.map((edge, i) => {
            const coords = getEdgeCoordinates(edge.source, edge.target);
            if (!coords) return null;
            return (
              <line 
                key={i} 
                x1={`${coords.x1}%`} 
                y1={`${coords.y1}%`} 
                x2={`${coords.x2}%`} 
                y2={`${coords.y2}%`} 
                stroke="currentColor" 
                strokeWidth="2" 
                className="text-slate-700"
              />
            );
          })}
        </svg>

        {state.nodes.map(node => {
          let bg = "bg-slate-800 border-slate-600";
          let textColor = "text-slate-300";
          if (node.status === 'current') { bg = "bg-amber-500 border-amber-300"; textColor = "text-slate-900"; }
          else if (node.status === 'queue') { bg = "bg-indigo-500/50 border-indigo-400"; textColor = "text-indigo-100"; }
          else if (node.status === 'visited') {
             const levelClass = node.level !== undefined ? levelColors[node.level % levelColors.length] : 'border-emerald-400 text-emerald-400';
             bg = `bg-slate-900 border-2 ${levelClass}`;
             textColor = "text-slate-200";
          } else if (node.status === 'broken') {
             bg = "bg-red-500 border-red-300 animate-pulse"; textColor = "text-white";
          }

          return (
            <div 
              key={node.id}
              className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex flex-col items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${bg} ${textColor}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.label}
              {node.level !== undefined && node.status === 'visited' && (
                <span className="absolute -bottom-5 text-[10px] text-slate-400 whitespace-nowrap">L{node.level}</span>
              )}
            </div>
          );
        })}

        {state.message && (
          <div className="absolute top-4 left-4 bg-slate-950/80 p-2 rounded border border-slate-800 text-sm font-medium text-slate-300">
            {state.message}
          </div>
        )}
      </div>

      {/* Side Panel */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        {/* Queue Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-1">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex justify-between">
            <span>The Queue (FIFO)</span>
            {state.isCycleWarning && <span className="text-red-400 text-xs animate-pulse">Growing!</span>}
          </h3>
          <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2">
            {state.queue.length === 0 && <p className="text-xs text-slate-500 italic">Empty</p>}
            {state.queue.map((nodeId, idx) => (
              <div key={idx} className="bg-indigo-950/50 border border-indigo-800/50 px-3 py-2 rounded text-indigo-300 text-sm flex justify-between">
                <span>{nodeId}</span>
                {idx === 0 && <span className="text-[10px] text-amber-500 uppercase font-bold">Front (Next)</span>}
              </div>
            ))}
            {state.queue.length > 8 && (
              <div className="text-center text-xs text-slate-500 font-mono">... {state.queue.length - 8} more</div>
            )}
          </div>
        </div>

        {/* Visited Set Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-32">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Visited Set</h3>
          <div className="flex flex-wrap gap-1">
            {state.visited.length === 0 && <p className="text-xs text-slate-500 italic">Empty</p>}
            {state.visited.map((v, i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-900">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
