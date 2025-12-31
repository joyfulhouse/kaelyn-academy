/**
 * TypeScript types for AI Tutor conversations and parent monitoring
 * Used for COPPA compliance - parents can monitor their child's AI interactions
 */

export type MessageRole = "user" | "assistant" | "system";

export type ConversationStatus = "active" | "completed" | "archived";

export interface TutorMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  metadata?: {
    processingTime?: number;
    model?: string;
    feedback?: "helpful" | "not_helpful" | null;
  } | null;
  createdAt: Date;
}

export interface TutorConversation {
  id: string;
  learnerId: string;
  organizationId: string;
  lessonId?: string | null;
  conceptId?: string | null;
  topic: string | null;
  status: ConversationStatus;
  provider: string;
  model: string | null;
  summary: string | null;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TutorConversationWithMessages extends TutorConversation {
  messages: TutorMessage[];
}

export interface TutorConversationWithLearner extends TutorConversation {
  learner: {
    id: string;
    name: string;
    gradeLevel: number;
    avatarUrl: string | null;
  };
  messageCount: number;
}

// API Request/Response types

export interface StartConversationRequest {
  topic?: string;
  lessonId?: string;
  conceptId?: string;
  provider?: string;
  model?: string;
}

export interface StartConversationResponse {
  conversation: TutorConversation;
}

export interface AddMessageRequest {
  role: MessageRole;
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  metadata?: TutorMessage["metadata"];
}

export interface AddMessageResponse {
  message: TutorMessage;
}

export interface EndConversationRequest {
  summary?: string;
}

export interface EndConversationResponse {
  conversation: TutorConversation;
}

// Parent monitoring types

export interface ParentConversationListResponse {
  conversations: TutorConversationWithLearner[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ParentConversationDetailResponse {
  conversation: TutorConversationWithLearner;
  messages: TutorMessage[];
}

// For updating the frontend
export interface LocalConversation {
  id: string;
  serverConversationId?: string; // Maps to database conversation
  title: string;
  subject: string;
  createdAt: Date;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}
