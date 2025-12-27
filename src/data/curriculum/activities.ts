/**
 * Activity Content Types
 * Rich activity data structures for interactive learning content
 */

// Base activity interface
interface BaseActivity {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  points?: number;
}

// Quiz activity - multiple choice, true/false, fill in the blank
export interface QuizActivity extends BaseActivity {
  type: "quiz";
  content: {
    questions: Array<{
      id: string;
      question: string;
      questionType: "multiple_choice" | "true_false" | "fill_blank";
      options?: string[];
      correctAnswer: string;
      explanation?: string;
      hint?: string;
      points?: number;
    }>;
    passingScore: number; // percentage
    allowRetry: boolean;
    showExplanations: boolean;
  };
}

// Video activity - watch and learn
export interface VideoActivity extends BaseActivity {
  type: "video";
  content: {
    videoUrl?: string; // YouTube, Vimeo, or hosted
    videoId?: string; // For YouTube/Vimeo embeds
    provider?: "youtube" | "vimeo" | "hosted";
    duration: number; // seconds
    transcript?: string;
    captions?: boolean;
    watchPoints?: Array<{
      timestamp: number;
      label: string;
      description?: string;
    }>;
    completionThreshold: number; // percentage to watch to complete
  };
}

// Practice activity - interactive exercises
export interface PracticeActivity extends BaseActivity {
  type: "practice";
  content: {
    problems: Array<{
      id: string;
      prompt: string;
      inputType: "number" | "text" | "expression" | "selection";
      correctAnswer: string | string[];
      tolerance?: number; // for numeric answers
      hints: string[];
      solution?: string;
      difficulty?: 1 | 2 | 3;
    }>;
    requiredCorrect: number; // minimum correct to pass
    shuffleProblems: boolean;
    showSolution: boolean;
  };
}

// Reading activity - text content with comprehension
export interface ReadingActivity extends BaseActivity {
  type: "reading";
  content: {
    text: string; // Markdown supported
    readingLevel?: string;
    wordCount?: number;
    keyTerms?: Array<{
      term: string;
      definition: string;
    }>;
    comprehensionQuestions?: Array<{
      question: string;
      answer: string;
    }>;
    audioUrl?: string; // Text-to-speech version
  };
}

// Interactive activity - drag-drop, simulations, games
export interface InteractiveActivity extends BaseActivity {
  type: "interactive";
  content: {
    interactionType: "drag_drop" | "matching" | "sorting" | "simulation" | "drawing" | "game";
    instructions: string;
    componentData: Record<string, unknown>; // Flexible data for different interaction types
    successCriteria?: string;
    // For drag-drop
    items?: Array<{
      id: string;
      label: string;
      category?: string;
    }>;
    targets?: Array<{
      id: string;
      label: string;
      acceptedItems: string[];
    }>;
    // For matching
    pairs?: Array<{
      left: string;
      right: string;
    }>;
    // For sorting
    sortableItems?: Array<{
      id: string;
      label: string;
      correctPosition: number;
    }>;
  };
}

// Discussion activity - reflection prompts
export interface DiscussionActivity extends BaseActivity {
  type: "discussion";
  content: {
    prompt: string;
    guidingQuestions?: string[];
    minimumResponse?: number; // minimum words
    rubric?: Array<{
      criterion: string;
      description: string;
      points: number;
    }>;
    peerReview?: boolean;
  };
}

// Discriminated union of all activity types
export type Activity =
  | QuizActivity
  | VideoActivity
  | PracticeActivity
  | ReadingActivity
  | InteractiveActivity
  | DiscussionActivity;

// Activity type guard helpers
export function isQuizActivity(activity: Activity): activity is QuizActivity {
  return activity.type === "quiz";
}

export function isVideoActivity(activity: Activity): activity is VideoActivity {
  return activity.type === "video";
}

export function isPracticeActivity(activity: Activity): activity is PracticeActivity {
  return activity.type === "practice";
}

export function isReadingActivity(activity: Activity): activity is ReadingActivity {
  return activity.type === "reading";
}

export function isInteractiveActivity(activity: Activity): activity is InteractiveActivity {
  return activity.type === "interactive";
}

export function isDiscussionActivity(activity: Activity): activity is DiscussionActivity {
  return activity.type === "discussion";
}

// Activity factory functions
export function createQuizActivity(
  id: string,
  title: string,
  questions: QuizActivity["content"]["questions"],
  options?: Partial<Omit<QuizActivity, "id" | "title" | "type" | "content">>
): QuizActivity {
  return {
    id,
    title,
    type: "quiz",
    estimatedMinutes: options?.estimatedMinutes ?? Math.max(5, questions.length * 2),
    points: options?.points ?? questions.length * 10,
    description: options?.description,
    content: {
      questions,
      passingScore: 70,
      allowRetry: true,
      showExplanations: true,
    },
  };
}

export function createVideoActivity(
  id: string,
  title: string,
  videoUrl: string,
  duration: number,
  options?: Partial<Omit<VideoActivity, "id" | "title" | "type" | "content">>
): VideoActivity {
  // Parse video provider from URL
  let provider: "youtube" | "vimeo" | "hosted" = "hosted";
  let videoId: string | undefined;

  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    provider = "youtube";
    const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    videoId = match?.[1];
  } else if (videoUrl.includes("vimeo.com")) {
    provider = "vimeo";
    const match = videoUrl.match(/vimeo\.com\/(\d+)/);
    videoId = match?.[1];
  }

  return {
    id,
    title,
    type: "video",
    estimatedMinutes: options?.estimatedMinutes ?? Math.ceil(duration / 60),
    points: options?.points ?? 10,
    description: options?.description,
    content: {
      videoUrl,
      videoId,
      provider,
      duration,
      completionThreshold: 80,
      captions: true,
    },
  };
}

export function createPracticeActivity(
  id: string,
  title: string,
  problems: PracticeActivity["content"]["problems"],
  options?: Partial<Omit<PracticeActivity, "id" | "title" | "type" | "content">>
): PracticeActivity {
  return {
    id,
    title,
    type: "practice",
    estimatedMinutes: options?.estimatedMinutes ?? Math.max(10, problems.length * 3),
    points: options?.points ?? problems.length * 5,
    description: options?.description,
    content: {
      problems,
      requiredCorrect: Math.ceil(problems.length * 0.7),
      shuffleProblems: false,
      showSolution: true,
    },
  };
}

export function createReadingActivity(
  id: string,
  title: string,
  text: string,
  options?: Partial<Omit<ReadingActivity, "id" | "title" | "type" | "content">>
): ReadingActivity {
  const wordCount = text.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / 200); // ~200 words per minute

  return {
    id,
    title,
    type: "reading",
    estimatedMinutes: options?.estimatedMinutes ?? readingTimeMinutes,
    points: options?.points ?? 10,
    description: options?.description,
    content: {
      text,
      wordCount,
    },
  };
}

export function createInteractiveActivity(
  id: string,
  title: string,
  interactionType: InteractiveActivity["content"]["interactionType"],
  componentData: Record<string, unknown>,
  options?: Partial<Omit<InteractiveActivity, "id" | "title" | "type" | "content">>
): InteractiveActivity {
  return {
    id,
    title,
    type: "interactive",
    estimatedMinutes: options?.estimatedMinutes ?? 10,
    points: options?.points ?? 15,
    description: options?.description,
    content: {
      interactionType,
      instructions: "",
      componentData,
    },
  };
}

export function createDiscussionActivity(
  id: string,
  title: string,
  prompt: string,
  options?: Partial<Omit<DiscussionActivity, "id" | "title" | "type" | "content">>
): DiscussionActivity {
  return {
    id,
    title,
    type: "discussion",
    estimatedMinutes: options?.estimatedMinutes ?? 15,
    points: options?.points ?? 20,
    description: options?.description,
    content: {
      prompt,
      minimumResponse: 50,
      peerReview: false,
    },
  };
}

// Default activity when string conversion needed
export function activityFromString(activityTitle: string, index: number): Activity {
  // Convert legacy string activities to a basic reading/instruction activity
  return createReadingActivity(
    `legacy-${index}`,
    activityTitle,
    `Complete this activity: ${activityTitle}\n\nFollow the instructions provided by your teacher or the lesson materials.`,
    { estimatedMinutes: 5 }
  );
}
