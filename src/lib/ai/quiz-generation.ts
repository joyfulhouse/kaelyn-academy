/**
 * AI Quiz Generation System
 * Generates quiz questions for lessons using AI
 */

import { generateObject } from "ai";
import { z } from "zod";
import { getModelForCapability, type AIProvider } from "./providers";
import type { QuizConfig, Question, QuestionType } from "../assessment/types";

/**
 * Request parameters for quiz generation
 */
export interface QuizGenerationRequest {
  lessonId: string;
  lessonTitle: string;
  lessonDescription: string;
  subject: string;
  gradeLevel: number;
  /** Learning objectives to test (optional) */
  objectives?: string[];
  /** Number of questions to generate (default: 5) */
  questionCount?: number;
  /** Question types to include (default: all types) */
  questionTypes?: QuestionType[];
  /** Difficulty level 1-10 (default: 5) */
  difficulty?: number;
  /** Preferred AI provider */
  preferredProvider?: AIProvider;
}

/**
 * Result of quiz generation
 */
export interface QuizGenerationResult {
  quiz: QuizConfig;
  generatedAt: Date;
  provider: string;
  tokensUsed?: number;
}

// Zod schema for a generated question
const questionSchema = z.object({
  type: z.enum(["multiple_choice", "true_false", "fill_blank", "matching", "ordering"]),
  question: z.string().describe("The question text, appropriate for the grade level"),
  hint: z.string().optional().describe("A helpful hint without giving away the answer"),
  options: z.array(z.string()).optional().describe("Options for multiple choice (4 items), items to order, or left side of matching"),
  matchTargets: z.array(z.string()).optional().describe("Right side targets for matching questions only"),
  correctAnswer: z.union([
    z.string(),
    z.array(z.string()),
  ]).describe("The correct answer - string for single answer, array for matching/ordering"),
  explanation: z.string().describe("Educational explanation of why the answer is correct"),
  points: z.number().min(5).max(25).describe("Points for this question (5-25 based on complexity)"),
});

const quizSchema = z.object({
  title: z.string().describe("Engaging quiz title"),
  instructions: z.string().describe("Brief, age-appropriate instructions"),
  questions: z.array(questionSchema).describe("Quiz questions"),
});

type GeneratedQuiz = z.infer<typeof quizSchema>;

/**
 * Get grade level description for prompts
 */
function getGradeLevelDescription(grade: number): string {
  if (grade === 0) return "Kindergarten (ages 5-6)";
  if (grade === 1) return "1st grade (ages 6-7)";
  if (grade === 2) return "2nd grade (ages 7-8)";
  if (grade <= 5) return `${grade}rd grade elementary (ages ${grade + 5}-${grade + 6})`;
  if (grade <= 8) return `${grade}th grade middle school (ages ${grade + 5}-${grade + 6})`;
  return `${grade}th grade high school (ages ${grade + 5}-${grade + 6})`;
}

/**
 * Get age-appropriate language guidelines
 */
function getLanguageGuidelines(grade: number): string {
  if (grade <= 2) {
    return `
- Use very simple words and short sentences
- Include emojis to make questions engaging
- Use concrete examples (apples, toys, animals)
- Keep questions to 1-2 sentences maximum
- For matching/ordering, use only 3-4 items`;
  }
  if (grade <= 5) {
    return `
- Use clear, straightforward language
- Include real-world examples students can relate to
- Questions can be 2-3 sentences
- For matching/ordering, use 4-5 items
- Can include some educational vocabulary with context`;
  }
  if (grade <= 8) {
    return `
- Use grade-appropriate vocabulary
- Include scenarios and applications
- Questions can be more complex with multiple parts
- For matching/ordering, use 4-6 items
- Include some technical terms appropriate to the subject`;
  }
  return `
- Use academic language appropriate for high school
- Include complex scenarios and real-world applications
- Questions can involve analysis and synthesis
- For matching/ordering, use 5-6 items
- Include subject-specific terminology`;
}

/**
 * Get question type instructions
 */
function getQuestionTypeInstructions(types: QuestionType[]): string {
  const instructions: string[] = [];

  if (types.includes("multiple_choice")) {
    instructions.push(`
MULTIPLE CHOICE:
- Provide exactly 4 options
- Only one option should be correct
- Make distractors plausible but clearly wrong
- Avoid "all of the above" or "none of the above"`);
  }

  if (types.includes("true_false")) {
    instructions.push(`
TRUE/FALSE:
- Statement should be clearly true or false
- Avoid tricky wording
- Test actual understanding, not reading comprehension
- Options array should be ["True", "False"]`);
  }

  if (types.includes("fill_blank")) {
    instructions.push(`
FILL IN THE BLANK:
- Use ___ to indicate the blank
- The blank should test a key concept
- Correct answer should be a single word or short phrase
- No options array needed for this type`);
  }

  if (types.includes("matching")) {
    instructions.push(`
MATCHING:
- Provide items in 'options' array (left side)
- Provide corresponding targets in 'matchTargets' array (right side)
- correctAnswer should be the matchTargets in order that matches options
- Example: if options=["A", "B"] and they match to ["2", "1"], correctAnswer=["2", "1"]`);
  }

  if (types.includes("ordering")) {
    instructions.push(`
ORDERING:
- Provide items to order in 'options' array (shuffled)
- correctAnswer should be the items in correct order
- Make the correct order educationally meaningful
- Examples: chronological order, smallest to largest, steps in a process`);
  }

  return instructions.join("\n");
}

/**
 * Build the generation prompt
 */
function buildQuizPrompt(request: QuizGenerationRequest): string {
  const gradeDesc = getGradeLevelDescription(request.gradeLevel);
  const langGuidelines = getLanguageGuidelines(request.gradeLevel);
  const questionTypes = request.questionTypes ?? [
    "multiple_choice",
    "true_false",
    "fill_blank",
    "matching",
    "ordering",
  ];
  const typeInstructions = getQuestionTypeInstructions(questionTypes);
  const difficulty = request.difficulty ?? 5;

  return `
Generate a quiz for the following lesson:

LESSON INFORMATION:
- ID: ${request.lessonId}
- Title: ${request.lessonTitle}
- Description: ${request.lessonDescription}
- Subject: ${request.subject}
- Grade Level: ${gradeDesc}
- Difficulty: ${difficulty}/10
${request.objectives?.length ? `- Learning Objectives:\n  ${request.objectives.map((o, i) => `${i + 1}. ${o}`).join("\n  ")}` : ""}

REQUIREMENTS:
- Generate exactly ${request.questionCount ?? 5} questions
- Include a mix of these question types: ${questionTypes.join(", ")}
- Each question should test understanding of the lesson content
- Include educational explanations that reinforce learning

LANGUAGE GUIDELINES for ${gradeDesc}:
${langGuidelines}

QUESTION TYPE FORMATS:
${typeInstructions}

IMPORTANT:
- All questions must be factually accurate
- Questions should progress from easier to harder
- Each question should test a different aspect of the lesson
- Explanations should be encouraging and educational
- Points should be 10 for basic questions, 15-20 for complex ones, 25 for very challenging

Generate an engaging, age-appropriate quiz that effectively tests the lesson content.
`;
}

/**
 * Generate a quiz for a lesson using AI
 */
export async function generateQuizForLesson(
  request: QuizGenerationRequest
): Promise<QuizGenerationResult> {
  const model = getModelForCapability("practice", request.preferredProvider);

  const questionCount = request.questionCount ?? 5;
  const questionTypes = request.questionTypes ?? [
    "multiple_choice",
    "true_false",
    "fill_blank",
    "matching",
    "ordering",
  ];

  // Adjust schema for the specific number of questions
  const adjustedSchema = z.object({
    title: z.string(),
    instructions: z.string(),
    questions: z.array(questionSchema).min(questionCount).max(questionCount + 1),
  });

  const result = await generateObject({
    model,
    schema: adjustedSchema,
    prompt: buildQuizPrompt(request),
    temperature: 0.7,
  });

  const generated = result.object as GeneratedQuiz;

  // Transform to QuizConfig format
  const questions: Question[] = generated.questions.slice(0, questionCount).map((q, index) => ({
    id: `q${index + 1}`,
    type: q.type,
    question: q.question,
    hint: q.hint,
    options: q.options,
    matchTargets: q.matchTargets,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    points: q.points,
  }));

  const quiz: QuizConfig = {
    id: `${request.lessonId}-quiz`,
    title: generated.title,
    instructions: generated.instructions,
    questions,
    passingScore: 70,
    showExplanations: true,
    allowRetry: true,
    shuffleQuestions: request.gradeLevel >= 3, // Only shuffle for older students
    shuffleOptions: request.gradeLevel >= 3,
  };

  return {
    quiz,
    generatedAt: new Date(),
    provider: request.preferredProvider ?? "default",
    tokensUsed: result.usage?.totalTokens,
  };
}

/**
 * Generate quizzes for multiple lessons in parallel (with rate limiting)
 */
export async function generateQuizzesForLessons(
  requests: QuizGenerationRequest[],
  options?: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<Map<string, QuizGenerationResult>> {
  const results = new Map<string, QuizGenerationResult>();
  const concurrency = options?.concurrency ?? 3;

  // Process in batches to avoid rate limiting
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (request) => {
        try {
          const result = await generateQuizForLesson(request);
          return { lessonId: request.lessonId, result };
        } catch (error) {
          console.error(`Failed to generate quiz for ${request.lessonId}:`, error);
          return { lessonId: request.lessonId, result: null };
        }
      })
    );

    for (const { lessonId, result } of batchResults) {
      if (result) {
        results.set(lessonId, result);
      }
    }

    options?.onProgress?.(Math.min(i + concurrency, requests.length), requests.length);

    // Small delay between batches to avoid rate limiting
    if (i + concurrency < requests.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Validate a generated quiz for quality
 */
export function validateQuiz(quiz: QuizConfig): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!quiz.id) issues.push("Missing quiz ID");
  if (!quiz.title) issues.push("Missing quiz title");
  if (!quiz.questions?.length) issues.push("No questions in quiz");

  for (const q of quiz.questions ?? []) {
    if (!q.question) {
      issues.push(`Question ${q.id}: Missing question text`);
    }

    if (!q.correctAnswer) {
      issues.push(`Question ${q.id}: Missing correct answer`);
    }

    switch (q.type) {
      case "multiple_choice":
        if (!q.options || q.options.length !== 4) {
          issues.push(`Question ${q.id}: Multiple choice should have exactly 4 options`);
        }
        if (q.options && !q.options.includes(String(q.correctAnswer))) {
          issues.push(`Question ${q.id}: Correct answer not in options`);
        }
        break;

      case "true_false":
        if (!q.options || !["True", "False"].every((o) => q.options?.includes(o))) {
          issues.push(`Question ${q.id}: True/false should have ["True", "False"] options`);
        }
        break;

      case "matching":
        if (!q.matchTargets?.length) {
          issues.push(`Question ${q.id}: Matching question missing matchTargets`);
        }
        if (q.options?.length !== q.matchTargets?.length) {
          issues.push(`Question ${q.id}: Matching options and targets should have same length`);
        }
        break;

      case "ordering":
        if (!Array.isArray(q.correctAnswer)) {
          issues.push(`Question ${q.id}: Ordering correctAnswer should be an array`);
        }
        break;
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Convert generated quiz to the format used in quiz-data.ts
 */
export function quizToDataFormat(quiz: QuizConfig): string {
  const questionsStr = quiz.questions
    .map((q) => {
      const parts = [
        `      {`,
        `        id: "${q.id}",`,
        `        type: "${q.type}",`,
        `        question: ${JSON.stringify(q.question)},`,
      ];

      if (q.options) {
        parts.push(`        options: ${JSON.stringify(q.options)},`);
      }
      if (q.matchTargets) {
        parts.push(`        matchTargets: ${JSON.stringify(q.matchTargets)},`);
      }
      parts.push(`        correctAnswer: ${JSON.stringify(q.correctAnswer)},`);
      if (q.explanation) {
        parts.push(`        explanation: ${JSON.stringify(q.explanation)},`);
      }
      parts.push(`        points: ${q.points ?? 10},`);
      parts.push(`      },`);

      return parts.join("\n");
    })
    .join("\n");

  return `  "${quiz.id.replace("-quiz", "")}": {
    id: "${quiz.id}",
    title: ${JSON.stringify(quiz.title)},
    instructions: ${JSON.stringify(quiz.instructions)},
    passingScore: ${quiz.passingScore ?? 70},
    showExplanations: ${quiz.showExplanations ?? true},
    allowRetry: ${quiz.allowRetry ?? true},
    questions: [
${questionsStr}
    ],
  },`;
}
