


export type SubjectId = 'dsa' | 'os' | 'dbms' | 'cn' | 'system-design' | 'aiml' | 'automata' | 'web-dev' | 'oops';

export interface MicroQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PredictionPoint {
  scenario: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ConceptCard {
  id: string;
  type: 'theory' | 'example' | 'prediction' | 'quiz';
  title: string;
  content: string;
  quiz?: MicroQuiz;
  prediction?: PredictionPoint;
}

export interface PracticeQuestion {
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Concept {
  id: string;
  subjectId: SubjectId;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  importance: number; // 0 to 1
  companies: string[];
  shortDescription: string;
  longExplanation: string;
  analogy: string;
  cards: ConceptCard[];
  practiceQuestions: PracticeQuestion[];
  interviewPrompts: string[];
  relatedProblemIds: string[];
  visualizerId?: string; // Links to ALGORITHMS in algorithms-data.ts
}

export interface Subject {
  id: SubjectId;
  title: string;
  description: string;
  icon: string;
  color: string;
  concepts: Concept[];
}

export const SUBJECTS_HUB: Record<SubjectId, Subject> = {
  'dsa': {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    description: 'Master the building blocks of efficient software.',
    icon: 'BrainCircuit',
    color: 'text-indigo-400',
    concepts: [
      {
        id: 'dsa_binary_search',
        subjectId: 'dsa',
        title: 'Binary Search',
        category: 'Searching',
        difficulty: 'Easy',
        importance: 0.98,
        companies: ['Google', 'Amazon', 'Microsoft'],
        visualizerId: 'binary-search',
        shortDescription: 'Logarithmic search in sorted datasets.',
        longExplanation: 'Binary Search is a search algorithm that finds the position of a target value within a sorted array. It compares the target value to the middle element of the array; if they are unequal, the half in which the target cannot lie is eliminated and the search continues on the remaining half.',
        analogy: 'Finding a name in a physical phone book. You open the middle, see if the name is before or after, and rip the other half away.',
        relatedProblemIds: ['binary-search'],
        practiceQuestions: [
          { question: "What is the prerequisite for Binary Search?", answer: "The input array must be sorted.", difficulty: "Easy" },
          { question: "Why is the complexity O(log n)?", answer: "Because the search space is halved in every single step.", difficulty: "Medium" }
        ],
        interviewPrompts: ["Implement Binary Search recursively.", "How would you find the first occurrence of a duplicate element using Binary Search?"],
        cards: [
          { id: 'dsa-bs-1', type: 'theory', title: 'The Midpoint Logic', content: 'We calculate mid = low + (high - low) / 2 to avoid integer overflow in certain languages.' },
          { id: 'dsa-bs-2', type: 'prediction', title: 'Array Split', content: 'Target is 7. Current array is [1, 3, 5, 7, 9]. Mid is 5.', prediction: { scenario: 'Target 7 > Mid 5', question: 'Which half do we keep?', options: ['Left half [1, 3]', 'Right half [7, 9]', 'Restart search', 'Neither'], correctIndex: 1 } }
        ]
      },
      {
        id: 'dsa_bubble_sort',
        subjectId: 'dsa',
        title: 'Bubble Sort',
        category: 'Sorting',
        difficulty: 'Easy',
        importance: 0.7,
        companies: ['TCS', 'Infosys'],
        visualizerId: 'bubble-sort',
        shortDescription: 'Simple comparison-based sorting.',
        longExplanation: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
        analogy: 'Large bubbles rising to the top of a soda glass. The largest numbers "bubble" to the end of the array.',
        relatedProblemIds: ['bubble-sort'],
        practiceQuestions: [],
        interviewPrompts: ["Is Bubble Sort stable?", "What is the best case complexity if optimized?"],
        cards: [{ id: 'dsa-bb-1', type: 'theory', title: 'Swapping', content: 'In each pass, the largest unsorted element is placed at its correct position.' }]
      },
      {
        id: 'dsa_bfs',
        subjectId: 'dsa',
        title: 'Breadth-First Search',
        category: 'Graphs',
        difficulty: 'Medium',
        importance: 0.95,
        companies: ['Google', 'Meta', 'Amazon'],
        visualizerId: 'bfs',
        shortDescription: 'Layer-by-layer graph traversal.',
        longExplanation: 'BFS starts at the tree root (or some arbitrary node of a graph) and explores all of the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.',
        analogy: 'A ripple in a pond. The water moves outward in concentric circles, hitting all points at a certain distance before moving further.',
        relatedProblemIds: ['bfs', 'number-islands'],
        practiceQuestions: [],
        interviewPrompts: ["Which data structure is used in BFS?", "Can BFS find the shortest path in a weighted graph?"],
        cards: [{ id: 'dsa-bfs-1', type: 'theory', title: 'The Queue', content: 'BFS uses a FIFO (First-In-First-Out) queue to track nodes to visit next.' }]
      }
    ]
  },
  'os': {
    id: 'os',
    title: 'Operating Systems',
    description: 'Understand how software manages hardware resources.',
    icon: 'Cpu',
    color: 'text-emerald-400',
    concepts: [
      {
        id: 'os_deadlock',
        subjectId: 'os',
        title: 'Deadlock',
        category: 'Processes',
        difficulty: 'Medium',
        importance: 0.95,
        companies: ['Amazon', 'Microsoft', 'Google'],
        shortDescription: 'A situation where processes wait indefinitely due to resource contention.',
        longExplanation: 'A deadlock occurs when two or more processes are unable to proceed because each is waiting for the other to release a resource. It is a critical state that can freeze an entire system.',
        analogy: 'Think of two cars meeting on a narrow single-lane bridge from opposite directions. Neither can move forward unless the other moves back, but there is no space to move back.',
        relatedProblemIds: [],
        practiceQuestions: [
          { question: "What are the 4 Coffman conditions?", answer: "Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.", difficulty: "Medium" },
          { question: "Deadlock prevention vs avoidance?", answer: "Prevention breaks one of the 4 conditions. Avoidance uses algorithms (like Banker's) to ensure the system never enters an unsafe state.", difficulty: "Hard" }
        ],
        interviewPrompts: [
          "Explain Deadlock using a real-world scenario.",
          "How would you detect a deadlock in a distributed system?",
          "Explain Banker's Algorithm."
        ],
        cards: [
          {
            id: 'os-dl-1',
            type: 'theory',
            title: 'Circular Wait',
            content: 'The most common condition for deadlock is Circular Wait, where a set of processes are waiting for each other in a circular chain.'
          },
          {
            id: 'os-dl-2',
            type: 'prediction',
            title: 'Can you spot it?',
            content: 'Process A holds the Printer and wants the Scanner. Process B holds the Scanner and wants the Printer.',
            prediction: {
              scenario: 'Both processes are waiting for the other to release.',
              question: 'Will this state ever resolve automatically?',
              options: ['Yes, after a timeout', 'No, they are stuck forever', 'Only if a third process joins', 'Yes, B will yield'],
              correctIndex: 1
            }
          },
          {
            id: 'os-dl-3',
            type: 'quiz',
            title: 'Validation',
            content: 'Check your deadlock knowledge.',
            quiz: {
              question: 'Which condition is NOT a Coffman condition?',
              options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'],
              correctIndex: 2,
              explanation: 'NO Preemption is the condition. If preemption exists, deadlocks can be broken.'
            }
          }
        ]
      },
      {
        id: 'os_process_thread',
        subjectId: 'os',
        title: 'Process vs Thread',
        category: 'Scheduling',
        difficulty: 'Easy',
        importance: 0.98,
        companies: ['Google', 'Amazon', 'Meta'],
        shortDescription: 'The actual technical difference between execution units.',
        longExplanation: 'A process is an independent execution unit with its own memory space (heap, stack, data). A thread is a subset of a process that shares the same memory space (heap) but has its own stack and program counter.',
        analogy: 'A Process is like a restaurant (independent building, own kitchen). A Thread is like a waiter in that restaurant (shares the same kitchen, but performs independent tasks).',
        relatedProblemIds: [],
        practiceQuestions: [
          { question: "What does a context switch involve?", answer: "Saving the state of the current process/thread (registers, PC) and loading the state of the next one.", difficulty: "Medium" }
        ],
        interviewPrompts: ["Why are threads called 'lightweight processes'?", "What happens to child threads if the parent process exits?"],
        cards: [
          {
            id: 'os-pt-1',
            type: 'theory',
            title: 'Memory Isolation',
            content: 'Processes are isolated from each other. If one crashes, the other survives. Threads share memory, so one buggy thread can crash the entire process.'
          },
          {
            id: 'os-pt-2',
            type: 'prediction',
            title: 'Resource Overhead',
            content: 'A system switches between two processes versus switching between two threads within the same process.',
            prediction: {
              scenario: 'Comparing context switch costs.',
              question: 'Which switch is faster?',
              options: ['Process switch', 'Thread switch', 'Both take same time', 'Depends on CPU cores'],
              correctIndex: 1
            }
          }
        ]
      }
    ]
  },
  'dbms': {
    id: 'dbms',
    title: 'Database Systems',
    description: 'Learn storage and transactional integrity.',
    icon: 'Database',
    color: 'text-amber-400',
    concepts: [
      {
        id: 'dbms_acid',
        subjectId: 'dbms',
        title: 'ACID Properties',
        category: 'Transactions',
        difficulty: 'Easy',
        importance: 0.9,
        companies: ['Amazon', 'Oracle'],
        shortDescription: 'The pillars of reliable database transactions.',
        longExplanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. These properties ensure that database transactions are processed reliably.',
        analogy: 'Think of a bank transfer. If you send $100, the money must be deducted from your account AND added to the recipient\'s account. If only one happens, the transaction is invalid.',
        relatedProblemIds: [],
        practiceQuestions: [
          { question: "What is a dirty read?", answer: "Reading data that has been modified by a transaction but not yet committed.", difficulty: "Medium" }
        ],
        interviewPrompts: ["Explain Isolation levels in SQL.", "How does a database ensure Durability during a crash?"],
        cards: [
          {
            id: 'dbms-acid-1',
            type: 'theory',
            title: 'Atomicity',
            content: 'Atomicity ensures that all operations within a transaction are completed; otherwise, the transaction is aborted.'
          },
          {
            id: 'dbms-acid-2',
            type: 'quiz',
            title: 'Consistency Check',
            content: 'Check your ACID knowledge.',
            quiz: {
              question: 'Which property ensures the database moves from one valid state to another?',
              options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
              correctIndex: 1,
              explanation: 'Consistency ensures that all data follows predefined rules and constraints.'
            }
          }
        ]
      }
    ]
  },
  'cn': {
    id: 'cn',
    title: 'Computer Networks',
    description: 'The protocols that power the internet.',
    icon: 'Globe',
    color: 'text-purple-400',
    concepts: [
      {
        id: 'cn_tcp_udp',
        subjectId: 'cn',
        title: 'TCP vs UDP',
        category: 'Protocols',
        difficulty: 'Easy',
        importance: 0.92,
        companies: ['Google', 'Meta'],
        shortDescription: 'Reliability vs. Speed.',
        longExplanation: 'TCP is connection-oriented and ensures reliable delivery. UDP is connectionless and prioritized for speed.',
        analogy: 'TCP is like a phone call. UDP is like a postcard.',
        relatedProblemIds: [],
        practiceQuestions: [
          { question: "Explain the 3-way handshake.", answer: "SYN, SYN-ACK, ACK.", difficulty: "Medium" }
        ],
        interviewPrompts: ["When would you use UDP over TCP?", "Explain TCP Congestion Control."],
        cards: [
          {
            id: 'cn-tcp-1',
            type: 'theory',
            title: 'Handshake',
            content: 'TCP uses a 3-way handshake to establish a reliable connection.'
          }
        ]
      }
    ]
  },
  'system-design': {
    id: 'system-design',
    title: 'System Design',
    description: 'Design scalable, high-availability architectures.',
    icon: 'Network',
    color: 'text-blue-400',
    concepts: [
      {
        id: 'sd_load_balancer',
        subjectId: 'system-design',
        title: 'Load Balancing',
        category: 'Fundamentals',
        difficulty: 'Medium',
        importance: 0.93,
        companies: ['Netflix', 'Amazon'],
        shortDescription: 'Distributing traffic across multiple servers.',
        longExplanation: 'Load balancing distributes tasks over a set of resources to make processing efficient.',
        analogy: 'A manager directing customers to the shortest line in a supermarket.',
        relatedProblemIds: [],
        practiceQuestions: [
          { question: "Round Robin vs Least Connections?", answer: "RR rotates sequentially. LC picks the server with fewest active sessions.", difficulty: "Medium" }
        ],
        interviewPrompts: ["How does a load balancer handle session persistence?", "Explain L4 vs L7 balancing."],
        cards: [
          {
            id: 'sd-lb-1',
            type: 'theory',
            title: 'Distribution',
            content: 'Load balancers improve availability by preventing any single server from becoming a bottleneck.'
          }
        ]
      }
    ]
  },
  'web-dev': {
    id: 'web-dev',
    title: 'Web Development',
    description: 'Modern frontend and backend engineering.',
    icon: 'Zap',
    color: 'text-red-400',
    concepts: [
      {
        id: 'web_event_loop',
        subjectId: 'web-dev',
        title: 'JavaScript Event Loop',
        category: 'JS Internals',
        difficulty: 'Medium',
        importance: 0.95,
        companies: ['Netflix', 'Uber', 'Paytm'],
        shortDescription: 'How JS handles concurrency despite being single-threaded.',
        longExplanation: 'The event loop checks the call stack and moves tasks from the callback queue to the stack when it is empty.',
        analogy: 'A waiter taking orders and handing them to the kitchen, while continuing to serve other tables.',
        relatedProblemIds: [],
        practiceQuestions: [{ question: "Microtask vs Macrotask?", answer: "Microtasks (Promises) have higher priority than macrotasks (setTimeout).", difficulty: "Medium" }],
        interviewPrompts: ["Explain Hoisting.", "What are Closures?"],
        cards: [{ id: 'web-ev-1', type: 'theory', title: 'Event Loop', content: 'JS executes code line by line but handles async tasks via the loop.' }]
      }
    ]
  },
  'oops': {
    id: 'oops',
    title: 'OOPs Concepts',
    description: 'Object Oriented Programming principles.',
    icon: 'ListChecks',
    color: 'text-slate-400',
    concepts: [
      {
        id: 'oops_solid',
        subjectId: 'oops',
        title: 'SOLID Principles',
        category: 'Design',
        difficulty: 'Hard',
        importance: 0.9,
        companies: ['Microsoft', 'Amazon'],
        shortDescription: 'The 5 commandments of clean code.',
        longExplanation: 'SOLID is an acronym for 5 design principles intended to make software designs more understandable and flexible.',
        analogy: 'Building with LEGOs—each piece has a specific purpose and can be easily swapped.',
        relatedProblemIds: [],
        practiceQuestions: [{ question: "What is Dependency Inversion?", answer: "High-level modules should not depend on low-level modules; both should depend on abstractions.", difficulty: "Hard" }],
        interviewPrompts: ["Inheritance vs Composition.", "Explain Polymorphism with an example."],
        cards: [{ id: 'oops-sol-1', type: 'theory', title: 'SOLID', content: 'Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.' }]
      }
    ]
  },
  'aiml': {
    id: 'aiml',
    title: 'AI & ML',
    description: 'Neural networks and intelligence models.',
    icon: 'Zap',
    color: 'text-orange-400',
    concepts: []
  },
  'automata': {
    id: 'automata',
    title: 'Automata Theory',
    description: 'Formal languages and state machines.',
    icon: 'Activity',
    color: 'text-slate-500',
    concepts: []
  }
};
