import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TimelineState } from '@/features/interactive-lesson/renderers/TimelineRenderer';

function generateDnsTraces(controls: Record<string, any>): TraceStep<TimelineState>[] {
  const steps: TraceStep<TimelineState>[] = [];
  const browserCache = controls['browserCache'] === true; // false by default
  const osCache = controls['osCache'] === true; // false by default

  const getState = (time: number, msg: string, br: any[], ispr: any[], root: any[], tld: any[], auth: any[]): TimelineState => {
    return {
      timeRange: [0, 8],
      currentTime: time,
      lanes: [
        { id: 'Browser', label: '1. Your Browser', items: [...br] },
        { id: 'ISP', label: '2. ISP Resolver', items: [...ispr] },
        { id: 'Root', label: '3. Root Server (.)', items: [...root] },
        { id: 'TLD', label: '4. TLD Server (.com)', items: [...tld] },
        { id: 'Auth', label: '5. Auth Server (google.com)', items: [...auth] }
      ],
      globalStatus: 'running',
      message: msg
    };
  };

  let br: any[] = [];
  let ispr: any[] = [];
  let root: any[] = [];
  let tld: any[] = [];
  let auth: any[] = [];
  let stepCount = 0;

  // Step 0: Start
  steps.push({
    step: stepCount++,
    state: getState(0, 'You type google.com and press Enter.', br, ispr, root, tld, auth),
    narration: 'Your browser needs the IP address of google.com to connect to it. Where does it look first?'
  });

  if (browserCache) {
    br.push({ id: 'req_br', label: 'Cache HIT!', start: 0, end: 1, status: 'success' });
    steps.push({
      step: stepCount++,
      state: getState(1, 'Browser checks its own cache... Found it!', br, ispr, root, tld, auth),
      narration: 'Fastest possible response! Your browser recently visited google.com and remembered the IP. DNS Resolution is complete.'
    });
    return steps;
  }

  // Step 1: Browser misses, asks OS
  br.push({ id: 'req_br', label: 'Cache Miss', start: 0, end: 1, status: 'error' });
  steps.push({
    step: stepCount++,
    state: getState(1, 'Browser cache miss. Asking the Operating System...', br, ispr, root, tld, auth),
    narration: 'The browser doesn\'t know the IP. It delegates the task to your Operating System.'
  });

  if (osCache) {
    br.push({ id: 'os_hit', label: 'OS Cache HIT!', start: 1, end: 2, status: 'success' });
    steps.push({
      step: stepCount++,
      state: getState(2, 'OS cache hit! Returning to browser.', br, ispr, root, tld, auth),
      narration: 'Your OS remembered the IP! It returns it to the browser immediately.'
    });
    return steps;
  }

  // Step 2: OS Misses, asks ISP Resolver
  ispr.push({ id: 'req_isp', label: 'Where is google.com?', start: 1, end: 2, status: 'blocked' });
  steps.push({
    step: stepCount++,
    state: getState(2, 'OS cache miss. Asking ISP Recursive Resolver.', br, ispr, root, tld, auth),
    narration: 'Your computer gives up and asks your ISP (like Comcast or Google 8.8.8.8) to find the IP for you.'
  });

  // Step 3: ISP asks Root
  root.push({ id: 'req_root', label: 'Ask .com TLD', start: 2, end: 3, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(3, 'ISP Resolver asks the Root Server.', br, ispr, root, tld, auth),
    narration: 'The ISP Resolver doesn\'t know. It asks the top of the internet hierarchy: The Root Server. The Root says "I don\'t know google.com, but I know who handles .com domains. Ask them."'
  });

  // Step 4: ISP asks TLD
  tld.push({ id: 'req_tld', label: 'Ask Auth Server', start: 3, end: 4, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(4, 'ISP Resolver asks the .com TLD Server.', br, ispr, root, tld, auth),
    narration: 'The ISP Resolver goes to the .com TLD Server. It says "I don\'t know google.com\'s IP, but I know the Authoritative Server that Google runs. Ask them."'
  });

  // Step 5: ISP asks Authoritative
  auth.push({ id: 'req_auth', label: '142.250.190.46', start: 4, end: 5, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(5, 'ISP Resolver asks Google\'s Authoritative Server.', br, ispr, root, tld, auth),
    narration: 'The ISP Resolver finally asks Google\'s own DNS server. It responds: "Yes, google.com is at 142.250.190.46!"'
  });

  // Step 6: Return to browser
  br.push({ id: 'done', label: 'IP: 142.250.190.46', start: 5, end: 6, status: 'success' });
  steps.push({
    step: stepCount++,
    state: getState(6, 'ISP returns IP to OS, OS returns to Browser.', br, ispr, root, tld, auth),
    narration: 'The ISP Resolver caches the answer and gives it to your computer. Your browser finally connects to Google!'
  });

  return steps;
}

export const dnsLesson: InteractiveLesson<TimelineState> = {
  id: 'cn_dns_resolution',
  subject: 'Computer Networks',
  title: 'DNS Resolution',
  difficulty: 'Medium',
  estMinutes: 15,
  prerequisites: ['Networking Basics'],
  hook: {
    scenario: 'You type "netflix.com". But computers only speak numbers (IP addresses like 54.23.11.2). How did your computer find the right IP in less than 50 milliseconds?',
    rendererId: 'TimelineRenderer',
    initialState: { timeRange: [0, 8], currentTime: 0, lanes: [], globalStatus: 'running' }
  },
  predict: {
    question: 'Where is the master "phonebook" of the entire internet stored?',
    options: [
      'In a giant database owned by Google.',
      'Inside your Wi-Fi router.',
      'It is distributed across thousands of servers worldwide.',
      'Inside the transatlantic fiber cables.'
    ],
    correctIndex: 2,
    whyExplanation: 'If one server held the whole internet phonebook, it would crash instantly. DNS is a massive distributed, hierarchical caching system.'
  },
  play: {
    rendererId: 'TimelineRenderer',
    controls: [
      { id: 'browserCache', label: 'Browser Cache Hit', type: 'toggle', defaultValue: false },
      { id: 'osCache', label: 'OS Cache Hit', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Full Resolution (Cold Start)', state: { browserCache: false, osCache: false } },
      { name: 'OS Cache Hit', state: { browserCache: false, osCache: true } },
      { name: 'Browser Cache Hit', state: { browserCache: true, osCache: false } }
    ],
    traceGenerator: generateDnsTraces
  },
  breakIt: {
    goal: 'Make the DNS resolution happen instantly without ever leaving your computer.',
    successCondition: (state: TimelineState) => state.currentTime === 1 && state.lanes[0].items[0].label === 'Cache HIT!',
    hint: 'If you just visited the site yesterday, your browser should remember it.'
  },
  explain: {
    keyPoints: [
      'DNS (Domain Name System) translates human-readable domain names into IP addresses.',
      'It relies heavily on caching. Your Browser, OS, and Router all cache DNS records to speed up browsing.',
      'If there is a cache miss, a Recursive Resolver (usually your ISP) does the heavy lifting of traversing the Root -> TLD -> Authoritative servers.'
    ],
    complexity: {
      time: 'O(1) with Cache, O(depth of tree) without',
      space: 'Requires caching memory at every layer'
    },
    analogy: 'Looking up a friend\'s number. First you check your brain (Browser Cache). Then you check your contact app (OS Cache). Then you ask a mutual friend (ISP), who asks the friend\'s mom (TLD), who asks the friend directly (Authoritative).'
  },
  code: {
    starterCode: `// Performing a DNS Lookup in Node.js\nconst dns = require('dns');\n\ndns.lookup('algo-vista.com', (err, address, family) => {\n  console.log('IP Address:', address);\n});`,
    language: ['javascript', 'python'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate what happens when you type google.com into the browser, focusing specifically on the DNS portion.',
    seedQuestions: [
      'Explain the DNS resolution process.',
      'What is the difference between a Recursive Resolver and an Authoritative Server?'
    ]
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 50
  }
};
