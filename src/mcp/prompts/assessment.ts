/**
 * Assessment Prompts for MCP Server
 *
 * Provides prompt templates for assessment and evaluation.
 *
 * @module mcp/prompts/assessment
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register assessment prompts with the MCP server
 */
export function registerAssessmentPrompts(server: McpServer): void {
  // Generate quiz prompt
  server.prompt(
    "assessment:generate-quiz",
    "Generate a quiz for a topic",
    {
      topic: z.string().describe("The topic to create a quiz for"),
      gradeLevel: z.number().min(0).max(12).describe("Grade level (0=K)"),
      questionCount: z.number().min(1).max(20).default(5).describe("Number of questions"),
      questionTypes: z.array(z.enum(["multiple_choice", "true_false", "short_answer", "fill_blank"])).optional().describe("Types of questions to include"),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium").describe("Difficulty level"),
      focusAreas: z.array(z.string()).optional().describe("Specific areas within the topic to focus on"),
    },
    async ({ topic, gradeLevel, questionCount, questionTypes, difficulty, focusAreas }) => {
      const types = questionTypes?.join(", ") || "multiple choice";
      const gradeDescriptor =
        gradeLevel <= 2 ? "K-2nd grade" :
        gradeLevel <= 5 ? "3rd-5th grade" :
        gradeLevel <= 8 ? "6th-8th grade" :
        "9th-12th grade";

      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Create a ${difficulty} difficulty quiz about "${topic}" for ${gradeDescriptor} students.

Requirements:
- ${questionCount} questions
- Question types: ${types}
${focusAreas?.length ? `- Focus on: ${focusAreas.join(", ")}` : ""}

For each question provide:
1. The question text
2. Answer options (for multiple choice/true-false)
3. The correct answer
4. A brief explanation of why it's correct
5. A hint for students who are stuck

Format as JSON with this structure:
{
  "quiz": {
    "topic": "${topic}",
    "gradeLevel": ${gradeLevel},
    "difficulty": "${difficulty}",
    "questions": [
      {
        "id": 1,
        "type": "multiple_choice",
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "...",
        "hint": "..."
      }
    ]
  }
}

Generate the quiz:`,
            },
          },
        ],
      };
    }
  );

  // Evaluate response prompt
  server.prompt(
    "assessment:evaluate-response",
    "Evaluate a student's response to a question",
    {
      question: z.string().describe("The question that was asked"),
      correctAnswer: z.string().describe("The expected correct answer"),
      studentResponse: z.string().describe("What the student answered"),
      gradeLevel: z.number().min(0).max(12).describe("Student's grade level"),
      rubric: z.string().optional().describe("Grading rubric or criteria"),
    },
    async ({ question, correctAnswer, studentResponse, gradeLevel, rubric }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Evaluate this grade ${gradeLevel} student's response:

Question: ${question}
Expected answer: ${correctAnswer}
Student's response: ${studentResponse}

${rubric ? `Grading criteria: ${rubric}` : ""}

Provide:
1. Whether the answer is correct, partially correct, or incorrect
2. A score from 0-100
3. Specific, constructive feedback
4. What the student did well
5. What could be improved
6. A follow-up hint if the answer was wrong

Be encouraging and age-appropriate. Never make the student feel bad.

Format as JSON:
{
  "evaluation": {
    "status": "correct" | "partial" | "incorrect",
    "score": 0-100,
    "feedback": "...",
    "strengths": ["..."],
    "improvements": ["..."],
    "hint": "..." (only if incorrect)
  }
}

Evaluate:`,
            },
          },
        ],
      };
    }
  );

  // Generate practice problems prompt
  server.prompt(
    "assessment:practice-problems",
    "Generate practice problems for a skill",
    {
      skill: z.string().describe("The skill to practice"),
      gradeLevel: z.number().min(0).max(12).describe("Grade level"),
      currentLevel: z.enum(["beginner", "intermediate", "advanced"]).describe("Student's current level"),
      count: z.number().min(1).max(10).default(5).describe("Number of problems"),
      includeWorkedExamples: z.boolean().default(true).describe("Include worked examples"),
    },
    async ({ skill, gradeLevel, currentLevel, count, includeWorkedExamples }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate ${count} practice problems for a ${currentLevel} grade ${gradeLevel} student learning "${skill}".

Requirements:
- Problems should progress in difficulty
- Each problem should have a clear answer
${includeWorkedExamples ? "- Include 1 fully worked example first" : ""}
- Match the student's grade level

Format as JSON:
{
  "skill": "${skill}",
  ${includeWorkedExamples ? `"workedExample": {
    "problem": "...",
    "steps": ["step 1", "step 2", ...],
    "answer": "..."
  },` : ""}
  "problems": [
    {
      "id": 1,
      "difficulty": "easy" | "medium" | "hard",
      "problem": "...",
      "answer": "...",
      "hint": "..."
    }
  ]
}

Generate the problems:`,
            },
          },
        ],
      };
    }
  );

  // Analyze misconceptions prompt
  server.prompt(
    "assessment:analyze-misconceptions",
    "Analyze common misconceptions from student responses",
    {
      topic: z.string().describe("The topic being assessed"),
      responses: z.array(z.object({
        question: z.string(),
        studentAnswer: z.string(),
        isCorrect: z.boolean(),
      })).describe("Array of student responses"),
      gradeLevel: z.number().min(0).max(12).describe("Grade level"),
    },
    async ({ topic, responses, gradeLevel }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze these grade ${gradeLevel} student responses about "${topic}" to identify misconceptions:

${JSON.stringify(responses, null, 2)}

Provide:
1. Identified misconceptions (patterns in wrong answers)
2. Root causes of each misconception
3. Recommended interventions for each
4. Suggested follow-up questions to address gaps

Format as JSON:
{
  "topic": "${topic}",
  "analysis": {
    "overallPerformance": "strong" | "moderate" | "needs-support",
    "correctRate": 0-100,
    "misconceptions": [
      {
        "description": "...",
        "evidence": ["..."],
        "rootCause": "...",
        "intervention": "...",
        "followUpQuestions": ["..."]
      }
    ],
    "strengths": ["..."],
    "recommendedFocus": ["..."]
  }
}

Analyze:`,
            },
          },
        ],
      };
    }
  );

  // Adaptive difficulty prompt
  server.prompt(
    "assessment:adaptive-difficulty",
    "Recommend difficulty adjustment based on performance",
    {
      subject: z.string().describe("Subject area"),
      recentScores: z.array(z.number()).describe("Recent quiz/activity scores (0-100)"),
      currentDifficulty: z.enum(["easy", "medium", "hard"]).describe("Current difficulty setting"),
      streakInfo: z.object({
        currentStreak: z.number(),
        recentFailures: z.number(),
      }).optional().describe("Streak and failure information"),
      gradeLevel: z.number().min(0).max(12).describe("Grade level"),
    },
    async ({ subject, recentScores, currentDifficulty, streakInfo, gradeLevel }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze this grade ${gradeLevel} student's performance in ${subject} and recommend difficulty adjustment:

Recent scores: ${recentScores.join(", ")}
Current difficulty: ${currentDifficulty}
${streakInfo ? `Current streak: ${streakInfo.currentStreak}, Recent failures: ${streakInfo.recentFailures}` : ""}

Consider:
1. Score trends (improving, declining, stable)
2. Consistency of performance
3. Risk of frustration vs. boredom
4. Zone of proximal development

Format as JSON:
{
  "analysis": {
    "averageScore": number,
    "trend": "improving" | "declining" | "stable",
    "consistency": "high" | "medium" | "low",
    "recommendation": "decrease" | "maintain" | "increase",
    "newDifficulty": "easy" | "medium" | "hard",
    "reasoning": "...",
    "encouragement": "..." (message for the student)
  }
}

Analyze and recommend:`,
            },
          },
        ],
      };
    }
  );
}
