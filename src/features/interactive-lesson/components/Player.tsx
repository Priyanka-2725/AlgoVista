"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, FastForward, Rewind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { TraceStep } from '../types';

interface PlayerProps {
  traces: TraceStep<any>[];
  currentStep: number;
  onStepChange: (step: number) => void;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
}

export function Player({ traces, currentStep, onStepChange, playing, onPlayingChange }: PlayerProps) {
  const [speed, setSpeed] = useState<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (playing) {
      const delay = 1000 / speed;
      intervalRef.current = setInterval(() => {
        onStepChange(currentStep < traces.length - 1 ? currentStep + 1 : currentStep);
        if (currentStep >= traces.length - 1) {
          onPlayingChange(false);
        }
      }, delay);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, currentStep, speed, traces.length, onStepChange, onPlayingChange]);

  const togglePlay = () => {
    if (currentStep >= traces.length - 1 && !playing) {
      onStepChange(0); // Restart if at end
    }
    onPlayingChange(!playing);
  };

  const handleSliderChange = (value: number[]) => {
    onStepChange(value[0]);
    if (playing) onPlayingChange(false); // Auto pause on scrub
  };

  const handleSpeedToggle = () => {
    setSpeed(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : prev === 2 ? 0.5 : 1);
  };

  if (!traces.length) return null;

  const currentTrace = traces[currentStep];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-white flex flex-col gap-4">
      {/* Narration Display */}
      <div className="bg-slate-950 p-3 rounded text-center text-sm font-medium border border-slate-800 h-12 flex items-center justify-center">
        {currentTrace?.narration || "..."}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onStepChange(0)} disabled={currentStep === 0}>
            <Rewind className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onStepChange(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button variant="default" size="icon" onClick={togglePlay}>
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => onStepChange(Math.min(traces.length - 1, currentStep + 1))} disabled={currentStep === traces.length - 1}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 px-4">
          <Slider 
            value={[currentStep]} 
            max={Math.max(0, traces.length - 1)} 
            step={1} 
            onValueChange={handleSliderChange}
            className="w-full"
          />
        </div>

        <Button variant="outline" size="sm" onClick={handleSpeedToggle} className="w-16 font-mono">
          {speed}x
        </Button>
      </div>
    </div>
  );
}
