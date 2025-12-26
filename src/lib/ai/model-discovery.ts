// Automatic Model Discovery for AI Providers
// Fetches and caches the latest available models from each provider

import { unstable_cache } from "next/cache";

export type ModelTier = "fast" | "balanced" | "powerful";
export type AIProvider = "anthropic" | "openai" | "google";

interface ModelInfo {
  id: string;
  name: string;
  tier: ModelTier;
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  releaseDate?: string;
}

interface ProviderModels {
  provider: AIProvider;
  models: ModelInfo[];
  lastUpdated: string;
}

// Model classification patterns for automatic tier assignment
const TIER_PATTERNS: Record<ModelTier, RegExp[]> = {
  fast: [
    /haiku/i,
    /mini/i,
    /flash-lite/i,
    /nano/i,
    /instant/i,
  ],
  balanced: [
    /sonnet/i,
    /4o(?!-mini)/i,
    /flash(?!-lite)/i,
    /pro(?!-preview)/i,
  ],
  powerful: [
    /opus/i,
    /o[1-4](?!-mini)/i,
    /pro-preview/i,
    /ultra/i,
  ],
};

function classifyModelTier(modelId: string): ModelTier {
  // Check powerful first (most specific)
  for (const pattern of TIER_PATTERNS.powerful) {
    if (pattern.test(modelId)) return "powerful";
  }
  // Then balanced
  for (const pattern of TIER_PATTERNS.balanced) {
    if (pattern.test(modelId)) return "balanced";
  }
  // Then fast
  for (const pattern of TIER_PATTERNS.fast) {
    if (pattern.test(modelId)) return "fast";
  }
  // Default to balanced
  return "balanced";
}

// Anthropic model discovery
async function fetchAnthropicModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!response.ok) {
      console.warn("Anthropic models API not available, using defaults");
      return getAnthropicDefaults();
    }

    const data = await response.json();
    return data.data?.map((m: { id: string; display_name: string; created_at?: string }) => ({
      id: m.id,
      name: m.display_name || m.id,
      tier: classifyModelTier(m.id),
      contextWindow: getContextWindow("anthropic", m.id),
      inputCostPer1M: getCost("anthropic", m.id, "input"),
      outputCostPer1M: getCost("anthropic", m.id, "output"),
      releaseDate: m.created_at,
    })) || getAnthropicDefaults();
  } catch {
    return getAnthropicDefaults();
  }
}

// OpenAI model discovery
async function fetchOpenAIModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return getOpenAIDefaults();
    }

    const data = await response.json();
    // Filter to only chat models
    const chatModels = data.data?.filter((m: { id: string }) =>
      m.id.includes("gpt") || m.id.startsWith("o")
    ) || [];

    return chatModels.map((m: { id: string; created?: number }) => ({
      id: m.id,
      name: m.id,
      tier: classifyModelTier(m.id),
      contextWindow: getContextWindow("openai", m.id),
      inputCostPer1M: getCost("openai", m.id, "input"),
      outputCostPer1M: getCost("openai", m.id, "output"),
      releaseDate: m.created ? new Date(m.created * 1000).toISOString() : undefined,
    }));
  } catch {
    return getOpenAIDefaults();
  }
}

// Google model discovery
async function fetchGoogleModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      return getGoogleDefaults();
    }

    const data = await response.json();
    // Filter to generative models
    const genModels = data.models?.filter((m: { name: string }) =>
      m.name.includes("gemini")
    ) || [];

    return genModels.map((m: { name: string; displayName: string }) => {
      const id = m.name.replace("models/", "");
      return {
        id,
        name: m.displayName || id,
        tier: classifyModelTier(id),
        contextWindow: getContextWindow("google", id),
        inputCostPer1M: getCost("google", id, "input"),
        outputCostPer1M: getCost("google", id, "output"),
      };
    });
  } catch {
    return getGoogleDefaults();
  }
}

// Default models when API discovery fails
function getAnthropicDefaults(): ModelInfo[] {
  return [
    { id: "claude-haiku-4-5", name: "Claude 4.5 Haiku", tier: "fast", contextWindow: 200000, inputCostPer1M: 1, outputCostPer1M: 5 },
    { id: "claude-sonnet-4-5-20250929", name: "Claude 4.5 Sonnet", tier: "balanced", contextWindow: 200000, inputCostPer1M: 3, outputCostPer1M: 15 },
    { id: "claude-opus-4-5-20251101", name: "Claude 4.5 Opus", tier: "powerful", contextWindow: 200000, inputCostPer1M: 15, outputCostPer1M: 75 },
  ];
}

function getOpenAIDefaults(): ModelInfo[] {
  return [
    { id: "gpt-5-nano", name: "GPT-5 Nano", tier: "fast", contextWindow: 128000, inputCostPer1M: 0.1, outputCostPer1M: 0.4 },
    { id: "gpt-5.2", name: "GPT-5.2", tier: "balanced", contextWindow: 256000, inputCostPer1M: 5, outputCostPer1M: 15 },
    { id: "gpt-5.2-pro", name: "GPT-5.2 Pro", tier: "powerful", contextWindow: 256000, inputCostPer1M: 15, outputCostPer1M: 60 },
  ];
}

function getGoogleDefaults(): ModelInfo[] {
  return [
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", tier: "fast", contextWindow: 2000000, inputCostPer1M: 0.1, outputCostPer1M: 0.4 },
    { id: "gemini-3-pro-preview", name: "Gemini 3 Pro", tier: "balanced", contextWindow: 2000000, inputCostPer1M: 2, outputCostPer1M: 8 },
    { id: "gemini-3-pro-preview", name: "Gemini 3 Pro", tier: "powerful", contextWindow: 2000000, inputCostPer1M: 2, outputCostPer1M: 8 },
  ];
}

// Context window lookup
function getContextWindow(provider: AIProvider, modelId: string): number {
  if (provider === "anthropic") {
    return 200000;
  }
  if (provider === "openai") {
    if (modelId.startsWith("o")) return 200000;
    return 128000;
  }
  if (provider === "google") {
    if (modelId.includes("2.5")) return 2000000;
    if (modelId.includes("2.0")) return 1000000;
    return 128000;
  }
  return 128000;
}

// Cost lookup (per 1M tokens, in USD)
function getCost(provider: AIProvider, modelId: string, type: "input" | "output"): number {
  const costs: Record<string, [number, number]> = {
    // Anthropic [input, output]
    "claude-haiku-4-5": [1, 5],
    "claude-sonnet-4-5": [3, 15],
    "claude-opus-4-5": [15, 75],
    // OpenAI
    "gpt-4o-mini": [0.15, 0.6],
    "gpt-4o": [2.5, 10],
    "o3": [15, 60],
    "o3-mini": [1.1, 4.4],
    // Google
    "gemini-2.5-flash": [0.075, 0.3],
    "gemini-2.5-pro": [1.25, 5],
  };

  for (const [key, [input, output]] of Object.entries(costs)) {
    if (modelId.includes(key)) {
      return type === "input" ? input : output;
    }
  }
  return type === "input" ? 1 : 5;
}

// Cached model discovery
export const discoverModels = unstable_cache(
  async (): Promise<Record<AIProvider, ProviderModels>> => {
    const [anthropic, openai, google] = await Promise.all([
      fetchAnthropicModels(),
      fetchOpenAIModels(),
      fetchGoogleModels(),
    ]);

    const now = new Date().toISOString();

    return {
      anthropic: { provider: "anthropic", models: anthropic, lastUpdated: now },
      openai: { provider: "openai", models: openai, lastUpdated: now },
      google: { provider: "google", models: google, lastUpdated: now },
    };
  },
  ["model-discovery"],
  { revalidate: 86400 } // Cache for 24 hours
);

// Get the best model for a specific tier from a provider
export async function getBestModel(
  provider: AIProvider,
  tier: ModelTier
): Promise<ModelInfo | null> {
  const allModels = await discoverModels();
  const providerModels = allModels[provider];

  if (!providerModels || providerModels.models.length === 0) {
    return null;
  }

  // Find models matching the tier
  const tierModels = providerModels.models.filter((m) => m.tier === tier);

  if (tierModels.length === 0) {
    // Fall back to any available model
    return providerModels.models[0];
  }

  // Sort by release date (newest first) or context window (largest first)
  tierModels.sort((a, b) => {
    if (a.releaseDate && b.releaseDate) {
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    }
    return b.contextWindow - a.contextWindow;
  });

  return tierModels[0];
}

// Get the latest model ID for a provider and tier
export async function getLatestModelId(
  provider: AIProvider,
  tier: ModelTier
): Promise<string> {
  const model = await getBestModel(provider, tier);

  if (!model) {
    // Return hardcoded fallbacks if discovery fails completely
    const fallbacks: Record<AIProvider, Record<ModelTier, string>> = {
      anthropic: {
        fast: "claude-haiku-4-5",
        balanced: "claude-sonnet-4-5-20250929",
        powerful: "claude-opus-4-5-20251101",
      },
      openai: {
        fast: "gpt-5-nano",
        balanced: "gpt-5.2",
        powerful: "gpt-5.2-pro",
      },
      google: {
        fast: "gemini-3-flash-preview",
        balanced: "gemini-3-pro-preview",
        powerful: "gemini-3-pro-preview",
      },
    };
    return fallbacks[provider][tier];
  }

  return model.id;
}

// Refresh the model cache
export async function refreshModelCache(): Promise<void> {
  // Force revalidation by calling with a new cache key
  await discoverModels();
}
