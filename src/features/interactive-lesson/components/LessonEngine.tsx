"use client";

import React, { useState, useMemo } from 'react';
import { InteractiveLesson, TraceStep } from '../types';
import { Player } from './Player';
import { TimelineRenderer, TimelineState } from '../renderers/TimelineRenderer';
import { ArrayRenderer, ArrayState } from '../renderers/ArrayRenderer';
import { GraphRenderer, GraphState } from '../renderers/GraphRenderer';
import { TreeRenderer, TreeState } from '../renderers/TreeRenderer';
import { TableMemoryRenderer, TableMemoryState } from '../renderers/TableMemoryRenderer';
import { CallStackRenderer, CallStackState } from '../renderers/CallStackRenderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface LessonEngineProps {
  lesson: InteractiveLesson;
  onComplete: (xpEarned: number) => void;
}

export function LessonEngine({ lesson, onComplete }: LessonEngineProps) {
  const [stage, setStage] = useState<number>(0);
  
  // Predict State
  const [prediction, setPrediction] = useState<number | null>(null);
  
  // Play State
  const [playControls, setPlayControls] = useState<Record<string, any>>(
    lesson.play.controls.reduce((acc, c) => ({ ...acc, [c.id]: c.defaultValue }), {})
  );
  
  const traces = useMemo(() => {
    return lesson.play.traceGenerator(playControls);
  }, [lesson, playControls]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const [hasBrokenIt, setHasBrokenIt] = useState(false);

  const renderRenderer = (rendererId: string, state: any) => {
    switch (rendererId) {
      case 'TimelineRenderer':
        return <TimelineRenderer state={state as TimelineState} />;
      case 'ArrayRenderer':
        return <ArrayRenderer state={state as ArrayState} />;
      case 'GraphRenderer':
        return <GraphRenderer state={state as GraphState} />;
      case 'TreeRenderer':
        return <TreeRenderer state={state as TreeState} />;
      case 'TableMemoryRenderer':
        return <TableMemoryRenderer state={state as TableMemoryState} />;
      case 'CallStackRenderer':
        return <CallStackRenderer state={state as CallStackState} />;
      default:
        return <div className="p-4 bg-slate-900 border border-slate-700 text-white">Unknown renderer: {rendererId}</div>;
    }
  };

  const advanceStage = () => setStage(s => Math.min(5, s + 1));

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-24">
      {/* Stage Tracker */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['1. Hook', '2. Predict', '3. Play', '4. Break It', '5. Explain', '6. Code'].map((name, i) => (
          <div 
            key={name}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
              i === stage ? 'bg-indigo-500 text-white' : i < stage ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* 1. HOOK */}
      {stage === 0 && (
        <Card className="glass-card border-none bg-slate-900/40 text-white animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
          <CardContent className="p-8 flex flex-col gap-6">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-indigo-400">The Scenario</h2>
            <p className="text-slate-300 text-lg leading-relaxed font-bold">{lesson.hook.scenario}</p>
            <div className="mt-4 pointer-events-none opacity-80 border-2 border-white/5 rounded-2xl p-4 bg-black/20">
              {renderRenderer(lesson.hook.rendererId, lesson.hook.initialState)}
            </div>
            <Button className="mt-4 self-end bg-indigo-600 hover:bg-indigo-500 font-black italic rounded-xl shadow-lg" size="lg" onClick={advanceStage}>Next: What Happens?</Button>
          </CardContent>
        </Card>
      )}

      {/* 2. PREDICT */}
      {stage === 1 && (
        <Card className="glass-card border-none bg-slate-900/40 text-white animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
          <CardContent className="p-8 flex flex-col gap-6">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-amber-400">Before we run it...</h2>
            <p className="text-slate-300 text-xl font-bold">{lesson.predict.question}</p>
            
            <RadioGroup 
              value={prediction !== null ? prediction.toString() : undefined} 
              onValueChange={(v) => setPrediction(parseInt(v))}
              className="flex flex-col gap-4 mt-4"
            >
              {lesson.predict.options.map((opt, idx) => (
                <div key={idx} className={`flex items-center space-x-3 p-5 rounded-2xl border-2 cursor-pointer transition-all font-bold ${
                  prediction === idx ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100' : 'border-white/5 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10'
                }`} onClick={() => setPrediction(idx)}>
                  <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="border-indigo-500/50 text-indigo-500" />
                  <Label htmlFor={`opt-${idx}`} className="text-lg cursor-pointer flex-1">{opt}</Label>
                </div>
              ))}
            </RadioGroup>

            <Button className="mt-4 self-end bg-indigo-600 hover:bg-indigo-500 font-black italic rounded-xl shadow-lg h-14 px-10" size="lg" disabled={prediction === null} onClick={advanceStage}>LOCK PREDICTION</Button>
          </CardContent>
        </Card>
      )}

      {/* 3. PLAY */}
      {stage === 2 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center bg-indigo-600/10 p-6 rounded-3xl border border-indigo-500/20">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-indigo-400">Visual Sandbox</h2>
            <Button className="bg-indigo-600 hover:bg-indigo-500 font-black italic rounded-xl shadow-lg" onClick={advanceStage}>DONE PLAYING</Button>
          </div>
          
          <div className="p-2 border-4 border-white/5 bg-black/20 rounded-3xl overflow-hidden">
            {renderRenderer(lesson.play.rendererId, traces[currentStep]?.state || lesson.hook.initialState)}
          </div>
          
          <Player 
            traces={traces} 
            currentStep={currentStep} 
            onStepChange={setCurrentStep}
            playing={playing}
            onPlayingChange={setPlaying}
          />

          <Card className="glass-card border-none bg-slate-900/60 shadow-xl">
            <CardContent className="p-6 flex gap-4 items-center flex-wrap">
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Presets:</span>
               {lesson.play.presets.map((preset, i) => (
                 <Button key={i} variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white font-bold rounded-xl" onClick={() => {
                   setPlayControls(preset.state);
                   setCurrentStep(0);
                   setPlaying(true);
                 }}>
                   {preset.name}
                 </Button>
               ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. BREAK IT */}
      {stage === 3 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="glass-card border-none bg-red-950/20 border-red-900/50 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-red-500 mb-2">Mission: Break It!</h2>
              <p className="text-slate-300 text-lg font-bold">{lesson.breakIt.goal}</p>
              <p className="text-sm text-red-400 mt-2 italic font-bold">Hint: {lesson.breakIt.hint}</p>
            </CardContent>
          </Card>

          {renderRenderer(lesson.play.rendererId, traces[currentStep]?.state || lesson.hook.initialState)}
          <Player traces={traces} currentStep={currentStep} onStepChange={setCurrentStep} playing={playing} onPlayingChange={setPlaying} />

          <Card className="glass-card border-none bg-slate-900/60 shadow-xl">
            <CardContent className="p-6 flex gap-4 items-center">
               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Controls:</span>
               {lesson.play.controls.map(c => (
                 <div key={c.id} className="flex flex-col gap-2 flex-1">
                   <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{c.label}</Label>
                   <Button variant="secondary" size="sm" className="font-bold italic uppercase h-10" onClick={() => {
                     const val = typeof playControls[c.id] === 'boolean' ? !playControls[c.id] : (playControls[c.id] || 0) + 1;
                     const newControls = { ...playControls, [c.id]: val };
                     setPlayControls(newControls);
                     setCurrentStep(0);
                     if (lesson.breakIt.successCondition(lesson.play.traceGenerator(newControls).slice(-1)[0].state)) {
                       setHasBrokenIt(true);
                     }
                   }}>
                     Toggle / Trigger
                   </Button>
                 </div>
               ))}
            </CardContent>
          </Card>

          {hasBrokenIt && (
            <div className="bg-emerald-950/40 border-2 border-emerald-500/30 p-6 rounded-2xl flex justify-between items-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <span className="text-emerald-400 font-black italic uppercase text-xl">System Broken Successfully!</span>
              <Button className="bg-emerald-600 hover:bg-emerald-500 font-black italic rounded-xl shadow-lg" onClick={advanceStage}>WHY DID THIS HAPPEN?</Button>
            </div>
          )}
        </div>
      )}

      {/* 5. EXPLAIN */}
      {stage === 4 && (
        <Card className="glass-card border-none bg-slate-900/40 text-white animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
          <CardContent className="p-10 flex flex-col gap-8">
            <div className="bg-indigo-950/20 border-2 border-indigo-500/20 p-6 rounded-2xl">
              <h3 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Intel Report (Prediction)</h3>
              {prediction === lesson.predict.correctIndex ? (
                <p className="text-emerald-400 font-bold italic text-lg">SPOT ON! {lesson.predict.whyExplanation}</p>
              ) : (
                <p className="text-amber-400 font-bold text-lg">
                  You predicted "{lesson.predict.options[prediction || 0]}", but reality was different! 
                  <br/><span className="text-white font-normal mt-2 block">{lesson.predict.whyExplanation}</span>
                  <span className="mt-4 inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-full text-xs font-black uppercase">+50 XP SURPRISE BONUS</span>
                </p>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6 text-white">The Theory</h2>
              <ul className="list-disc pl-5 space-y-4 text-slate-300 text-lg font-medium">
                {lesson.explain.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
              </ul>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border-l-4 border-indigo-500">
              <span className="font-black italic uppercase text-indigo-400 text-sm block mb-2">Analogy</span>
              <span className="text-slate-300 text-lg font-medium">{lesson.explain.analogy}</span>
            </div>

            {lesson.explain.complexity && (
              <div className="flex gap-4">
                <div className="bg-slate-900/80 p-6 rounded-2xl flex-1 text-center border-t-2 border-emerald-500/20">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Time Complexity</span>
                  <span className="font-mono text-emerald-400 font-bold text-xl">{lesson.explain.complexity.time}</span>
                </div>
                <div className="bg-slate-900/80 p-6 rounded-2xl flex-1 text-center border-t-2 border-emerald-500/20">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Space Complexity</span>
                  <span className="font-mono text-emerald-400 font-bold text-xl">{lesson.explain.complexity.space}</span>
                </div>
              </div>
            )}

            <Button className="mt-4 self-end bg-indigo-600 hover:bg-indigo-500 font-black italic rounded-xl shadow-lg h-14 px-10" size="lg" onClick={advanceStage}>FINAL CHALLENGE: CODE & VIVA</Button>
          </CardContent>
        </Card>
      )}

      {/* 6. CODE & VIVA */}
      {stage === 5 && (
        <Card className="glass-card border-none bg-slate-900/40 text-white animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
          <CardContent className="p-12 flex flex-col gap-8 items-center justify-center min-h-[400px]">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-emerald-400 text-center">Code Editor & AI Viva</h2>
            <p className="text-slate-400 text-center max-w-lg font-medium">
              (Integration Point: Here we embed the Monaco Editor with `lesson.code.starterCode` and trigger the Genkit `lesson.viva.aiPromptContext` flow to simulate the final interview).
            </p>
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-500 font-black italic rounded-xl shadow-[0_0_40px_rgba(16,185,129,0.3)] h-16 px-12 text-xl" size="lg" onClick={() => onComplete(lesson.xp.base + (prediction !== lesson.predict.correctIndex ? lesson.xp.predictBonus : 0))}>
              COMPLETE MISSION & CLAIM XP
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
