
/**
 * @fileOverview Comprehensive local dataset of algorithm problems.
 * Pruned test cases to avoid rate-limiting in judge cluster.
 */

import { Problem } from '@/features/learning/components/ProblemList';

export const ARENA_PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    inputFormat: "Line 1: Space-separated integers (nums)\nLine 2: Target integer",
    outputFormat: "Two space-separated indices",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Exactly one solution exists."],
    examples: [{ input: "2 7 11 15\n9", output: "0 1" }],
    timeLimit: 1000,
    memoryLimit: 256,
    starterCode: {
      python: "def solution(nums, target):\n    # Write your code here\n    return [0, 1]",
      java: "class Solution {\n    public int[] solution(int[] nums, int target) {\n        return new int[]{0, 1};\n    }\n}",
      cpp: "vector<int> solution(vector<int>& nums, int target) {\n    return {0, 1};\n}"
    },
    sampleTestCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1" },
      { input: "3 2 4\n6", expectedOutput: "1 2" }
    ],
    hiddenTestCases: [
      { input: "-1 -2 -3 -4 -5\n-8", expectedOutput: "2 4" },
      { input: "0 4 3 0\n0", expectedOutput: "0 3" },
      { input: "10 20 30 40 50\n90", expectedOutput: "3 4" }
    ]
  },
  {
    id: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    category: "Searching",
    description: "Given a sorted array of integers nums and a target integer target, write a function to search target in nums.",
    inputFormat: "Line 1: Sorted space-separated integers\nLine 2: Target integer",
    outputFormat: "Index of target or -1",
    constraints: ["1 <= nums.length <= 10^4", "nums is sorted in ascending order."],
    examples: [{ input: "-1 0 3 5 9 12\n9", output: "4" }],
    timeLimit: 1000,
    memoryLimit: 256,
    starterCode: {
      python: "def solution(nums, target):\n    return -1",
      java: "class Solution {\n    public int solution(int[] nums, int target) {\n        return -1;\n    }\n}",
      cpp: "int solution(vector<int>& nums, int target) {\n    return -1;\n}"
    },
    sampleTestCases: [
      { input: "-1 0 3 5 9 12\n9", expectedOutput: "4" },
      { input: "-1 0 3 5 9 12\n2", expectedOutput: "-1" }
    ],
    hiddenTestCases: [
      { input: "1 2 3 4 5\n3", expectedOutput: "2" },
      { input: "5\n5", expectedOutput: "0" },
      { input: "-10 -5 0 5 10\n0", expectedOutput: "2" }
    ]
  },
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    difficulty: "Easy",
    category: "Sorting",
    description: "Sort an array of integers in ascending order using Bubble Sort.",
    inputFormat: "Space-separated integers",
    outputFormat: "Sorted space-separated integers",
    constraints: ["1 <= nums.length <= 1000"],
    examples: [{ input: "5 1 4 2 8", output: "1 2 4 5 8" }],
    timeLimit: 1000,
    memoryLimit: 256,
    starterCode: {
      python: "def solution(nums):\n    # Sort the array\n    return sorted(nums)",
      java: "class Solution {\n    public int[] solution(int[] nums) {\n        return nums;\n    }\n}",
      cpp: "vector<int> solution(vector<int>& nums) {\n    return nums;\n}"
    },
    sampleTestCases: [
      { input: "5 1 4 2 8", expectedOutput: "1 2 4 5 8" },
      { input: "3 2 1", expectedOutput: "1 2 3" }
    ],
    hiddenTestCases: [
      { input: "10 20 30", expectedOutput: "10 20 30" },
      { input: "-1 -5 -2", expectedOutput: "-5 -2 -1" },
      { input: "100 0", expectedOutput: "0 100" }
    ]
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: "Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.",
    inputFormat: "Line 1: Space-separated integers",
    outputFormat: "The maximum sum",
    constraints: ["1 <= nums.length <= 10^5"],
    examples: [{ input: "-2 1 -3 4 -1 2 1 -5 4", output: "6" }],
    timeLimit: 1000,
    memoryLimit: 256,
    starterCode: {
      python: "def solution(nums):\n    return 0",
      java: "class Solution {\n    public int solution(int[] nums) {\n        return 0;\n    }\n}",
      cpp: "int solution(vector<int>& nums) {\n    return 0;\n}"
    },
    sampleTestCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
      { input: "1", expectedOutput: "1" }
    ],
    hiddenTestCases: [
      { input: "5 4 -1 7 8", expectedOutput: "23" },
      { input: "-1 -2 -3 -4", expectedOutput: "-1" },
      { input: "1 2 3 4", expectedOutput: "10" }
    ]
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Strings",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    inputFormat: "A string s",
    outputFormat: "Length of substring",
    constraints: ["0 <= s.length <= 5 * 10^4"],
    examples: [{ input: "abcabcbb", output: "3" }],
    timeLimit: 1000,
    memoryLimit: 256,
    starterCode: {
      python: "def solution(s):\n    return 0",
      java: "class Solution {\n    public int solution(String s) {\n        return 0;\n    }\n}",
      cpp: "int solution(string s) {\n    return 0;\n}"
    },
    sampleTestCases: [
      { input: "abcabcbb", expectedOutput: "3" },
      { input: "bbbbb", expectedOutput: "1" }
    ],
    hiddenTestCases: [
      { input: "pwwkew", expectedOutput: "3" },
      { input: " ", expectedOutput: "1" },
      { input: "dvdf", expectedOutput: "3" }
    ]
  },
  {
    id: "number-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Graphs",
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
    inputFormat: "Line 1: m n\nNext m lines: binary row string (e.g. 11110)",
    outputFormat: "Number of islands",
    constraints: ["1 <= m, n <= 300"],
    examples: [{ input: "4 5\n11110\n11010\n11000\n00000", output: "1" }],
    timeLimit: 1000,
    memoryLimit: 256,
    starterCode: {
      python: "def solution(grid):\n    # grid is a list of strings\n    return 0",
      java: "class Solution {\n    public int solution(char[][] grid) {\n        return 0;\n    }\n}",
      cpp: "int solution(vector<vector<char>>& grid) {\n    return 0;\n}"
    },
    sampleTestCases: [
      { input: "4 5\n11110\n11010\n11000\n00000", expectedOutput: "1" },
      { input: "4 5\n11000\n11000\n00100\n00011", expectedOutput: "3" }
    ],
    hiddenTestCases: [
      { input: "1 1\n0", expectedOutput: "0" },
      { input: "1 1\n1", expectedOutput: "1" },
      { input: "2 2\n10\n01", expectedOutput: "2" }
    ]
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Arrays",
    description: "Given an array of intervals, merge all overlapping intervals and return an array of non-overlapping intervals.",
    inputFormat: "Line 1: N (number of intervals)\nNext N lines: start end",
    outputFormat: "N' lines: merged start end",
    constraints: ["1 <= intervals.length <= 10^4"],
    examples: [{ input: "4\n1 3\n2 6\n8 10\n15 18", output: "1 6\n8 10\n15 18" }],
    timeLimit: 1000,
    memoryLimit: 256,
    starterCode: {
      python: "def solution(intervals):\n    # intervals is list of lists\n    return sorted(intervals)",
      java: "class Solution {\n    public int[][] solution(int[][] intervals) {\n        return intervals;\n    }\n}",
      cpp: "vector<vector<int>> solution(vector<vector<int>>& intervals) {\n    return intervals;\n}"
    },
    sampleTestCases: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", expectedOutput: "1 6\n8 10\n15 18" },
      { input: "2\n1 4\n4 5", expectedOutput: "1 5" }
    ],
    hiddenTestCases: [
      { input: "1\n1 4", expectedOutput: "1 4" },
      { input: "2\n1 4\n0 4", expectedOutput: "0 4" },
      { input: "2\n1 4\n2 3", expectedOutput: "1 4" }
    ]
  }
];
