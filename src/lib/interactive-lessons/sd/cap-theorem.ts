import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { GraphState } from '@/features/interactive-lesson/renderers/GraphRenderer';

function generateCapTraces(controls: Record<string, any>): TraceStep<GraphState>[] {
  const steps: TraceStep<GraphState>[] = [];
  const network = controls['network'] || 'healthy'; // 'healthy', 'partitioned'
  const dbChoice = controls['dbChoice'] || 'CP'; // 'CP' (Consistency), 'AP' (Availability)

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

  // Base nodes setup
  const clientX = { id: 'ClientX', label: 'Client X', x: 20, y: 30, status: 'visited' };
  const clientY = { id: 'ClientY', label: 'Client Y', x: 80, y: 30, status: 'visited' };
  const dbA = { id: 'DbA', label: 'DB Node A', x: 35, y: 70, status: 'unvisited' };
  const dbB = { id: 'DbB', label: 'DB Node B', x: 65, y: 70, status: 'unvisited' };

  const baseEdges = [
    { source: 'ClientX', target: 'DbA' },
    { source: 'ClientY', target: 'DbB' }
  ];

  let nodes = [clientX, clientY, dbA, dbB];
  let edges = [...baseEdges];
  if (network === 'healthy') {
    edges.push({ source: 'DbA', target: 'DbB' }); // Replication link
  }

  // Step 0
  steps.push({
    step: stepCount++,
    state: getState(nodes, edges, 'Initial state: Bank Account Balance = $100.'),
    narration: 'Client X and Client Y both share a bank account with $100. They connect to different database nodes.'
  });

  // Step 1: Write
  nodes = nodes.map(n => n.id === 'DbA' ? { ...n, label: 'DB Node A\n($200)', status: 'current' } : n);
  steps.push({
    step: stepCount++,
    state: getState(nodes, edges, 'Client X deposits $100 into DB Node A.'),
    narration: 'Client X deposits $100. DB Node A now says the balance is $200.'
  });

  // Step 2: Replication attempt
  if (network === 'healthy') {
    nodes = nodes.map(n => n.id === 'DbB' ? { ...n, label: 'DB Node B\n($200)', status: 'visited' } : n);
    steps.push({
      step: stepCount++,
      state: getState(nodes, edges, 'DB Node A successfully syncs with DB Node B.'),
      narration: 'Because the network is healthy, Node A instantly synchronizes the new $200 balance to Node B. Everything is perfect.'
    });

    nodes = nodes.map(n => n.id === 'ClientY' ? { ...n, status: 'current' } : n);
    steps.push({
      step: stepCount++,
      state: getState(nodes, edges, 'Client Y checks balance.'),
      narration: 'Client Y checks their balance and sees $200. This system is Consistent and Available!'
    });
  } else {
    // Partitioned!
    steps.push({
      step: stepCount++,
      state: getState(nodes, edges, 'NETWORK PARTITION! The cable between A and B is cut.'),
      narration: 'Oh no! The network cable between Node A and Node B is physically cut. Node A cannot synchronize the new $200 balance to Node B.'
    });

    nodes = nodes.map(n => n.id === 'ClientY' ? { ...n, status: 'current' } : n);
    
    if (dbChoice === 'CP') {
      // Consistency over Availability
      nodes = nodes.map(n => n.id === 'DbB' ? { ...n, status: 'broken' } : n);
      steps.push({
        step: stepCount++,
        state: getState(nodes, edges, 'Client Y attempts to read from Node B. System returns ERROR.'),
        narration: 'Because you chose Consistency (CP), Node B knows it might be out of date. It refuses to answer Client Y and returns an Error (System Down). You sacrificed Availability to maintain Consistency.'
      });
    } else {
      // Availability over Consistency
      nodes = nodes.map(n => n.id === 'DbB' ? { ...n, status: 'visited' } : n);
      steps.push({
        step: stepCount++,
        state: getState(nodes, edges, 'Client Y reads from Node B and gets $100! STALE DATA!'),
        narration: 'Because you chose Availability (AP), Node B happily responds to Client Y. BUT it responds with the old $100 balance! You sacrificed Consistency to keep the system Available.'
      });
    }
  }

  return steps;
}

export const capTheoremLesson: InteractiveLesson<GraphState> = {
  id: 'sd_cap_theorem',
  subject: 'System Design',
  title: 'The CAP Theorem',
  difficulty: 'Hard',
  estMinutes: 20,
  prerequisites: ['Databases'],
  hook: {
    scenario: 'You build a massive distributed database across two continents. Someone unplugs the internet cable connecting them. When a user asks for data, should your database give them stale (wrong) data, or just crash and give an error?',
    rendererId: 'GraphRenderer',
    initialState: { nodes: [], edges: [], queue: [], visited: [] }
  },
  predict: {
    question: 'According to the CAP Theorem, in the event of a network partition (P), you can only choose one of two things. What are they?',
    options: ['Speed or Security', 'Consistency or Availability', 'Relational or NoSQL', 'Storage or Compute'],
    correctIndex: 1,
    whyExplanation: 'When the network splits (Partition), you must choose: either answer every request but risk giving stale data (Availability), or refuse to answer to ensure no one gets the wrong data (Consistency).'
  },
  play: {
    rendererId: 'GraphRenderer',
    controls: [
      { id: 'network', label: 'Network State', type: 'radio', options: ['healthy', 'partitioned'], defaultValue: 'healthy' },
      { id: 'dbChoice', label: 'Database Design Choice', type: 'radio', options: ['CP', 'AP'], defaultValue: 'CP' }
    ],
    presets: [
      { name: 'Healthy System (Happy Path)', state: { network: 'healthy', dbChoice: 'CP' } },
      { name: 'CP System (Bank / Finance)', state: { network: 'partitioned', dbChoice: 'CP' } },
      { name: 'AP System (Social Media / Likes)', state: { network: 'partitioned', dbChoice: 'AP' } }
    ],
    traceGenerator: generateCapTraces
  },
  breakIt: {
    goal: 'Force the system to return STALE data to Client Y.',
    successCondition: (state: GraphState) => !!state.message?.includes('STALE DATA'),
    hint: 'You need the network to break (Partition), and the database must prioritize Availability (AP) over Consistency.'
  },
  explain: {
    keyPoints: [
      'C (Consistency): Every read receives the most recent write or an error.',
      'A (Availability): Every request receives a (non-error) response, without the guarantee that it contains the most recent write.',
      'P (Partition Tolerance): The system continues to operate despite an arbitrary number of messages being dropped by the network.',
      'Network Partitions (P) WILL happen. Therefore, you must architect your system to be either CP or AP.'
    ],
    complexity: {
      time: 'N/A',
      space: 'N/A'
    },
    analogy: 'Two cashiers share a ledger. They stand on opposite sides of a loud stadium (Partition). A customer deposits money with Cashier 1. A second customer asks Cashier 2 for the balance. Cashier 2 can either say "I don\'t know, I can\'t hear Cashier 1" (Consistency/CP) or guess the old balance (Availability/AP).'
  },
  code: {
    starterCode: `// Pseudo-code of a CP vs AP Database Node\nclass DbNode {\n  constructor(isApSystem) {\n    this.isApSystem = isApSystem;\n    this.networkCut = true;\n  }\n\n  readData() {\n    if (this.networkCut) {\n      if (this.isApSystem) {\n        return "Stale Data";\n      } else {\n        throw new Error("System Down to protect consistency!");\n      }\n    }\n    return "Fresh Data";\n  }\n}`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate why they would choose a CP database (like MongoDB/HBase) vs an AP database (like Cassandra/DynamoDB).',
    seedQuestions: [
      'Give me an example of an application that requires an AP system.',
      'Can you explain the CAP theorem in your own words?'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 100
  }
};
