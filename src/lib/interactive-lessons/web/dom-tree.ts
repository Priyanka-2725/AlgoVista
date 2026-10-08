import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TreeState } from '@/features/interactive-lesson/renderers/TreeRenderer';

function generateDomTraces(controls: Record<string, any>): TraceStep<TreeState>[] {
  const steps: TraceStep<TreeState>[] = [];
  const action = controls['action'] || 'none'; 

  const getState = (nodes: any[], edges: any[], msg: string): TreeState => {
    return {
      nodes: [...nodes],
      edges: [...edges],
      stats: { 'Nodes': nodes.length }
    };
  };

  let stepCount = 0;

  // Base DOM
  const html = { id: 'html', label: '<html>', x: 50, y: 10, status: 'done' };
  const head = { id: 'head', label: '<head>', x: 30, y: 35, status: 'done' };
  const body = { id: 'body', label: '<body>', x: 70, y: 35, status: 'done' };
  const h1 = { id: 'h1', label: '<h1>', x: 55, y: 60, status: 'done' };
  const p = { id: 'p', label: '<p>', x: 85, y: 60, status: 'done' };

  let nodes = [html, head, body, h1, p];
  let edges = [
    { source: 'html', target: 'head' },
    { source: 'html', target: 'body' },
    { source: 'body', target: 'h1' },
    { source: 'body', target: 'p' }
  ];

  steps.push({
    step: stepCount++,
    state: getState(nodes, edges, ''),
    narration: 'The browser parses your HTML file and converts it into a Tree Data Structure in memory called the DOM.'
  });

  if (action === 'appendChild') {
    steps.push({
      step: stepCount++,
      state: getState(nodes, edges, ''),
      narration: 'Executing JS: const btn = document.createElement("button"); document.body.appendChild(btn);'
    });
    
    nodes = [...nodes, { id: 'btn', label: '<button>', x: 100, y: 60, status: 'active' }];
    edges = [...edges, { source: 'body', target: 'btn' }];
    
    steps.push({
      step: stepCount++,
      state: getState(nodes, edges, ''),
      narration: 'A new node is grafted onto the tree! This triggers a "Reflow" and "Repaint" in the browser to draw the button on screen.'
    });
  } else if (action === 'removeChild') {
    steps.push({
      step: stepCount++,
      state: getState(nodes, edges, ''),
      narration: 'Executing JS: const p = document.querySelector("p"); p.remove();'
    });
    
    nodes = nodes.map(n => n.id === 'p' ? { ...n, status: 'pruned' } : n);
    
    steps.push({
      step: stepCount++,
      state: getState(nodes, edges, ''),
      narration: 'The node is pruned from the tree data structure and disappears from the screen.'
    });
  }

  return steps;
}

export const domTreeLesson: InteractiveLesson<TreeState> = {
  id: 'web_dom_tree',
  subject: 'Web Development',
  title: 'The DOM Tree',
  difficulty: 'Easy',
  estMinutes: 15,
  prerequisites: ['HTML', 'JavaScript'],
  hook: {
    scenario: 'You write raw HTML text like <h1>Hello</h1>. But inside JavaScript, you can somehow change the text color, move it around, or delete it dynamically. How?',
    rendererId: 'TreeRenderer',
    initialState: { nodes: [], edges: [] }
  },
  predict: {
    question: 'Under the hood, what data structure does the browser use to represent your webpage?',
    options: ['An Array of strings', 'A Hash Map', 'A Graph with cycles', 'A Tree'],
    correctIndex: 3,
    whyExplanation: 'The Document Object Model (DOM) is a Tree. Every HTML tag is a node, and nested tags are its children.'
  },
  play: {
    rendererId: 'TreeRenderer',
    controls: [
      { id: 'action', label: 'JavaScript DOM Action', type: 'radio', options: ['none', 'appendChild', 'removeChild'], defaultValue: 'none' }
    ],
    presets: [
      { name: 'View DOM', state: { action: 'none' } },
      { name: 'document.appendChild()', state: { action: 'appendChild' } },
      { name: 'element.remove()', state: { action: 'removeChild' } }
    ],
    traceGenerator: generateDomTraces
  },
  breakIt: {
    goal: 'Prune the `<p>` node from the tree.',
    successCondition: (state: TreeState) => !!state.nodes.find(n => n.status === 'pruned'),
    hint: 'Use the element.remove() preset.'
  },
  explain: {
    keyPoints: [
      'HTML is just text. The DOM is the living, breathing, in-memory object representation of that text.',
      'Because it is a Tree, JavaScript can easily traverse it (e.g. parentNode, childNodes) to find and modify elements.',
      'Every time you modify the DOM Tree in JavaScript, the browser must recalculate positions (Reflow) and redraw pixels (Repaint), which is why excessive DOM manipulation is slow.'
    ],
    complexity: {
      time: 'O(N) to traverse or search the tree',
      space: 'O(N) where N is number of HTML elements'
    },
    analogy: 'HTML is the blueprint on paper. The DOM is the actual house built from the blueprint. JavaScript is the renovation crew tearing down walls and adding windows.'
  },
  code: {
    starterCode: `// Manipulating the DOM\nconst newDiv = document.createElement('div');\nnewDiv.textContent = 'I am a new leaf on the tree!';\n\ndocument.body.appendChild(newDiv);`,
    language: ['javascript'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate why manipulating the DOM directly is considered slow, and how frameworks like React solve this (Virtual DOM).',
    seedQuestions: [
      'What is the difference between the DOM and the Virtual DOM?',
      'Why is document.getElementById() faster than document.querySelector()?'
    ]
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 50
  }
};
