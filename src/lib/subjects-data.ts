


export type SubjectDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: SubjectDifficulty;
  category: string;
}

export interface SubjectModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  questions: InterviewQuestion[];
}

export const SUBJECTS: Record<string, SubjectModule> = {
  'dbms': {
    id: 'dbms',
    title: 'DBMS & SQL',
    description: 'Master Database Management Systems, ACID properties, and complex SQL queries.',
    icon: 'Database',
    color: 'text-emerald-400',
    questions: [
      {
        id: 'dbms-1',
        question: 'What are ACID properties in a database?',
        answer: 'ACID stands for Atomicity (all or nothing), Consistency (valid state), Isolation (transactions don\'t interfere), and Durability (saved permanently).',
        difficulty: 'Easy',
        category: 'Transactions'
      },
      {
        id: 'dbms-2',
        question: 'Explain the difference between SQL and NoSQL.',
        answer: 'SQL databases are relational, structured, and use fixed schemas (good for complex queries). NoSQL databases are non-relational, distributed, and have dynamic schemas (good for scalability).',
        difficulty: 'Easy',
        category: 'Architecture'
      },
      {
        id: 'dbms-3',
        question: 'What is Database Normalization and why is it used?',
        answer: 'Normalization is the process of organizing data to minimize redundancy and dependency by isolating data so that additions, deletions, and modifications can be made in just one table.',
        difficulty: 'Medium',
        category: 'Design'
      }
    ]
  },
  'os': {
    id: 'os',
    title: 'Operating Systems',
    description: 'Understand Process Scheduling, Threads, Deadlocks, and Memory Management.',
    icon: 'Cpu',
    color: 'text-indigo-400',
    questions: [
      {
        id: 'os-goal',
        question: 'What exactly is an OS and what are its primary goals?',
        answer: 'An OS is an interface between user and hardware. Primary goals: Convenience (user-friendly), Efficiency (resource management), and Ability to Evolve (scalability).',
        difficulty: 'Easy',
        category: 'Basics'
      },
      {
        id: 'os-sys-call',
        question: 'What is a system call, and how does a trap differ from an interrupt?',
        answer: 'A system call is a request to the kernel. A trap is a software-generated interrupt caused by error or user request (synchronous). An interrupt is a hardware-generated signal (asynchronous).',
        difficulty: 'Medium',
        category: 'Kernel'
      },
      {
        id: 'os-modes',
        question: 'Explain User Mode vs. Kernel Mode.',
        answer: 'User mode is a restricted mode for applications. Kernel mode has full access to hardware and memory. CPU switches to kernel mode via system calls to perform privileged operations.',
        difficulty: 'Medium',
        category: 'Kernel'
      },
      {
        id: 'os-pcb',
        question: 'What is a Process Control Block (PCB)?',
        answer: 'A data structure in the OS kernel containing info about a process: PID, state, PC, registers, memory limits, and open files.',
        difficulty: 'Easy',
        category: 'Processes'
      },
      {
        id: 'os-fork-exec',
        question: 'fork() vs exec(): What do they do?',
        answer: 'fork() creates a duplicate of the current process (same code, new PID). exec() replaces the current process image with a new program.',
        difficulty: 'Medium',
        category: 'Processes'
      },
      {
        id: 'os-zombie',
        question: 'What is an Orphan process vs. a Zombie process?',
        answer: 'Zombie: Process has finished but its entry remains in PCB until parent reads exit status. Orphan: Parent died before child; child is adopted by "init" (PID 1).',
        difficulty: 'Medium',
        category: 'Processes'
      },
      {
        id: 'os-deadlock-cond',
        question: 'What are the 4 Coffman conditions for a Deadlock?',
        answer: '1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. All four must hold simultaneously for deadlock to occur.',
        difficulty: 'Hard',
        category: 'Deadlocks'
      },
      {
        id: 'os-bankers',
        question: 'Explain Banker’s Algorithm.',
        answer: 'A resource allocation and deadlock avoidance algorithm that tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources.',
        difficulty: 'Hard',
        category: 'Deadlocks'
      },
      {
        id: 'os-paging',
        question: 'How does Paging completely kill external fragmentation?',
        answer: 'Paging divides physical memory into fixed-size frames and logical memory into pages. Since pages can be non-contiguous in RAM, there is no need for large contiguous blocks.',
        difficulty: 'Medium',
        category: 'Memory'
      },
      {
        id: 'os-tlb',
        question: 'What is the TLB (Translation Lookaside Buffer)?',
        answer: 'A high-speed cache for page table entries. It speeds up logical-to-physical address translation. On a miss, we must access the Page Table in main RAM.',
        difficulty: 'Hard',
        category: 'Memory'
      },
      {
        id: 'os-thrashing',
        question: 'What is Thrashing?',
        answer: 'A state where the system spends more time swapping pages in/out than executing instructions. Usually happens when the working set of processes exceeds physical RAM.',
        difficulty: 'Hard',
        category: 'Memory'
      },
      {
        id: 'os-belady',
        question: 'What is Belady’s Anomaly?',
        answer: 'The phenomenon where increasing the number of page frames results in an increase in the number of page faults for certain access patterns (occurs in FIFO).',
        difficulty: 'Medium',
        category: 'Memory'
      },
      {
        id: 'os-dma',
        question: 'What is DMA (Direct Memory Access)?',
        answer: 'A feature allowing hardware subsystems to access main memory independently of the CPU, reducing CPU overhead during high-speed I/O transfers.',
        difficulty: 'Medium',
        category: 'I/O'
      }
    ]
  },
  'system-design': {
    id: 'system-design',
    title: 'System Design',
    description: 'Design scalable, distributed systems like URL shorteners or Chat apps.',
    icon: 'Network',
    color: 'text-amber-400',
    questions: [
      {
        id: 'sd-1',
        question: 'What is Load Balancing?',
        answer: 'Load balancing is the process of distributing network traffic across multiple servers to ensure no single server bears too much load, improving availability and responsiveness.',
        difficulty: 'Medium',
        category: 'Scalability'
      },
      {
        id: 'sd-2',
        question: 'Explain Horizontal vs Vertical Scaling.',
        answer: 'Vertical scaling means adding more power (CPU, RAM) to an existing server. Horizontal scaling means adding more servers to the network to share the load.',
        difficulty: 'Easy',
        category: 'Scalability'
      },
      {
        id: 'sd-3',
        question: 'How would you design a URL Shortener?',
        answer: 'Key components: A hashing algorithm (like Base62), a relational database for mapping, a caching layer (Redis) for high-traffic URLs, and a redirection logic.',
        difficulty: 'Hard',
        category: 'Architecture'
      }
    ]
  },
  'cn': {
    id: 'cn',
    title: 'Computer Networks',
    description: 'Learn the OSI model, TCP/IP, DNS, and secure data transmission protocols.',
    icon: 'Globe',
    color: 'text-blue-400',
    questions: [
      {
        id: 'cn-1',
        question: 'Explain the OSI Model layers.',
        answer: '7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. It standardizes communication functions of a computing system.',
        difficulty: 'Medium',
        category: 'Fundamentals'
      },
      {
        id: 'cn-2',
        question: 'TCP vs UDP: Which one to use and when?',
        answer: 'TCP is connection-oriented and reliable (used for web, email). UDP is connectionless and fast (used for streaming, gaming, VoIP).',
        difficulty: 'Easy',
        category: 'Protocols'
      }
    ]
  }
};
