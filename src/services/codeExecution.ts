'use server';

import { TestCase } from '@/features/learning/components/ProblemList';
import { normalizeOutput } from '@/lib/utils/normalize-output';

interface PistonResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

export type ExecutionStatus = 
  | 'Accepted' 
  | 'Wrong Answer' 
  | 'Time Limit Exceeded' 
  | 'Runtime Error' 
  | 'Internal Error' 
  | 'Compilation Error';

export interface TestResult {
  testCaseIndex: number;
  status: ExecutionStatus;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  time?: number;
  error?: string;
}

const LANGUAGE_CONFIG: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'cpp', version: '10.2.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.0' },
};

// Priority list of Piston API mirrors
const JUDGE_ENDPOINTS = [
  'https://piston.engineer/api/v2/execute',
  'https://emkc.org/api/v2/piston/execute',
  'https://piston.any.do/api/v2/execute'
];

/**
 * Utility to add delay between API calls to avoid rate limits.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes user code against a single test case using the Piston API with fallback logic.
 */
async function executeSingleTestCase(
  code: string,
  language: string,
  testCase: TestCase,
  index: number
): Promise<TestResult> {
  const config = LANGUAGE_CONFIG[language] || { language, version: '*' };

  // Java Wrapper: Ensure class is named Main for Piston compatibility
  let finalCode = code;
  if (language === 'java') {
    finalCode = code.replace(/class\s+\w+/, 'public class Main');
  }

  const fileName = language === 'java' ? 'Main.java' : 'solution';

  // Use strictly isolated headers to prevent 401/403 errors in cloud environments
  const cleanHeaders = new Headers();
  cleanHeaders.append('Content-Type', 'application/json');
  cleanHeaders.append('User-Agent', 'AlgoVista-Judge/2.0');
  cleanHeaders.append('Accept', 'application/json');

  for (const endpoint of JUDGE_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: cleanHeaders,
        body: JSON.stringify({
          language: config.language,
          version: config.version,
          files: [{ 
            name: fileName, 
            content: finalCode 
          }],
          stdin: testCase.input,
          run_timeout: 5000, // 5s timeout
        }),
        credentials: 'omit',
        cache: 'no-store',
        next: { revalidate: 0 } 
      });

      if (!response.ok) {
        console.warn(`[Judge] Mirror ${endpoint} rejected with status ${response.status}`);
        continue;
      }

      const data: PistonResponse = await response.json();

      if (data.run.signal === 'SIGKILL' || data.run.signal === 'SIGTERM') {
        return {
          testCaseIndex: index,
          status: 'Time Limit Exceeded',
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          time: 5000,
        };
      }

      if (data.run.code !== 0) {
        const errorMsg = data.run.stderr.toLowerCase();
        const isCompileError = errorMsg.includes('error:') || errorMsg.includes('compilation') || data.run.code === 127;
        
        return {
          testCaseIndex: index,
          status: isCompileError ? 'Compilation Error' : 'Runtime Error',
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: data.run.stdout,
          error: data.run.stderr || data.run.output,
          time: 0,
        };
      }

      const normalizedActual = normalizeOutput(data.run.stdout);
      const normalizedExpected = normalizeOutput(testCase.expectedOutput);

      return {
        testCaseIndex: index,
        status: normalizedActual === normalizedExpected ? 'Accepted' : 'Wrong Answer',
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: data.run.stdout,
        time: 0,
      };
    } catch (error: any) {
      console.error(`[Judge] Connection error for mirror ${endpoint}`);
    }
  }

  throw new Error('All mirrors unreachable');
}

/**
 * Centralized Evaluation Logic.
 * Test cases are run sequentially with a delay to avoid rate-limiting.
 */
export async function evaluateSubmission(
  code: string,
  language: string,
  testCases: TestCase[]
) {
  const results: TestResult[] = [];
  
  for (let i = 0; i < testCases.length; i++) {
    try {
      // Add a small delay between requests to be gentle on the API
      if (i > 0) await sleep(300);
      
      const result = await executeSingleTestCase(code, language, testCases[i], i);
      results.push(result);
      
      if (result.status !== 'Accepted') break;
    } catch (error) {
      return {
        status: 'Internal Error' as ExecutionStatus,
        totalTestCases: testCases.length,
        passedCount: results.length,
        results: results,
        errorMessage: "Communication with judge cluster failed across all mirrors. This usually happens when cloud IP ranges are rate-limited. Please try again in 30 seconds."
      };
    }
  }

  const passedCount = results.filter((r) => r.status === 'Accepted').length;
  const isAccepted = passedCount === testCases.length && results.length === testCases.length;
  
  const finalStatus = isAccepted 
    ? 'Accepted' 
    : (results.find(r => r.status !== 'Accepted')?.status || 'Wrong Answer');

  return {
    status: finalStatus as ExecutionStatus,
    totalTestCases: testCases.length,
    passedCount,
    results,
    averageTime: 0,
  };
}
