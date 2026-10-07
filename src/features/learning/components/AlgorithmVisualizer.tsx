
"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  SkipBack,
  Database,
  Info,
  Settings2,
  Dice5,
  Send,
  Target,
  Code2
} from 'lucide-react';
import { Algorithm } from '@/lib/algorithms-data';
import { cn } from '@/lib/utils';

interface VisualizerStep {
  data: any;
  highlights: number[];
  explanation: string;
  memory: Record<string, any>;
}

export function AlgorithmVisualizer({ algorithm }: { algorithm: Algorithm }) {
  const [steps, setSteps] = useState<VisualizerStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); 
  const [customInput, setCustomInput] = useState("");
  const [targetInput, setTargetInput] = useState("40");
  const [inputData, setInputData] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isSearching = algorithm.category === 'Searching';

  // Initialize data
  useEffect(() => {
    let initial: number[] = [45, 12, 89, 34, 10, 56];
    let initialTarget = "34";
    if (algorithm.id === 'binary-search') {
      initial = [10, 20, 30, 40, 50, 60, 70, 80];
      initialTarget = "60";
    }
    setInputData(initial);
    setCustomInput(initial.join(', '));
    setTargetInput(initialTarget);
  }, [algorithm.id]);

  const generateSteps = useCallback((dataToUse: number[], targetVal: number) => {
    let newSteps: VisualizerStep[] = [];
    const arr = [...dataToUse];
    
    if (algorithm.id === 'binary-search') {
      const sortedArr = [...arr].sort((a, b) => a - b);
      let low = 0, high = sortedArr.length - 1;
      newSteps.push({ data: sortedArr, highlights: [], explanation: `Start: Searching for ${targetVal}.`, memory: { low, high, mid: '-', target: targetVal } });
      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        newSteps.push({ data: sortedArr, highlights: [mid], explanation: `Checking mid index ${mid} (Value: ${sortedArr[mid]}).`, memory: { low, high, mid, target: targetVal } });
        if (sortedArr[mid] === targetVal) {
          newSteps.push({ data: sortedArr, highlights: [mid], explanation: `Match found!`, memory: { low, high, mid, target: targetVal, found: true } });
          break;
        }
        if (sortedArr[mid] < targetVal) { low = mid + 1; } else { high = mid - 1; }
        newSteps.push({ data: sortedArr, highlights: [mid], explanation: `Adjusting search boundaries.`, memory: { low, high, mid, target: targetVal } });
      }
    } else if (algorithm.id === 'bubble-sort') {
      let currentArr = [...arr];
      for (let i = 0; i < currentArr.length; i++) {
        for (let j = 0; j < currentArr.length - i - 1; j++) {
          newSteps.push({ data: [...currentArr], highlights: [j, j+1], explanation: `Comparing ${currentArr[j]} and ${currentArr[j+1]}`, memory: { i, j } });
          if (currentArr[j] > currentArr[j+1]) {
            [currentArr[j], currentArr[j+1]] = [currentArr[j+1], currentArr[j]];
            newSteps.push({ data: [...currentArr], highlights: [j, j+1], explanation: `Swapping elements.`, memory: { i, j, swapping: true } });
          }
        }
      }
    } else if (algorithm.id === 'selection-sort') {
      let currentArr = [...arr];
      for (let i = 0; i < currentArr.length - 1; i++) {
        let minIdx = i;
        newSteps.push({ data: [...currentArr], highlights: [i], explanation: `New pass: Assume index ${i} is minimum.`, memory: { i, minIdx } });
        for (let j = i + 1; j < currentArr.length; j++) {
          newSteps.push({ data: [...currentArr], highlights: [i, j], explanation: `Comparing with index ${j}`, memory: { i, j, minIdx } });
          if (currentArr[j] < currentArr[minIdx]) {
            minIdx = j;
            newSteps.push({ data: [...currentArr], highlights: [i, minIdx], explanation: `New minimum found at ${minIdx}`, memory: { i, j, minIdx } });
          }
        }
        [currentArr[i], currentArr[minIdx]] = [currentArr[minIdx], currentArr[i]];
        newSteps.push({ data: [...currentArr], highlights: [i, minIdx], explanation: `Swapping assumed min with actual min.`, memory: { i, minIdx, swapped: true } });
      }
    } else if (algorithm.id === 'insertion-sort') {
      let currentArr = [...arr];
      for (let i = 1; i < currentArr.length; i++) {
        let key = currentArr[i];
        let j = i - 1;
        newSteps.push({ data: [...currentArr], highlights: [i], explanation: `Key: ${key}. Comparing with sorted portion.`, memory: { i, key, j } });
        while (j >= 0 && currentArr[j] > key) {
          currentArr[j + 1] = currentArr[j];
          newSteps.push({ data: [...currentArr], highlights: [j, j+1], explanation: `Shifting ${currentArr[j]} to the right.`, memory: { i, key, j } });
          j--;
        }
        currentArr[j + 1] = key;
        newSteps.push({ data: [...currentArr], highlights: [j+1], explanation: `Inserted key at correct position.`, memory: { i, key, j: j+1, inserted: true } });
      }
    } else {
      newSteps.push({ data: arr, highlights: [], explanation: `Visualization for ${algorithm.name} ready.`, memory: { count: arr.length } });
    }

    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithm.id, algorithm.category, algorithm.name]);

  useEffect(() => {
    if (inputData.length > 0) {
      generateSteps(inputData, parseInt(targetInput) || 0);
    }
  }, [inputData, targetInput, generateSteps]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000 - speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, speed, steps.length]);

  const handleRandomize = () => {
    const size = 6 + Math.floor(Math.random() * 4);
    const randomData = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    if (algorithm.id === 'binary-search') randomData.sort((a, b) => a - b);
    const randomTarget = randomData[Math.floor(Math.random() * randomData.length)];
    setInputData(randomData);
    setCustomInput(randomData.join(', '));
    setTargetInput(randomTarget.toString());
  };

  const handleApplyCustom = () => {
    const parsed = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0) {
      const limited = parsed.slice(0, 12);
      if (algorithm.id === 'binary-search') limited.sort((a, b) => a - b);
      setInputData(limited);
      setCustomInput(limited.join(', '));
    }
  };

  const step = steps[currentStep] || { data: [], highlights: [], explanation: "", memory: {} };

  return (
    <div className="space-y-6">
      <Card className="glass-card bg-slate-900/60 border-indigo-500/10 overflow-hidden relative">
        <div className="p-10 min-h-[450px] flex flex-col justify-center">
          {/* Visual Canvas */}
          <div className="flex items-end justify-center gap-3 h-56 mb-12">
            {algorithm.category === 'Sorting' ? (
              step.data.map((val: number, idx: number) => (
                <motion.div
                  key={`${idx}-${val}`}
                  layout
                  className={cn(
                    "w-14 rounded-t-xl transition-all duration-300 relative",
                    step.highlights.includes(idx) ? 'bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.6)]' : 'bg-slate-700/50'
                  )}
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-8 left-0 right-0 text-center text-xs font-mono font-black text-white italic">
                    {val}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                {step.data.map((val: any, idx: number) => (
                  <motion.div
                    key={`${idx}-${val}`}
                    layout
                    className={cn(
                      "w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black text-xl transition-all duration-300",
                      step.highlights.includes(idx) 
                        ? "border-indigo-500 bg-indigo-500/20 text-white scale-110 shadow-[0_0_30px_rgba(99,102,241,0.4)]" 
                        : "border-slate-800 bg-slate-900/50 text-slate-500"
                    )}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Explanation Banner */}
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-indigo-500/10 border-l-4 border-indigo-500 p-6 rounded-r-2xl min-h-[80px] flex items-center shadow-xl"
          >
             <div className="flex gap-4">
              <Info className="text-indigo-400 shrink-0" size={24} />
              <p className="text-base text-indigo-100 italic font-medium leading-relaxed">{step.explanation}</p>
             </div>
          </motion.div>
        </div>

        {/* Playback Controls */}
        <div className="bg-black/40 border-t border-white/5 p-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-500" onClick={() => { setIsPlaying(false); setCurrentStep(0); }}>
              <RotateCcw size={20} />
            </Button>
            <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-500" onClick={() => { setIsPlaying(false); if(currentStep > 0) setCurrentStep(currentStep-1); }}>
              <SkipBack size={20} />
            </Button>
            <Button size="icon" className="h-12 w-12 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-500" onClick={() => { setIsPlaying(false); if(currentStep < steps.length - 1) setCurrentStep(currentStep+1); }}>
              <SkipForward size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-6 flex-1 max-w-xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Velocity</span>
            <Slider 
              value={[speed]} 
              onValueChange={(val) => setSpeed(val[0])} 
              max={1900} 
              min={100} 
              step={100}
              className="w-full"
            />
          </div>

          <div className="text-xs font-black italic text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
            STEP {currentStep + 1} / {steps.length}
          </div>
        </div>
      </Card>

      {/* Input & Memory Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card bg-slate-900/40 border-none lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black flex items-center gap-2 text-slate-400 uppercase tracking-widest italic">
              <Database size={14} className="text-indigo-400" /> Logical Memory Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <AnimatePresence>
                 {Object.entries(step.memory).map(([key, val]) => (
                   <motion.div 
                    key={key} 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 rounded-xl bg-black/40 border border-white/5 transition-all hover:border-indigo-500/30"
                   >
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{key}</p>
                      <p className="font-mono text-indigo-400 font-black text-lg">{String(val)}</p>
                   </motion.div>
                 ))}
               </AnimatePresence>
               {Object.keys(step.memory).length === 0 && (
                 <p className="text-slate-500 text-xs italic py-4">Logic core initializing...</p>
               )}
             </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-slate-900/40 border-none">
           <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black flex items-center gap-2 text-slate-400 uppercase tracking-widest italic">
              <Settings2 size={14} className="text-indigo-400" /> Lab Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isSearching && (
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-black uppercase flex items-center gap-1">
                  <Target size={12} className="text-indigo-400" /> Target Value
                </label>
                <Input 
                  type="number"
                  className="bg-black/40 border-white/5 text-indigo-300 font-black"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-black uppercase italic">Custom Environment (CSV)</label>
              <textarea 
                className="w-full h-20 bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500/50 resize-none"
                placeholder="e.g. 10, 20, 30, 40"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button size="sm" variant="outline" className="text-[10px] font-black uppercase border-indigo-500/20 hover:bg-indigo-500/10 h-10" onClick={handleRandomize}>
                <Dice5 size={14} className="mr-2" /> Random
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black uppercase h-10" onClick={handleApplyCustom}>
                <Send size={14} className="mr-2" /> Inject
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
