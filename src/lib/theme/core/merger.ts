/**
 * Theme Merger Utility
 *
 * This module provides utilities for deep merging theme objects.
 * Used to compose theme layers in the correct order of precedence.
 *
 * @module theme/core/merger
 */

import type {
  DesignTokens,
  PartialDesignTokens,
  ThemeLayer,
  DeepPartial,
} from "./types";

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is a plain object (not array, null, or other types)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

/**
 * Check if value is defined (not undefined or null)
 */
function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

// ============================================================================
// Deep Merge Implementation
// ============================================================================

/**
 * Deep merge two objects, with source values taking precedence
 * Arrays are replaced, not merged
 * Undefined values in source don't overwrite defined values in target
 */
export function deepMerge<T>(
  target: T,
  source: DeepPartial<T>
): T {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return target;
  }

  const result = { ...target } as Record<string, unknown>;

  for (const key of Object.keys(source)) {
    const sourceValue = (source as Record<string, unknown>)[key];
    const targetValue = (target as Record<string, unknown>)[key];

    // Skip undefined source values
    if (sourceValue === undefined) {
      continue;
    }

    // If source is null, use null
    if (sourceValue === null) {
      result[key] = null;
      continue;
    }

    // If both are plain objects, merge recursively
    if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue as DeepPartial<typeof targetValue>);
    } else {
      // Otherwise, source overwrites target
      result[key] = sourceValue;
    }
  }

  return result as T;
}

/**
 * Merge multiple partial objects into a complete object
 */
export function mergeAll<T>(
  base: T,
  ...partials: DeepPartial<T>[]
): T {
  return partials.reduce<T>(
    (acc, partial) => deepMerge(acc, partial),
    { ...base } as T
  );
}

// ============================================================================
// Theme Layer Merging
// ============================================================================

/**
 * Sort theme layers by priority (lowest first)
 */
export function sortLayersByPriority(layers: ThemeLayer[]): ThemeLayer[] {
  return [...layers].sort((a, b) => a.priority - b.priority);
}

/**
 * Merge theme layers into a complete DesignTokens object
 * Layers are applied in order of priority (lowest to highest)
 */
export function mergeThemeLayers(
  base: DesignTokens,
  layers: ThemeLayer[]
): DesignTokens {
  const sortedLayers = sortLayersByPriority(layers);

  return sortedLayers.reduce<DesignTokens>((acc, layer) => {
    if (!isDefined(layer.tokens) || Object.keys(layer.tokens).length === 0) {
      return acc;
    }
    return deepMerge(acc, layer.tokens);
  }, { ...base });
}

/**
 * Filter layers by type
 */
export function filterLayersByType(
  layers: ThemeLayer[],
  types: ThemeLayer["type"][]
): ThemeLayer[] {
  return layers.filter((layer) => types.includes(layer.type));
}

/**
 * Remove layers by type
 */
export function removeLayersByType(
  layers: ThemeLayer[],
  types: ThemeLayer["type"][]
): ThemeLayer[] {
  return layers.filter((layer) => !types.includes(layer.type));
}

// ============================================================================
// Token Extraction
// ============================================================================

/**
 * Extract a specific token path from design tokens
 * Path format: "colors.semantic.primary" or "typography.sizes.base"
 */
export function extractToken<T = unknown>(
  tokens: DesignTokens,
  path: string
): T | undefined {
  const parts = path.split(".");
  let current: unknown = tokens;

  for (const part of parts) {
    if (!isPlainObject(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
    if (current === undefined) {
      return undefined;
    }
  }

  return current as T;
}

/**
 * Set a specific token path in design tokens
 * Creates intermediate objects if needed
 */
export function setToken<T>(
  tokens: DesignTokens,
  path: string,
  value: T
): DesignTokens {
  const parts = path.split(".");
  const result = JSON.parse(JSON.stringify(tokens)) as DesignTokens;
  let current: Record<string, unknown> = result as unknown as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!isPlainObject(current[part])) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;

  return result;
}

// ============================================================================
// Comparison Utilities
// ============================================================================

/**
 * Compare two objects and return the differences
 * Returns a partial object with only changed values
 */
export function diffObjects<T extends Record<string, unknown>>(
  original: T,
  modified: T
): DeepPartial<T> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(modified)) {
    const originalValue = original[key];
    const modifiedValue = modified[key];

    if (isPlainObject(originalValue) && isPlainObject(modifiedValue)) {
      const nestedDiff = diffObjects(
        originalValue as Record<string, unknown>,
        modifiedValue as Record<string, unknown>
      );
      if (Object.keys(nestedDiff).length > 0) {
        result[key] = nestedDiff;
      }
    } else if (originalValue !== modifiedValue) {
      result[key] = modifiedValue;
    }
  }

  return result as DeepPartial<T>;
}

/**
 * Check if two token sets are equal
 */
export function areTokensEqual(a: DesignTokens, b: DesignTokens): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate that all required token paths exist
 */
export function validateRequiredTokens(
  tokens: PartialDesignTokens,
  requiredPaths: string[]
): { valid: boolean; missingPaths: string[] } {
  const missingPaths: string[] = [];

  for (const path of requiredPaths) {
    const parts = path.split(".");
    let current: unknown = tokens;

    for (const part of parts) {
      if (!isPlainObject(current)) {
        missingPaths.push(path);
        break;
      }
      current = (current as Record<string, unknown>)[part];
      if (current === undefined) {
        missingPaths.push(path);
        break;
      }
    }
  }

  return {
    valid: missingPaths.length === 0,
    missingPaths,
  };
}

// ============================================================================
// Immutability Helpers
// ============================================================================

/**
 * Create a frozen deep copy of an object
 */
export function freezeDeep<T>(obj: T): T {
  if (!isPlainObject(obj)) {
    return obj;
  }

  const result = { ...obj } as Record<string, unknown>;

  for (const key of Object.keys(result)) {
    const value = result[key];
    if (isPlainObject(value)) {
      result[key] = freezeDeep(value);
    }
  }

  return Object.freeze(result) as T;
}

/**
 * Create a mutable deep copy of an object
 */
export function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
