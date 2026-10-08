"use client";

import React from 'react';

export interface TableMemoryState {
  tables?: {
    id: string;
    title: string;
    headers: string[];
    rows: { id: string, cells: string[], status?: 'highlight' | 'normal' | 'error' | 'success' }[];
  }[];
  memoryBlocks?: {
    id: string;
    label: string;
    type: 'code' | 'data' | 'heap' | 'stack';
    content: string[];
    isShared?: boolean;
    status?: 'normal' | 'crashed' | 'active';
  }[];
}

interface TableMemoryRendererProps {
  state: TableMemoryState;
}

export function TableMemoryRenderer({ state }: TableMemoryRendererProps) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Memory Blocks View */}
      {state.memoryBlocks && state.memoryBlocks.length > 0 && (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-6 min-h-[300px]">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Memory Layout</h3>
          <div className="flex gap-4 flex-wrap">
            {state.memoryBlocks.map(block => {
              let bg = "bg-slate-950 border-slate-700";
              if (block.type === 'stack') bg = "bg-blue-950/30 border-blue-800";
              if (block.type === 'heap') bg = "bg-purple-950/30 border-purple-800";
              if (block.status === 'crashed') bg = "bg-red-950/50 border-red-500 animate-pulse";
              if (block.status === 'active') bg = "bg-emerald-950/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]";

              return (
                <div key={block.id} className={`flex-1 min-w-[150px] rounded-lg border-2 p-3 ${bg} transition-all duration-300`}>
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-inherit">
                    <span className="font-bold text-sm text-slate-200">{block.label}</span>
                    {block.isShared && <span className="text-[10px] uppercase bg-indigo-500/20 text-indigo-400 px-1 rounded">Shared</span>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {block.content.map((line, i) => (
                      <div key={i} className="text-xs font-mono text-slate-400 bg-black/20 px-2 py-1 rounded truncate">
                        {line}
                      </div>
                    ))}
                    {block.content.length === 0 && <div className="text-xs text-slate-600 italic">Empty</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tables View */}
      {state.tables && state.tables.length > 0 && (
        <div className="flex-1 flex flex-col gap-4">
          {state.tables.map(table => (
            <div key={table.id} className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300">{table.title}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-950 text-slate-500">
                    <tr>
                      {table.headers.map((h, i) => <th key={i} className="px-4 py-2 font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => {
                      let rowBg = "bg-slate-900 border-b border-slate-800";
                      let textColor = "text-slate-300";
                      if (row.status === 'highlight') { rowBg = "bg-indigo-950/50 border-b border-indigo-900"; textColor = "text-indigo-300"; }
                      if (row.status === 'error') { rowBg = "bg-red-950/30 border-b border-red-900"; textColor = "text-red-400"; }
                      if (row.status === 'success') { rowBg = "bg-emerald-950/30 border-b border-emerald-900"; textColor = "text-emerald-400 font-bold"; }

                      return (
                        <tr key={row.id} className={`${rowBg} ${textColor} transition-colors duration-300`}>
                          {row.cells.map((cell, i) => (
                            <td key={i} className="px-4 py-2 font-mono whitespace-nowrap">{cell}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
