import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { GraphState } from '@/features/interactive-lesson/renderers/GraphRenderer';

function generateSolidTraces(controls: Record<string, any>): TraceStep<GraphState>[] {
  const steps: TraceStep<GraphState>[] = [];
  const applied = controls['applied'] === true; // false by default

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

  if (!applied) {
    // Bad Design (Tightly Coupled)
    const btn = { id: 'btn', label: 'Button Class', x: 20, y: 30, status: 'current' };
    const lamp = { id: 'lamp', label: 'Lamp Class', x: 80, y: 30, status: 'visited' };
    const motor = { id: 'motor', label: 'Motor Class', x: 80, y: 70, status: 'unvisited' };

    steps.push({
      step: stepCount++,
      state: getState([btn, lamp, motor], [{ source: 'btn', target: 'lamp' }], 'TIGHT COUPLING: Button directly controls the Lamp.'),
      narration: 'We have a Button class. Inside its press() method, it creates a new Lamp object and calls lamp.turnOn().'
    });

    steps.push({
      step: stepCount++,
      state: getState([btn, lamp, motor], [{ source: 'btn', target: 'lamp' }, { source: 'btn', target: 'motor' }], 'REQUIREMENT CHANGE: Now we need the button to control a Motor.'),
      narration: 'Your boss says: "Make the button control a Motor instead of a Lamp!"'
    });

    steps.push({
      step: stepCount++,
      state: getState([btn, lamp, motor], [{ source: 'btn', target: 'lamp' }, { source: 'btn', target: 'motor' }], 'VIOLATION: OCP and DIP broken.'),
      narration: 'You have to open the Button class code, delete the Lamp code, and write Motor code. This violates the Open-Closed Principle (OCP) and Dependency Inversion Principle (DIP)!'
    });
  } else {
    // Good Design (Loosely Coupled via Interface)
    const btn = { id: 'btn', label: 'Button Class', x: 20, y: 50, status: 'current' };
    const iface = { id: 'iface', label: '<<ISwitchable>>', x: 50, y: 50, status: 'visited' };
    const lamp = { id: 'lamp', label: 'Lamp Class', x: 80, y: 20, status: 'visited' };
    const motor = { id: 'motor', label: 'Motor Class', x: 80, y: 80, status: 'visited' };

    steps.push({
      step: stepCount++,
      state: getState([btn, iface], [{ source: 'btn', target: 'iface' }], 'DEPENDENCY INVERSION: Button only knows about ISwitchable interface.'),
      narration: 'We create an ISwitchable interface. The Button class takes an ISwitchable in its constructor. It doesn\'t know what a Lamp or Motor is!'
    });

    steps.push({
      step: stepCount++,
      state: getState([btn, iface, lamp, motor], [
        { source: 'btn', target: 'iface' },
        { source: 'lamp', target: 'iface' },
        { source: 'motor', target: 'iface' }
      ], 'LOOSE COUPLING: Both Lamp and Motor implement ISwitchable.'),
      narration: 'Both Lamp and Motor implement the ISwitchable interface.'
    });

    steps.push({
      step: stepCount++,
      state: getState([btn, iface, lamp, motor], [
        { source: 'btn', target: 'iface' },
        { source: 'lamp', target: 'iface' },
        { source: 'motor', target: 'iface' }
      ], 'SUCCESS: Open for extension, closed for modification.'),
      narration: 'Now, if the boss wants a button to control a TV, you just create a TV class that implements ISwitchable. You NEVER have to touch the Button code again!'
    });
  }

  return steps;
}

export const solidLesson: InteractiveLesson<GraphState> = {
  id: 'oops_solid',
  subject: 'OOPs Concepts',
  title: 'SOLID Principles (DIP)',
  difficulty: 'Hard',
  estMinutes: 20,
  prerequisites: ['Classes and Objects'],
  hook: {
    scenario: 'You write a 10,000 line God Class. When you change how the database saves, the UI buttons break. Welcome to Spaghetti Code. How do we fix it?',
    rendererId: 'GraphRenderer',
    initialState: { nodes: [], edges: [], queue: [], visited: [] }
  },
  predict: {
    question: 'According to the Open-Closed Principle (OCP), a software entity should be...',
    options: ['Open for modification, closed for extension', 'Open for extension, closed for modification', 'Open for testing, closed for production', 'Open Source, closed source'],
    correctIndex: 1,
    whyExplanation: 'You should be able to add new functionality (extension) by adding new files/classes, WITHOUT changing existing, working code (modification).'
  },
  play: {
    rendererId: 'GraphRenderer',
    controls: [
      { id: 'applied', label: 'Apply Dependency Inversion (DIP)', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Spaghetti Architecture', state: { applied: false } },
      { name: 'SOLID Architecture', state: { applied: true } }
    ],
    traceGenerator: generateSolidTraces
  },
  breakIt: {
    goal: 'See what happens when you don\'t use interfaces. Turn OFF the Dependency Inversion.',
    successCondition: (state: GraphState) => !!state.message?.includes('VIOLATION'),
    hint: 'Turn off the toggle.'
  },
  explain: {
    keyPoints: [
      'S (Single Responsibility): A class should have one reason to change.',
      'O (Open-Closed): Open for extension, closed for modification.',
      'L (Liskov Substitution): Subclasses should be replaceable for their base classes.',
      'I (Interface Segregation): Many client-specific interfaces are better than one general-purpose interface.',
      'D (Dependency Inversion): Depend on abstractions, not concretions.'
    ],
    complexity: {
      time: 'N/A',
      space: 'N/A'
    },
    analogy: 'A wall outlet is an Interface. You can plug in a Lamp, a TV, or a Phone Charger. The wall doesn\'t need to be rewired every time you buy a new device. That is Dependency Inversion!'
  },
  code: {
    starterCode: `// Bad Code\nclass Button {\n  constructor() {\n    this.lamp = new Lamp(); // Tightly coupled!\n  }\n  press() {\n    this.lamp.turnOn();\n  }\n}`,
    language: ['javascript', 'java', 'csharp'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate to explain the Dependency Inversion Principle using a real-world example.',
    seedQuestions: [
      'What does "Depend on abstractions, not concretions" mean?',
      'Why is the Single Responsibility Principle important?'
    ]
  },
  xp: {
    base: 150,
    predictBonus: 50,
    breakItBonus: 50
  }
};
