/**
 * Theme Mode Presets
 *
 * Light and dark mode base configurations.
 * These are the foundation that other layers build upon.
 *
 * @module theme/presets/modes
 */

import type { ThemeLayer, ResolvedThemeMode } from "../../core/types";
import { lightDesignTokens, darkDesignTokens } from "../../core/tokens";
import { createLayer, LAYER_PRIORITIES } from "../../core/builder";

// ============================================================================
// Mode Layers
// ============================================================================

/**
 * Create a light mode theme layer
 * Note: Light mode tokens are the base, so this layer is essentially empty
 */
export function createLightModeLayer(): ThemeLayer {
  return createLayer("mode", "light", {}, LAYER_PRIORITIES.mode);
}

/**
 * Create a dark mode theme layer
 * Note: Dark mode tokens are loaded as the base when mode is dark
 */
export function createDarkModeLayer(): ThemeLayer {
  return createLayer("mode", "dark", {}, LAYER_PRIORITIES.mode);
}

/**
 * Create a mode layer based on the resolved mode
 */
export function createModeLayer(mode: ResolvedThemeMode): ThemeLayer {
  return mode === "dark" ? createDarkModeLayer() : createLightModeLayer();
}

// ============================================================================
// Mode Token Getters
// ============================================================================

/**
 * Get base design tokens for a mode
 */
export function getBaseTokensForMode(mode: ResolvedThemeMode) {
  return mode === "dark" ? darkDesignTokens : lightDesignTokens;
}

// ============================================================================
// Mode Detection
// ============================================================================

/**
 * Detect system color scheme preference
 */
export function detectSystemColorScheme(): ResolvedThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Resolve theme mode from user preference
 */
export function resolveThemeMode(
  preference: "light" | "dark" | "system"
): ResolvedThemeMode {
  if (preference === "system") {
    return detectSystemColorScheme();
  }
  return preference;
}

/**
 * Subscribe to system color scheme changes
 */
export function subscribeToColorSchemeChanges(
  callback: (mode: ResolvedThemeMode) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light");
  };

  mediaQuery.addEventListener("change", handler);

  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
}
