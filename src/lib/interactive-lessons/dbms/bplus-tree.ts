import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TreeState } from '@/features/interactive-lesson/renderers/TreeRenderer';

function generateBTreeTraces(controls: Record<string, any>): TraceStep<TreeState>[] {
  const steps: TraceStep<TreeState>[] = [];
  
  const insertSequential = controls['insertSequential'] === true; // worst case for BST, best case for B-Tree depth

  // Hardcode a small B+ tree trace for visual demonstration since full B+ tree logic is complex to fit perfectly in 20 steps
  
  let nodes = [
    { id: 'root', label: '[ 15 ]', x: 50, y: 15, status: 'done' as const }
  ];
  let edges: any[] = [];
  let stats = { 'Keys Inserted': 1, 'Tree Depth': 1, 'Row Reads (Table Scan)': 1000000, 'Row Reads (Index)': 1 };

  const getState = (activeNode: string | null): TreeState => {
    return {
      nodes: nodes.map(n => ({ ...n, status: n.id === activeNode ? 'active' : 'done' })),
      edges: [...edges],
      stats: { ...stats }
    };
  };

  steps.push({
    step: 0,
    state: getState(null),
    narration: 'Empty B+ Tree. Root node created. Inserting 15.'
  });

  if (insertSequential) {
    // 15, 20, 25, 30
    nodes = [{ id: 'root', label: '[ 15 | 20 ]', x: 50, y: 15, status: 'done' }];
    stats = { ...stats, 'Keys Inserted': 2, 'Row Reads (Index)': 1 };
    steps.push({ step: 1, state: getState('root'), narration: 'Inserting 20. Fits in the root node.' });

    nodes = [{ id: 'root', label: '[ 15 | 20 | 25 ]', x: 50, y: 15, status: 'done' }];
    stats = { ...stats, 'Keys Inserted': 3, 'Row Reads (Index)': 1 };
    steps.push({ step: 2, state: getState('root'), narration: 'Inserting 25. Fits in the root node.' });

    // SPLIT
    nodes = [
      { id: 'root', label: '[ 20 ]', x: 50, y: 15, status: 'done' },
      { id: 'leaf1', label: '[ 15 ]', x: 30, y: 50, status: 'done' },
      { id: 'leaf2', label: '[ 20 | 25 | 30 ]', x: 70, y: 50, status: 'done' }
    ];
    edges = [
      { source: 'root', target: 'leaf1' },
      { source: 'root', target: 'leaf2' },
      { source: 'leaf1', target: 'leaf2' } // Leaf link
    ];
    stats = { ...stats, 'Keys Inserted': 4, 'Tree Depth': 2, 'Row Reads (Index)': 2 };
    steps.push({ step: 3, state: getState('root'), narration: 'Inserting 30. OVERFLOW! Node splits. Median (20) moves up. Notice the link between leaves.' });
  } else {
    // Random insertion that causes different split
    // 15, 5, 25, 10
    nodes = [{ id: 'root', label: '[ 5 | 15 ]', x: 50, y: 15, status: 'done' }];
    stats = { ...stats, 'Keys Inserted': 2, 'Row Reads (Index)': 1 };
    steps.push({ step: 1, state: getState('root'), narration: 'Inserting 5. Fits in the root.' });

    nodes = [{ id: 'root', label: '[ 5 | 15 | 25 ]', x: 50, y: 15, status: 'done' }];
    stats = { ...stats, 'Keys Inserted': 3, 'Row Reads (Index)': 1 };
    steps.push({ step: 2, state: getState('root'), narration: 'Inserting 25. Fits in the root.' });

    // SPLIT
    nodes = [
      { id: 'root', label: '[ 15 ]', x: 50, y: 15, status: 'done' },
      { id: 'leaf1', label: '[ 5 | 10 ]', x: 30, y: 50, status: 'done' },
      { id: 'leaf2', label: '[ 15 | 25 ]', x: 70, y: 50, status: 'done' }
    ];
    edges = [
      { source: 'root', target: 'leaf1' },
      { source: 'root', target: 'leaf2' },
      { source: 'leaf1', target: 'leaf2' }
    ];
    stats = { ...stats, 'Keys Inserted': 4, 'Tree Depth': 2, 'Row Reads (Index)': 2 };
    steps.push({ step: 3, state: getState('root'), narration: 'Inserting 10. OVERFLOW! Median (15) moves up. Leaves remain sorted and linked.' });
  }

  // Common massive insert simulation
  steps.push({
    step: 4,
    state: getState(null),
    narration: '...Fast forward 1,000,000 insertions...'
  });

  stats = { ...stats, 'Keys Inserted': 1000000, 'Tree Depth': 4, 'Row Reads (Index)': 4 };
  steps.push({
    step: 5,
    state: getState(null),
    narration: 'Tree stays incredibly shallow! Finding a key among 1,000,000 rows takes exactly 4 reads, compared to 1,000,000 for a Table Scan.'
  });

  return steps;
}

export const bplusTreeLesson: InteractiveLesson<TreeState> = {
  id: 'dbms_bplus_tree',
  subject: 'Database Systems',
  title: 'Indexing and B+ Tree',
  difficulty: 'Hard',
  estMinutes: 20,
  prerequisites: ['Trees'],
  hook: {
    scenario: 'You run `SELECT * FROM users WHERE email = "zack@test.com"`. It takes 8 seconds because the DB scans 10 million rows one by one. You add an INDEX, and it drops to 0.001 seconds.',
    rendererId: 'TreeRenderer',
    initialState: { nodes: [], edges: [] }
  },
  predict: {
    question: 'If a Binary Search Tree (BST) can become a slow, unbalanced line if you insert sorted data (1, 2, 3...), why doesn\'t a database index break when inserting sorted timestamps?',
    options: ['The database randomizes the data first.', 'B+ Trees split nodes upwards, staying perfectly balanced.', 'It actually does break, you have to rebuild indexes nightly.', 'It uses a hash table, not a tree.'],
    correctIndex: 1,
    whyExplanation: 'B+ Trees are self-balancing. Instead of adding leaves downward forever, when a node fills up, it splits and pushes a key UP to the parent, ensuring the tree is always perfectly flat at the bottom.'
  },
  play: {
    rendererId: 'TreeRenderer',
    controls: [
      { id: 'insertSequential', label: 'Insert Sequential Data (10, 20, 30)', type: 'toggle', defaultValue: true }
    ],
    presets: [
      { name: 'Sequential Insert', state: { insertSequential: true } },
      { name: 'Random Insert', state: { insertSequential: false } }
    ],
    traceGenerator: generateBTreeTraces
  },
  breakIt: {
    goal: 'Understand the worst case for a normal tree. See how the B+ Tree depth remains small regardless of insertion order by toggling Sequential inserts.',
    successCondition: (state: TreeState) => (state.stats?.['Tree Depth'] as number) > 0, // Informational break-it
    hint: 'Notice that even with perfectly sequential data (the nightmare of a Binary Tree), the B+ Tree depth barely moves.'
  },
  explain: {
    keyPoints: [
      'A B+ Tree is a fat, shallow tree. A single node holds hundreds of keys (high fan-out).',
      'It is perfectly balanced. Every leaf node is exactly the same distance from the root.',
      'Unlike standard B-Trees, ALL data lives in the leaf nodes, and leaf nodes are linked like a Linked List for ultra-fast range queries (`WHERE age BETWEEN 20 AND 30`).'
    ],
    complexity: {
      time: 'O(log N) for Search, Insert, Delete',
      space: 'O(N) for the index structure'
    },
    analogy: 'Imagine a filing cabinet. The Root is the drawer label (A-M, N-Z). The internal nodes are the folder tabs (A-C). The leaves are the actual papers. You only touch 3 things to find any paper among thousands.'
  },
  code: {
    starterCode: `-- Adding an Index in SQL\nCREATE INDEX idx_users_email ON users(email);\n\n-- The Database Optimizer now uses the B+ Tree!\nSELECT * FROM users WHERE email = 'zack@test.com';`,
    language: ['sql'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate the difference between a B-Tree and a B+ Tree, specifically focusing on range queries and where data is stored.',
    seedQuestions: [
      'Why do databases use B+ Trees instead of Binary Search Trees?',
      'How does the Linked List structure at the leaf level help with SQL queries?'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 100
  }
};
