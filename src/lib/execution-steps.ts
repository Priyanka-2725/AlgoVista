
export interface ExecutionStep {
  line: number;
  description: string;
  variables: Record<string, any>;
  highlights: number[]; // indices in the array to highlight
  array: any[];
}

export interface ProblemExecution {
  code: string;
  language: string;
  steps: ExecutionStep[];
}

export const EXECUTION_DATA: Record<string, ProblemExecution> = {
  'two-sum': {
    language: 'python',
    code: `def twoSum(nums, target):
    prevMap = {} # val : index
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prevMap:
            return [prevMap[diff], i]
        prevMap[n] = i
    return`,
    steps: [
      { line: 1, description: "Initialize an empty hash map to store visited numbers and their indices.", variables: { prevMap: "{}" }, highlights: [], array: [2, 7, 11, 15] },
      { line: 2, description: "Iterate through the array. i = 0, value = 2.", variables: { i: 0, n: 2, prevMap: "{}" }, highlights: [0], array: [2, 7, 11, 15] },
      { line: 3, description: "Calculate the required complement: 9 - 2 = 7.", variables: { i: 0, n: 2, diff: 7, prevMap: "{}" }, highlights: [0], array: [2, 7, 11, 15] },
      { line: 4, description: "Check if 7 exists in our visited map. It doesn't.", variables: { i: 0, n: 2, diff: 7, prevMap: "{}" }, highlights: [0], array: [2, 7, 11, 15] },
      { line: 6, description: "Add 2 to the map with its index 0.", variables: { i: 0, n: 2, prevMap: "{2: 0}" }, highlights: [0], array: [2, 7, 11, 15] },
      { line: 2, description: "Next iteration. i = 1, value = 7.", variables: { i: 1, n: 7, prevMap: "{2: 0}" }, highlights: [1], array: [2, 7, 11, 15] },
      { line: 3, description: "Calculate complement: 9 - 7 = 2.", variables: { i: 1, n: 7, diff: 2, prevMap: "{2: 0}" }, highlights: [1], array: [2, 7, 11, 15] },
      { line: 4, description: "Check if 2 exists in our map. YES! It is at index 0.", variables: { i: 1, n: 7, diff: 2, prevMap: "{2: 0}" }, highlights: [0, 1], array: [2, 7, 11, 15] },
      { line: 5, description: "Target found. Return the pair of indices [0, 1].", variables: { i: 1, n: 7, result: "[0, 1]" }, highlights: [0, 1], array: [2, 7, 11, 15] }
    ]
  },
  'binary-search': {
    language: 'python',
    code: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] > target:
            r = m - 1
        elif nums[m] < target:
            l = m + 1
        else:
            return m
    return -1`,
    steps: [
      { line: 1, description: "Set boundaries. Left at index 0, Right at index 7.", variables: { l: 0, r: 7, target: 60 }, highlights: [0, 7], array: [10, 20, 30, 40, 50, 60, 70, 80] },
      { line: 3, description: "Find middle index: (0 + 7) // 2 = 3.", variables: { l: 0, r: 7, m: 3, target: 60 }, highlights: [3], array: [10, 20, 30, 40, 50, 60, 70, 80] },
      { line: 6, description: "Value 40 < 60. Target must be in the right half.", variables: { l: 0, r: 7, m: 3, target: 60 }, highlights: [3], array: [10, 20, 30, 40, 50, 60, 70, 80] },
      { line: 7, description: "Move Left pointer to m + 1 (index 4).", variables: { l: 4, r: 7, m: 3, target: 60 }, highlights: [4, 7], array: [10, 20, 30, 40, 50, 60, 70, 80] },
      { line: 3, description: "Next iteration. Mid = (4 + 7) // 2 = 5.", variables: { l: 4, r: 7, m: 5, target: 60 }, highlights: [5], array: [10, 20, 30, 40, 50, 60, 70, 80] },
      { line: 8, description: "Check if nums[5] == 60. YES!", variables: { l: 4, r: 7, m: 5, target: 60 }, highlights: [5], array: [10, 20, 30, 40, 50, 60, 70, 80] },
      { line: 9, description: "Return index 5.", variables: { result: 5 }, highlights: [5], array: [10, 20, 30, 40, 50, 60, 70, 80] }
    ]
  }
};
