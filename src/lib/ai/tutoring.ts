import { streamText, generateText } from "ai";
import { getModelForCapability, type AIProvider } from "./providers";

export interface TutoringContext {
  learnerId: string;
  learnerName: string;
  gradeLevel: number;
  subject: string;
  topic: string;
  conceptName: string;
  previousMessages?: Array<{ role: "user" | "assistant"; content: string }>;
  masteryLevel?: number; // 0-100
  preferredProvider?: AIProvider;
}

function getGradeLevelDescription(grade: number): string {
  if (grade === 0) return "Kindergarten (age 5-6)";
  if (grade <= 2) return `${grade}${grade === 1 ? "st" : "nd"} grade (age ${grade + 5}-${grade + 6})`;
  if (grade === 3) return "3rd grade (age 8-9)";
  return `${grade}th grade (age ${grade + 5}-${grade + 6})`;
}

function buildTutoringSystemPrompt(context: TutoringContext): string {
  const gradeDesc = getGradeLevelDescription(context.gradeLevel);

  return `You are a friendly, encouraging tutor for Kaelyn's Academy, helping ${context.learnerName} learn.

STUDENT PROFILE:
- Name: ${context.learnerName}
- Grade Level: ${gradeDesc}
- Subject: ${context.subject}
- Current Topic: ${context.topic}
- Concept: ${context.conceptName}
${context.masteryLevel !== undefined ? `- Current Mastery: ${context.masteryLevel}%` : ""}

TUTORING GUIDELINES:
1. Use age-appropriate language and examples for a ${gradeDesc} student
2. Be encouraging and positive - celebrate small wins
3. Break complex concepts into smaller, digestible pieces
4. Use real-world examples relevant to a student this age
5. Ask guiding questions rather than giving answers directly (Socratic method)
6. If the student is struggling, try a different explanation approach
7. For younger students (K-2): Use simple words, lots of encouragement, fun examples
8. For middle grades (3-5): Build on prior knowledge, use relatable scenarios
9. For upper grades (6-8): Introduce more abstract concepts gradually
10. For high school (9-12): Connect to real-world applications and future relevance

RESPONSE FORMAT:
- Keep responses concise and focused
- Use markdown formatting when helpful
- Include visual descriptions when explaining spatial or complex concepts
- For math: Show step-by-step work when solving problems
- End with a question or activity to keep the student engaged

Remember: You're not just teaching facts - you're building confidence and curiosity!`;
}

export async function streamTutoringResponse(
  context: TutoringContext,
  userMessage: string
) {
  const model = getModelForCapability("tutoring", context.preferredProvider);

  const messages = [
    ...(context.previousMessages ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  return streamText({
    model,
    system: buildTutoringSystemPrompt(context),
    messages,
    temperature: 0.7,
    maxOutputTokens: 1024,
  });
}

export async function generateTutoringResponse(
  context: TutoringContext,
  userMessage: string
): Promise<string> {
  const model = getModelForCapability("tutoring", context.preferredProvider);

  const messages = [
    ...(context.previousMessages ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const result = await generateText({
    model,
    system: buildTutoringSystemPrompt(context),
    messages,
    temperature: 0.7,
    maxOutputTokens: 1024,
  });

  return result.text;
}

export interface HintRequest {
  context: TutoringContext;
  question: string;
  studentAnswer?: string;
  hintLevel: 1 | 2 | 3; // 1 = subtle, 2 = moderate, 3 = direct
}

export async function generateHint(request: HintRequest): Promise<string> {
  const model = getModelForCapability("tutoring", request.context.preferredProvider);

  const hintDescriptions = {
    1: "Give a very subtle hint that points in the right direction without revealing the answer",
    2: "Give a moderate hint that narrows down the approach but still requires thinking",
    3: "Give a direct hint that clearly explains the next step without giving the final answer",
  };

  const prompt = `
The student is working on this question: "${request.question}"
${request.studentAnswer ? `Their current answer attempt: "${request.studentAnswer}"` : "They haven't answered yet."}

${hintDescriptions[request.hintLevel]}

Keep the hint age-appropriate for ${getGradeLevelDescription(request.context.gradeLevel)}.
Be encouraging and maintain the student's confidence.
`;

  const result = await generateText({
    model,
    system: buildTutoringSystemPrompt(request.context),
    prompt,
    temperature: 0.7,
    maxOutputTokens: 256,
  });

  return result.text;
}

export interface ExplanationRequest {
  context: TutoringContext;
  concept: string;
  style: "visual" | "story" | "step-by-step" | "analogy";
}

export async function generateExplanation(request: ExplanationRequest): Promise<string> {
  const model = getModelForCapability("tutoring", request.context.preferredProvider);

  const styleInstructions = {
    visual: "Explain using vivid visual imagery and descriptions. Help the student 'see' the concept in their mind.",
    story: "Explain through a short, engaging story or narrative that demonstrates the concept.",
    "step-by-step": "Break down the concept into clear, numbered steps. Make each step simple and build on the previous.",
    analogy: "Use relatable analogies and comparisons to everyday things the student would understand.",
  };

  const prompt = `
Explain the concept of "${request.concept}" to ${request.context.learnerName}.

Style: ${styleInstructions[request.style]}

Remember this is for a ${getGradeLevelDescription(request.context.gradeLevel)} student.
Keep it engaging, clear, and age-appropriate.
`;

  const result = await generateText({
    model,
    system: buildTutoringSystemPrompt(request.context),
    prompt,
    temperature: 0.8,
    maxOutputTokens: 512,
  });

  return result.text;
}
