import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TableMemoryState } from '@/features/interactive-lesson/renderers/TableMemoryRenderer';

function generateProcessThreadTraces(controls: Record<string, any>): TraceStep<TableMemoryState>[] {
  const steps: TraceStep<TableMemoryState>[] = [];
  
  const mode = controls['mode'] as 'process' | 'thread' || 'thread';
  const crashA = controls['crashA'] === true;

  const getMemoryState = (activeType: 'normal' | 'crashed' | 'active', threadA_counter: number, threadB_counter: number, global_counter: number): TableMemoryState => {
    
    if (mode === 'process') {
      return {
        memoryBlocks: [
          { id: 'p1_code', label: 'Process A Code/Data', type: 'code', content: ['let counter = 0;'] },
          { id: 'p1_heap', label: 'Process A Heap', type: 'heap', content: [`counter = ${threadA_counter}`], status: crashA ? 'crashed' : 'normal' },
          { id: 'p1_stack', label: 'Process A Stack', type: 'stack', content: ['main()'], status: crashA ? 'crashed' : 'normal' },
          { id: 'p2_code', label: 'Process B Code/Data', type: 'code', content: ['let counter = 0;'] },
          { id: 'p2_heap', label: 'Process B Heap', type: 'heap', content: [`counter = ${threadB_counter}`] },
          { id: 'p2_stack', label: 'Process B Stack', type: 'stack', content: ['main()'] },
        ]
      };
    } else {
      // Thread mode
      return {
        memoryBlocks: [
          { id: 't_code', label: 'Shared Code/Data', type: 'code', content: ['let shared_counter = 0;'], isShared: true, status: crashA ? 'crashed' : 'normal' },
          { id: 't_heap', label: 'Shared Heap', type: 'heap', content: [`shared_counter = ${global_counter}`], isShared: true, status: crashA ? 'crashed' : 'normal' },
          { id: 't1_stack', label: 'Thread A Stack', type: 'stack', content: ['increment()', `local_tmp = ${threadA_counter}`], status: crashA ? 'crashed' : 'normal' },
          { id: 't2_stack', label: 'Thread B Stack', type: 'stack', content: ['increment()', `local_tmp = ${threadB_counter}`], status: crashA ? 'crashed' : 'normal' },
        ]
      };
    }
  };

  steps.push({
    step: 0,
    state: getMemoryState('normal', 0, 0, 0),
    narration: mode === 'process' ? 'Spawning two completely separate Processes.' : 'Spawning two Threads inside the same Process.'
  });

  if (crashA) {
    steps.push({
      step: 1,
      state: getMemoryState('crashed', 0, 0, 0),
      narration: mode === 'process' ? 'Process A crashed! Notice Process B is completely unaffected.' : 'Thread A crashed! Because they share the Heap/Code, the ENTIRE process dies! Thread B is killed too.'
    });
    return steps;
  }

  // Simulate a Race Condition in Thread Mode
  if (mode === 'thread') {
    steps.push({ step: 1, state: getMemoryState('normal', 0, 0, 0), narration: 'Thread A and Thread B both want to do: shared_counter++' });
    steps.push({ step: 2, state: getMemoryState('normal', 0, 0, 0), narration: 'Thread A reads shared_counter into its local stack (local_tmp = 0).' });
    steps.push({ step: 3, state: getMemoryState('normal', 0, 0, 0), narration: 'Context Switch! Thread B preempts.' });
    steps.push({ step: 4, state: getMemoryState('normal', 0, 0, 0), narration: 'Thread B reads shared_counter into its local stack (local_tmp = 0).' });
    steps.push({ step: 5, state: getMemoryState('normal', 0, 1, 0), narration: 'Thread B increments local_tmp to 1.' });
    steps.push({ step: 6, state: getMemoryState('normal', 0, 1, 1), narration: 'Thread B writes 1 back to the Shared Heap.' });
    steps.push({ step: 7, state: getMemoryState('normal', 1, 1, 1), narration: 'Context Switch! Thread A resumes, increments ITS local_tmp to 1.' });
    steps.push({ step: 8, state: getMemoryState('normal', 1, 1, 1), narration: 'Thread A writes 1 back to the Shared Heap. Wait, the global counter should be 2! RACE CONDITION!' });
  } else {
    // Process Mode
    steps.push({ step: 1, state: getMemoryState('normal', 1, 0, 0), narration: 'Process A increments its private counter.' });
    steps.push({ step: 2, state: getMemoryState('normal', 1, 1, 0), narration: 'Process B increments its private counter. They don\'t affect each other.' });
  }

  return steps;
}

export const processVsThreadLesson: InteractiveLesson<TableMemoryState> = {
  id: 'os_process_thread',
  subject: 'Operating Systems',
  title: 'Process vs Thread',
  difficulty: 'Easy',
  estMinutes: 15,
  prerequisites: [],
  hook: {
    scenario: 'You are downloading a file and it crashes. If the download was handled by a separate PROCESS, only the download fails. If it was handled by a THREAD in the main browser, your entire browser tab crashes.',
    rendererId: 'TableMemoryRenderer',
    initialState: { memoryBlocks: [] }
  },
  predict: {
    question: 'Two execution units want to increment a shared counter 100 times each. Which approach is faster to switch between, but dangerously prone to overwriting each other\'s work?',
    options: ['Processes', 'Threads', 'Both are the same', 'Neither can share data'],
    correctIndex: 1,
    whyExplanation: 'Threads share the same Heap memory. This makes them much faster to spawn and context-switch, but they can easily step on each other\'s toes (Race Conditions) if not protected by locks.'
  },
  play: {
    rendererId: 'TableMemoryRenderer',
    controls: [
      { id: 'mode', label: 'Execution Mode', type: 'toggle', defaultValue: 'thread' }, // boolean toggle can be hacked for string via wrapper, or we can use two presets
      { id: 'crashA', label: 'Simulate a Crash (Segfault) in Unit A', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Spawn Threads (Shared Memory)', state: { mode: 'thread', crashA: false } },
      { name: 'Spawn Processes (Isolated)', state: { mode: 'process', crashA: false } }
    ],
    traceGenerator: generateProcessThreadTraces
  },
  breakIt: {
    goal: 'Create a Race Condition! Ensure the execution mode is set to "Threads" and watch how they both read the counter as 0, increment it, and write back 1. (Expected: 2).',
    successCondition: (state: TableMemoryState) => {
      // Find the heap block in thread mode
      const heap = state.memoryBlocks?.find(b => b.id === 't_heap');
      return heap !== undefined && heap.content.includes('shared_counter = 1'); 
    },
    hint: 'Processes have completely isolated memory. Threads share the Heap. Run the "Spawn Threads" preset.'
  },
  explain: {
    keyPoints: [
      'A Process is an independent execution unit with its own isolated memory (Code, Data, Heap, Stack). If one crashes, others survive.',
      'A Thread is a lightweight subset of a process. Threads inside a process SHARE the Code, Data, and Heap, but have their own private Stack.',
      'Because they share Heap memory, context switching between threads is very fast, but requires synchronization (Locks/Mutexes) to prevent Race Conditions.'
    ],
    analogy: 'A Process is like a house (independent kitchen, bathroom). Threads are roommates inside the house. They have their own bedrooms (Stack), but share the kitchen (Heap). If someone burns down the kitchen, everyone goes hungry.'
  },
  code: {
    starterCode: `// Multi-threading race condition example\nlet sharedCounter = 0;\n\nfunction threadA() {\n  let temp = sharedCounter;\n  // context switch happens here\n  sharedCounter = temp + 1;\n}\n\nfunction threadB() {\n  let temp = sharedCounter;\n  sharedCounter = temp + 1;\n}`,
    language: ['javascript', 'python', 'c++'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate what components of memory are shared between threads of the same process, and what happens to child threads if the parent process exits.',
    seedQuestions: [
      'Do threads share the Stack memory?',
      'If the main parent process is killed, what happens to its child threads?'
    ]
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 100
  }
};
