'use server';
/**
 * @fileOverview Actionable AI Mentor Genkit Flow.
 * 
 * Provides context-aware guidance based on user performance data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MentorRequestSchema = z.object({
  type: z.enum(['hint', 'review', 'recommendation', 'coaching']),
  code: z.string().optional(),
  problemTitle: z.string().optional(),
  problemDescription: z.string().optional(),
  language: z.string().optional(),
  userContext: z.object({
    weakCategories: z.array(z.string()).optional(),
    xp: z.number().optional(),
    problemsSolved: z.number().optional(),
    streak: z.number().optional(),
    accuracy: z.number().optional(),
    pendingTasks: z.array(z.string()).optional()
  }).optional(),
});

export type MentorRequest = z.infer<typeof MentorRequestSchema>;

const MentorActionSchema = z.object({
  label: z.string().describe('Short button text for the action.'),
  link: z.string().describe('Internal platform route (e.g. /learn/concept/id, /todo, /battles/practice).'),
});

const MentorResponseSchema = z.object({
  message: z.string().describe('The markdown response from the AI mentor.'),
  suggestedActions: z.array(MentorActionSchema).describe('Clickable next steps for the user.'),
  topicFocus: z.string().optional().describe('The primary domain being addressed.'),
});

export type MentorResponse = z.infer<typeof MentorResponseSchema>;

// Internal schema for prompt logic
const MentorPromptInputSchema = MentorRequestSchema.extend({
  isHint: z.boolean(),
  isReview: z.boolean(),
  isCoaching: z.boolean(),
});

const mentorPrompt = ai.definePrompt({
  name: 'aiMentorPrompt',
  input: { schema: MentorPromptInputSchema },
  output: { schema: MentorResponseSchema },
  prompt: `You are the Elite AI Mentor for Algo Vista. Your goal is to provide high-signal, data-driven coaching.

MISSION TYPE: {{{type}}}

{{#if userContext}}
USER INTELLIGENCE:
- Weak Topics: {{#each userContext.weakCategories}}{{{this}}}, {{/each}}
- Accuracy: {{{userContext.accuracy}}}%
- Current Streak: {{{userContext.streak}}} days
- Pending Missions: {{#each userContext.pendingTasks}} - {{{this}}}{{/each}}
{{/if}}

{{#if problemTitle}}
CURRENT ARENA:
Title: {{{problemTitle}}}
Description: {{{problemDescription}}}
{{/if}}

{{#if code}}
USER LOGIC ({{{language}}}):
\`\`\`{{{language}}}
{{{code}}}
\`\`\`
{{/if}}

INSTRUCTIONS:
1. Be concise and actionable. No generic "practice more" advice.
2. If the user is weak in a topic, suggest a specific sub-topic module.
3. Use the user's "Pending Missions" to nudge them toward completion.
4. Always provide 1-3 suggestedActions. Use these routes:
   - /learn/concept/:id (Mastery modules)
   - /todo (Mission log)
   - /battles/practice (DSA sets)
   - /interview/mock (Arena)

{{#if isHint}}
- Provide a conceptual push. Focus on the 'why' not the 'what'.
- No code snippets.
{{/if}}

{{#if isReview}}
- Analyze time/space complexity.
- Identify logical bottlenecks or anti-patterns.
{{/if}}

{{#if isCoaching}}
- Look at the Weak Topics and Accuracy.
- Create a 2-step plan to stabilize their performance.
- Use a motivational, strategic tone.
{{/if}}

Respond in clean markdown.`,
});

const aiMentorFlow = ai.defineFlow(
  {
    name: 'aiMentorFlow',
    inputSchema: MentorRequestSchema,
    outputSchema: MentorResponseSchema,
  },
  async (input) => {
    let lastError;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { output } = await mentorPrompt({
          ...input,
          isHint: input.type === 'hint',
          isReview: input.type === 'review',
          isCoaching: input.type === 'coaching' || input.type === 'recommendation',
        });
        return output!;
      } catch (e: any) {
        lastError = e;
        const errMsg = String(e).toLowerCase();
        if (errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('unavailable') || errMsg.includes('high demand')) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
    throw lastError;
  }
);

export async function getMentorAdvice(input: MentorRequest): Promise<MentorResponse> {
  return aiMentorFlow(input);
}
