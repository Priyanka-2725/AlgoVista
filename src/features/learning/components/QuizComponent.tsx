"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Trophy, ArrowRight } from 'lucide-react';
import { QuizQuestion } from '@/lib/algorithms-data';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
  completed: boolean;
}

export function QuizComponent({ questions, onComplete, completed }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    setSelectedIdx(index);
    setShowFeedback(true);
    if (index === questions[currentIdx].correctIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedIdx(null);
      setShowFeedback(false);
    } else {
      setIsFinished(true);
      if (score >= questions.length - 1) onComplete();
    }
  };

  if (isFinished) {
    return (
      <Card className="glass-card bg-slate-900/40 border-indigo-500/20 text-center py-12">
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="p-6 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="text-yellow-500" size={64} />
            </div>
          </div>
          <h4 className="text-3xl font-bold">Quiz Complete!</h4>
          <p className="text-slate-400 text-lg">You scored {score} out of {questions.length}</p>
          {score < questions.length - 1 ? (
             <Button 
                onClick={() => { setIsFinished(false); setCurrentIdx(0); setScore(0); setSelectedIdx(null); setShowFeedback(false); }}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Try Again to Earn XP
              </Button>
          ) : (
            <p className="text-emerald-400 font-bold">Mastery confirmed! +10 XP awarded.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentIdx];

  return (
    <Card className="glass-card bg-slate-900/40 border-none overflow-hidden">
      <div className="h-1 bg-slate-800">
        <motion.div 
          className="h-full bg-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>
      <CardContent className="p-8 space-y-8">
        <div className="space-y-2">
           <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</p>
           <h4 className="text-2xl font-bold text-white leading-tight">{question.question}</h4>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {question.options.map((opt, idx) => {
            const isCorrect = idx === question.correctIndex;
            const isSelected = idx === selectedIdx;
            
            let variantClass = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10";
            if (showFeedback) {
              if (isCorrect) variantClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
              else if (isSelected) variantClass = "bg-red-500/20 border-red-500/50 text-red-400";
              else variantClass = "bg-white/5 border-white/5 text-slate-600 opacity-50";
            }

            return (
              <button
                key={idx}
                disabled={showFeedback}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group ${variantClass}`}
              >
                <span>{opt}</span>
                {showFeedback && isCorrect && <Check size={20} className="text-emerald-400" />}
                {showFeedback && isSelected && !isCorrect && <X size={20} className="text-red-400" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end pt-4"
            >
              <Button onClick={nextQuestion} className="bg-indigo-600 hover:bg-indigo-500 gap-2">
                {currentIdx < questions.length - 1 ? "Next Question" : "Finish Quiz"} <ArrowRight size={16} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
