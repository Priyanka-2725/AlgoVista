
'use server';
/**
 * @fileOverview AI Interview Replay Critique Genkit Flow.
 * 
 * Analyzes the chronological snapshots of a coding session to provide behavioral feedback.
 */




const ReplaySnapshotSchema = z.object({
  timestamp: z.number().describe('Milliseconds since session start.'),
  codeLength: z.number(),
  event: z.string().optional(),
});

const ReplayCritiqueRequestSchema = z.object({
  problemTitle: z.string(),
  finalCode: z.string(),
  timeline: z.array(ReplaySnapshotSchema),
  language: z.string(),
});

export type ReplayCritiqueRequest = z.infer<typeof ReplayCritiqueRequestSchema>;

const ReplayCritiqueResponseSchema = z.object({
  behavioralInsights: z.array(z.object({
    timestamp: z.number(),
    label: z.string().describe('Short label like "Stagnation" or "Refactor Cycle"'),
    message: z.string().describe('Detailed observation of what happened here.'),
    severity: z.enum(['Low', 'Medium', 'High']),
  })),
  summary: z.string().describe('Overall critique of the solving process.'),
  timeEfficiencyScore: z.number().min(0).max(100),
  stagnationPoints: z.array(z.string()).describe('List of specific moments where the user got stuck.'),
});

export type ReplayCritiqueResponse = z.infer<typeof ReplayCritiqueResponseSchema>;

const critiquePrompt = ai.definePrompt({
  name: 'interviewReplayCritiquePrompt',
  input: { schema: ReplayCritiqueRequestSchema },
  output: { schema: ReplayCritiqueResponseSchema },
  prompt: `You are an elite Senior Engineering Manager analyzing a candidate's solve process.
Instead of looking just at the final code, you are analyzing the TIMELINE of their typing and decisions.

PROBLEM: {{{problemTitle}}}
LANGUAGE: {{{language}}}

TIMELINE DATA:
{{#each timeline}}
- Time: {{timestamp}}ms | Code Length: {{codeLength}} | Event: {{#if event}}{{event}}{{else}}Typing{{/if}}
{{/each}}

FINAL SOLUTION:
\`\`\`{{{language}}}
{{{finalCode}}}
\`\`\`

INSTRUCTIONS:
1. Identify "Stagnation Points": Where did the user stop typing for more than 2 minutes?
2. Identify "Refactor Cycles": Did the code length drastically decrease then increase? This indicates a change in strategy.
3. Identify "Hesitation": Small deletions and re-typing of the same logic.
4. Provide Behavioral Insights: Connect these moments to technical interview soft skills (e.g., "Good recovery after getting stuck").
5. Score Time Efficiency: High score if the timeline is steady, low if there are massive gaps.

Provide constructive, professional feedback that helps the candidate improve their solving flow.`,
});

export async function getReplayCritique(input: ReplayCritiqueRequest): Promise<ReplayCritiqueResponse> {
  const { output } = await critiquePrompt(input);
  return output!;
}
