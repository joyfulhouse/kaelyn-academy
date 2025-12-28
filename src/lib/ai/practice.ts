import { generateObject } from "ai";
import { z } from "zod";
import { getModelForCapability, type AIProvider } from "./providers";
import { sanitizeText } from "./pii-sanitizer";

export interface PracticeGenerationRequest {
  subject: string;
  gradeLevel: number;
  conceptName: string;
  difficultyLevel: number; // 1-10
  questionType: "multiple-choice" | "fill-in-blank" | "short-answer" | "true-false" | "matching";
  count: number;
  previousQuestions?: string[]; // Avoid duplicates
  preferredProvider?: AIProvider;
}

const multipleChoiceSchema = z.object({
  question: z.string().describe("The question text"),
  options: z.array(z.string()).length(4).describe("Four answer options (A, B, C, D)"),
  correctIndex: z.number().min(0).max(3).describe("Index of the correct answer (0-3)"),
  explanation: z.string().describe("Why the correct answer is right"),
  hint: z.string().describe("A helpful hint if the student is stuck"),
  difficulty: z.number().min(1).max(10).describe("Difficulty rating 1-10"),
});

const fillInBlankSchema = z.object({
  sentence: z.string().describe("The sentence with a blank represented as ___"),
  answer: z.string().describe("The correct answer for the blank"),
  acceptableAnswers: z.array(z.string()).describe("Other acceptable answers"),
  explanation: z.string().describe("Why this is the correct answer"),
  hint: z.string().describe("A helpful hint"),
  difficulty: z.number().min(1).max(10),
});

const shortAnswerSchema = z.object({
  question: z.string().describe("The question requiring a short answer"),
  sampleAnswer: z.string().describe("A model answer"),
  keyPoints: z.array(z.string()).describe("Key points that should be in a correct answer"),
  rubric: z.object({
    excellent: z.string().describe("What makes an excellent answer"),
    good: z.string().describe("What makes a good answer"),
    needsWork: z.string().describe("What indicates more work is needed"),
  }),
  hint: z.string(),
  difficulty: z.number().min(1).max(10),
});

const trueFalseSchema = z.object({
  statement: z.string().describe("The statement to evaluate"),
  isTrue: z.boolean().describe("Whether the statement is true"),
  explanation: z.string().describe("Why the statement is true or false"),
  hint: z.string(),
  difficulty: z.number().min(1).max(10),
});

const matchingSchema = z.object({
  instructions: z.string().describe("Instructions for the matching exercise"),
  leftColumn: z.array(z.string()).describe("Items on the left to match"),
  rightColumn: z.array(z.string()).describe("Items on the right to match to"),
  correctMatches: z.array(z.number()).describe("Index mapping: leftColumn[i] matches rightColumn[correctMatches[i]]"),
  explanation: z.string().describe("Explanation of the correct matches"),
  hint: z.string(),
  difficulty: z.number().min(1).max(10),
});

export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceSchema>;
export type FillInBlankQuestion = z.infer<typeof fillInBlankSchema>;
export type ShortAnswerQuestion = z.infer<typeof shortAnswerSchema>;
export type TrueFalseQuestion = z.infer<typeof trueFalseSchema>;
export type MatchingQuestion = z.infer<typeof matchingSchema>;

export type PracticeQuestion =
  | { type: "multiple-choice"; data: MultipleChoiceQuestion }
  | { type: "fill-in-blank"; data: FillInBlankQuestion }
  | { type: "short-answer"; data: ShortAnswerQuestion }
  | { type: "true-false"; data: TrueFalseQuestion }
  | { type: "matching"; data: MatchingQuestion };

function getGradeLevelDescription(grade: number): string {
  if (grade === 0) return "Kindergarten";
  if (grade <= 5) return `${grade}${["st", "nd", "rd"][grade - 1] || "th"} grade elementary`;
  if (grade <= 8) return `${grade}th grade middle school`;
  return `${grade}th grade high school`;
}

function buildGenerationPrompt(request: PracticeGenerationRequest): string {
  const gradeDesc = getGradeLevelDescription(request.gradeLevel);

  return `
Generate practice questions for a ${gradeDesc} student.

REQUIREMENTS:
- Subject: ${request.subject}
- Concept: ${request.conceptName}
- Difficulty: ${request.difficultyLevel}/10
- Question type: ${request.questionType}
- Number of questions: ${request.count}

${request.previousQuestions?.length ? `
AVOID THESE PREVIOUSLY USED QUESTIONS:
${request.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
` : ""}

GUIDELINES:
- Make questions age-appropriate for ${gradeDesc}
- Difficulty ${request.difficultyLevel}/10 means: ${getDifficultyDescription(request.difficultyLevel)}
- Include educational value - students should learn from both correct and incorrect attempts
- Hints should guide without giving away the answer
- Explanations should reinforce the concept being taught
- For younger grades (K-2): Use simple vocabulary, concrete examples
- For middle grades (3-5): Build on fundamentals, introduce some abstraction
- For upper grades (6-8): Include more complex scenarios
- For high school (9-12): Connect to real-world applications

Generate unique, engaging questions that test understanding of the concept.
`;
}

function getDifficultyDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: "Very basic recall, simple recognition",
    2: "Basic understanding, simple application",
    3: "Straightforward application of concepts",
    4: "Moderate application with some complexity",
    5: "Average difficulty, requires solid understanding",
    6: "Above average, requires good conceptual grasp",
    7: "Challenging, requires connecting multiple ideas",
    8: "Difficult, requires deep understanding",
    9: "Very challenging, requires analysis and synthesis",
    10: "Expert level, requires mastery and creative application",
  };
  return descriptions[level] || descriptions[5];
}

export async function generateMultipleChoiceQuestions(
  request: Omit<PracticeGenerationRequest, "questionType">
): Promise<MultipleChoiceQuestion[]> {
  const model = getModelForCapability("practice", request.preferredProvider);

  const questions: MultipleChoiceQuestion[] = [];

  for (let i = 0; i < request.count; i++) {
    const result = await generateObject({
      model,
      schema: multipleChoiceSchema,
      prompt: buildGenerationPrompt({ ...request, questionType: "multiple-choice", count: 1 }) +
        (questions.length > 0 ? `\n\nAlready generated: ${questions.map((q) => q.question).join("; ")}` : ""),
      temperature: 0.8,
    });
    questions.push(result.object);
  }

  return questions;
}

export async function generateFillInBlankQuestions(
  request: Omit<PracticeGenerationRequest, "questionType">
): Promise<FillInBlankQuestion[]> {
  const model = getModelForCapability("practice", request.preferredProvider);

  const questions: FillInBlankQuestion[] = [];

  for (let i = 0; i < request.count; i++) {
    const result = await generateObject({
      model,
      schema: fillInBlankSchema,
      prompt: buildGenerationPrompt({ ...request, questionType: "fill-in-blank", count: 1 }) +
        (questions.length > 0 ? `\n\nAlready generated: ${questions.map((q) => q.sentence).join("; ")}` : ""),
      temperature: 0.8,
    });
    questions.push(result.object);
  }

  return questions;
}

export async function generateTrueFalseQuestions(
  request: Omit<PracticeGenerationRequest, "questionType">
): Promise<TrueFalseQuestion[]> {
  const model = getModelForCapability("practice", request.preferredProvider);

  const questions: TrueFalseQuestion[] = [];

  for (let i = 0; i < request.count; i++) {
    const result = await generateObject({
      model,
      schema: trueFalseSchema,
      prompt: buildGenerationPrompt({ ...request, questionType: "true-false", count: 1 }) +
        (questions.length > 0 ? `\n\nAlready generated: ${questions.map((q) => q.statement).join("; ")}` : "") +
        `\n\nBalance: Include roughly equal true and false statements across the set.`,
      temperature: 0.8,
    });
    questions.push(result.object);
  }

  return questions;
}

export async function generateShortAnswerQuestions(
  request: Omit<PracticeGenerationRequest, "questionType">
): Promise<ShortAnswerQuestion[]> {
  const model = getModelForCapability("practice", request.preferredProvider);

  const questions: ShortAnswerQuestion[] = [];

  for (let i = 0; i < request.count; i++) {
    const result = await generateObject({
      model,
      schema: shortAnswerSchema,
      prompt: buildGenerationPrompt({ ...request, questionType: "short-answer", count: 1 }) +
        (questions.length > 0 ? `\n\nAlready generated: ${questions.map((q) => q.question).join("; ")}` : ""),
      temperature: 0.8,
    });
    questions.push(result.object);
  }

  return questions;
}

export async function generateMatchingQuestions(
  request: Omit<PracticeGenerationRequest, "questionType">
): Promise<MatchingQuestion[]> {
  const model = getModelForCapability("practice", request.preferredProvider);

  const questions: MatchingQuestion[] = [];

  for (let i = 0; i < request.count; i++) {
    const result = await generateObject({
      model,
      schema: matchingSchema,
      prompt: buildGenerationPrompt({ ...request, questionType: "matching", count: 1 }) +
        `\n\nGenerate a matching exercise with 4-6 items to match.` +
        (questions.length > 0 ? `\n\nAlready generated topics: ${questions.map((q) => q.instructions).join("; ")}` : ""),
      temperature: 0.8,
    });
    questions.push(result.object);
  }

  return questions;
}

// Unified generation function
export async function generatePracticeQuestions(
  request: PracticeGenerationRequest
): Promise<PracticeQuestion[]> {
  switch (request.questionType) {
    case "multiple-choice": {
      const questions = await generateMultipleChoiceQuestions(request);
      return questions.map((data) => ({ type: "multiple-choice" as const, data }));
    }
    case "fill-in-blank": {
      const questions = await generateFillInBlankQuestions(request);
      return questions.map((data) => ({ type: "fill-in-blank" as const, data }));
    }
    case "true-false": {
      const questions = await generateTrueFalseQuestions(request);
      return questions.map((data) => ({ type: "true-false" as const, data }));
    }
    case "short-answer": {
      const questions = await generateShortAnswerQuestions(request);
      return questions.map((data) => ({ type: "short-answer" as const, data }));
    }
    case "matching": {
      const questions = await generateMatchingQuestions(request);
      return questions.map((data) => ({ type: "matching" as const, data }));
    }
  }
}

// Grade a short answer response
export async function gradeShortAnswer(
  question: ShortAnswerQuestion,
  studentAnswer: string,
  gradeLevel: number,
  preferredProvider?: AIProvider
): Promise<{
  score: number; // 0-100
  feedback: string;
  keyPointsHit: string[];
  keyPointsMissed: string[];
  suggestions: string;
}> {
  const model = getModelForCapability("practice", preferredProvider);

  const gradeSchema = z.object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
    keyPointsHit: z.array(z.string()),
    keyPointsMissed: z.array(z.string()),
    suggestions: z.string(),
  });

  // SECURITY: Sanitize student answer for PII before sending to AI
  const sanitizedAnswer = sanitizeText(studentAnswer);

  const result = await generateObject({
    model,
    schema: gradeSchema,
    prompt: `
Grade this ${getGradeLevelDescription(gradeLevel)} student's answer.

QUESTION: ${question.question}
MODEL ANSWER: ${question.sampleAnswer}
KEY POINTS EXPECTED: ${question.keyPoints.join(", ")}
STUDENT'S ANSWER: ${sanitizedAnswer}

GRADING RUBRIC:
- Excellent (90-100): ${question.rubric.excellent}
- Good (70-89): ${question.rubric.good}
- Needs Work (0-69): ${question.rubric.needsWork}

Grade fairly but encouragingly. Recognize partial understanding.
For younger students, focus more on effort and understanding than perfect answers.
`,
    temperature: 0.3,
  });

  return result.object;
}
