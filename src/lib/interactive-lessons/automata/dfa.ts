import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { GraphState } from '@/features/interactive-lesson/renderers/GraphRenderer';

function generateDfaTraces(controls: Record<string, any>): TraceStep<GraphState>[] {
  const steps: TraceStep<GraphState>[] = [];
  const inputString = controls['inputString'] || '101'; 

  const getState = (nodes: any[], edges: any[], msg: string): GraphState => {
    return {
      nodes: [...nodes],
      edges: [...edges],
      queue: [],
      visited: [],
      message: msg
    };
  };

  let stepCount = 0;

  const q0 = { id: 'q0', label: 'q0 (Start)', x: 20, y: 50, status: 'unvisited' };
  const q1 = { id: 'q1', label: 'q1', x: 50, y: 50, status: 'unvisited' };
  const q2 = { id: 'q2', label: 'q2 (Accept)', x: 80, y: 50, status: 'unvisited' };

  const edges = [
    { source: 'q0', target: 'q1', isDirected: true }, // 1
    { source: 'q1', target: 'q0', isDirected: true }, // 0
    { source: 'q1', target: 'q2', isDirected: true }, // 1
    { source: 'q2', target: 'q2', isDirected: true }, // 0,1
  ];

  let nodes = [q0, q1, q2];

  // This DFA accepts strings ending in '11' (wait no, my edges above are messy).
  // Let's make it explicitly: Accepts strings containing "11".
  // q0: sees 1 -> q1. sees 0 -> q0.
  // q1: sees 1 -> q2. sees 0 -> q0.
  // q2 (Accept): sees 0,1 -> q2.
  
  steps.push({
    step: stepCount++,
    state: getState([
      { ...q0, status: 'current' }, q1, { ...q2, label: '(( q2 )) Accept' }
    ], edges, \`Input String: "\${inputString}". Starting at q0.\`),
    narration: 'We are starting at the initial state q0. This machine is designed to accept strings containing "11".'
  });

  let currentState = 'q0';

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    let nextState = currentState;

    if (currentState === 'q0') {
      nextState = char === '1' ? 'q1' : 'q0';
    } else if (currentState === 'q1') {
      nextState = char === '1' ? 'q2' : 'q0';
    } else if (currentState === 'q2') {
      nextState = 'q2';
    }

    currentState = nextState;

    steps.push({
      step: stepCount++,
      state: getState([
        { ...q0, status: currentState === 'q0' ? 'current' : 'unvisited' },
        { ...q1, status: currentState === 'q1' ? 'current' : 'unvisited' },
        { ...q2, label: '(( q2 )) Accept', status: currentState === 'q2' ? 'current' : 'unvisited' }
      ], edges, \`Read '\${char}'. Transitioned to \${currentState}.\`),
      narration: \`The machine reads '\${char}' from the string "\${inputString}". Based on its hardcoded rules, it moves to \${currentState}.\`
    });
  }

  if (currentState === 'q2') {
    steps.push({
      step: stepCount++,
      state: getState([
        q0, q1, { ...q2, label: '(( q2 )) Accept', status: 'current' }
      ], edges, 'STRING ACCEPTED! 🎉'),
      narration: 'The string has been completely read, and we ended up in a double-circled Accept State! The machine returns TRUE.'
    });
  } else {
    steps.push({
      step: stepCount++,
      state: getState([
        { ...q0, status: currentState === 'q0' ? 'broken' : 'unvisited' },
        { ...q1, status: currentState === 'q1' ? 'broken' : 'unvisited' },
        { ...q2, label: '(( q2 )) Accept' }
      ], edges, 'STRING REJECTED. ❌'),
      narration: 'The string is finished, but we are stuck in a non-accept state. The machine returns FALSE.'
    });
  }

  return steps;
}

export const dfaLesson: InteractiveLesson<GraphState> = {
  id: 'automata_dfa',
  subject: 'Automata Theory',
  title: 'Deterministic Finite Automaton (DFA)',
  difficulty: 'Hard',
  estMinutes: 20,
  prerequisites: ['Discrete Math'],
  hook: {
    scenario: 'How does a Vending Machine know you\'ve put in exactly $1.50? How does Regular Expression matching actually work inside your code? They both use a mathematical machine called a State Machine.',
    rendererId: 'GraphRenderer',
    initialState: { nodes: [], edges: [], queue: [], visited: [] }
  },
  predict: {
    question: 'A DFA (Deterministic Finite Automaton) can have multiple paths for the same input character. True or False?',
    options: ['True, it can guess the right path.', 'False, it must be Deterministic (exactly one path).', 'True, but only if it has a stack.', 'False, it cannot read inputs.'],
    correctIndex: 1,
    whyExplanation: 'The "D" stands for Deterministic. For any state and any input character, there is exactly ONE path to take. There is no guessing.'
  },
  play: {
    rendererId: 'GraphRenderer',
    controls: [
      { id: 'inputString', label: 'Input String (0s and 1s)', type: 'radio', options: ['0101', '100110', '00000'], defaultValue: '0101' }
    ],
    presets: [
      { name: 'Reject: "0101"', state: { inputString: '0101' } },
      { name: 'Accept: "100110"', state: { inputString: '100110' } },
      { name: 'Reject: "00000"', state: { inputString: '00000' } }
    ],
    traceGenerator: generateDfaTraces
  },
  breakIt: {
    goal: 'Make the machine ACCEPT a string. The string must contain "11".',
    successCondition: (state: GraphState) => !!state.message?.includes('ACCEPTED'),
    hint: 'Choose the preset that contains "11".'
  },
  explain: {
    keyPoints: [
      'A Finite Automaton is a mathematical model of computation consisting of States and Transitions.',
      'It reads an input string one character at a time, changing states based on transition rules.',
      'If it finishes reading the string and is currently on an "Accept State" (double circles), it returns True.',
      'DFAs are exactly equivalent to Regular Expressions. Every Regex compiles down to a State Machine!'
    ],
    complexity: {
      time: 'O(N) where N is the length of the string',
      space: 'O(1) it only remembers its current state, no memory!'
    },
    analogy: 'A board game where you roll a dice. The rules say "If you roll a 6, go to the Start box. If you roll a 1, go to Jail". You blindly follow the lines drawn on the board.'
  },
  code: {
    starterCode: `// Simulating a DFA in code\nfunction validateContains11(str) {\n  let state = 0;\n  for (let char of str) {\n    if (state === 0 && char === '1') state = 1;\n    else if (state === 0 && char === '0') state = 0;\n    else if (state === 1 && char === '1') state = 2;\n    else if (state === 1 && char === '0') state = 0;\n  }\n  return state === 2;\n}`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate what the difference between a DFA and an NFA is, and why DFAs cannot parse HTML.',
    seedQuestions: [
      'Why can\'t a DFA parse HTML or matching parentheses?',
      'What is the difference between DFA and NFA?'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 100
  }
};
