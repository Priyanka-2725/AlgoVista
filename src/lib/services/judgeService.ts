'use client';
import { TestCase, Problem } from '@/features/learning/components/ProblemList';
import { evaluateSubmission, ExecutionStatus, TestResult as ExecutionTestResult } from '@/services/codeExecution';

export interface TestResult extends ExecutionTestResult {}

export interface SubmissionResult {
  status: ExecutionStatus;
  totalTestCases: number;
  passedCount: number;
  results: TestResult[];
  averageTime?: number;
  maxMemory?: number;
  errorMessage?: string;
}

/**
 * Unified Online Judge Service (OJS)
 * Central entry point for all code executions in Sprint Battles, Contests, and Practice.
 */
export const submitCodeToJudge = async (
  code: string,
  language: string,
  problem: Problem,
  mode: 'run' | 'submit'
): Promise<SubmissionResult> => {
  // Select test cases based on mode
  const testCases = mode === 'run' ? problem.sampleTestCases : problem.hiddenTestCases;
  
  if (!testCases || testCases.length === 0) {
    console.warn(`[Judge] No test cases found for problem ${problem.id} in ${mode} mode.`);
    return {
      status: 'Internal Error',
      totalTestCases: 0,
      passedCount: 0,
      results: [],
      errorMessage: "Test cases missing for this problem."
    };
  }

  try {
    const result = await evaluateSubmission(code, language, testCases);
    
    return {
      ...result,
      status: result.status as ExecutionStatus,
      maxMemory: Math.random() * 10 + 5, // Simulated memory usage for now
    };
  } catch (error: any) {
    console.error("[Judge] Execution pipeline crashed:", error);
    return {
      status: 'Internal Error',
      totalTestCases: testCases.length,
      passedCount: 0,
      results: [],
      errorMessage: error.message || "Judgment pipeline failure."
    };
  }
};
