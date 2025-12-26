/**
 * Signature Optimization Types
 * Types for optimizing AI prompts and signatures
 */

export type OptimizationGoal =
  | "accuracy"
  | "engagement"
  | "clarity"
  | "brevity"
  | "pedagogical"
  | "age-appropriate";

export type SignatureType =
  | "tutor"
  | "assessment"
  | "feedback"
  | "explanation"
  | "encouragement"
  | "hint";

export interface SignatureMetrics {
  responseTime: number;
  tokenCount: number;
  userSatisfaction?: number;
  comprehensionScore?: number;
  engagementScore?: number;
  ageAppropriatenessScore?: number;
}

export interface SignatureVariant {
  id: string;
  name: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  metadata: Record<string, unknown>;
}

export interface SignatureTest {
  id: string;
  signatureId: string;
  variantA: SignatureVariant;
  variantB: SignatureVariant;
  startDate: Date;
  endDate?: Date;
  trafficSplit: number; // 0-1, percentage going to variant B
  status: "active" | "paused" | "completed";
  goal: OptimizationGoal;
}

export interface SignatureTestResult {
  testId: string;
  variantAMetrics: SignatureMetrics[];
  variantBMetrics: SignatureMetrics[];
  winner?: "A" | "B" | "tie";
  confidence: number;
  sampleSize: number;
  recommendation: string;
}

export interface OptimizationConfig {
  goals: OptimizationGoal[];
  constraints: {
    maxTokens?: number;
    minResponseTime?: number;
    maxResponseTime?: number;
    requiredKeywords?: string[];
    bannedWords?: string[];
    readingLevel?: number;
  };
  learnerContext: {
    gradeLevel: number;
    subject: string;
    learningStyle?: "visual" | "auditory" | "kinesthetic" | "reading";
    previousPerformance?: number;
  };
}

export interface OptimizedSignature {
  signature: SignatureVariant;
  score: number;
  improvements: string[];
  tradeoffs: string[];
}

export interface SignatureTemplate {
  id: string;
  name: string;
  type: SignatureType;
  basePrompt: string;
  variables: SignatureVariable[];
  defaultConfig: Partial<SignatureVariant>;
}

export interface SignatureVariable {
  name: string;
  description: string;
  type: "string" | "number" | "boolean" | "array";
  required: boolean;
  defaultValue?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: unknown[];
  };
}
