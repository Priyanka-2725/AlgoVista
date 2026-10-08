"use client";

import React from 'react';

export interface ArrayState {
  array: number[];
  target: number;
  pointers: Record<string, number | null>; // e.g., { low: 0, mid: 4, high: 9 }
  discardedIndices: number[]; // indices that are grayed out
  comparisons: number;
  linearComparisons: number; // to compare vs linear search
  status: 'searching' | 'found' | 'not_found' | 'overflow' | 'broken';
  overflowError?: boolean;
}

interface ArrayRendererProps {
  state: ArrayState;
}

export function ArrayRenderer({ state }: ArrayRendererProps) {
  // Find the max value to scale the bars height proportionally
  const maxVal = Math.max(...state.array, 1);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col gap-6 overflow-x-auto min-h-[300px]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Array Visualization</h3>
          <p className="text-xs text-slate-500">Target: <span className="text-indigo-400 font-bold">{state.target}</span></p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">Binary Steps</span>
            <span className="font-mono text-emerald-400 font-bold">{state.comparisons}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">Linear Steps</span>
            <span className="font-mono text-amber-400 font-bold">{state.linearComparisons}</span>
          </div>
        </div>
      </div>

      {state.overflowError && (
        <div className="bg-red-500/20 text-red-400 p-2 rounded text-sm font-bold animate-pulse text-center border border-red-500/50">
          FATAL ERROR: Integer Overflow occurred calculating (low + high) / 2
        </div>
      )}
      {state.status === 'not_found' && state.array.length > 0 && !state.overflowError && (
        <div className="bg-amber-500/20 text-amber-400 p-2 rounded text-sm font-bold text-center border border-amber-500/50">
          Target Not Found! (Did you break it?)
        </div>
      )}
      {state.status === 'found' && (
        <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded text-sm font-bold text-center border border-emerald-500/50">
          Target Found!
        </div>
      )}

      {/* The Array Bars */}
      <div className="flex-1 flex items-end justify-center gap-1 sm:gap-2 mt-4 min-h-[150px]">
        {state.array.map((val, idx) => {
          const isDiscarded = state.discardedIndices.includes(idx);
          const isMid = state.pointers['mid'] === idx;
          const isLow = state.pointers['low'] === idx;
          const isHigh = state.pointers['high'] === idx;
          const isTargetFound = state.status === 'found' && isMid;

          // Determine colors
          let barColor = "bg-indigo-500/50";
          if (isDiscarded) barColor = "bg-slate-800/30 opacity-30";
          else if (isTargetFound) barColor = "bg-emerald-500";
          else if (isMid) barColor = "bg-amber-400";
          else if (val === state.target && !isDiscarded && state.status !== 'found') barColor = "bg-indigo-400"; 
          
          let borderColor = "border-indigo-400/50";
          if (isDiscarded) borderColor = "border-transparent";
          else if (isTargetFound) borderColor = "border-emerald-400";
          else if (isMid) borderColor = "border-amber-300";

          const heightPercent = Math.max((val / maxVal) * 100, 10);

          return (
            <div key={idx} className="flex flex-col items-center justify-end h-full w-8 sm:w-12 group">
              <div className="h-10 relative w-full flex justify-center items-end pb-2">
                 {/* Pointers display */}
                 {isLow && !isDiscarded && <span className="absolute -top-6 text-[10px] text-blue-400 font-bold">L</span>}
                 {isMid && !isDiscarded && <span className="absolute -top-10 text-[10px] text-amber-400 font-bold">M</span>}
                 {isHigh && !isDiscarded && <span className="absolute -top-6 text-[10px] text-purple-400 font-bold">H</span>}
              </div>
              <div 
                className={`w-full rounded-t-sm border-t border-l border-r transition-all duration-300 ${barColor} ${borderColor} flex items-start justify-center pt-2`}
                style={{ height: `${heightPercent}%` }}
              >
                {!isDiscarded && (
                  <span className={`text-xs font-mono font-bold rotate-90 sm:rotate-0 mt-4 sm:mt-0 ${isMid || isTargetFound ? 'text-slate-900' : 'text-white'}`}>
                    {val}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">{idx}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
