import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type AIProvider = "anthropic" | "openai" | "google";

export type ModelCapability = "tutoring" | "adaptive" | "practice" | "general";

interface ProviderConfig {
  id: AIProvider;
  name: string;
  available: boolean;
  models: {
    fast: string;
    balanced: string;
    powerful: string;
  };
}

function getProviderConfigs(): Record<AIProvider, ProviderConfig> {
  return {
    anthropic: {
      id: "anthropic",
      name: "Claude (Anthropic)",
      available: !!process.env.ANTHROPIC_API_KEY,
      models: {
        fast: "claude-haiku-4-5",
        balanced: "claude-sonnet-4-5-20250929",
        powerful: "claude-opus-4-5-20251101",
      },
    },
    openai: {
      id: "openai",
      name: "GPT (OpenAI)",
      available: !!process.env.OPENAI_API_KEY,
      models: {
        fast: "gpt-5-nano",
        balanced: "gpt-5.2",
        powerful: "gpt-5.2-pro",
      },
    },
    google: {
      id: "google",
      name: "Gemini (Google)",
      available: !!process.env.GOOGLE_AI_API_KEY,
      models: {
        fast: "gemini-3-flash-preview",
        balanced: "gemini-3-pro-preview",
        powerful: "gemini-3-pro-preview",
      },
    },
  };
}

export function getAvailableProviders(): ProviderConfig[] {
  const configs = getProviderConfigs();
  return Object.values(configs).filter((p) => p.available);
}

export function getDefaultProvider(): AIProvider | null {
  const available = getAvailableProviders();
  if (available.length === 0) return null;

  // Priority: Anthropic > OpenAI > Google
  const priority: AIProvider[] = ["anthropic", "openai", "google"];
  for (const provider of priority) {
    if (available.find((p) => p.id === provider)) {
      return provider;
    }
  }
  return available[0].id;
}

type ModelTier = "fast" | "balanced" | "powerful";

export function getModel(
  provider: AIProvider,
  tier: ModelTier = "balanced"
): LanguageModel {
  const configs = getProviderConfigs();
  const config = configs[provider];

  if (!config.available) {
    throw new Error(`Provider ${provider} is not configured. Missing API key.`);
  }

  const modelId = config.models[tier];

  switch (provider) {
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      return anthropic(modelId);
    }
    case "openai": {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      return openai(modelId);
    }
    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_AI_API_KEY,
      });
      return google(modelId);
    }
  }
}

// Get the best available model for a specific capability
export function getModelForCapability(
  capability: ModelCapability,
  preferredProvider?: AIProvider
): LanguageModel {
  const provider = preferredProvider ?? getDefaultProvider();

  if (!provider) {
    throw new Error("No AI providers configured. Set at least one API key.");
  }

  // Map capabilities to model tiers
  const tierMap: Record<ModelCapability, ModelTier> = {
    tutoring: "balanced",    // Good reasoning for tutoring
    adaptive: "fast",        // Quick decisions for difficulty adjustment
    practice: "balanced",    // Quality problem generation
    general: "balanced",     // Default to balanced
  };

  return getModel(provider, tierMap[capability]);
}
