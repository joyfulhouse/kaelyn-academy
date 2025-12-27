// AI Provider Abstraction Layer for Kaelyn's Academy
// Supports Claude (Anthropic), GPT (OpenAI), and Gemini (Google)

export {
  getAvailableProviders,
  getDefaultProvider,
  getModel,
  getModelForCapability,
  type AIProvider,
  type ModelCapability,
} from "./providers";

export {
  streamTutoringResponse,
  generateTutoringResponse,
  generateHint,
  generateExplanation,
  type TutoringContext,
  type HintRequest,
  type ExplanationRequest,
} from "./tutoring";

export {
  calculateDifficultyAdjustment,
  quickDifficultyAdjustment,
  generateLearningPath,
  type PerformanceData,
  type DifficultyAdjustment,
  type LearnerProgress,
  type LearningPathRecommendation,
} from "./adaptive";

export {
  generatePracticeQuestions,
  generateMultipleChoiceQuestions,
  generateFillInBlankQuestions,
  generateTrueFalseQuestions,
  generateShortAnswerQuestions,
  generateMatchingQuestions,
  gradeShortAnswer,
  type PracticeGenerationRequest,
  type PracticeQuestion,
  type MultipleChoiceQuestion,
  type FillInBlankQuestion,
  type ShortAnswerQuestion,
  type TrueFalseQuestion,
  type MatchingQuestion,
} from "./practice";

export {
  generateLessonContent,
  streamLessonContent,
  suggestLessonTopics,
  type LessonContentRequest,
  type GeneratedLessonContent,
  type TopicSuggestion,
} from "./content";
