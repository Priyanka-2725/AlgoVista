
'use server';
/**
 * @fileOverview AI Resume Interview Evaluation Genkit Flow.
 * 
 * Evaluates candidate answers to resume-specific questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeEvalRequestSchema = z.object({
  question: z.string(),
  answer: z.string(),
  context: z.string().optional(),
});

export type ResumeEvalRequest = z.infer<typeof ResumeEvalRequestSchema>;

const ResumeEvalResponseSchema = z.object({
  score: z.number().min(0).max(10),
  feedback: z.string(),
  technicalDepth: z.enum(['Low', 'Medium', 'High', 'Expert']),
  suggestions: z.array(z.string()),
});

export type ResumeEvalResponse = z.infer<typeof ResumeEvalResponseSchema>;

const evalPrompt = ai.definePrompt({
  name: 'resumeEvalPrompt',
  input: { schema: ResumeEvalRequestSchema },
  output: { schema: ResumeEvalResponseSchema },
  prompt: `You are a Senior Software Engineer conducting a technical interview based on a candidate's projects.

QUESTION: {{{question}}}
CONTEXT: {{{context}}}
CANDIDATE ANSWER: {{{answer}}}

Evaluate the response based on:
1. Technical Correctness: Does the answer demonstrate a true understanding of the tech mentioned?
2. Depth: Did they provide specific details or just surface-level definitions?
3. Ownership: Do they sound like they actually built the project and made the decisions?

Provide a score from 0-10, feedback, and specific suggestions to make the answer more "Senior-level".`,
});

const resumeEvalFlow = ai.defineFlow(
  {
    name: 'resumeEvalFlow',
    inputSchema: ResumeEvalRequestSchema,
    outputSchema: ResumeEvalResponseSchema,
  },
  async (input) => {
    const { output } = await evalPrompt(input);
    return output!;
  }
);

export async function evaluateResumeAnswer(input: ResumeEvalRequest): Promise<ResumeEvalResponse> {
  return resumeEvalFlow(input);
}
