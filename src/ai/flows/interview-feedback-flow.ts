'use server';
/**
 * @fileOverview AI Interview Feedback Genkit Flow.
 * 
 * Provides professional critique on technical approach and code efficiency.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterviewFeedbackRequestSchema = z.object({
  problemTitle: z.string(),
  problemDescription: z.string(),
  userCode: z.string(),
  language: z.string(),
  resultStatus: z.string(), // e.g. "Accepted", "Wrong Answer"
});

export type InterviewFeedbackRequest = z.infer<typeof InterviewFeedbackRequestSchema>;

const InterviewFeedbackResponseSchema = z.object({
  summary: z.string().describe('A high-level summary of the interview performance.'),
  technicalCritique: z.string().describe('Detailed feedback on time/space complexity and logic.'),
  behavioralTip: z.string().describe('Tips on how to explain this approach during a real interview.'),
  mockScore: z.number().min(0).max(100).describe('A simulated score from 0 to 100.'),
});

export type InterviewFeedbackResponse = z.infer<typeof InterviewFeedbackResponseSchema>;

const feedbackPrompt = ai.definePrompt({
  name: 'interviewFeedbackPrompt',
  input: { schema: InterviewFeedbackRequestSchema },
  output: { schema: InterviewFeedbackResponseSchema },
  prompt: `You are an elite Senior Software Engineer at a Big Tech company conducting a technical interview.
You are evaluating a candidate's solution to the following problem:

PROBLEM: {{{problemTitle}}}
DESCRIPTION: {{{problemDescription}}}

CANDIDATE'S CODE ({{{language}}}):
\`\`\`{{{language}}}
{{{userCode}}}
\`\`\`

EXECUTION VERDICT: {{{resultStatus}}}

Evaluate the performance based on:
1. Correctness: Did the code pass? (Even if it passed, could it be better?)
2. Efficiency: Is the time and space complexity optimal?
3. Code Quality: Is it readable and maintainable?
4. Interview Presence: How should the candidate have communicated this approach?

Provide a constructive, professional critique and a score from 0 to 100.`,
});

const interviewFeedbackFlow = ai.defineFlow(
  {
    name: 'interviewFeedbackFlow',
    inputSchema: InterviewFeedbackRequestSchema,
    outputSchema: InterviewFeedbackResponseSchema,
  },
  async (input) => {
    let lastError;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { output } = await feedbackPrompt(input);
        return output!;
      } catch (e: any) {
        lastError = e;
        const errMsg = String(e).toLowerCase();
        // Catch 503, 429, and other temporary service unavailability strings
        if (errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('unavailable') || errMsg.includes('high demand')) {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
    throw lastError;
  }
);

export async function getInterviewFeedback(input: InterviewFeedbackRequest): Promise<InterviewFeedbackResponse> {
  return interviewFeedbackFlow(input);
}
