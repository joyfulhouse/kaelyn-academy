/**
 * Tutoring Prompts for MCP Server
 *
 * Provides prompt templates for AI tutoring interactions.
 *
 * @module mcp/prompts/tutoring
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register tutoring prompts with the MCP server
 */
export function registerTutoringPrompts(server: McpServer): void {
  // Explain concept prompt
  server.prompt(
    "tutoring:explain-concept",
    "Generate an age-appropriate explanation of a concept",
    {
      concept: z.string().describe("The concept to explain"),
      gradeLevel: z.number().min(0).max(12).describe("Student's grade level (0=K)"),
      context: z.string().optional().describe("Additional context about what the student is learning"),
      learningStyle: z.enum(["visual", "auditory", "kinesthetic", "reading"]).optional().describe("Preferred learning style"),
    },
    async ({ concept, gradeLevel, context, learningStyle }) => {
      const gradeDescriptor =
        gradeLevel <= 2 ? "young child (ages 5-7)" :
        gradeLevel <= 5 ? "elementary student (ages 8-10)" :
        gradeLevel <= 8 ? "middle schooler (ages 11-13)" :
        "high school student (ages 14-18)";

      const styleGuidance = learningStyle
        ? `The student prefers ${learningStyle} learning, so ${
            learningStyle === "visual" ? "include diagrams, charts, or visual descriptions" :
            learningStyle === "auditory" ? "explain as if speaking aloud, use rhythm and patterns" :
            learningStyle === "kinesthetic" ? "include hands-on activities or physical examples" :
            "provide clear written explanations with key terms highlighted"
          }.`
        : "";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `You are a patient, encouraging tutor for Kaelyn's Academy.

Explain the concept of "${concept}" to a ${gradeDescriptor}.

${context ? `Context: ${context}` : ""}

${styleGuidance}

Guidelines:
- Use age-appropriate language and examples
- Be encouraging and positive
- Break down complex ideas into simple steps
- Use analogies the student can relate to
- End with a simple check for understanding

Provide your explanation now:`,
            },
          },
        ],
      };
    }
  );

  // Help with stuck student prompt
  server.prompt(
    "tutoring:help-stuck-student",
    "Help a student who is stuck on a problem",
    {
      problem: z.string().describe("The problem the student is working on"),
      studentAttempt: z.string().optional().describe("What the student has tried so far"),
      gradeLevel: z.number().min(0).max(12).describe("Student's grade level"),
      hintLevel: z.number().min(1).max(4).default(1).describe("How much help to provide (1=subtle hint, 4=direct guidance)"),
    },
    async ({ problem, studentAttempt, gradeLevel, hintLevel }) => {
      const helpLevel =
        hintLevel === 1 ? "Give a very subtle hint without revealing the answer. Ask a guiding question." :
        hintLevel === 2 ? "Provide a moderate hint that points them in the right direction." :
        hintLevel === 3 ? "Give a strong hint that breaks down the problem into smaller steps." :
        "Provide step-by-step guidance while still encouraging the student to think.";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `You are a supportive tutor helping a grade ${gradeLevel} student who is stuck.

Problem: ${problem}

${studentAttempt ? `What they've tried: ${studentAttempt}` : "They haven't started yet."}

Your task: ${helpLevel}

Important:
- Never make the student feel bad for being stuck
- Celebrate what they've done correctly
- Use encouraging language
- Guide them to discover the answer themselves
- Match your language to their grade level

Provide your response:`,
            },
          },
        ],
      };
    }
  );

  // Socratic questioning prompt
  server.prompt(
    "tutoring:socratic-dialogue",
    "Engage in Socratic dialogue to deepen understanding",
    {
      topic: z.string().describe("The topic to explore"),
      currentUnderstanding: z.string().describe("What the student currently understands"),
      gradeLevel: z.number().min(0).max(12).describe("Student's grade level"),
    },
    async ({ topic, currentUnderstanding, gradeLevel }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `You are a thoughtful tutor using the Socratic method with a grade ${gradeLevel} student.

Topic: ${topic}
Current understanding: ${currentUnderstanding}

Use questions to:
1. Probe their current understanding
2. Identify any misconceptions gently
3. Guide them to deeper insights
4. Connect to things they already know

Ask 1-2 thought-provoking questions that are appropriate for their grade level. Be encouraging and curious.

Your questions:`,
            },
          },
        ],
      };
    }
  );

  // Encourage and motivate prompt
  server.prompt(
    "tutoring:encourage",
    "Provide encouragement and motivation to a student",
    {
      situation: z.string().describe("The current situation (e.g., 'just failed a quiz', 'struggling with math')"),
      gradeLevel: z.number().min(0).max(12).describe("Student's grade level"),
      achievements: z.array(z.string()).optional().describe("Recent achievements to reference"),
    },
    async ({ situation, gradeLevel, achievements }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `You are a warm, supportive tutor helping a grade ${gradeLevel} student who needs encouragement.

Situation: ${situation}

${achievements?.length ? `Their recent achievements: ${achievements.join(", ")}` : ""}

Provide a brief, genuine message of encouragement that:
- Acknowledges their feelings
- Reminds them of their capabilities
- Gives them a concrete next step
- Uses age-appropriate language

Your message:`,
            },
          },
        ],
      };
    }
  );

  // Personalized learning path prompt
  server.prompt(
    "tutoring:learning-path",
    "Suggest a personalized learning path",
    {
      currentLevel: z.string().describe("Current mastery level and skills"),
      goals: z.string().describe("Learning goals"),
      interests: z.array(z.string()).optional().describe("Student's interests"),
      gradeLevel: z.number().min(0).max(12).describe("Student's grade level"),
    },
    async ({ currentLevel, goals, interests, gradeLevel }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `You are an educational advisor creating a personalized learning path for a grade ${gradeLevel} student.

Current level: ${currentLevel}
Goals: ${goals}
${interests?.length ? `Interests: ${interests.join(", ")}` : ""}

Create a clear, encouraging learning path that:
1. Starts from their current level
2. Builds progressively toward their goals
3. Incorporates their interests where possible
4. Includes 3-5 concrete next steps
5. Sets realistic expectations

Learning path:`,
            },
          },
        ],
      };
    }
  );
}
