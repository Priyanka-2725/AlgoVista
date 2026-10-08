import { InteractiveLesson, TraceStep } from '@/features/interactive-lesson/types';
import { ArrayState } from '@/features/interactive-lesson/renderers/ArrayRenderer';

function generateBinarySearchTraces(controls: Record<string, any>): TraceStep<ArrayState>[] {
  const steps: TraceStep<ArrayState>[] = [];
  
  const size = controls['size'] || 15;
  const isSorted = controls['isSorted'] !== false; // default true
  const triggerOverflow = controls['triggerOverflow'] === true; // default false
  
  // Create array
  let arr = Array.from({ length: size }, (_, i) => (i + 1) * 3);
  if (!isSorted) {
    // Shuffle slightly to break sorting
    const temp = arr[2];
    arr[2] = arr[size - 2];
    arr[size - 2] = temp;
  }

  const target = arr[Math.floor(size * 0.75)] || arr[0]; // Pick a target that exists (usually)

  let low = 0;
  let high = arr.length - 1;
  let comparisons = 0;
  let discarded: number[] = [];

  steps.push({
    step: 0,
    state: {
      array: arr, target, pointers: { low, high, mid: null }, discardedIndices: [...discarded],
      comparisons, linearComparisons: 0, status: 'searching'
    },
    narration: `Searching for ${target}. Initial bounds: Low=${low}, High=${high}.`
  });

  let found = false;
  let overflowed = false;

  while (low <= high) {
    comparisons++;
    
    // Simulate Overflow
    let mid;
    if (triggerOverflow && low + high > 20) { // Artificial low threshold for demo
      mid = -1; // Represents negative overflow
      overflowed = true;
    } else {
      mid = Math.floor((low + high) / 2);
    }

    if (overflowed) {
      steps.push({
        step: comparisons * 2 - 1,
        state: {
          array: arr, target, pointers: { low, high, mid }, discardedIndices: [...discarded],
          comparisons, linearComparisons: target / 3, status: 'broken', overflowError: true
        },
        narration: `CRASH! (low + high) overflowed the 32-bit integer limit and became negative!`
      });
      break;
    }

    steps.push({
      step: comparisons * 2 - 1,
      state: {
        array: arr, target, pointers: { low, high, mid }, discardedIndices: [...discarded],
        comparisons, linearComparisons: target / 3, status: 'searching'
      },
      narration: `Calculated Mid = ${mid}. Value at mid is ${arr[mid]}.`
    });

    if (arr[mid] === target) {
      found = true;
      steps.push({
        step: comparisons * 2,
        state: {
          array: arr, target, pointers: { low, high, mid }, discardedIndices: [...discarded],
          comparisons, linearComparisons: arr.indexOf(target) + 1, status: 'found'
        },
        narration: `Match! Target found at index ${mid} in ${comparisons} steps.`
      });
      break;
    } else if (arr[mid] < target) {
      // Go right, discard left
      for(let i = low; i <= mid; i++) discarded.push(i);
      low = mid + 1;
      steps.push({
        step: comparisons * 2,
        state: {
          array: arr, target, pointers: { low, high, mid }, discardedIndices: [...discarded],
          comparisons, linearComparisons: arr.indexOf(target) + 1, status: 'searching'
        },
        narration: `${arr[mid]} is less than ${target}. Discarding left half. New Low=${low}.`
      });
    } else {
      // Go left, discard right
      for(let i = mid; i <= high; i++) discarded.push(i);
      high = mid - 1;
      steps.push({
        step: comparisons * 2,
        state: {
          array: arr, target, pointers: { low, high, mid }, discardedIndices: [...discarded],
          comparisons, linearComparisons: arr.indexOf(target) + 1, status: 'searching'
        },
        narration: `${arr[mid]} is greater than ${target}. Discarding right half. New High=${high}.`
      });
    }
  }

  if (!found && !overflowed) {
    steps.push({
      step: comparisons * 2 + 1,
      state: {
        array: arr, target, pointers: { low, high, mid: null }, discardedIndices: [...discarded],
        comparisons, linearComparisons: arr.length, status: 'not_found'
      },
      narration: `Low > High. Target not found! Did we break the precondition?`
    });
  }

  return steps;
}

export const binarySearchLesson: InteractiveLesson<ArrayState> = {
  id: 'dsa_binary_search',
  subject: 'Data Structures and Algorithms',
  title: 'Binary Search',
  difficulty: 'Easy',
  estMinutes: 15,
  prerequisites: ['Arrays'],
  hook: {
    scenario: 'You need to find the name "Zack" in a physical phonebook of 1,000,000 entries. A linear search means checking page 1, then page 2, taking forever...',
    rendererId: 'ArrayRenderer',
    initialState: {
      array: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
      target: 27,
      pointers: { low: 0, high: 9, mid: null },
      discardedIndices: [],
      comparisons: 0,
      linearComparisons: 0,
      status: 'searching'
    }
  },
  predict: {
    question: 'How many steps will it take to find an item in a sorted list of 1,000,000 items in the worst case?',
    options: ['500,000', '1,000', '20', '100'],
    correctIndex: 2,
    whyExplanation: 'Because the search space halves every step (1M -> 500k -> 250k...), it takes at most log2(1,000,000) steps, which is roughly 20!'
  },
  play: {
    rendererId: 'ArrayRenderer',
    controls: [
      { id: 'size', label: 'Array Size', type: 'slider', min: 7, max: 31, defaultValue: 15 },
      { id: 'isSorted', label: 'Array is Sorted', type: 'toggle', defaultValue: true },
      { id: 'triggerOverflow', label: 'Trigger (low+high)/2 Overflow', type: 'toggle', defaultValue: false }
    ],
    presets: [
      { name: 'Normal (Sorted)', state: { size: 15, isSorted: true, triggerOverflow: false } },
      { name: 'Large Array', state: { size: 31, isSorted: true, triggerOverflow: false } },
      { name: 'Unsorted Array', state: { size: 15, isSorted: false, triggerOverflow: false } }
    ],
    traceGenerator: generateBinarySearchTraces
  },
  breakIt: {
    goal: 'Make the Binary Search algorithm fail to find a target that actually exists in the array!',
    successCondition: (state: ArrayState) => state.status === 'not_found' || state.overflowError === true,
    hint: 'Binary Search makes a very strict assumption about the data it searches. What happens if you break that assumption using the controls?'
  },
  explain: {
    keyPoints: [
      'Binary Search requires the array to be SORTED. If it is unsorted, discarding a half will accidentally throw away the target.',
      'It halves the search space each step. 1,000,000 items takes just 20 steps. 1 Billion items takes just 30 steps.',
      'The classic bug: `(low + high) / 2` can cause an integer overflow in languages like Java/C++ if the array is huge. Use `low + (high - low) / 2` instead.'
    ],
    complexity: {
      time: 'O(log N)',
      space: 'O(1) Iterative'
    },
    analogy: 'Like finding a word in a dictionary. You open the middle, check if the word is before or after, and completely ignore the other half of the book.'
  },
  code: {
    starterCode: `function binarySearch(arr, target) {\n  let low = 0;\n  let high = arr.length - 1;\n  \n  while (low <= high) {\n    let mid = low + Math.floor((high - low) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}`,
    language: ['javascript', 'python', 'java'],
    testCases: [
      { input: '[1,2,3,4,5], 4', expected: '3' },
      { input: '[1,2,3,4,5], 6', expected: '-1' }
    ]
  },
  viva: {
    aiPromptContext: 'You are an interviewer. The candidate just solved Binary Search. Ask them why it fails on unsorted data, and how they would find the FIRST occurrence of a duplicate element.',
    seedQuestions: [
      'Why does `(low + high) / 2` cause bugs?',
      'How would you modify this to find the first occurrence of a duplicate target?'
    ]
  },
  xp: {
    base: 100,
    predictBonus: 50,
    breakItBonus: 100
  }
};
