import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TimelineState } from '@/features/interactive-lesson/renderers/TimelineRenderer';

function generateAimLTraces(controls: Record<string, any>): TraceStep<TimelineState>[] {
  const steps: TraceStep<TimelineState>[] = [];
  const lr = controls['lr'] || 'right'; // 'high', 'right', 'low'

  const getState = (time: number, msg: string, items: any[]): TimelineState => {
    return {
      timeRange: [0, 6],
      currentTime: time,
      lanes: [
        { id: 'Loss', label: 'Model Error (Loss)', items: [...items] }
      ],
      globalStatus: 'running',
      message: msg
    };
  };

  let items: any[] = [];
  let stepCount = 0;

  steps.push({
    step: stepCount++,
    state: getState(0, 'Initial State: Model is randomly guessing. Error is HIGH.', items),
    narration: 'We are training an AI to predict house prices. Initially, it guesses randomly, so the Error (Loss) is very high.'
  });

  if (lr === 'low') {
    // Too Low
    for(let i=1; i<=6; i++) {
      items.push({ id: \`e\${i}\`, label: \`Error: \${100 - i*2}%\`, start: i-1, end: i, status: 'blocked' });
      steps.push({
        step: stepCount++,
        state: getState(i, 'Learning Rate is TOO SMALL. Making microscopic progress.', items),
        narration: 'Because the Learning Rate is tiny, the AI takes microscopic baby steps down the mountain. It will take years to train this model!'
      });
    }
  } else if (lr === 'high') {
    // Too High
    let error = 100;
    for(let i=1; i<=6; i++) {
      error = error * 1.5; // Exploding gradient
      items.push({ id: \`e\${i}\`, label: \`Error: \${Math.round(error)}%\`, start: i-1, end: i, status: 'error' });
      steps.push({
        step: stepCount++,
        state: getState(i, 'Learning Rate is TOO HIGH. Gradient Explosion!', items),
        narration: 'Because the Learning Rate is huge, the AI takes giant leaps. It completely overshot the bottom of the valley and is bouncing up the other side! The error is exploding.'
      });
    }
  } else {
    // Just Right
    let error = 100;
    for(let i=1; i<=6; i++) {
      error = error * 0.4; // Converges nicely
      items.push({ id: \`e\${i}\`, label: \`Error: \${error < 1 ? '<1' : Math.round(error)}%\`, start: i-1, end: i, status: 'success' });
      steps.push({
        step: stepCount++,
        state: getState(i, 'Learning Rate is PERFECT. Converging to global minimum.', items),
        narration: 'Perfect! The AI takes appropriately sized steps, slowing down as it reaches the bottom of the valley. The model is fully trained.'
      });
    }
  }

  return steps;
}

export const gradientDescentLesson: InteractiveLesson<TimelineState> = {
  id: 'aiml_gradient_descent',
  subject: 'AI & ML',
  title: 'Gradient Descent & Learning Rate',
  difficulty: 'Medium',
  estMinutes: 20,
  prerequisites: ['Basic Calculus'],
  hook: {
    scenario: 'You build a massive Neural Network. You hit "Train". After 3 days of GPU processing, the accuracy is 0%. Why did it fail to learn anything?',
    rendererId: 'TimelineRenderer',
    initialState: { timeRange: [0, 6], currentTime: 0, lanes: [], globalStatus: 'running' }
  },
  predict: {
    question: 'Gradient Descent is like walking blindly down a mountain. The "Learning Rate" is your step size. What happens if your step size is too big?',
    options: ['You reach the bottom instantly', 'You step over the valley and bounce up the other side', 'You stop moving', 'The mountain flattens'],
    correctIndex: 1,
    whyExplanation: 'If the learning rate is too high, you overshoot the global minimum (the bottom). Your error actually INCREASES and explodes to infinity.'
  },
  play: {
    rendererId: 'TimelineRenderer',
    controls: [
      { id: 'lr', label: 'Learning Rate Size', type: 'radio', options: ['low', 'right', 'high'], defaultValue: 'right' }
    ],
    presets: [
      { name: 'Optimal (Just Right)', state: { lr: 'right' } },
      { name: 'Microscopic (Too Low)', state: { lr: 'low' } },
      { name: 'Exploding (Too High)', state: { lr: 'high' } }
    ],
    traceGenerator: generateAimLTraces
  },
  breakIt: {
    goal: 'Cause a Gradient Explosion! Make the error shoot up to infinity.',
    successCondition: (state: TimelineState) => !!state.lanes[0].items.find(i => i.status === 'error'),
    hint: 'Set the learning rate to Too High.'
  },
  explain: {
    keyPoints: [
      'Gradient Descent is the optimization algorithm used to train Neural Networks.',
      'Loss/Error Function: A mathematical valley. The bottom of the valley is 0 error (perfect model).',
      'Learning Rate: A hyperparameter that dictates how big of a step to take down the valley slope.',
      'Too small = Converges too slowly (or gets stuck).',
      'Too large = Overshoots the bottom and diverges (Gradient Explosion).'
    ],
    complexity: {
      time: 'Dependent on epochs and dataset size',
      space: 'Requires memory for model weights and gradients'
    },
    analogy: 'Imagine being blindfolded on a mountain and trying to reach the lowest point. You feel the slope with your foot and take a step. If you take huge leaps (High LR), you jump over the lowest point entirely!'
  },
  code: {
    starterCode: `// Pseudo-code for Gradient Descent\nlet weight = 0.5;\nconst learningRate = 0.01;\n\nfor (let epoch = 0; epoch < 1000; epoch++) {\n  let gradient = computeGradient(weight);\n  weight = weight - (learningRate * gradient);\n}`,
    language: ['python', 'javascript'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate what happens if the learning rate is too high vs too low, and how they would fix a model that isn\'t converging.',
    seedQuestions: [
      'What is an Exploding Gradient?',
      'How does Adam Optimizer improve upon basic Gradient Descent?'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 50
  }
};
