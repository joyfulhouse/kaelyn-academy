import { AxGen } from "@ax-llm/ax";
import { createAxAI, type AIProvider, type ModelTier } from "../index";

// Input/Output types for the tutoring agent
export interface TutoringInput {
  learnerName: string;
  gradeLevel: number;
  subject: string;
  topic: string;
  conceptName: string;
  masteryLevel: number;
  studentMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface TutoringOutput {
  response: string;
  suggestedActivity?: string;
  difficultyAdjustment: "easier" | "maintain" | "harder";
  confidence: number;
  encouragement: string;
}

function getGradeLevelDescription(grade: number): string {
  if (grade === 0) return "Kindergarten (age 5-6)";
  if (grade <= 2) return `${grade}${grade === 1 ? "st" : "nd"} grade (age ${grade + 5}-${grade + 6})`;
  if (grade === 3) return "3rd grade (age 8-9)";
  return `${grade}th grade (age ${grade + 5}-${grade + 6})`;
}

// Create the signature string for tutoring
function createTutoringSignature(gradeDesc: string): string {
  return `"You are a friendly tutor for ${gradeDesc} students. Be encouraging, use age-appropriate language, and guide with questions rather than direct answers."
learnerName:string, gradeLevel:number, subject:string, topic:string, conceptName:string, masteryLevel:number, studentMessage:string, conversationContext?:string ->
response:string "Educational response tailored to the student",
suggestedActivity?:string "Optional hands-on activity",
difficultyAdjustment:class "easier, maintain, harder" "Whether to adjust difficulty",
confidence:number "0-100 confidence in explanation",
encouragement:string "Positive encouragement"`;
}

export class TutoringAgent {
  private provider: AIProvider;
  private tier: ModelTier;

  constructor(provider: AIProvider = "anthropic", tier: ModelTier = "balanced") {
    this.provider = provider;
    this.tier = tier;
  }

  async respond(input: TutoringInput): Promise<TutoringOutput> {
    const ai = createAxAI(this.provider, this.tier);
    const gradeDesc = getGradeLevelDescription(input.gradeLevel);

    // Format conversation history as context
    const conversationContext = input.conversationHistory
      ? input.conversationHistory
          .slice(-5)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n")
      : "";

    const gen = new AxGen<
      {
        learnerName: string;
        gradeLevel: number;
        subject: string;
        topic: string;
        conceptName: string;
        masteryLevel: number;
        studentMessage: string;
        conversationContext?: string;
      },
      {
        response: string;
        suggestedActivity?: string;
        difficultyAdjustment: string;
        confidence: number;
        encouragement: string;
      }
    >(createTutoringSignature(gradeDesc));

    const result = await gen.forward(ai, {
      learnerName: input.learnerName,
      gradeLevel: input.gradeLevel,
      subject: input.subject,
      topic: input.topic,
      conceptName: input.conceptName,
      masteryLevel: input.masteryLevel,
      studentMessage: input.studentMessage,
      conversationContext: conversationContext || undefined,
    });

    return {
      response: result.response,
      suggestedActivity: result.suggestedActivity,
      difficultyAdjustment: (result.difficultyAdjustment || "maintain") as TutoringOutput["difficultyAdjustment"],
      confidence: typeof result.confidence === "number" ? result.confidence : 80,
      encouragement: result.encouragement || "Great job!",
    };
  }

  /**
   * Generate a hint for the student
   */
  async generateHint(
    input: TutoringInput,
    question: string,
    studentAnswer: string | undefined,
    hintLevel: 1 | 2 | 3
  ): Promise<string> {
    const ai = createAxAI(this.provider, this.tier);
    const gradeDesc = getGradeLevelDescription(input.gradeLevel);

    const hintDescriptions = {
      1: "subtle hint pointing in the right direction",
      2: "moderate hint narrowing down the approach",
      3: "direct hint explaining the next step",
    };

    const signature = `"Provide a ${hintDescriptions[hintLevel]} for a ${gradeDesc} student"
question:string, studentAnswer?:string, gradeLevel:number -> hint:string "Helpful hint"`;

    const gen = new AxGen<
      { question: string; studentAnswer?: string; gradeLevel: number },
      { hint: string }
    >(signature);

    const result = await gen.forward(ai, {
      question,
      studentAnswer,
      gradeLevel: input.gradeLevel,
    });

    return result.hint;
  }

  /**
   * Generate an explanation in a specific style
   */
  async generateExplanation(
    input: TutoringInput,
    concept: string,
    style: "visual" | "story" | "step-by-step" | "analogy"
  ): Promise<string> {
    const ai = createAxAI(this.provider, this.tier);
    const gradeDesc = getGradeLevelDescription(input.gradeLevel);

    const styleInstructions = {
      visual: "using vivid visual imagery",
      story: "through a short engaging story",
      "step-by-step": "in clear numbered steps",
      analogy: "using relatable everyday analogies",
    };

    const signature = `"Explain concept ${styleInstructions[style]} for a ${gradeDesc} student"
concept:string, gradeLevel:number -> explanation:string "Clear explanation"`;

    const gen = new AxGen<
      { concept: string; gradeLevel: number },
      { explanation: string }
    >(signature);

    const result = await gen.forward(ai, {
      concept,
      gradeLevel: input.gradeLevel,
    });

    return result.explanation;
  }
}
