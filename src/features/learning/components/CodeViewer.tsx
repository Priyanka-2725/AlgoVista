"use client"

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CodeViewer({ code }: { code: { java: string; python: string; cpp: string } }) {
  const [copied, setCopied] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = (lang: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(lang);
    toast({ description: `${lang} code copied to clipboard!` });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="glass-card bg-black/40 border-none rounded-xl overflow-hidden">
      <Tabs defaultValue="java" className="w-full">
        <div className="flex items-center justify-between px-4 bg-slate-900/60 border-b border-white/5">
          <TabsList className="bg-transparent border-none">
            <TabsTrigger value="java" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400">Java</TabsTrigger>
            <TabsTrigger value="python" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400">Python</TabsTrigger>
            <TabsTrigger value="cpp" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-400">C++</TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(code).map(([lang, snippet]) => (
          <TabsContent key={lang} value={lang} className="mt-0 relative group">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/50"
              onClick={() => handleCopy(lang, snippet)}
            >
              {copied === lang ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-400" />}
            </Button>
            <pre className="p-6 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed bg-[#020617]/50">
              <code>{snippet}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
