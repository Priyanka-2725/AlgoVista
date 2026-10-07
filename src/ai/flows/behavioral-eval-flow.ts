'use server';
/**
 * @fileOverview AI Behavioral Evaluation Genkit Flow.
 * 
 * Analyzes HR interview responses for clarity, structure, and relevance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BehavioralEvalRequestSchema = z.object({
  question: z.string().describe('The HR/Behavioral question asked.'),
  answer: z.string().describe('The user’s provided answer.'),
});

export type BehavioralEvalRequest = z.infer<typeof BehavioralEvalRequestSchema>;

const BehavioralEvalResponseSchema = z.object({
  score: z.object({
    clarity: z.number().min(0).max(10).describe('How clear and easy to understand the answer is.'),
    structure: z.number().min(0).max(10).describe('How well the answer follows patterns like STAR (Situation, Task, Action, Result).'),
    relevance: z.number().min(0).max(10).describe('How well the answer addresses the specific question asked.'),
  }),
  feedback: z.string().describe('A concise summary of the answer quality.'),
  suggestions: z.array(z.string()).describe('List of specific ways to improve the answer.'),
});

export type BehavioralEvalResponse = z.infer<typeof BehavioralEvalResponseSchema>;

const evalPrompt = ai.definePrompt({
  name: 'behavioralEvalPrompt',
  input: { schema: BehavioralEvalRequestSchema },
  output: { schema: BehavioralEvalResponseSchema },
  prompt: `You are an expert HR Interviewer and Communication Coach. 
You are evaluating a candidate's response to a behavioral interview question.

QUESTION: {{{question}}}
CANDIDATE ANSWER: {{{answer}}}

Evaluate the response based on:
1. CLARITY: Is the language professional? Is it concise?
2. STRUCTURE: Does it follow the STAR (Situation, Task, Action, Result) method? Is there a clear beginning, middle, and end?
3. RELEVANCE: Does it actually answer the question asked?

Provide a score from 0 to 10 for each category, a summary feedback, and 2-3 specific suggestions for improvement.
Be encouraging but critically honest to help the candidate grow.`,
});

const behavioralEvalFlow = ai.defineFlow(
  {
    name: 'behavioralEvalFlow',
    inputSchema: BehavioralEvalRequestSchema,
    outputSchema: BehavioralEvalResponseSchema,
  },
  async (input) => {
    let lastError;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { output } = await evalPrompt(input);
        return output!;
      } catch (e: any) {
        lastError = e;
        const errMsg = String(e).toLowerCase();
        if (errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('unavailable')) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
    throw lastError;
  }
);

export async function evaluateBehavioralResponse(input: BehavioralEvalRequest): Promise<BehavioralEvalResponse> {
  return behavioralEvalFlow(input);
}
