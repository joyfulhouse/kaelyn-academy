/**
 * Signature Optimizer
 * Optimizes AI prompts and signatures for educational effectiveness
 */

import type {
  SignatureVariant,
  SignatureTemplate,
  OptimizationConfig,
  OptimizedSignature,
  SignatureMetrics,
  OptimizationGoal,
} from "./types";
import { READING_LEVELS, getTemplate } from "./templates";

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get vocabulary level description for a grade
 */
export function getVocabularyLevel(gradeLevel: number): string {
  const level = READING_LEVELS[gradeLevel] ?? READING_LEVELS[5];
  return level.vocabulary;
}

/**
 * Replace variables in a template prompt
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, unknown>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    if (value === undefined) return match;
    return String(value);
  });
}

/**
 * Build a signature from a template
 */
export function buildSignature(
  template: SignatureTemplate,
  variables: Record<string, unknown>,
  overrides?: Partial<SignatureVariant>
): SignatureVariant {
  // Add vocabulary level if not provided
  const enrichedVariables = {
    ...variables,
    vocabularyLevel:
      variables.vocabularyLevel ??
      getVocabularyLevel(Number(variables.gradeLevel) || 5),
  };

  const systemPrompt = interpolateTemplate(template.basePrompt, enrichedVariables);

  return {
    id: generateId(),
    name: `${template.name} - Grade ${variables.gradeLevel}`,
    systemPrompt,
    temperature: overrides?.temperature ?? template.defaultConfig.temperature ?? 0.7,
    maxTokens: overrides?.maxTokens ?? template.defaultConfig.maxTokens ?? 500,
    metadata: {
      templateId: template.id,
      variables: enrichedVariables,
      ...overrides?.metadata,
    },
  };
}

/**
 * Calculate optimization score for a signature
 */
export function calculateOptimizationScore(
  metrics: SignatureMetrics,
  goals: OptimizationGoal[]
): number {
  const weights: Record<OptimizationGoal, (m: SignatureMetrics) => number> = {
    accuracy: (m) => (m.comprehensionScore ?? 0.5) * 100,
    engagement: (m) => (m.engagementScore ?? 0.5) * 100,
    clarity: (m) => {
      // Clarity inversely related to response length for simple explanations
      const tokenPenalty = Math.max(0, 100 - m.tokenCount * 0.1);
      return tokenPenalty * (m.comprehensionScore ?? 0.7);
    },
    brevity: (m) => Math.max(0, 100 - m.tokenCount * 0.2),
    pedagogical: (m) => {
      // Combination of comprehension and engagement
      return ((m.comprehensionScore ?? 0.5) + (m.engagementScore ?? 0.5)) * 50;
    },
    "age-appropriate": (m) => (m.ageAppropriatenessScore ?? 0.5) * 100,
  };

  if (goals.length === 0) return 50;

  const scores = goals.map((goal) => weights[goal](metrics));
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Apply optimization constraints to a signature
 */
export function applyConstraints(
  signature: SignatureVariant,
  config: OptimizationConfig
): SignatureVariant {
  const { constraints } = config;
  const optimized = { ...signature };

  // Apply max tokens constraint
  if (constraints.maxTokens) {
    optimized.maxTokens = Math.min(signature.maxTokens, constraints.maxTokens);
  }

  // Apply reading level constraint by adding to prompt
  if (constraints.readingLevel !== undefined) {
    const readingGuidance = `\n\nIMPORTANT: Use vocabulary and sentence structure appropriate for grade ${constraints.readingLevel} reading level.`;
    optimized.systemPrompt += readingGuidance;
  }

  // Apply required keywords
  if (constraints.requiredKeywords?.length) {
    const keywordsNote = `\n\nWhen relevant, incorporate these concepts: ${constraints.requiredKeywords.join(", ")}`;
    optimized.systemPrompt += keywordsNote;
  }

  // Apply banned words
  if (constraints.bannedWords?.length) {
    const bannedNote = `\n\nAvoid using these words/phrases: ${constraints.bannedWords.join(", ")}`;
    optimized.systemPrompt += bannedNote;
  }

  return optimized;
}

/**
 * Generate signature variants for A/B testing
 */
export function generateVariants(
  baseSignature: SignatureVariant,
  count: number = 3
): SignatureVariant[] {
  const variants: SignatureVariant[] = [baseSignature];

  // Temperature variants
  const temperatures = [0.5, 0.7, 0.9];
  for (let i = 1; i < count && temperatures.length > 0; i++) {
    const temp = temperatures.shift()!;
    if (temp !== baseSignature.temperature) {
      variants.push({
        ...baseSignature,
        id: generateId(),
        name: `${baseSignature.name} (temp=${temp})`,
        temperature: temp,
        metadata: {
          ...baseSignature.metadata,
          variant: `temperature-${temp}`,
        },
      });
    }
  }

  // Prompt length variants
  if (variants.length < count) {
    // Concise version
    const concisePrompt = makeConcise(baseSignature.systemPrompt);
    variants.push({
      ...baseSignature,
      id: generateId(),
      name: `${baseSignature.name} (concise)`,
      systemPrompt: concisePrompt,
      metadata: {
        ...baseSignature.metadata,
        variant: "concise",
      },
    });
  }

  return variants.slice(0, count);
}

/**
 * Make a prompt more concise
 */
function makeConcise(prompt: string): string {
  // Remove redundant whitespace
  let concise = prompt.replace(/\n{3,}/g, "\n\n");

  // Remove overly detailed instructions (keeping structure)
  concise = concise
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      // Keep headers and important lines
      return (
        trimmed.startsWith("-") ||
        trimmed.startsWith("1.") ||
        trimmed.startsWith("2.") ||
        trimmed.startsWith("3.") ||
        trimmed.length < 100 ||
        trimmed.includes(":")
      );
    })
    .join("\n");

  return concise;
}

/**
 * Optimize a signature based on configuration
 */
export function optimizeSignature(
  template: SignatureTemplate,
  config: OptimizationConfig
): OptimizedSignature {
  const variables: Record<string, unknown> = {
    gradeLevel: config.learnerContext.gradeLevel,
    subject: config.learnerContext.subject,
  };

  // Build base signature
  const baseSignature = buildSignature(template, variables);

  // Apply constraints
  const constrainedSignature = applyConstraints(baseSignature, config);

  // Apply goal-specific optimizations
  const optimizedSignature = applyGoalOptimizations(constrainedSignature, config.goals);

  // Calculate improvements and tradeoffs
  const improvements: string[] = [];
  const tradeoffs: string[] = [];

  if (config.goals.includes("brevity")) {
    improvements.push("Reduced response length for quicker interactions");
    tradeoffs.push("May sacrifice some detail for conciseness");
  }

  if (config.goals.includes("engagement")) {
    improvements.push("Added hooks and interactive elements");
  }

  if (config.goals.includes("age-appropriate")) {
    improvements.push(`Vocabulary calibrated for grade ${config.learnerContext.gradeLevel}`);
  }

  if (config.goals.includes("pedagogical")) {
    improvements.push("Structured for optimal learning with checks for understanding");
  }

  return {
    signature: optimizedSignature,
    score: 85, // Placeholder - would calculate based on actual metrics
    improvements,
    tradeoffs,
  };
}

/**
 * Apply goal-specific optimizations to a signature
 */
function applyGoalOptimizations(
  signature: SignatureVariant,
  goals: OptimizationGoal[]
): SignatureVariant {
  const optimized = { ...signature };

  for (const goal of goals) {
    switch (goal) {
      case "brevity":
        optimized.maxTokens = Math.min(optimized.maxTokens, 300);
        optimized.systemPrompt += "\n\nBe concise. Keep responses short and focused.";
        break;

      case "engagement":
        optimized.systemPrompt += "\n\nMake learning fun! Use enthusiasm, ask questions, and celebrate progress.";
        optimized.temperature = Math.min(optimized.temperature + 0.1, 1.0);
        break;

      case "clarity":
        optimized.systemPrompt += "\n\nPrioritize clarity. Use simple language and concrete examples.";
        optimized.temperature = Math.max(optimized.temperature - 0.1, 0.3);
        break;

      case "accuracy":
        optimized.systemPrompt += "\n\nEnsure accuracy. Double-check facts and provide correct information.";
        optimized.temperature = Math.max(optimized.temperature - 0.2, 0.2);
        break;

      case "pedagogical":
        optimized.systemPrompt += `
\nApply proven pedagogical techniques:
- Activate prior knowledge before introducing new concepts
- Use scaffolding to build understanding step by step
- Check for understanding frequently
- Provide immediate, specific feedback`;
        break;

      case "age-appropriate":
        // Already handled by vocabulary level in template
        break;
    }
  }

  return optimized;
}

/**
 * Create a signature for a specific use case
 */
export function createOptimizedSignature(
  type: "tutor" | "assessment" | "feedback" | "explanation" | "hint" | "encouragement",
  gradeLevel: number,
  subject: string,
  goals: OptimizationGoal[] = ["pedagogical", "age-appropriate"]
): OptimizedSignature {
  const template = getTemplate(type);
  const config: OptimizationConfig = {
    goals,
    constraints: {
      readingLevel: gradeLevel,
    },
    learnerContext: {
      gradeLevel,
      subject,
    },
  };

  return optimizeSignature(template, config);
}

/**
 * Analyze metrics and suggest improvements
 */
export function analyzeAndSuggest(
  metrics: SignatureMetrics[],
  currentSignature: SignatureVariant
): string[] {
  const suggestions: string[] = [];

  if (metrics.length === 0) return ["Collect more data to generate suggestions"];

  const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
  const avgTokens = metrics.reduce((sum, m) => sum + m.tokenCount, 0) / metrics.length;
  const avgSatisfaction = metrics
    .filter((m) => m.userSatisfaction !== undefined)
    .reduce((sum, m) => sum + (m.userSatisfaction ?? 0), 0) / metrics.length;

  // Response time suggestions
  if (avgResponseTime > 3000) {
    suggestions.push("Consider reducing max tokens to improve response time");
  }

  // Token count suggestions
  if (avgTokens > 400) {
    suggestions.push("Responses may be too long - consider adding brevity instructions");
  }

  // Satisfaction suggestions
  if (avgSatisfaction < 0.6) {
    suggestions.push("User satisfaction is low - consider A/B testing different approaches");
  }

  // Temperature suggestions
  if (currentSignature.temperature > 0.8) {
    suggestions.push("High temperature may cause inconsistent responses - consider lowering");
  }

  return suggestions.length > 0 ? suggestions : ["Signature is performing well - no changes recommended"];
}
