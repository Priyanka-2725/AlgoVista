
'use server';
/**
 * @fileOverview AI Resume Analysis Genkit Flow.
 * 
 * Parses a PDF resume and generates contextual interview questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResumeAnalysisInputSchema = z.object({
  pdfDataUri: z.string().describe("Base64 encoded PDF data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."),
});

export type ResumeAnalysisInput = z.infer<typeof ResumeAnalysisInputSchema>;

const ResumeAnalysisOutputSchema = z.object({
  summary: z.object({
    name: z.string().optional(),
    skills: z.array(z.string()),
    projects: z.array(z.object({
      title: z.string(),
      description: z.string(),
      tech: z.array(z.string())
    })),
  }),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    context: z.string().describe("Why this question was asked based on the resume (e.g. 'Follow-up on your Bookstore Project')"),
    difficulty: z.enum(['Easy', 'Medium', 'Hard'])
  }))
});

export type ResumeAnalysisOutput = z.infer<typeof ResumeAnalysisOutputSchema>;

const analysisPrompt = ai.definePrompt({
  name: 'resumeAnalysisPrompt',
  input: { schema: ResumeAnalysisInputSchema },
  output: { schema: ResumeAnalysisOutputSchema },
  prompt: `You are an elite Technical Recruiter and Senior Engineering Manager. 
Your task is to analyze the provided resume and prepare for a technical interview.

RESUME PDF: {{media url=pdfDataUri}}

INSTRUCTIONS:
1. Extract the candidate's name, core skills, and significant projects.
2. Generate 10 high-quality interview questions.
3. Questions must be specific to the projects and technologies mentioned.
4. Avoid generic questions like "Tell me about yourself". Instead, ask "I see you used Java + JDBC for your Bookstore app; how did you handle database connection pooling?"
5. Focus on:
   - Architectural decisions
   - Technology choices
   - Scalability challenges
   - Debugging and problem-solving examples within their projects.

Provide the output in the requested structured format.`,
});

const resumeAnalysisFlow = ai.defineFlow(
  {
    name: 'resumeAnalysisFlow',
    inputSchema: ResumeAnalysisInputSchema,
    outputSchema: ResumeAnalysisOutputSchema,
  },
  async (input) => {
    let lastError;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { output } = await analysisPrompt(input);
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

export async function analyzeResume(input: ResumeAnalysisInput): Promise<ResumeAnalysisOutput> {
  return resumeAnalysisFlow(input);
}
