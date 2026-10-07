
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Category = 'Searching' | 'Sorting' | 'Graph' | 'Dynamic Programming' | 'Greedy';

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Algorithm {
  id: string;
  name: string;
  category: Category;
  difficulty: Difficulty;
  useCase: string;
  shortDescription: string;
  problemStatement: {
    description: string;
    input: string;
    output: string;
    exampleInput: string;
    exampleOutput: string;
  };
  steps: string[];
  complexity: Complexity;
  code: {
    java: string;
    python: string;
    cpp: string;
  };
  quiz: QuizQuestion[];
}

export const ALGORITHMS: Record<string, Algorithm> = {
  'binary-search': {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    difficulty: 'Easy',
    useCase: 'Finding elements in sorted datasets quickly.',
    shortDescription: 'Binary Search is an efficient algorithm for finding an item from a sorted list of items.',
    problemStatement: {
      description: 'Given a sorted array of integers and a target value, find the index of the target value.',
      input: 'A sorted integer array `arr` and a target integer `target`.',
      output: 'The index of `target` in `arr`, or -1 if not found.',
      exampleInput: 'arr = [1, 3, 5, 7, 9], target = 7',
      exampleOutput: '3'
    },
    steps: [
      'Set low pointer to start, high to end.',
      'Compute mid = floor((low + high) / 2).',
      'If arr[mid] == target, return mid.',
      'If target < arr[mid], search left half (high = mid - 1).',
      'Else, search right half (low = mid + 1).'
    ],
    complexity: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
      space: 'O(1)',
      explanation: 'Binary search halves the search space in each step.'
    },
    code: {
      java: `public int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) high = mid - 1;
        else low = mid + 1;
    }
    return -1;
}`,
      python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            high = mid - 1
        else:
            low = mid + 1
    return -1`,
      cpp: `int binarySearch(vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) high = mid - 1;
        else low = mid + 1;
    }
    return -1;
}`
    },
    quiz: [
      {
        question: 'What is the primary requirement for Binary Search?',
        options: ['Sorted array', 'Large array', 'Even size', 'Random access'],
        correctIndex: 0
      },
      {
        question: 'Worst-case time complexity?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctIndex: 1
      }
    ]
  },
  'bubble-sort': {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    useCase: 'Educational sorting concept.',
    shortDescription: 'Simple comparison-based sorting that bubbles larger elements to the top.',
    problemStatement: {
      description: 'Sort an array in ascending order by repeatedly swapping adjacent elements.',
      input: 'Unsorted array.',
      output: 'Sorted array.',
      exampleInput: '[5, 1, 4, 2]',
      exampleOutput: '[1, 2, 4, 5]'
    },
    steps: [
      'Iterate through the array.',
      'Compare adjacent elements.',
      'Swap if current > next.',
      'Repeat until no more swaps are needed.'
    ],
    complexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      explanation: 'Uses nested loops to bubble up the largest element.'
    },
    code: {
      java: `void bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++)
        for (int j = 0; j < arr.length - i - 1; j++)
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp;
            }
}`,
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`,
      cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++)
        for (int j = 0; j < n - i - 1; j++)
            if (arr[j] > arr[j + 1]) swap(arr[j], arr[j + 1]);
}`
    },
    quiz: [
      {
        question: 'What happens in each pass of Bubble Sort?',
        options: ['Smallest element sinks', 'Largest element bubbles to end', 'Array is divided', 'Pivot is selected'],
        correctIndex: 1
      }
    ]
  },
  'selection-sort': {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    useCase: 'Sorting small arrays with limited memory.',
    shortDescription: 'Repeatedly finding the minimum element from the unsorted part.',
    problemStatement: {
      description: 'Sort an array by continuously picking the smallest item and putting it at the start.',
      input: 'Unsorted array.',
      output: 'Sorted array.',
      exampleInput: '[64, 25, 12, 22]',
      exampleOutput: '[12, 22, 25, 64]'
    },
    steps: [
      'Assume first unsorted index is minimum.',
      'Search remaining array for a smaller value.',
      'Update min index if smaller value found.',
      'Swap min value with first unsorted index.'
    ],
    complexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      explanation: 'Selection sort always performs n² comparisons regardless of initial order.'
    },
    code: {
      java: `void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length-1; i++) {
        int minIdx = i;
        for (int j = i+1; j < arr.length; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        int temp = arr[minIdx]; arr[minIdx] = arr[i]; arr[i] = temp;
    }
}`,
      python: `def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i+1, len(arr)):
            if arr[j] < arr[min_idx]: min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
      cpp: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        int minIdx = i;
        for (int j = i+1; j < n; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        swap(arr[minIdx], arr[i]);
    }
}`
    },
    quiz: [
      {
        question: 'Selection Sort is known for minimizing what?',
        options: ['Comparisons', 'Swaps', 'Memory', 'Time'],
        correctIndex: 1
      }
    ]
  },
  'insertion-sort': {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    useCase: 'Sorting nearly sorted or very small arrays.',
    shortDescription: 'Builds the final sorted array one item at a time.',
    problemStatement: {
      description: 'Sort an array by inserting each element into its correct position in a sorted sub-portion.',
      input: 'Unsorted array.',
      output: 'Sorted array.',
      exampleInput: '[12, 11, 13, 5]',
      exampleOutput: '[5, 11, 12, 13]'
    },
    steps: [
      'Assume first element is sorted.',
      'Take next element (key) and compare with elements in sorted sub-array.',
      'Shift elements larger than key to the right.',
      'Insert key at its correct position.'
    ],
    complexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
      space: 'O(1)',
      explanation: 'Performs well on nearly sorted data (O(n)).'
    },
    code: {
      java: `void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; ++i) {
        int key = arr[i]; int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j]; j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
      python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i-1
        while j >= 0 and key < arr[j]:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key`,
      cpp: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i]; int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j]; j = j - 1;
        }
        arr[j + 1] = key;
    }
}`
    },
    quiz: [
      {
        question: 'Worst-case for Insertion Sort?',
        options: ['Sorted array', 'Reverse sorted array', 'Random array', 'Constant array'],
        correctIndex: 1
      }
    ]
  }
};
