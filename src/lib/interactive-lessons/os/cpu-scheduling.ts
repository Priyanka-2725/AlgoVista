import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TimelineState } from '@/features/interactive-lesson/renderers/TimelineRenderer';

function generateCpuSchedulingTraces(controls: Record<string, any>): TraceStep<TimelineState>[] {
  const steps: TraceStep<TimelineState>[] = [];
  const algorithm = controls['algorithm'] || 'FCFS';
  const isConvoy = controls['isConvoy'] === true;
  const timeQuantum = controls['timeQuantum'] || 2;

  // Process definition: { id, arrival, burst }
  let processes = [
    { id: 'P1', arrival: 0, burst: 4, remaining: 4, color: 'blue' },
    { id: 'P2', arrival: 1, burst: 3, remaining: 3, color: 'emerald' },
    { id: 'P3', arrival: 2, burst: 1, remaining: 1, color: 'purple' }
  ];

  if (isConvoy) {
    processes = [
      { id: 'P1', arrival: 0, burst: 10, remaining: 10, color: 'blue' },
      { id: 'P2', arrival: 1, burst: 1, remaining: 1, color: 'emerald' },
      { id: 'P3', arrival: 2, burst: 1, remaining: 1, color: 'purple' }
    ];
  }

  const lanes = processes.map(p => ({ id: p.id, label: `Process ${p.id} (Burst: ${p.burst})`, items: [] as any[] }));
  
  const getState = (time: number, msg: string, isBroken: boolean = false): TimelineState => {
    // deep copy lanes
    const currentLanes = lanes.map(l => ({ ...l, items: [...l.items] }));
    return {
      timeRange: [0, isConvoy ? 15 : 10],
      currentTime: time,
      lanes: currentLanes,
      globalStatus: isBroken ? 'deadlock' : 'running', // hack for broken styling
      message: msg
    };
  };

  steps.push({ step: 0, state: getState(0, `Initialized processes. Using ${algorithm} scheduling.`), narration: `Algorithm: ${algorithm}. Ready queue is empty.` });

  let time = 0;
  let readyQueue: typeof processes = [];
  let completed = 0;
  const total = processes.length;
  let currentProcess: typeof processes[0] | null = null;
  let sliceTime = 0;

  let stepCount = 1;

  while (completed < total && time < 20) { // arbitrary cap to prevent infinite
    // Check arrivals
    for (const p of processes) {
      if (p.arrival === time) {
        readyQueue.push(p);
        steps.push({
          step: stepCount++,
          state: getState(time, `${p.id} arrived and entered the Ready Queue.`),
          narration: `${p.id} arrives at time ${time}.`
        });
      }
    }

    if (!currentProcess && readyQueue.length > 0) {
      if (algorithm === 'SJF') {
        readyQueue.sort((a, b) => a.remaining - b.remaining);
      }
      currentProcess = readyQueue.shift()!;
      sliceTime = 0;
    }

    if (currentProcess) {
      const lane = lanes.find(l => l.id === currentProcess!.id)!;
      lane.items.push({
        id: `exec_${time}`,
        label: 'Exec',
        start: time,
        end: time + 1,
        status: 'success'
      });

      // Mark others as waiting
      for (const p of readyQueue) {
        const waitLane = lanes.find(l => l.id === p.id)!;
        waitLane.items.push({
          id: `wait_${time}`,
          label: 'Wait',
          start: time,
          end: time + 1,
          status: 'blocked'
        });
      }

      const msg = isConvoy && time > 3 && readyQueue.length > 0 && algorithm === 'FCFS'
        ? `CONVOY EFFECT: Short processes are stuck waiting behind the massive P1!` 
        : `Executing ${currentProcess.id}...`;

      const isBroken = isConvoy && time > 3 && readyQueue.length > 0 && algorithm === 'FCFS';

      steps.push({
        step: stepCount++,
        state: getState(time + 1, msg, isBroken),
        narration: `Time ${time}-${time + 1}: ${currentProcess.id} executes. Remaining burst: ${currentProcess.remaining - 1}.`
      });

      currentProcess.remaining--;
      sliceTime++;
      time++;

      if (currentProcess.remaining === 0) {
        completed++;
        steps.push({
          step: stepCount++,
          state: getState(time, `${currentProcess.id} completed.`),
          narration: `${currentProcess.id} finishes execution.`
        });
        currentProcess = null;
      } else if (algorithm === 'RR' && sliceTime === timeQuantum) {
        steps.push({
          step: stepCount++,
          state: getState(time, `Time Quantum (${timeQuantum}) reached for ${currentProcess.id}. Context switch!`),
          narration: `Time Quantum expired. Preempting ${currentProcess.id} and moving it to the back of the queue.`
        });
        readyQueue.push(currentProcess);
        currentProcess = null;
      }

    } else {
      time++; // idle
      steps.push({
        step: stepCount++,
        state: getState(time, `CPU is idle.`),
        narration: `No processes ready. CPU is idle.`
      });
    }
  }

  steps.push({
    step: stepCount++,
    state: getState(time, `All processes completed.`),
    narration: `Scheduling simulation complete.`
  });

  return steps;
}

export const cpuSchedulingLesson: InteractiveLesson<TimelineState> = {
  id: 'os_cpu_scheduling',
  subject: 'Operating Systems',
  title: 'CPU Scheduling',
  difficulty: 'Medium',
  estMinutes: 20,
  prerequisites: ['Processes'],
  hook: {
    scenario: 'You have a giant 10GB video rendering job. Suddenly, you try to open Notepad, but it takes 15 seconds to appear. Why? Because the CPU scheduler made Notepad wait behind the massive video job.',
    rendererId: 'TimelineRenderer',
    initialState: { timeRange: [0, 10], currentTime: 0, lanes: [], globalStatus: 'running' }
  },
  predict: {
    question: 'If Process A takes 100ms, and Process B takes 1ms, and we use First-Come-First-Serve (FCFS). Process A arrives right before Process B. What happens?',
    options: ['B preempts A because it is shorter.', 'B waits 100ms just to do 1ms of work.', 'They run at the exact same time.', 'A gets paused halfway.'],
    correctIndex: 1,
    whyExplanation: 'In non-preemptive FCFS, the CPU is never taken away. B becomes a victim of the "Convoy Effect", waiting a massive amount of time for a tiny task.'
  },
  play: {
    rendererId: 'TimelineRenderer',
    controls: [
      { id: 'algorithm', label: 'Scheduling Algorithm', type: 'radio', options: ['FCFS', 'SJF', 'RR'], defaultValue: 'FCFS' },
      { id: 'timeQuantum', label: 'Time Quantum (for RR)', type: 'slider', min: 1, max: 4, defaultValue: 2 },
      { id: 'isConvoy', label: 'Trigger Convoy Effect (Massive P1)', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Normal FCFS', state: { algorithm: 'FCFS', isConvoy: false } },
      { name: 'Shortest Job First (SJF)', state: { algorithm: 'SJF', isConvoy: false } },
      { name: 'Round Robin (RR)', state: { algorithm: 'RR', timeQuantum: 2, isConvoy: false } },
      { name: 'Convoy Bug (FCFS)', state: { algorithm: 'FCFS', isConvoy: true } }
    ],
    traceGenerator: generateCpuSchedulingTraces
  },
  breakIt: {
    goal: 'Create the "Convoy Effect"! Starve the short processes (P2, P3) by making them wait behind a massive P1 using the FCFS algorithm.',
    successCondition: (state: TimelineState) => state.globalStatus === 'deadlock', // We used this flag to mark the broken state in the trace
    hint: 'First-Come-First-Serve (FCFS) does not care how long a process takes. Toggle the Convoy Effect preset.'
  },
  explain: {
    keyPoints: [
      'FCFS (First-Come-First-Serve) is simple but suffers from the Convoy Effect: short processes get stuck waiting for a long process to finish.',
      'SJF (Shortest Job First) minimizes average waiting time, but predicting burst times is practically impossible.',
      'RR (Round Robin) solves fairness by giving everyone a "Time Quantum" (a slice of time). It provides excellent responsiveness for interactive apps.'
    ],
    complexity: {
      time: 'O(N) to schedule',
      space: 'O(N) for Ready Queue'
    },
    analogy: 'FCFS is a single checkout lane at a grocery store. If the person in front of you has 200 items, and you only have 1 (Notepad), you still have to wait.'
  },
  code: {
    starterCode: `function roundRobin(processes, quantum) {\n  let time = 0;\n  let queue = [...processes];\n  \n  while(queue.length > 0) {\n    let p = queue.shift();\n    let runTime = Math.min(p.remaining, quantum);\n    time += runTime;\n    p.remaining -= runTime;\n    \n    if (p.remaining > 0) {\n      queue.push(p);\n    }\n  }\n}`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate what starvation is, and which algorithms (SJF vs Priority vs RR) suffer from it.',
    seedQuestions: [
      'Does Round Robin suffer from starvation?',
      'If you have SJF, how could a long process be starved forever?'
    ]
  },
  xp: {
    base: 120,
    predictBonus: 50,
    breakItBonus: 100
  }
};
