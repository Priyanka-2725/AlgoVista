'use server';
/**
 * @fileOverview AI Concept Explanation Genkit Flow.
 * 
 * Provides simplified explanations and real-world examples for CS concepts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ConceptRequestSchema = z.object({
  concept: z.string().describe('The CS concept or question to explain.'),
  type: z.enum(['simple', 'example', 'evaluate']),
  userAnswer: z.string().optional().describe('User provided answer for evaluation.'),
});

export type ConceptRequest = z.infer<typeof ConceptRequestSchema>;

const ConceptResponseSchema = z.object({
  explanation: z.string().describe('The AI generated explanation or evaluation.'),
  score: z.number().optional().describe('Evaluation score from 0-10 if type is evaluate.'),
  keyTakeaways: z.array(z.string()).optional(),
});

export type ConceptResponse = z.infer<typeof ConceptResponseSchema>;

// Internal schema for prompt logic
const ConceptPromptInputSchema = ConceptRequestSchema.extend({
  isSimple: z.boolean(),
  isExample: z.boolean(),
  isEvaluate: z.boolean(),
});

const conceptPrompt = ai.definePrompt({
  name: 'conceptExplanationPrompt',
  input: { schema: ConceptPromptInputSchema },
  output: { schema: ConceptResponseSchema },
  prompt: `You are an elite Computer Science Professor and Technical Interviewer. 

CONCEPT: {{{concept}}}

{{#if userAnswer}}
USER ANSWER FOR EVALUATION:
{{{userAnswer}}}
{{/if}}

INSTRUCTIONS:
{{#if isSimple}}
- Explain this concept in very simple terms (ELIs5).
- Use analogies where possible.
- Focus on the "Why" and "How".
{{/if}}

{{#if isExample}}
- Provide 2 real-world engineering examples where this concept is applied.
- Be specific about technologies (e.g., "This is how Redis handles...").
{{/if}}

{{#if isEvaluate}}
- Compare the User Answer against the technical definition of the Concept.
- Grade it out of 10.
- Provide constructive feedback on what is missing or incorrect.
{{/if}}

Respond in clean markdown.`,
});

const conceptExplanationFlow = ai.defineFlow(
  {
    name: 'conceptExplanationFlow',
    inputSchema: ConceptRequestSchema,
    outputSchema: ConceptResponseSchema,
  },
  async (input) => {
    let lastError;
    // 5 attempts with exponential backoff
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { output } = await conceptPrompt({
          ...input,
          isSimple: input.type === 'simple',
          isExample: input.type === 'example',
          isEvaluate: input.type === 'evaluate',
        });
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

export async function getConceptExplanation(input: ConceptRequest): Promise<ConceptResponse> {
  return conceptExplanationFlow(input);
}
