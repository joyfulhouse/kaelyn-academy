/**
 * AI Quiz Feedback Generator
 * Generates personalized feedback for quiz attempts using AI
 */

import { generateText } from "ai";
import { getModelForCapability, getDefaultProvider } from "./providers";
import { sanitizeLearnerName, sanitizeText } from "./pii-sanitizer";
import type { QuizConfig, QuestionResult } from "@/lib/assessment/types";

export interface QuizFeedbackRequest {
  quizConfig: QuizConfig;
  questionResults: QuestionResult[];
  score: number;
  passed: boolean;
  learnerName?: string;
  gradeLevel?: number;
}

export interface QuizFeedback {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  nextSteps: string[];
  encouragement: string;
}

function getGradeDescription(gradeLevel?: number): string {
  if (!gradeLevel && gradeLevel !== 0) return "student";
  if (gradeLevel === 0) return "Kindergarten student";
  if (gradeLevel <= 5) return `${gradeLevel}th grade elementary student`;
  if (gradeLevel <= 8) return `${gradeLevel}th grade middle schooler`;
  return `${gradeLevel}th grade high schooler`;
}

function buildFeedbackPrompt(request: QuizFeedbackRequest): string {
  const { quizConfig, questionResults, score, passed, learnerName, gradeLevel } = request;
  const gradeDesc = getGradeDescription(gradeLevel);
  const correctCount = questionResults.filter((q) => q.correct).length;
  // SECURITY: Pseudonymize student name for COPPA/privacy compliance
  const displayName = sanitizeLearnerName(learnerName);

  // Build summary of incorrect answers
  const incorrectQuestions = questionResults
    .filter((q) => !q.correct)
    .map((q) => {
      const question = quizConfig.questions.find((qc) => qc.id === q.questionId);
      if (!question) return null;
      return {
        question: question.question,
        // SECURITY: Sanitize student answers for PII
        studentAnswer: sanitizeText(String(q.answer)),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    })
    .filter(Boolean);

  return `You are a supportive, encouraging K-12 tutor providing feedback on a quiz attempt.

Student: ${displayName} (${gradeDesc})
Quiz: ${quizConfig.title}
Score: ${score}% (${correctCount}/${questionResults.length} correct)
Result: ${passed ? "PASSED" : "Did not pass yet"}
Passing Score: ${quizConfig.passingScore ?? 70}%

${incorrectQuestions.length > 0 ? `
Questions answered incorrectly:
${incorrectQuestions.map((q, i) => `
${i + 1}. Question: ${q!.question}
   Student's answer: ${Array.isArray(q!.studentAnswer) ? q!.studentAnswer.join(", ") : q!.studentAnswer}
   Correct answer: ${Array.isArray(q!.correctAnswer) ? q!.correctAnswer.join(", ") : q!.correctAnswer}
   ${q!.explanation ? `Explanation: ${q!.explanation}` : ""}
`).join("")}
` : "All questions answered correctly!"}

Provide personalized feedback in JSON format:
{
  "summary": "Brief 1-2 sentence overview of performance",
  "strengths": ["Specific things the student did well (2-3 items)"],
  "areasForImprovement": ["Specific concepts to review (0-3 items, empty if perfect score)"],
  "nextSteps": ["Concrete actions to take next (2-3 items)"],
  "encouragement": "A warm, age-appropriate encouraging message"
}

Guidelines:
- Use age-appropriate language for a ${gradeDesc}
- Be specific about concepts, not just "study more"
- Focus on growth and progress, not failure
- If they passed, celebrate but still give constructive feedback
- If they didn't pass, be encouraging and supportive
- Keep each bullet point concise (1 sentence)`;
}

/**
 * Generate AI-powered feedback for a quiz attempt
 */
export async function generateQuizFeedback(
  request: QuizFeedbackRequest
): Promise<QuizFeedback> {
  const provider = getDefaultProvider();

  // If no AI provider, use fallback
  if (!provider) {
    return generateFallbackFeedback(request);
  }

  try {
    const model = getModelForCapability("general", provider);
    const prompt = buildFeedbackPrompt(request);

    const result = await generateText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1000,
    });

    // Parse the JSON response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateFallbackFeedback(request);
    }

    const feedback = JSON.parse(jsonMatch[0]) as QuizFeedback;

    // Validate the response has required fields
    if (
      !feedback.summary ||
      !feedback.strengths ||
      !feedback.areasForImprovement ||
      !feedback.nextSteps ||
      !feedback.encouragement
    ) {
      return generateFallbackFeedback(request);
    }

    return feedback;
  } catch (error) {
    console.error("Error generating AI quiz feedback:", error);
    return generateFallbackFeedback(request);
  }
}

/**
 * Generate fallback feedback when AI is unavailable
 */
function generateFallbackFeedback(request: QuizFeedbackRequest): QuizFeedback {
  const { score, passed, questionResults, quizConfig } = request;
  const correctCount = questionResults.filter((q) => q.correct).length;

  // Find incorrect topics
  const incorrectTopics = questionResults
    .filter((q) => !q.correct)
    .map((q) => {
      const question = quizConfig.questions.find((qc) => qc.id === q.questionId);
      return question?.question?.split(" ").slice(0, 6).join(" ") + "...";
    })
    .filter((t): t is string => Boolean(t))
    .slice(0, 3);

  if (score >= 90) {
    return {
      summary: `Excellent work! You scored ${score}% and demonstrated outstanding understanding.`,
      strengths: [
        "Strong grasp of core concepts",
        "Careful attention to detail",
        `Correctly answered ${correctCount} out of ${questionResults.length} questions`,
      ],
      areasForImprovement:
        incorrectTopics.length > 0
          ? incorrectTopics.map((t) => `Review: ${t}`)
          : [],
      nextSteps: [
        "Continue to the next lesson",
        "Help a classmate understand these concepts",
        "Challenge yourself with advanced problems",
      ],
      encouragement:
        "You're doing amazing! Your hard work is really paying off. Keep up this fantastic effort!",
    };
  } else if (passed) {
    return {
      summary: `Good job! You passed with ${score}% and showed solid understanding.`,
      strengths: [
        "Successfully grasped key concepts",
        `Answered ${correctCount} questions correctly`,
        "Ready to move forward",
      ],
      areasForImprovement: incorrectTopics.map((t) => `Review: ${t}`),
      nextSteps: [
        "Review the explanations for missed questions",
        "Practice similar problems before the next lesson",
        "Keep up the consistent effort",
      ],
      encouragement:
        "Great job passing! Every quiz helps you learn. You should be proud of your progress!",
    };
  } else if (score >= 50) {
    return {
      summary: `You're making progress with ${score}%. Let's work on building your understanding.`,
      strengths: [
        `Correctly answered ${correctCount} questions`,
        "Showed understanding of some key concepts",
        "Putting in the effort to learn",
      ],
      areasForImprovement: incorrectTopics.map((t) => `Focus on: ${t}`),
      nextSteps: [
        "Review the lesson material again",
        "Focus on one concept at a time",
        "Try again when you feel ready",
      ],
      encouragement:
        "Learning takes practice, and you're on the right track! Every attempt makes you stronger. You've got this!",
    };
  } else {
    return {
      summary: `This is a learning opportunity! You scored ${score}%, and with practice, you'll improve.`,
      strengths: [
        "Brave for taking on the challenge",
        "Now you know what to focus on",
        "Every master was once a beginner",
      ],
      areasForImprovement: [
        "Go back through the lesson slowly",
        "Take notes on key concepts",
        "Ask for help with confusing parts",
      ],
      nextSteps: [
        "Re-read the lesson material carefully",
        "Work through the practice activities again",
        "Try the quiz again when you feel more confident",
      ],
      encouragement:
        "Don't give up! Learning is a journey, not a race. The most important thing is that you're trying. You will get better with practice!",
    };
  }
}

/**
 * Format feedback for display or storage
 */
export function formatFeedbackAsString(feedback: QuizFeedback): string {
  const parts = [
    feedback.summary,
    "",
    "**Strengths:**",
    ...feedback.strengths.map((s) => `• ${s}`),
  ];

  if (feedback.areasForImprovement.length > 0) {
    parts.push("", "**Areas for Improvement:**");
    parts.push(...feedback.areasForImprovement.map((a) => `• ${a}`));
  }

  parts.push("", "**Next Steps:**");
  parts.push(...feedback.nextSteps.map((n) => `• ${n}`));

  parts.push("", `💪 ${feedback.encouragement}`);

  return parts.join("\n");
}
