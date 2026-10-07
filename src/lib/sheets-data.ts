


export interface SheetTopic {
  name: string;
  problemIds: string[];
}

export interface CuratedSheet {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: SheetTopic[];
  revisionNotes?: string[]; 
}

export const CURATED_SHEETS: CuratedSheet[] = [
  {
    id: 'fresher-launchpad',
    title: "Fresher's Launchpad",
    description: "A specialized revision sheet for freshers focusing on DSA foundations and interview etiquette.",
    level: 'Beginner',
    revisionNotes: [
      "DSA: Master Array traversals and basic String manipulations first.",
      "HR: Use the S.T.A.R method (Situation, Task, Action, Result) for behavioral questions.",
      "Etiquette: Research the company values and prepare 2-3 thoughtful questions for the interviewer.",
      "Logic: Practice explaining your thoughts out loud while coding."
    ],
    topics: [
      {
        name: 'Foundations (Searching & Sorting)',
        problemIds: ['binary-search', 'bubble-sort', 'palindrome-check']
      },
      {
        name: 'Array Patterns',
        problemIds: ['two-sum', 'maximum-subarray']
      },
      {
        name: 'Interview Etiquette (Concepts)',
        problemIds: ['climbing-stairs'] 
      }
    ]
  },
  {
    id: 'pattern-master',
    title: 'Pattern Master (Core 10)',
    description: 'Master the 10 most critical DSA patterns used in technical interviews.',
    level: 'Intermediate',
    revisionNotes: [
      "Sliding Window: Use for subarrays or substrings where you need to maintain a specific window.",
      "Two Pointers: Ideal for sorted arrays or searching for pairs.",
      "DFS/BFS: Know when to use recursion (DFS) vs level-order (BFS).",
      "Dynamic Programming: If you see 'Optimal' or 'Count of ways', think DP."
    ],
    topics: [
      {
        name: 'Pattern: Sliding Window',
        problemIds: ['longest-substring', 'min-window-substring']
      },
      {
        name: 'Pattern: Two Pointers',
        problemIds: ['two-sum', 'palindrome-check']
      },
      {
        name: 'Pattern: Fast & Slow Pointers',
        problemIds: ['diameter-bt'] 
      },
      {
        name: 'Pattern: BFS & DFS',
        problemIds: ['number-islands', 'bfs', 'dfs']
      }
    ]
  },
  {
    id: 'blind-75',
    title: 'Blind 75',
    description: 'The definitive list of 75 most common LeetCode problems for technical interviews.',
    level: 'Intermediate',
    revisionNotes: [
      "Focus on the 'High Signal' problems first (Two Sum, Merge Intervals).",
      "Ensure you can calculate Time and Space complexity for every solution.",
      "Try to solve each problem in under 30 minutes."
    ],
    topics: [
      {
        name: 'Arrays',
        problemIds: ['two-sum', 'best-time-stock', 'product-except-self', 'maximum-subarray', 'merge-intervals']
      },
      {
        name: 'Strings',
        problemIds: ['longest-substring', 'valid-anagram', 'group-anagrams', 'min-window-substring']
      },
      {
        name: 'Trees',
        problemIds: ['bt-level-order', 'lca-bt', 'diameter-bt']
      },
      {
        name: 'Graphs',
        problemIds: ['number-islands', 'course-schedule', 'clone-graph']
      },
      {
        name: 'Dynamic Programming',
        problemIds: ['climbing-stairs', 'lis', 'knapsack-01']
      }
    ]
  }
];

export const COMPANY_LEVEL_PROBLEMS = [
  {
    id: 'best-time-stock',
    title: 'Best Time to Buy & Sell Stock',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Find the maximum profit you can achieve by buying on one day and selling on another.',
    inputFormat: "Line 1: Space-separated integers (prices)",
    outputFormat: "A single integer (max profit)",
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    starterCode: {
      python: "def solution(prices):\n    # Write logic\n    return 0",
      java: "class Solution {\n    public int solution(int[] prices) {\n        return 0;\n    }\n}",
      cpp: "int solution(vector<int>& prices) {\n    return 0;\n}"
    },
    sampleTestCases: [
      { input: "7 1 5 3 6 4", expectedOutput: "5" },
      { input: "7 6 4 3 1", expectedOutput: "0" }
    ],
    hiddenTestCases: [
      { input: "1 2", expectedOutput: "1" },
      { input: "2 1 2 1 0 1 2", expectedOutput: "1" },
      { input: "1 4 2", expectedOutput: "3" }
    ]
  },
  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Arrays',
    companies: ['Amazon', 'Apple'],
    description: 'Return an array answer such that answer[i] is equal to the product of all elements of nums except nums[i]. Must run in O(n) time and O(1) space.',
    inputFormat: "Line 1: Space-separated integers (nums)",
    outputFormat: "Space-separated products",
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
    starterCode: {
      python: "def solution(nums):\n    # Return products except self\n    return [0] * len(nums)",
      java: "class Solution {\n    public int[] solution(int[] nums) {\n        return new int[nums.length];\n    }\n}",
      cpp: "vector<int> solution(vector<int>& nums) {\n    return vector<int>(nums.size(), 0);\n}"
    },
    sampleTestCases: [
      { input: "1 2 3 4", expectedOutput: "24 12 8 6" },
      { input: "-1 1 0 -3 3", expectedOutput: "0 0 9 0 0" }
    ],
    hiddenTestCases: [
      { input: "4 5 1 8 2", expectedOutput: "40 32 160 20 80" },
      { input: "1 1 1 1", expectedOutput: "1 1 1 1" },
      { input: "0 0", expectedOutput: "0 0" }
    ]
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'Arrays',
    companies: ['Google', 'Microsoft', 'Bloomberg'],
    description: 'Given an array of intervals, merge all overlapping intervals and return an array of non-overlapping intervals.',
    inputFormat: "Line 1: N (number of intervals)\nNext N lines: start end",
    outputFormat: "N' lines: merged start end",
    constraints: ["1 <= intervals.length <= 10^4"],
    starterCode: {
      python: "def solution(intervals):\n    # Sort and merge\n    return []",
      java: "class Solution {\n    public int[][] solution(int[][] intervals) {\n        return new int[0][0];\n    }\n}",
      cpp: "vector<vector<int>> solution(vector<vector<int>>& intervals) {\n    return {};\n}"
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
  },
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    category: 'Strings',
    companies: ['Amazon', 'Google'],
    description: 'Determine if string t is an anagram of string s.',
    inputFormat: "Line 1: s\nLine 2: t",
    outputFormat: "true or false",
    constraints: ["1 <= s.length, t.length <= 5 * 10^4"],
    starterCode: {
      python: "def solution(s, t):\n    return False",
      java: "class Solution {\n    public boolean solution(String s, String t) {\n        return false;\n    }\n}",
      cpp: "bool solution(string s, string t) {\n    return false;\n}"
    },
    sampleTestCases: [
      { input: "anagram\nnagaram", expectedOutput: "true" },
      { input: "rat\ncar", expectedOutput: "false" }
    ],
    hiddenTestCases: [
      { input: "a\na", expectedOutput: "true" },
      { input: "ab\nba", expectedOutput: "true" },
      { input: "abc\ndef", expectedOutput: "false" }
    ]
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    category: 'Strings',
    companies: ['Amazon', 'Google', 'Uber'],
    description: 'Group an array of strings into sub-lists of anagrams. You can return the answer in any order.',
    inputFormat: "Line 1: Space-separated strings",
    outputFormat: "Grouped anagrams (sorted for judge)",
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100"],
    starterCode: {
      python: "def solution(strs):\n    # Write grouping logic\n    return [[]]",
      java: "class Solution {\n    public List<List<String>> solution(String[] strs) {\n        return new ArrayList<>();\n    }\n}",
      cpp: "vector<vector<string>> solution(vector<string>& strs) {\n    return {};\n}"
    },
    sampleTestCases: [
      { input: "eat tea tan ate nat bat", expectedOutput: "ate eat tea\nnat tan\nbat" },
      { input: "a", expectedOutput: "a" }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "" },
      { input: "abc cba def fed ghi ihg", expectedOutput: "abc cba\ndef fed\nghi ihg" }
    ]
  },
  {
    id: 'min-window-substring',
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    category: 'Strings',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    description: 'Given two strings s and t, return the minimum window substring of s such that every character in t is included in the window.',
    inputFormat: "Line 1: s\nLine 2: t",
    outputFormat: "Minimum window substring or \"\"",
    constraints: ["1 <= s.length, t.length <= 10^5"],
    starterCode: {
      python: "def solution(s, t):\n    return \"\"",
      java: "class Solution {\n    public String solution(String s, String t) {\n        return \"\";\n    }\n}",
      cpp: "string solution(string s, string t) {\n    return \"\";\n}"
    },
    sampleTestCases: [
      { input: "ADOBECODEBANC\nABC", expectedOutput: "BANC" },
      { input: "a\na", expectedOutput: "a" }
    ],
    hiddenTestCases: [
      { input: "a\naa", expectedOutput: "" },
      { input: "aa\na", expectedOutput: "a" },
      { input: "ab\nb", expectedOutput: "b" }
    ]
  },
  {
    id: 'bt-level-order',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    category: 'Trees',
    companies: ['Amazon', 'Microsoft', 'Facebook'],
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values (from left to right, level by level).',
    inputFormat: "Level-order array representation (null for missing)",
    outputFormat: "Grouped values per level",
    constraints: ["0 <= number of nodes <= 2000"],
    starterCode: {
      python: "def solution(root):\n    # root is node with .val, .left, .right\n    return []",
      java: "class Solution {\n    public List<List<Integer>> solution(TreeNode root) {\n        return new ArrayList<>();\n    }\n}",
      cpp: "vector<vector<int>> solution(TreeNode* root) {\n    return {};\n}"
    },
    sampleTestCases: [
      { input: "3 9 20 null null 15 7", expectedOutput: "3\n9 20\n15 7" },
      { input: "1", expectedOutput: "1" }
    ],
    hiddenTestCases: [
      { input: "", expectedOutput: "" },
      { input: "1 2 null 3 null 4 null 5", expectedOutput: "1\n2\n3\n4\n5" }
    ]
  },
  {
    id: 'course-schedule',
    title: 'Course Schedule',
    difficulty: 'Medium',
    category: 'Graphs',
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'There are a total of numCourses you have to take. Some courses have prerequisites. Return true if you can finish all courses.',
    inputFormat: "Line 1: numCourses\nLine 2: N (number of prerequisites)\nNext N lines: course prereq",
    outputFormat: "true or false",
    constraints: ["1 <= numCourses <= 2000"],
    starterCode: {
      python: "def solution(numCourses, prerequisites):\n    return True",
      java: "class Solution {\n    public boolean solution(int numCourses, int[][] prerequisites) {\n        return true;\n    }\n}",
      cpp: "bool solution(int numCourses, vector<vector<int>>& prerequisites) {\n    return true;\n}"
    },
    sampleTestCases: [
      { input: "2\n1\n1 0", expectedOutput: "true" },
      { input: "2\n2\n1 0\n0 1", expectedOutput: "false" }
    ],
    hiddenTestCases: [
      { input: "3\n2\n1 0\n2 1", expectedOutput: "true" },
      { input: "1\n0", expectedOutput: "true" }
    ]
  },
  {
    id: 'lis',
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Find the length of the longest strictly increasing subsequence in an integer array.',
    inputFormat: "Line 1: Space-separated integers (nums)",
    outputFormat: "Length of LIS",
    constraints: ["1 <= nums.length <= 2500"],
    starterCode: {
      python: "def solution(nums):\n    return 0",
      java: "class Solution {\n    public int solution(int[] nums) {\n        return 0;\n    }\n}",
      cpp: "int solution(vector<int>& nums) {\n    return 0;\n}"
    },
    sampleTestCases: [
      { input: "10 9 2 5 3 7 101 18", expectedOutput: "4" },
      { input: "0 1 0 3 2 3", expectedOutput: "4" }
    ],
    hiddenTestCases: [
      { input: "7 7 7 7 7", expectedOutput: "1" },
      { input: "1 2 3 4 5", expectedOutput: "5" }
    ]
  }
];
