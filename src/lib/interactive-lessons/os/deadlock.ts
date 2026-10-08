import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TimelineState } from '@/features/interactive-lesson/renderers/TimelineRenderer';

function generateDeadlockTraces(controls: Record<string, any>): TraceStep<TimelineState>[] {
  const steps: TraceStep<TimelineState>[] = [];
  const delayP1 = controls['delayP1'] || 0;
  const delayP2 = controls['delayP2'] || 0;

  // We have P1 and P2. P1 needs R1 then R2. P2 needs R2 then R1.
  // We simulate time steps.
  let t = 0;
  
  let p1State: 'compute' | 'acquire_r1' | 'acquire_r2' | 'done' = 'acquire_r1';
  let p2State: 'compute' | 'acquire_r2' | 'acquire_r1' | 'done' = 'acquire_r2';
  
  let r1HeldBy: string | null = null;
  let r2HeldBy: string | null = null;

  const getStatus = (pState: string, requiredResourceHeldBy: string | null, processId: string) => {
    if (pState === 'done') return 'success';
    if (requiredResourceHeldBy && requiredResourceHeldBy !== processId) return 'blocked';
    return 'pending';
  };

  const createLanes = (tIndex: number, globalStatus: 'running'|'deadlock'|'success') => {
    return {
      globalStatus,
      lanes: [
        {
          id: 'P1', label: 'Process 1',
          events: [
            { type: p1State.includes('r1') ? 'acquire' : p1State.includes('r2') ? 'acquire' : 'compute',
              resourceLabel: p1State.includes('r1') ? 'Printer (R1)' : p1State.includes('r2') ? 'Scanner (R2)' : '',
              duration: 1, 
              status: p1State === 'acquire_r1' && r1HeldBy && r1HeldBy !== 'P1' ? 'blocked' : p1State === 'acquire_r2' && r2HeldBy && r2HeldBy !== 'P1' ? 'blocked' : 'success' }
          ] as any
        },
        {
          id: 'P2', label: 'Process 2',
          events: [
            { type: p2State.includes('r1') ? 'acquire' : p2State.includes('r2') ? 'acquire' : 'compute',
              resourceLabel: p2State.includes('r1') ? 'Printer (R1)' : p2State.includes('r2') ? 'Scanner (R2)' : '',
              duration: 1,
              status: p2State === 'acquire_r1' && r1HeldBy && r1HeldBy !== 'P2' ? 'blocked' : p2State === 'acquire_r2' && r2HeldBy && r2HeldBy !== 'P2' ? 'blocked' : 'success' }
          ] as any
        }
      ]
    };
  };

  steps.push({
    step: 0,
    state: createLanes(0, 'running'),
    narration: 'Initial state: P1 needs Printer, P2 needs Scanner.'
  });

  // VERY simplified simulation for the visualizer trace
  // If delay is active, one process waits.
  
  const p1Blocked = () => p1State === 'acquire_r1' && r1HeldBy === 'P2' || p1State === 'acquire_r2' && r2HeldBy === 'P2';
  const p2Blocked = () => p2State === 'acquire_r2' && r2HeldBy === 'P1' || p2State === 'acquire_r1' && r1HeldBy === 'P1';

  for(let i = 1; i <= 6; i++) {
    // Process 1 logic
    if (i > delayP1 && !p1Blocked()) {
      if (p1State === 'acquire_r1') { r1HeldBy = 'P1'; p1State = 'acquire_r2'; }
      else if (p1State === 'acquire_r2') { r2HeldBy = 'P1'; p1State = 'done'; }
      else if (p1State === 'done') { r1HeldBy = r1HeldBy === 'P1' ? null : r1HeldBy; r2HeldBy = r2HeldBy === 'P1' ? null : r2HeldBy; }
    }
    
    // Process 2 logic
    if (i > delayP2 && !p2Blocked()) {
      if (p2State === 'acquire_r2') { r2HeldBy = 'P2'; p2State = 'acquire_r1'; }
      else if (p2State === 'acquire_r1') { r1HeldBy = 'P2'; p2State = 'done'; }
      else if (p2State === 'done') { r1HeldBy = r1HeldBy === 'P2' ? null : r1HeldBy; r2HeldBy = r2HeldBy === 'P2' ? null : r2HeldBy; }
    }

    const isDeadlock = p1Blocked() && p2Blocked();
    const isSuccess = p1State === 'done' && p2State === 'done';

    steps.push({
      step: i,
      state: createLanes(i, isDeadlock ? 'deadlock' : isSuccess ? 'success' : 'running'),
      narration: isDeadlock ? 'DEADLOCK! Both processes are waiting for each other forever.' : isSuccess ? 'Success! Both processes completed.' : `Step ${i}: Executing...`
    });

    if (isDeadlock || isSuccess) break;
  }

  return steps;
}

export const deadlockLesson: InteractiveLesson<TimelineState> = {
  id: 'os_deadlock',
  subject: 'Operating Systems',
  title: 'Deadlock & Resource Starvation',
  difficulty: 'Medium',
  estMinutes: 15,
  prerequisites: ['Process vs Thread'],
  hook: {
    scenario: 'Two cars meet on a narrow one-lane bridge from opposite directions. Neither can move forward unless the other reverses, but there are cars behind them blocking the reverse. They are stuck forever.',
    rendererId: 'TimelineRenderer',
    initialState: {
      globalStatus: 'deadlock',
      lanes: [
        { id: 'CarA', label: 'Car A', events: [{ type: 'wait', duration: 1, status: 'blocked', resourceLabel: 'Bridge Segment' }] },
        { id: 'CarB', label: 'Car B', events: [{ type: 'wait', duration: 1, status: 'blocked', resourceLabel: 'Bridge Segment' }] }
      ]
    }
  },
  predict: {
    question: 'Process A locks the Printer and needs the Scanner. At the exact same time, Process B locks the Scanner and needs the Printer. What happens next?',
    options: [
      'The OS forces Process B to drop the Scanner.',
      'They wait for each other forever (Deadlock).',
      'The OS shares both devices automatically.',
      'The process with higher priority wins.'
    ],
    correctIndex: 1,
    whyExplanation: 'Because neither process is willing to release what they already have (No Preemption), they will wait indefinitely in a Circular Wait.'
  },
  play: {
    rendererId: 'TimelineRenderer',
    controls: [
      { id: 'delayP1', label: 'Delay P1 (Seconds)', type: 'slider', min: 0, max: 3, defaultValue: 0 },
      { id: 'delayP2', label: 'Delay P2 (Seconds)', type: 'slider', min: 0, max: 3, defaultValue: 0 }
    ],
    presets: [
      { name: 'Normal (Clash)', state: { delayP1: 0, delayP2: 0 } },
      { name: 'Staggered (Safe)', state: { delayP1: 2, delayP2: 0 } }
    ],
    traceGenerator: generateDeadlockTraces
  },
  breakIt: {
    goal: 'Create a Deadlock! Adjust the execution delays so that P1 and P2 grab their first resource at the exact same time, blocking each other.',
    successCondition: (state: TimelineState) => state.globalStatus === 'deadlock',
    hint: 'If they start at the exact same time (Delay = 0), they will clash.'
  },
  explain: {
    keyPoints: [
      'A Deadlock occurs when a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.',
      'Coffman Conditions (All 4 must hold): Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.',
      'Prevention means ensuring at least one of the 4 conditions never occurs.'
    ],
    analogy: 'Imagine two people drawing. One has the paper and needs the pen. The other has the pen and needs the paper. Neither will let go first.'
  },
  code: {
    starterCode: `// Pseudo-code for Deadlock\nlock(printer);\nlock(scanner);\n// do work\nunlock(scanner);\nunlock(printer);`,
    language: ['typescript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate how they would detect a deadlock in a distributed database system.',
    seedQuestions: ['How does Banker\'s Algorithm avoid deadlocks?', 'Can deadlocks happen in single-threaded NodeJS?']
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 100
  }
};
