import { AxGen } from "@ax-llm/ax";
import { createAxAI, type AIProvider, type ModelTier } from "../index";

export interface PracticeInput {
  subject: string;
  gradeLevel: number;
  conceptName: string;
  difficultyLevel: number; // 1-10
  questionType: "multiple-choice" | "fill-in-blank" | "short-answer" | "true-false" | "matching";
  count: number;
  previousQuestions?: string[];
  learnerWeaknesses?: string[];
}

export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  difficulty: number;
}

export interface FillInBlankQuestion {
  sentence: string;
  answer: string;
  acceptableAnswers: string[];
  explanation: string;
  hint: string;
  difficulty: number;
}

export interface TrueFalseQuestion {
  statement: string;
  isTrue: boolean;
  explanation: string;
  hint: string;
  difficulty: number;
}

export interface ShortAnswerQuestion {
  question: string;
  sampleAnswer: string;
  keyPoints: string[];
  hint: string;
  difficulty: number;
}

export interface MatchingQuestion {
  instructions: string;
  leftColumn: string[];
  rightColumn: string[];
  correctMatches: number[];
  explanation: string;
  hint: string;
  difficulty: number;
}

export type PracticeQuestion =
  | { type: "multiple-choice"; data: MultipleChoiceQuestion }
  | { type: "fill-in-blank"; data: FillInBlankQuestion }
  | { type: "true-false"; data: TrueFalseQuestion }
  | { type: "short-answer"; data: ShortAnswerQuestion }
  | { type: "matching"; data: MatchingQuestion };

export interface PracticeOutput {
  questions: PracticeQuestion[];
  pedagogicalRationale: string;
  targetedWeaknesses: string[];
}

function getGradeLevelDescription(grade: number): string {
  if (grade === 0) return "Kindergarten";
  if (grade <= 5) return `${grade}${["st", "nd", "rd"][grade - 1] || "th"} grade elementary`;
  if (grade <= 8) return `${grade}th grade middle school`;
  return `${grade}th grade high school`;
}

// Signature templates for each question type
const MULTIPLE_CHOICE_SIG = (gradeDesc: string, difficulty: number) =>
  `"Create a ${gradeDesc} level multiple choice question at difficulty ${difficulty}/10. Make it educational and age-appropriate."
subject:string, concept:string, avoidQuestions?:string ->
question:string "The question",
optionA:string "Option A",
optionB:string "Option B",
optionC:string "Option C",
optionD:string "Option D",
correctOption:class "A, B, C, D" "Correct answer",
explanation:string "Why correct",
hint:string "Helpful hint"`;

const TRUE_FALSE_SIG = (gradeDesc: string, difficulty: number) =>
  `"Create a ${gradeDesc} level true/false question at difficulty ${difficulty}/10."
subject:string, concept:string, avoidQuestions?:string ->
statement:string "Statement to evaluate",
isTrue:boolean "Whether true",
explanation:string "Why true/false",
hint:string "Helpful hint"`;

const FILL_BLANK_SIG = (gradeDesc: string, difficulty: number) =>
  `"Create a ${gradeDesc} level fill-in-the-blank at difficulty ${difficulty}/10. Use ___ for the blank."
subject:string, concept:string, avoidQuestions?:string ->
sentence:string "Sentence with ___",
answer:string "Correct answer",
alternateAnswers:string "Comma-separated alternates",
explanation:string "Why correct",
hint:string "Helpful hint"`;

const SHORT_ANSWER_SIG = (gradeDesc: string, difficulty: number) =>
  `"Create a ${gradeDesc} level short answer question at difficulty ${difficulty}/10."
subject:string, concept:string, avoidQuestions?:string ->
question:string "The question",
sampleAnswer:string "Model answer",
keyPoints:string "Comma-separated key points",
hint:string "Helpful hint"`;

export class PracticeGeneratorAgent {
  private provider: AIProvider;
  private tier: ModelTier;

  constructor(provider: AIProvider = "anthropic", tier: ModelTier = "balanced") {
    this.provider = provider;
    this.tier = tier;
  }

  async generate(input: PracticeInput): Promise<PracticeOutput> {
    const questions: PracticeQuestion[] = [];
    const gradeDescription = getGradeLevelDescription(input.gradeLevel);
    const avoidQuestions = input.previousQuestions?.join("; ");

    for (let i = 0; i < input.count; i++) {
      const ai = createAxAI(this.provider, this.tier);

      const alreadyGenerated = questions.map((q) => {
        switch (q.type) {
          case "multiple-choice": return q.data.question;
          case "true-false": return q.data.statement;
          case "fill-in-blank": return q.data.sentence;
          case "short-answer": return q.data.question;
          case "matching": return q.data.instructions;
        }
      });

      const combinedAvoid = [...(avoidQuestions ? [avoidQuestions] : []), ...alreadyGenerated].join("; ") || undefined;

      switch (input.questionType) {
        case "multiple-choice": {
          const gen = new AxGen<
            { subject: string; concept: string; avoidQuestions?: string },
            { question: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: string; explanation: string; hint: string }
          >(MULTIPLE_CHOICE_SIG(gradeDescription, input.difficultyLevel));

          const result = await gen.forward(ai, {
            subject: input.subject,
            concept: input.conceptName,
            avoidQuestions: combinedAvoid,
          });

          const optionMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
          questions.push({
            type: "multiple-choice",
            data: {
              question: result.question,
              options: [result.optionA, result.optionB, result.optionC, result.optionD],
              correctIndex: optionMap[result.correctOption] ?? 0,
              explanation: result.explanation,
              hint: result.hint,
              difficulty: input.difficultyLevel,
            },
          });
          break;
        }

        case "true-false": {
          const gen = new AxGen<
            { subject: string; concept: string; avoidQuestions?: string },
            { statement: string; isTrue: boolean; explanation: string; hint: string }
          >(TRUE_FALSE_SIG(gradeDescription, input.difficultyLevel));

          const result = await gen.forward(ai, {
            subject: input.subject,
            concept: input.conceptName,
            avoidQuestions: combinedAvoid,
          });

          questions.push({
            type: "true-false",
            data: {
              statement: result.statement,
              isTrue: result.isTrue === true,
              explanation: result.explanation,
              hint: result.hint,
              difficulty: input.difficultyLevel,
            },
          });
          break;
        }

        case "fill-in-blank": {
          const gen = new AxGen<
            { subject: string; concept: string; avoidQuestions?: string },
            { sentence: string; answer: string; alternateAnswers: string; explanation: string; hint: string }
          >(FILL_BLANK_SIG(gradeDescription, input.difficultyLevel));

          const result = await gen.forward(ai, {
            subject: input.subject,
            concept: input.conceptName,
            avoidQuestions: combinedAvoid,
          });

          questions.push({
            type: "fill-in-blank",
            data: {
              sentence: result.sentence,
              answer: result.answer,
              acceptableAnswers: result.alternateAnswers
                ? result.alternateAnswers.split(",").map((s) => s.trim()).filter(Boolean)
                : [],
              explanation: result.explanation,
              hint: result.hint,
              difficulty: input.difficultyLevel,
            },
          });
          break;
        }

        case "short-answer": {
          const gen = new AxGen<
            { subject: string; concept: string; avoidQuestions?: string },
            { question: string; sampleAnswer: string; keyPoints: string; hint: string }
          >(SHORT_ANSWER_SIG(gradeDescription, input.difficultyLevel));

          const result = await gen.forward(ai, {
            subject: input.subject,
            concept: input.conceptName,
            avoidQuestions: combinedAvoid,
          });

          questions.push({
            type: "short-answer",
            data: {
              question: result.question,
              sampleAnswer: result.sampleAnswer,
              keyPoints: result.keyPoints
                ? result.keyPoints.split(",").map((s) => s.trim()).filter(Boolean)
                : [],
              hint: result.hint,
              difficulty: input.difficultyLevel,
            },
          });
          break;
        }

        case "matching": {
          // Matching is more complex, create a simplified version
          const matchingSig = `"Create a matching exercise for ${gradeDescription} at difficulty ${input.difficultyLevel}/10 with 4 items."
subject:string, concept:string ->
instructions:string "Instructions",
item1Left:string, item1Right:string,
item2Left:string, item2Right:string,
item3Left:string, item3Right:string,
item4Left:string, item4Right:string,
explanation:string "How to match",
hint:string "Helpful hint"`;

          const gen = new AxGen<
            { subject: string; concept: string },
            { instructions: string; item1Left: string; item1Right: string; item2Left: string; item2Right: string; item3Left: string; item3Right: string; item4Left: string; item4Right: string; explanation: string; hint: string }
          >(matchingSig);

          const result = await gen.forward(ai, {
            subject: input.subject,
            concept: input.conceptName,
          });

          const leftColumn = [result.item1Left, result.item2Left, result.item3Left, result.item4Left];
          const rightColumn = [result.item1Right, result.item2Right, result.item3Right, result.item4Right];

          // Shuffle right column
          const shuffledIndices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
          const shuffledRight = shuffledIndices.map((i) => rightColumn[i]);
          const correctMatches = [0, 1, 2, 3].map((i) => shuffledIndices.indexOf(i));

          questions.push({
            type: "matching",
            data: {
              instructions: result.instructions,
              leftColumn,
              rightColumn: shuffledRight,
              correctMatches,
              explanation: result.explanation,
              hint: result.hint,
              difficulty: input.difficultyLevel,
            },
          });
          break;
        }
      }
    }

    return {
      questions,
      pedagogicalRationale: `Generated ${input.count} ${input.questionType} questions at difficulty ${input.difficultyLevel}/10 for ${input.conceptName}`,
      targetedWeaknesses: input.learnerWeaknesses ?? [],
    };
  }
}
