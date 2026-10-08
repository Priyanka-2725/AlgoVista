import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TreeState } from '@/features/interactive-lesson/renderers/TreeRenderer';

function generateNQueensTraces(controls: Record<string, any>): TraceStep<TreeState>[] {
  const steps: TraceStep<TreeState>[] = [];
  const enablePruning = controls['enablePruning'] !== false; // default true
  
  let nodes: any[] = [];
  let edges: any[] = [];
  let exploredNodes = 0;
  let prunedBranches = 0;

  const getState = (activeId: string | null): TreeState => {
    return {
      nodes: nodes.map(n => ({
        ...n,
        status: n.id === activeId ? 'active' : n.status
      })),
      edges: [...edges],
      stats: { 'Explored Nodes': exploredNodes, 'Pruned Branches': prunedBranches }
    };
  };

  steps.push({
    step: 0,
    state: { nodes: [], edges: [], stats: { 'Explored': 0, 'Pruned': 0 } },
    narration: 'Starting 4-Queens Backtracking. Place a Queen on Row 0.'
  });

  // We simulate a 4x4 N-Queens recursion tree for visualization
  const board: number[] = [];

  const isValid = (row: number, col: number) => {
    for (let r = 0; r < row; r++) {
      const c = board[r];
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) return false;
    }
    return true;
  };

  const solve = (row: number, parentId: string | null, depth: number, xPos: number, xRange: number) => {
    if (exploredNodes > 30) return; // Cap the visual tree size for the sandbox

    const id = `q_${row}_${Math.random()}`;
    const node = { id, label: `Row ${row}`, x: xPos, y: depth * 20 + 10, status: 'pending' };
    nodes.push(node);
    
    if (parentId) {
      edges.push({ source: parentId, target: id });
    }

    exploredNodes++;
    steps.push({
      step: steps.length + 1,
      state: getState(id),
      narration: `Exploring Row ${row}...`
    });

    if (row === 4) {
      node.status = 'done';
      node.label = 'WIN!';
      steps.push({
        step: steps.length + 1,
        state: getState(null),
        narration: `Success! Placed all 4 Queens safely.`
      });
      return;
    }

    let colsToTry = [0, 1, 2, 3];
    const segmentWidth = xRange / colsToTry.length;

    for (let c = 0; c < colsToTry.length; c++) {
      const col = colsToTry[c];
      const valid = isValid(row, col);

      if (!valid && enablePruning) {
        // Prune immediately
        prunedBranches++;
        const pruneId = `${id}_prune_${col}`;
        nodes.push({ id: pruneId, label: `Col ${col} (X)`, x: xPos - (xRange/2) + (c * segmentWidth) + (segmentWidth/2), y: (depth + 1) * 20 + 10, status: 'pruned' });
        edges.push({ source: id, target: pruneId });
        steps.push({
          step: steps.length + 1,
          state: getState(id),
          narration: `Col ${col} is attacked. PRUNING this entire branch instantly without exploring!`
        });
      } else {
        if (!valid && !enablePruning) {
           steps.push({
            step: steps.length + 1,
            state: getState(id),
            narration: `Col ${col} is attacked, but pruning is OFF! Exploring it anyway (wasting time)...`
          });
        }

        board[row] = col;
        solve(row + 1, id, depth + 1, xPos - (xRange/2) + (c * segmentWidth) + (segmentWidth/2), segmentWidth);
        // Backtrack
        board.pop();
        
        steps.push({
          step: steps.length + 1,
          state: getState(id),
          narration: `Backtracking to Row ${row}. Removing Queen from Col ${col}.`
        });
      }
    }
    
    if (node.status !== 'done') node.status = 'done'; // Finished exploring this subtree
  };

  solve(0, null, 0, 50, 80);

  return steps;
}

export const nQueensLesson: InteractiveLesson<TreeState> = {
  id: 'dsa_n_queens',
  subject: 'Data Structures and Algorithms',
  title: 'Recursion and Backtracking (N-Queens)',
  difficulty: 'Hard',
  estMinutes: 20,
  prerequisites: ['Recursion'],
  hook: {
    scenario: 'You need to place 4 Queens on a 4x4 chessboard so no two attack each other. If you brute-force every combination, it takes 256 checks. But if you stop checking a path the moment two Queens attack, you save massive amounts of time.',
    rendererId: 'TreeRenderer',
    initialState: { nodes: [], edges: [] }
  },
  predict: {
    question: 'If you place a Queen on Row 0, Col 0, and then try Row 1, Col 0, the Queens attack each other. Should you bother exploring where to put Queens in Rows 2 and 3?',
    options: ['Yes, we must check all combinations.', 'No, we should Prune the branch and go back.', 'Only if the board is big enough.', 'Yes, but save it in memory.'],
    correctIndex: 1,
    whyExplanation: 'This is the core of Backtracking! The moment a state becomes invalid, you PRUNE it (stop exploring) and BACKTRACK to the previous row to try the next column.'
  },
  play: {
    rendererId: 'TreeRenderer',
    controls: [
      { id: 'enablePruning', label: 'Enable Pruning (Backtracking)', type: 'toggle', defaultValue: true }
    ],
    presets: [
      { name: 'Backtracking (Pruned Tree)', state: { enablePruning: true } },
      { name: 'Brute Force (No Pruning)', state: { enablePruning: false } }
    ],
    traceGenerator: generateNQueensTraces
  },
  breakIt: {
    goal: 'Make the algorithm explore unnecessary paths! Turn OFF Pruning and watch the "Explored Nodes" count explode compared to the Backtracking preset.',
    successCondition: (state: TreeState) => (state.stats?.['Explored Nodes'] as number) > 20,
    hint: 'If pruning is disabled, the algorithm will blindly place Queens in invalid positions and keep going deeper anyway.'
  },
  explain: {
    keyPoints: [
      'Backtracking is an algorithmic technique for solving problems recursively by trying to build a solution incrementally.',
      'The moment it determines that a partial solution cannot be completed to a valid solution, it abandons it (Pruning).',
      'It "backtracks" to the previous step and tries the next available option.'
    ],
    complexity: {
      time: 'O(N!) Worst Case',
      space: 'O(N) for the recursion stack and board array'
    },
    analogy: 'Imagine walking through a maze. If you hit a dead end, you don\'t keep banging your head against the wall. You walk BACK to the last intersection and try a different path.'
  },
  code: {
    starterCode: `function solveNQueens(n) {\n  const res = [];\n  const board = [];\n\n  function isValid(row, col) {\n    for(let r = 0; r < row; r++) {\n      let c = board[r];\n      if(c === col || Math.abs(r - row) === Math.abs(c - col)) return false;\n    }\n    return true;\n  }\n\n  function backtrack(row) {\n    if (row === n) return res.push([...board]);\n    for (let col = 0; col < n; col++) {\n      if (isValid(row, col)) {\n        board.push(col);\n        backtrack(row + 1);\n        board.pop(); // Backtrack!\n      }\n    }\n  }\n  backtrack(0);\n  return res;\n}`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate to explain why Backtracking is better than Brute Force, and what the time complexity is.',
    seedQuestions: [
      'What does Pruning mean in the context of Backtracking?',
      'If N=8, how many possible board states does Brute Force check vs Backtracking?'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 100
  }
};
