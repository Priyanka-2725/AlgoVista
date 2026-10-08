import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { TableMemoryState } from '@/features/interactive-lesson/renderers/TableMemoryRenderer';

function generatePagingTraces(controls: Record<string, any>): TraceStep<TableMemoryState>[] {
  const steps: TraceStep<TableMemoryState>[] = [];
  
  const vAddr = controls['vAddr'] || '0x00A5'; // Some hex
  const memoryPressure = controls['memoryPressure'] === true;

  // Let's assume a simplified 16-bit address space for the simulation where first char is page, next 3 are offset.
  // E.g., 0xA123 -> Page A, Offset 123
  const pageStr = vAddr.length > 2 ? vAddr.substring(2, 3) : '0';
  const offset = vAddr.length > 3 ? vAddr.substring(3) : '00';

  const getState = (
    highlightPT: boolean = false,
    highlightRAM: boolean = false,
    highlightDisk: boolean = false,
    ptMapped: boolean = false
  ): TableMemoryState => {
    return {
      tables: [
        {
          id: 'page_table',
          title: 'Page Table (OS)',
          headers: ['Virtual Page', 'Physical Frame', 'Valid Bit'],
          rows: [
            { id: 'p0', cells: ['0', 'Frame 5', '1'], status: pageStr === '0' && highlightPT ? 'highlight' : 'normal' },
            { id: 'pA', cells: ['A', ptMapped ? 'Frame 2' : '-', ptMapped ? '1' : '0'], status: pageStr === 'A' && highlightPT ? (ptMapped ? 'highlight' : 'error') : 'normal' },
            { id: 'pB', cells: ['B', 'Frame 1', '1'], status: pageStr === 'B' && highlightPT ? 'highlight' : 'normal' }
          ]
        }
      ],
      memoryBlocks: [
        {
          id: 'ram',
          label: 'Physical Memory (RAM)',
          type: 'heap',
          content: ptMapped ? [`Frame 2: Page A (Data)`] : ['Frame 1: Page B (Data)', 'Frame 5: Page 0 (Code)'],
          status: highlightRAM ? 'active' : 'normal'
        },
        {
          id: 'disk',
          label: 'Secondary Storage (Disk / Swap)',
          type: 'data',
          content: !ptMapped ? [`Page A (Data)`] : ['Page C (Data)'],
          status: highlightDisk ? 'active' : 'normal'
        }
      ]
    };
  };

  steps.push({
    step: 0,
    state: getState(),
    narration: `CPU requests Virtual Address ${vAddr}. The MMU splits this into Page=${pageStr}, Offset=${offset}.`
  });

  steps.push({
    step: 1,
    state: getState(true),
    narration: `Checking the Page Table for Virtual Page ${pageStr}...`
  });

  if (pageStr === 'A') {
    // Page Fault path
    steps.push({
      step: 2,
      state: getState(true, false, false, false),
      narration: `PAGE FAULT! The Valid Bit is 0. The page is not in physical RAM.`
    });

    if (memoryPressure) {
      steps.push({
        step: 3,
        state: getState(false, true, true, false),
        narration: `RAM is full (Memory Pressure). OS must evict a frame to disk before it can load Page ${pageStr}. (Thrashing Risk!)`
      });
    }

    steps.push({
      step: 4,
      state: getState(false, false, true, false),
      narration: `OS pauses the process and fetches Page ${pageStr} from the slow Disk...`
    });

    steps.push({
      step: 5,
      state: getState(true, true, false, true),
      narration: `Page loaded into Frame 2. Page Table updated (Valid=1).`
    });

    steps.push({
      step: 6,
      state: getState(true, true, false, true),
      narration: `CPU retries the instruction. Address ${vAddr} translates to Frame 2 + Offset ${offset}. Success!`
    });
  } else {
    // Hit path
    steps.push({
      step: 2,
      state: getState(true, true, false, true),
      narration: `HIT! Valid Bit is 1. Address translates instantly to Frame. Success!`
    });
  }

  return steps;
}

export const pagingLesson: InteractiveLesson<TableMemoryState> = {
  id: 'os_paging',
  subject: 'Operating Systems',
  title: 'Paging and Virtual Memory',
  difficulty: 'Medium',
  estMinutes: 20,
  prerequisites: ['Memory Management'],
  hook: {
    scenario: 'You have 8GB of RAM, but you have 20GB of games and apps open right now. How is that physically possible without crashing?',
    rendererId: 'TableMemoryRenderer',
    initialState: { tables: [] }
  },
  predict: {
    question: 'When a program asks for memory address 0x4000, what does that address represent?',
    options: ['The actual physical transistor in the RAM chip.', 'A Virtual Address that the OS translates to physical RAM.', 'A sector on the hard drive.', 'An offset in the CPU cache.'],
    correctIndex: 1,
    whyExplanation: 'Programs never see physical RAM! They get a "Virtual" address space. The OS uses a Page Table to map Virtual addresses to Physical Frames seamlessly.'
  },
  play: {
    rendererId: 'TableMemoryRenderer',
    controls: [
      { id: 'vAddr', label: 'Virtual Address Requested', type: 'radio', options: ['0x00A5 (In RAM)', '0x0A12 (On Disk)'], defaultValue: '0x0A12 (On Disk)' },
      { id: 'memoryPressure', label: 'RAM is 100% Full', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Page Hit (Fast)', state: { vAddr: '0x00A5 (In RAM)', memoryPressure: false } },
      { name: 'Page Fault (Disk Fetch)', state: { vAddr: '0x0A12 (On Disk)', memoryPressure: false } },
      { name: 'Thrashing Warning', state: { vAddr: '0x0A12 (On Disk)', memoryPressure: true } }
    ],
    traceGenerator: generatePagingTraces
  },
  breakIt: {
    goal: 'Trigger the ultimate slowdown: Thrashing! Force a Page Fault when the RAM is already 100% full.',
    successCondition: (state: TableMemoryState) => {
      // Find the step where both disk is active and memory pressure was enabled (simulated by checking if the trace reached step 3 of the fault with pressure)
      const disk = state.memoryBlocks?.find(b => b.id === 'disk');
      const ram = state.memoryBlocks?.find(b => b.id === 'ram');
      return disk?.status === 'active' && ram?.status === 'active'; // this happens during the thrashing step
    },
    hint: 'A Page Fault fetches from disk. If RAM is full, it must also EVICT to disk. Toggle "RAM is 100% Full" and request an address on disk.'
  },
  explain: {
    keyPoints: [
      'Virtual Memory gives every process the illusion of having a massive, continuous block of memory.',
      'The Memory Management Unit (MMU) uses a Page Table to translate Virtual Pages into Physical Frames in hardware.',
      'If a page is not in RAM, a PAGE FAULT occurs. The OS fetches it from the Hard Drive (Swap space).'
    ],
    complexity: {
      time: 'O(1) lookup via TLB',
      space: 'O(N) for Page Tables'
    },
    analogy: 'Virtual Memory is like a Library Catalog (Page Table). You look up a book (Virtual Address) and find its shelf (Physical Frame). If the book is in the basement storage (Disk), the librarian has to go fetch it (Page Fault).'
  },
  code: {
    starterCode: `// Simulating MMU Translation\nconst PAGE_SIZE = 4096; // 4KB\n\nfunction translateAddress(virtualAddr, pageTable) {\n  let pageNumber = Math.floor(virtualAddr / PAGE_SIZE);\n  let offset = virtualAddr % PAGE_SIZE;\n\n  let frame = pageTable[pageNumber];\n  if (frame === undefined) {\n    throw new Error("PAGE FAULT! OS must fetch from disk.");\n  }\n  \n  let physicalAddr = (frame * PAGE_SIZE) + offset;\n  return physicalAddr;\n}`,
    language: ['javascript', 'c'],
    testCases: []
  },
  viva: {
    aiPromptContext: 'You are an interviewer. Ask the candidate what happens when a Page Fault occurs and what Thrashing is.',
    seedQuestions: [
      'What exactly happens during a Page Fault?',
      'If your system starts "Thrashing", what is happening and how do you fix it?'
    ]
  },
  xp: {
    base: 130,
    predictBonus: 50,
    breakItBonus: 100
  }
};
