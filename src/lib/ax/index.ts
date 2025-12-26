// Ax Integration Layer for Kaelyn's Academy
// Provides declarative AI agents with the Ax framework alongside Vercel AI SDK

import {
  ai,
  type AxAIService,
  AxAIAnthropicModel,
  AxAIOpenAIModel,
  AxAIGoogleGeminiModel,
} from "@ax-llm/ax";

export type AIProvider = "anthropic" | "openai" | "google";
export type ModelTier = "fast" | "balanced" | "powerful";

// Model configurations using latest Ax enum types (Dec 2025)
const MODEL_CONFIGS = {
  anthropic: {
    fast: AxAIAnthropicModel.Claude45Haiku,
    balanced: AxAIAnthropicModel.Claude45Sonnet,
    powerful: AxAIAnthropicModel.Claude45Opus,
  },
  openai: {
    fast: AxAIOpenAIModel.GPT5Nano,
    balanced: AxAIOpenAIModel.GPT52,
    powerful: AxAIOpenAIModel.GPT52Pro,
  },
  google: {
    fast: AxAIGoogleGeminiModel.Gemini3Flash,
    balanced: AxAIGoogleGeminiModel.Gemini3Pro,
    powerful: AxAIGoogleGeminiModel.Gemini3Pro,
  },
} as const;

/**
 * Create an Ax AI instance for a specific provider and tier
 */
export function createAxAI(
  provider: AIProvider = "anthropic",
  tier: ModelTier = "balanced"
): AxAIService {
  switch (provider) {
    case "anthropic":
      return ai({
        name: "anthropic",
        apiKey: process.env.ANTHROPIC_API_KEY!,
        config: { model: MODEL_CONFIGS.anthropic[tier] },
      });
    case "openai":
      return ai({
        name: "openai",
        apiKey: process.env.OPENAI_API_KEY!,
        config: { model: MODEL_CONFIGS.openai[tier] },
      });
    case "google":
      return ai({
        name: "google-gemini",
        apiKey: process.env.GOOGLE_AI_API_KEY!,
        config: { model: MODEL_CONFIGS.google[tier] },
      });
  }
}

/**
 * Get the default provider based on available API keys
 */
export function getDefaultProvider(): AIProvider {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GOOGLE_AI_API_KEY) return "google";
  throw new Error("No AI provider configured. Set at least one API key.");
}

/**
 * Check if a provider is available
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "google":
      return !!process.env.GOOGLE_AI_API_KEY;
  }
}

// Re-export agent classes
export { TutoringAgent } from "./agents/tutoring-agent";
export { AdaptiveAgent } from "./agents/adaptive-agent";
export { PracticeGeneratorAgent } from "./agents/practice-generator-agent";

// Re-export types
export type { TutoringInput, TutoringOutput } from "./agents/tutoring-agent";
export type { AdaptiveInput, AdaptiveOutput } from "./agents/adaptive-agent";
export type { PracticeInput, PracticeOutput } from "./agents/practice-generator-agent";
