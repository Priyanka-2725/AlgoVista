import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TimelineState } from '@/features/interactive-lesson/renderers/TimelineRenderer';

function generateEventLoopTraces(controls: Record<string, any>): TraceStep<TimelineState>[] {
  const steps: TraceStep<TimelineState>[] = [];
  const addPromise = controls['addPromise'] === true; // false by default

  const getState = (time: number, msg: string, stack: any[], micro: any[], macro: any[]): TimelineState => {
    return {
      timeRange: [0, 10],
      currentTime: time,
      lanes: [
        { id: 'Stack', label: 'Call Stack', items: [...stack] },
        { id: 'Micro', label: 'Microtask Queue (Promises)', items: [...micro] },
        { id: 'Macro', label: 'Macrotask Queue (setTimeout)', items: [...macro] }
      ],
      globalStatus: 'running',
      message: msg
    };
  };

  let stack: any[] = [];
  let micro: any[] = [];
  let macro: any[] = [];
  let stepCount = 0;

  // Initial code state
  steps.push({
    step: stepCount++,
    state: getState(0, 'Code: console.log("A"); setTimeout(fn, 0); console.log("C");', stack, micro, macro),
    narration: 'JavaScript reads your code top-to-bottom. Let\'s see how it handles a mix of synchronous and asynchronous tasks.'
  });

  // Step 1: console.log("A")
  stack.push({ id: 'logA', label: 'log("A")', start: 0, end: 1, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(1, 'Executing console.log("A")', stack, micro, macro),
    narration: 'console.log("A") is a normal synchronous function. It goes straight onto the Call Stack and runs immediately.'
  });

  // Step 2: setTimeout
  stack = []; // cleared stack
  stack.push({ id: 'setTO', label: 'setTimeout(fn, 0)', start: 1, end: 2, status: 'blocked' });
  steps.push({
    step: stepCount++,
    state: getState(2, 'Executing setTimeout...', stack, micro, macro),
    narration: 'Next is setTimeout. Even with 0ms delay, it is an asynchronous Web API. JavaScript hands it off to the browser.'
  });

  // Step 3: setTimeout callback goes to Macrotask
  stack = [];
  macro.push({ id: 'cbB', label: 'log("B")', start: 2, end: 10, status: 'blocked' });
  steps.push({
    step: stepCount++,
    state: getState(3, 'setTimeout callback moved to Macrotask Queue', stack, micro, macro),
    narration: 'The browser instantly finishes the 0ms timer, but it DOES NOT interrupt the main thread. It puts the callback in the Macrotask Queue to wait.'
  });

  if (addPromise) {
    // Step 4: Promise
    stack.push({ id: 'prom', label: 'Promise.resolve().then(fn)', start: 3, end: 4, status: 'blocked' });
    steps.push({
      step: stepCount++,
      state: getState(4, 'Executing Promise...', stack, micro, macro),
      narration: 'Next, we create a resolved Promise. Promises are also asynchronous.'
    });

    stack = [];
    micro.push({ id: 'cbP', label: 'log("Promise")', start: 4, end: 10, status: 'success' });
    steps.push({
      step: stepCount++,
      state: getState(5, 'Promise callback moved to Microtask Queue', stack, micro, macro),
      narration: 'Unlike setTimeout, Promise callbacks go to the Microtask Queue. The Microtask Queue has HIGHER priority!'
    });
  }

  // Step 5: console.log("C")
  let t = addPromise ? 5 : 4;
  stack.push({ id: 'logC', label: 'log("C")', start: t, end: t+1, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(t+1, 'Executing console.log("C")', stack, micro, macro),
    narration: 'Finally, the last synchronous line runs. It goes straight to the Call Stack.'
  });

  // Step 6: Event Loop checks queues
  stack = [];
  steps.push({
    step: stepCount++,
    state: getState(t+2, 'Call Stack is empty. Event Loop checks Queues...', stack, micro, macro),
    narration: 'The Call Stack is now completely empty. The Event Loop wakes up! It ALWAYS empties the Microtask Queue first before touching the Macrotask Queue.'
  });

  if (addPromise) {
    micro = [];
    stack.push({ id: 'runP', label: 'log("Promise")', start: t+2, end: t+3, status: 'success' });
    steps.push({
      step: stepCount++,
      state: getState(t+3, 'Executing Microtask', stack, micro, macro),
      narration: 'Because Promises are Microtasks, it jumps ahead of the setTimeout! It runs now.'
    });
    t++;
  }

  // Step 7: Macrotask
  stack = [];
  macro = [];
  stack.push({ id: 'runB', label: 'log("B")', start: t+2, end: t+3, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(t+3, 'Executing Macrotask', stack, micro, macro),
    narration: 'Now that the Call Stack and Microtask Queue are both empty, the Event Loop finally grabs the setTimeout callback from the Macrotask Queue.'
  });

  return steps;
}

export const eventLoopLesson: InteractiveLesson<TimelineState> = {
  id: 'web_event_loop',
  subject: 'Web Development',
  title: 'JavaScript Event Loop',
  difficulty: 'Hard',
  estMinutes: 20,
  prerequisites: ['JavaScript Basics'],
  hook: {
    scenario: 'You write `setTimeout(fn, 0)` with a zero millisecond delay. Why does it execute AFTER code that is written beneath it? Doesn\'t 0 milliseconds mean instantly?',
    rendererId: 'TimelineRenderer',
    initialState: { timeRange: [0, 10], currentTime: 0, lanes: [], globalStatus: 'running' }
  },
  predict: {
    question: 'What is the exact output of: console.log("A"); setTimeout(()=>console.log("B"),0); Promise.resolve().then(()=>console.log("C")); console.log("D");',
    options: ['A, B, C, D', 'A, D, B, C', 'A, D, C, B', 'D, C, B, A'],
    correctIndex: 2,
    whyExplanation: 'A and D are synchronous (Stack). C is a Microtask (Promise) so it runs next. B is a Macrotask (setTimeout) so it runs absolute last.'
  },
  play: {
    rendererId: 'TimelineRenderer',
    controls: [
      { id: 'addPromise', label: 'Include a Promise', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Basic Event Loop', state: { addPromise: false } },
      { name: 'Microtasks vs Macrotasks', state: { addPromise: true } }
    ],
    traceGenerator: generateEventLoopTraces
  },
  breakIt: {
    goal: 'See a Microtask (Promise) jump ahead of a Macrotask (setTimeout) in the queue.',
    successCondition: (state: TimelineState) => !!state.lanes.find(l => l.id === 'Micro')?.items.length,
    hint: 'Turn ON "Include a Promise".'
  },
  explain: {
    keyPoints: [
      'JavaScript is single-threaded. The Call Stack can only execute one thing at a time.',
      'Asynchronous functions (like setTimeout or fetch) are handled by the browser/Node C++ APIs in the background.',
      'When they finish, their callbacks don\'t interrupt the main thread. They go to a Queue.',
      'The Event Loop constantly checks: Is the Call Stack empty? If yes, push the next callback from the Queue to the Stack.',
      'Microtasks (Promises) have higher priority than Macrotasks (setTimeout, setInterval).'
    ],
    complexity: {
      time: 'N/A',
      space: 'N/A'
    },
    analogy: 'Call Stack = The Kitchen. Queues = The Order Tickets. The Chef (JS Thread) only cooks one meal at a time. VIP Orders (Microtasks) always jump ahead of Regular Orders (Macrotasks).'
  },
  code: {
    starterCode: `console.log("1");\n\nsetTimeout(() => {\n  console.log("2");\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log("3");\n});\n\nconsole.log("4");`,
    language: ['javascript'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate about the JavaScript Event Loop, specifically focusing on Microtasks vs Macrotasks.',
    seedQuestions: [
      'Can a tight loop of Promises freeze the browser? Why?',
      'Explain the difference between the Call Stack and the Task Queue.'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 50
  }
};
