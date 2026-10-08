import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { GraphState } from '@/features/interactive-lesson/renderers/GraphRenderer';

function generateBfsTraces(controls: Record<string, any>): TraceStep<GraphState>[] {
  const steps: TraceStep<GraphState>[] = [];
  
  const hasCycle = controls['hasCycle'] === true; // default false
  const ignoreVisited = controls['ignoreVisited'] === true; // default false
  
  // Create a basic graph
  let nodes = [
    { id: 'A', label: 'A', x: 50, y: 10, status: 'unvisited' as const },
    { id: 'B', label: 'B', x: 25, y: 30, status: 'unvisited' as const },
    { id: 'C', label: 'C', x: 75, y: 30, status: 'unvisited' as const },
    { id: 'D', label: 'D', x: 10, y: 60, status: 'unvisited' as const },
    { id: 'E', label: 'E', x: 40, y: 60, status: 'unvisited' as const },
    { id: 'F', label: 'F', x: 90, y: 60, status: 'unvisited' as const },
  ];
  
  let edges = [
    { source: 'A', target: 'B' },
    { source: 'A', target: 'C' },
    { source: 'B', target: 'D' },
    { source: 'B', target: 'E' },
    { source: 'C', target: 'F' },
  ];

  if (hasCycle) {
    edges.push({ source: 'E', target: 'B' }); // cycle
    edges.push({ source: 'F', target: 'C' }); // cycle
  }

  const adjList: Record<string, string[]> = {};
  nodes.forEach(n => adjList[n.id] = []);
  edges.forEach(e => {
    adjList[e.source].push(e.target);
    // undirected logic for this demo, except the cycle which we treat as directed to force loop easily
    if (!hasCycle) {
      adjList[e.target].push(e.source);
    }
  });

  let queue: string[] = ['A'];
  let visited: Set<string> = new Set();
  if (!ignoreVisited) visited.add('A');
  
  let levels: Record<string, number> = { 'A': 0 };

  const getState = (current: string | null, message: string, isBroken: boolean = false): GraphState => {
    return {
      nodes: nodes.map(n => ({
        ...n,
        level: levels[n.id],
        status: isBroken && (n.id === current || queue.includes(n.id)) ? 'broken' 
              : n.id === current ? 'current' 
              : queue.includes(n.id) ? 'queue' 
              : visited.has(n.id) ? 'visited' 
              : 'unvisited'
      })),
      edges,
      queue: [...queue],
      visited: Array.from(visited),
      message,
      isCycleWarning: queue.length > 8
    };
  };

  steps.push({
    step: 0,
    state: getState(null, 'Initialize Queue with starting node A.'),
    narration: 'BFS starts by placing the root node in the Queue.'
  });

  let stepCount = 1;
  let isBroken = false;

  while (queue.length > 0 && stepCount < 20) { // cap at 20 to prevent real infinite loop
    const current = queue.shift()!;
    if (!ignoreVisited) visited.add(current);

    steps.push({
      step: stepCount++,
      state: getState(current, `Dequeue ${current}. Processing neighbors...`),
      narration: `Dequeue ${current} from the front. Let's check its neighbors.`
    });

    const neighbors = adjList[current];
    let addedAny = false;

    for (const neighbor of neighbors) {
      if (ignoreVisited || !visited.has(neighbor)) {
        if (ignoreVisited || !queue.includes(neighbor)) { // standard BFS checks if in queue/visited
          queue.push(neighbor);
          if (!ignoreVisited) visited.add(neighbor); // standard implementation marks visited on push
          levels[neighbor] = (levels[current] || 0) + 1;
          addedAny = true;
          
          steps.push({
            step: stepCount++,
            state: getState(current, `Neighbor ${neighbor} discovered! Enqueue it.`),
            narration: `Discovered unvisited neighbor ${neighbor}. Add to back of Queue.`
          });
        }
      }
    }

    if (queue.length > 10) {
      isBroken = true;
      steps.push({
        step: stepCount++,
        state: getState(current, `FATAL: Infinite Loop detected! Queue size exploding.`, true),
        narration: `The Queue is growing infinitely because we keep revisiting nodes in the cycle!`
      });
      break;
    }
  }

  if (!isBroken) {
    steps.push({
      step: stepCount++,
      state: getState(null, `Queue is empty. Traversal complete.`),
      narration: `All reachable nodes visited layer by layer.`
    });
  }

  return steps;
}

export const bfsLesson: InteractiveLesson<GraphState> = {
  id: 'dsa_bfs',
  subject: 'Data Structures and Algorithms',
  title: 'Breadth-First Search (BFS)',
  difficulty: 'Medium',
  estMinutes: 15,
  prerequisites: ['Graphs', 'Queues'],
  hook: {
    scenario: 'You want to find the absolute shortest path out of a maze, or the closest "friend-of-a-friend" on a social network. If you just wander randomly (DFS), you might take a huge detour.',
    rendererId: 'GraphRenderer',
    initialState: {
      nodes: [
        { id: 'A', label: 'A', x: 50, y: 10, status: 'unvisited' },
        { id: 'B', label: 'B', x: 25, y: 30, status: 'unvisited' }
      ],
      edges: [{source: 'A', target: 'B'}],
      queue: [],
      visited: [],
      message: 'Looking for shortest path...'
    }
  },
  predict: {
    question: 'In a Breadth-First Search starting from the Root, which nodes are explored first?',
    options: [
      'The deepest nodes at the bottom of the tree.',
      'All immediate neighbors (Layer 1), before moving to Layer 2.',
      'A single path is followed until it hits a dead end.',
      'Nodes are picked randomly.'
    ],
    correctIndex: 1,
    whyExplanation: 'BFS behaves like a water ripple. It explores everything 1 step away, then everything 2 steps away. This guarantees finding the shortest path in unweighted graphs!'
  },
  play: {
    rendererId: 'GraphRenderer',
    controls: [
      { id: 'hasCycle', label: 'Graph contains cycles (loops)', type: 'toggle', defaultValue: false },
      { id: 'ignoreVisited', label: 'Ignore the Visited Set (Bug)', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Normal Tree', state: { hasCycle: false, ignoreVisited: false } },
      { name: 'Cyclic Graph (Safe)', state: { hasCycle: true, ignoreVisited: false } },
      { name: 'Infinite Loop Bug', state: { hasCycle: true, ignoreVisited: true } }
    ],
    traceGenerator: generateBfsTraces
  },
  breakIt: {
    goal: 'Create an infinite loop! Make the Queue grow infinitely and crash the traversal.',
    successCondition: (state: GraphState) => state.queue.length > 8,
    hint: 'If a graph has cycles (loops), what mechanism prevents us from walking in circles forever?'
  },
  explain: {
    keyPoints: [
      'BFS uses a First-In-First-Out (FIFO) Queue to keep track of nodes to visit.',
      'Because of the Queue, nodes are naturally processed layer-by-layer (level order).',
      'You MUST maintain a `visited` set. If you do not mark nodes as visited, a cycle in the graph will cause an infinite loop.'
    ],
    complexity: {
      time: 'O(V + E)',
      space: 'O(V) for Queue/Visited Set'
    },
    analogy: 'Imagine a fire spreading in a forest. It burns all trees 1 meter away, then all trees 2 meters away, spreading outward uniformly.'
  },
  code: {
    starterCode: `function bfs(graph, startNode) {\n  let queue = [startNode];\n  let visited = new Set([startNode]);\n\n  while (queue.length > 0) {\n    let current = queue.shift();\n    console.log("Visited:", current);\n\n    for (let neighbor of graph[current]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n}`,
    language: ['javascript', 'python', 'java'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate why BFS guarantees the shortest path in an unweighted graph, but DFS does not.',
    seedQuestions: [
      'Why does BFS guarantee the shortest path in an unweighted graph?',
      'If the graph was weighted, would BFS still find the shortest path?'
    ]
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 100
  }
};
