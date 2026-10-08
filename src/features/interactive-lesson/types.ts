export interface TraceStep<TState = any> {
  step: number;
  state: TState;
  highlightedCodeLine?: number;
  narration: string;
  event?: string;
}

export interface LessonHook {
  scenario: string;
  rendererId: string;
  initialState: any;
}

export interface LessonPredict {
  question: string;
  options: string[];
  correctIndex: number;
  whyExplanation: string;
}

export interface LessonPlay<TState = any> {
  rendererId: string;
  controls: {
    id: string;
    label: string;
    type: 'slider' | 'button' | 'toggle';
    min?: number;
    max?: number;
    defaultValue?: number | boolean;
  }[];
  presets: { name: string; state: Partial<TState> }[];
  traceGenerator: (inputState: TState) => TraceStep<TState>[];
}

export interface LessonBreakIt {
  goal: string;
  successCondition: (state: any) => boolean;
  hint: string;
}

export interface LessonExplain {
  keyPoints: string[];
  complexity?: {
    time: string;
    space: string;
  };
  analogy: string;
}

export interface LessonCode {
  starterCode: string;
  language: string[];
  testCases: { input: string; expected: string }[];
  solutionTraceLink?: string;
}

export interface LessonViva {
  aiPromptContext: string;
  seedQuestions: string[];
}

export interface LessonXP {
  base: number;
  predictBonus: number;
  breakItBonus: number;
}

export interface InteractiveLesson<TState = any> {
  id: string;
  subject: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estMinutes: number;
  prerequisites: string[];
  hook: LessonHook;
  predict: LessonPredict;
  play: LessonPlay<TState>;
  breakIt: LessonBreakIt;
  explain: LessonExplain;
  code: LessonCode;
  viva: LessonViva;
  xp: LessonXP;
}
