import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TreeState } from '@/features/interactive-lesson/renderers/TreeRenderer';

function generateLbTraces(controls: Record<string, any>): TraceStep<TreeState>[] {
  const steps: TraceStep<TreeState>[] = [];
  const algorithm = controls['algorithm'] || 'round_robin'; // 'round_robin', 'least_conn'

  const getState = (servers: number[], activeServer: number | null): TreeState => {
    return {
      nodes: [
        { id: 'lb', label: 'Load Balancer', x: 50, y: 10, status: 'active' },
        { id: 's1', label: \`Server A (\${servers[0]})\`, x: 20, y: 50, status: activeServer === 0 ? 'active' : (servers[0] > 4 ? 'error' : 'done') },
        { id: 's2', label: \`Server B (\${servers[1]})\`, x: 50, y: 50, status: activeServer === 1 ? 'active' : (servers[1] > 4 ? 'error' : 'done') },
        { id: 's3', label: \`Server C (\${servers[2]})\`, x: 80, y: 50, status: activeServer === 2 ? 'active' : (servers[2] > 4 ? 'error' : 'done') }
      ],
      edges: [
        { source: 'lb', target: 's1' },
        { source: 'lb', target: 's2' },
        { source: 'lb', target: 's3' }
      ],
      stats: { 'Active Connections': servers.reduce((a,b)=>a+b,0) }
    };
  };

  // Initial heavy load on Server A to show why Least Connections is useful
  let servers = [3, 0, 0];
  let stepCount = 0;
  
  steps.push({
    step: stepCount++,
    state: getState(servers, null),
    narration: 'Server A currently has 3 active video streams processing. Server B and C are completely idle.'
  });

  const incomingRequests = 6;
  let rrIndex = 0;

  for (let i = 0; i < incomingRequests; i++) {
    let chosen = 0;
    
    if (algorithm === 'round_robin') {
      chosen = rrIndex;
      rrIndex = (rrIndex + 1) % 3;
    } else if (algorithm === 'least_conn') {
      let min = Infinity;
      for (let j = 0; j < 3; j++) {
        if (servers[j] < min) {
          min = servers[j];
          chosen = j;
        }
      }
    }

    servers = [...servers];
    servers[chosen]++;
    
    steps.push({
      step: stepCount++,
      state: getState(servers, chosen),
      narration: \`Request \${i+1} arrives! \${algorithm === 'round_robin' ? 'Round Robin blindly picks the next server in line' : 'Least Connections smartly picks the most idle server'} -> Server \${['A','B','C'][chosen]}.\`
    });
  }

  if (algorithm === 'round_robin') {
    steps.push({
      step: stepCount++,
      state: getState(servers, null),
      narration: 'Notice how Server A is overwhelmed and glowing red? Round Robin ignored the fact that A was already busy!'
    });
  } else {
    steps.push({
      step: stepCount++,
      state: getState(servers, null),
      narration: 'Perfect balance! Least Connections evenly distributed the load, keeping all servers healthy.'
    });
  }

  return steps;
}

export const loadBalancerLesson: InteractiveLesson<TreeState> = {
  id: 'sd_load_balancer',
  subject: 'System Design',
  title: 'Load Balancing',
  difficulty: 'Medium',
  estMinutes: 20,
  prerequisites: ['Networking'],
  hook: {
    scenario: 'Amazon Prime releases a new hit show. Millions of users click Play at the exact same second. If one server can only handle 1,000 users, how does the system not instantly explode?',
    rendererId: 'TreeRenderer',
    initialState: { nodes: [], edges: [] }
  },
  predict: {
    question: 'If you use Round Robin (taking turns 1-2-3-1-2-3), what happens if Server 1 gets assigned all the Heavy Video rendering tasks, and Server 2 gets assigned all the simple Text tasks?',
    options: ['Everything balances out perfectly over time.', 'Server 1 crashes from overload while Server 2 sits idle.', 'The Load Balancer crashes.', 'The users get redirected to Server 2.'],
    correctIndex: 1,
    whyExplanation: 'Round Robin is blind! It just hands out tasks sequentially. It doesn\'t check if the server is actually busy. This causes uneven load distribution in the real world.'
  },
  play: {
    rendererId: 'TreeRenderer',
    controls: [
      { id: 'algorithm', label: 'Routing Algorithm', type: 'radio', options: ['round_robin', 'least_conn'], defaultValue: 'round_robin' }
    ],
    presets: [
      { name: 'Round Robin (Blind)', state: { algorithm: 'round_robin' } },
      { name: 'Least Connections (Smart)', state: { algorithm: 'least_conn' } }
    ],
    traceGenerator: generateLbTraces
  },
  breakIt: {
    goal: 'Overload Server A using a naive algorithm. Watch it glow red as it crashes.',
    successCondition: (state: TreeState) => !!state.nodes.find(n => n.id === 's1' && n.status === 'error'),
    hint: 'Switch to Round Robin.'
  },
  explain: {
    keyPoints: [
      'A Load Balancer sits between the users and your servers, distributing incoming traffic.',
      'Round Robin distributes requests sequentially. It is fast but ignorant of server health.',
      'Least Connections distributes requests to the server with the fewest active sessions. It is slower to calculate but prevents overload.',
      'LBs also perform Health Checks to stop sending traffic to dead servers.'
    ],
    complexity: {
      time: 'O(1) routing overhead',
      space: 'Requires state memory for Least Connections/Sticky Sessions'
    },
    analogy: 'A supermarket manager directing you to checkout lines. Round Robin says "Go to Line 1, you go to Line 2". Least Connections looks at the lines and sends you to the shortest one.'
  },
  code: {
    starterCode: `// Pseudo-code of a Least Connections Load Balancer\nclass LoadBalancer {\n  constructor(servers) {\n    this.servers = servers;\n  }\n  \n  routeRequest(req) {\n    let best = this.servers[0];\n    for (let s of this.servers) {\n      if (s.activeConns < best.activeConns) best = s;\n    }\n    best.handle(req);\n  }\n}`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate about L4 vs L7 load balancing, and what happens if the Load Balancer itself goes down (Single Point of Failure).',
    seedQuestions: [
      'What happens if the Load Balancer crashes?',
      'Explain the difference between L4 (Transport) and L7 (Application) Load Balancing.'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 100
  }
};
