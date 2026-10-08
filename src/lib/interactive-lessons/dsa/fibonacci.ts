import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { CallStackState } from '@/features/interactive-lesson/renderers/CallStackRenderer';

function generateFibTraces(controls: Record<string, any>): TraceStep<CallStackState>[] {
  const steps: TraceStep<CallStackState>[] = [];
  const useMemo = controls['useMemo'] === true; // default false
  const target = 4; // fib(4) keeps the trace around ~20-30 steps

  let stack: CallStackState['frames'] = [];
  let calls = 0;
  let cacheHits = 0;
  const memo: Record<number, number> = {};

  const pushState = (narration: string) => {
    steps.push({
      step: steps.length,
      state: {
        frames: stack.map(f => ({ ...f })), // Deep copy
        stats: { 'Total Function Calls': calls, 'Cache Hits': cacheHits }
      },
      narration
    });
  };

  pushState('Starting fib(4). Calculating recursively: fib(n) = fib(n-1) + fib(n-2).');

  const fib = (n: number): number => {
    calls++;
    const frameId = `fib_${n}_${calls}`;
    
    // Check Memoization BEFORE pushing to stack (as a real engine would)
    if (useMemo && memo[n] !== undefined) {
      cacheHits++;
      stack.push({
        id: frameId,
        funcName: 'fib',
        args: n.toString(),
        status: 'memoized',
        returnValue: memo[n].toString()
      });
      pushState(`Cache HIT for fib(${n})! Found ${memo[n]}. No further recursion needed.`);
      const result = memo[n];
      stack.pop();
      return result;
    }

    stack.push({
      id: frameId,
      funcName: 'fib',
      args: n.toString(),
      status: 'active'
    });
    pushState(`Calling fib(${n})...`);

    // Base Case
    if (n <= 1) {
      const top = stack[stack.length - 1];
      top.status = 'done';
      top.returnValue = n.toString();
      pushState(`Base case reached. fib(${n}) returns ${n}.`);
      
      const result = n;
      stack.pop();
      // If we popped and the stack isn't empty, update the narration to show returning to parent
      if (stack.length > 0) {
          pushState(`Returning ${result} back to fib(${stack[stack.length - 1].args}).`);
      }
      return result;
    }

    // Highlighting overlapping subproblems when memo is OFF
    if (!useMemo && (n === 2 || n === 1 || n === 0) && calls > 5) {
       stack[stack.length - 1].status = 'error';
       pushState(`Wait, we are calculating fib(${n}) AGAIN! Overlapping subproblem detected.`);
    }

    // Recursive Calls
    const left = fib(n - 1);
    
    // Re-highlight the current frame before executing right side
    stack[stack.length - 1].status = 'active';
    pushState(`fib(${n-1}) returned ${left}. Now calling fib(${n-2}).`);
    
    const right = fib(n - 2);

    const result = left + right;
    
    const top = stack[stack.length - 1];
    top.status = 'done';
    top.returnValue = result.toString();
    
    if (useMemo) {
      memo[n] = result;
    }

    pushState(`fib(${n}) computed as ${left} + ${right} = ${result}.`);
    
    stack.pop();
    if (stack.length > 0) {
        pushState(`Returning ${result} back to fib(${stack[stack.length - 1].args}).`);
    }

    return result;
  };

  fib(target);

  if (!useMemo) {
    pushState('Notice the red items? The stack kept growing to recalculate fib(2) and fib(1). This is exponential time complexity!');
  } else {
    pushState('With Memoization, the stack immediately returned cached values instead of branching. Huge performance gain!');
  }

  return steps;
}

export const fibonacciLesson: InteractiveLesson<CallStackState> = {
  id: 'dsa_dp_fibonacci',
  subject: 'Data Structures and Algorithms',
  title: 'Dynamic Programming: Fibonacci',
  difficulty: 'Medium',
  estMinutes: 20,
  prerequisites: ['Recursion'],
  hook: {
    scenario: 'You write a simple recursive function for Fibonacci. Calling fib(10) is instant. Calling fib(40) completely freezes your browser and crashes the tab. Why?',
    rendererId: 'CallStackRenderer',
    initialState: { frames: [], stats: { 'Total Calls': 0 } }
  },
  predict: {
    question: 'How many total function calls are made if you run a naive recursive `fib(5)`? (fib(5) = fib(4) + fib(3)...)',
    options: ['5', '9', '15', 'It depends on the CPU'],
    correctIndex: 2,
    whyExplanation: 'Because it recursively branches out, calculating the same values over and over again, the number of calls grows exponentially (roughly 15 calls for fib(5)).'
  },
  play: {
    rendererId: 'CallStackRenderer',
    controls: [
      { id: 'useMemo', label: 'Turn on Memoization (Cache)', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Naive Recursion (Slow)', state: { useMemo: false } },
      { name: 'Memoized (Fast)', state: { useMemo: true } }
    ],
    traceGenerator: generateFibTraces
  },
  breakIt: {
    goal: 'Make the recursion horribly inefficient. Turn OFF memoization and watch the number of function calls explode with repeated subproblems (red stack frames).',
    successCondition: (state: CallStackState) => (state.stats?.['Total Function Calls'] as number) > 8,
    hint: 'If you do NOT cache the results (Memoization = OFF), the algorithm recalculates everything blindly.'
  },
  explain: {
    keyPoints: [
      'Naive recursion solves the same subproblems repeatedly. This is called "Overlapping Subproblems".',
      'Dynamic Programming (Memoization) fixes this by caching the result of a subproblem the first time it is solved.',
      'A massive $O(2^N)$ exponential time complexity is instantly reduced to $O(N)$ linear time.'
    ],
    complexity: {
      time: 'O(N) with Memoization, O(2^N) without',
      space: 'O(N) for recursion stack + cache array'
    },
    analogy: 'If I ask you what 1245 x 342 is, you calculate it. If I ask you the EXACT same question 5 seconds later, do you recalculate it? No, you just remember the answer. That is Memoization.'
  },
  code: {
    starterCode: `// Memoized Fibonacci\nfunction fib(n, memo = {}) {\n  if (n in memo) return memo[n];\n  if (n <= 1) return n;\n  \n  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n  return memo[n];\n}`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate to explain the difference between Top-Down (Memoization) and Bottom-Up (Tabulation) Dynamic Programming.',
    seedQuestions: [
      'What is the difference between Top-Down and Bottom-Up DP?',
      'Can you solve this in O(1) space complexity?'
    ]
  },
  xp: {
    base: 120,
    predictBonus: 50,
    breakItBonus: 100
  }
};
