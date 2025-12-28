/**
 * CSS Injector
 *
 * This module handles injecting and updating CSS custom properties in the DOM.
 * It provides efficient updates by only modifying changed properties.
 *
 * @module theme/css/injector
 */

import type { DesignTokens, CSSVariables, CSSVariableName } from "../core/types";
import { generateCSSVariables, generateDiffVariables } from "./generator";

// ============================================================================
// Constants
// ============================================================================

const STYLE_ID = "kaelys-academy-theme";
const DATA_ATTRIBUTES = {
  mode: "data-theme-mode",
  ageGroup: "data-age-group",
  role: "data-user-role",
  highContrast: "data-high-contrast",
  reducedMotion: "data-reduced-motion",
} as const;

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Get or create the theme style element
 */
function getStyleElement(): HTMLStyleElement | null {
  if (!isBrowser()) return null;

  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.setAttribute("data-theme-injector", "true");
    document.head.appendChild(styleEl);
  }

  return styleEl;
}

// ============================================================================
// CSS Variable Injection
// ============================================================================

/**
 * Inject CSS variables directly onto the document root
 * This is the most performant method for theme updates
 */
export function injectCSSVariables(vars: CSSVariables): void {
  if (!isBrowser()) return;

  const root = document.documentElement;

  for (const [name, value] of Object.entries(vars)) {
    root.style.setProperty(name, value);
  }
}

/**
 * Remove specific CSS variables from the document root
 */
export function removeCSSVariables(varNames: CSSVariableName[]): void {
  if (!isBrowser()) return;

  const root = document.documentElement;

  for (const name of varNames) {
    root.style.removeProperty(name);
  }
}

/**
 * Clear all theme CSS variables from the document root
 */
export function clearCSSVariables(): void {
  if (!isBrowser()) return;

  const root = document.documentElement;
  const style = root.style;

  // Get all custom properties
  for (let i = style.length - 1; i >= 0; i--) {
    const prop = style[i];
    if (prop.startsWith("--")) {
      root.style.removeProperty(prop);
    }
  }
}

// ============================================================================
// Token Injection
// ============================================================================

/**
 * Inject design tokens as CSS variables
 */
export function injectTokens(tokens: DesignTokens): void {
  const vars = generateCSSVariables(tokens);
  injectCSSVariables(vars);
}

/**
 * Update only changed tokens (diff-based update)
 */
export function updateTokens(
  oldTokens: DesignTokens,
  newTokens: DesignTokens
): void {
  const diffVars = generateDiffVariables(oldTokens, newTokens);

  if (Object.keys(diffVars).length > 0) {
    injectCSSVariables(diffVars);
  }
}

// ============================================================================
// Data Attributes
// ============================================================================

/**
 * Set theme-related data attributes on the document
 */
export function setThemeDataAttributes(options: {
  mode?: "light" | "dark";
  ageGroup?: string | null;
  role?: string;
  highContrast?: boolean;
  reducedMotion?: boolean;
}): void {
  if (!isBrowser()) return;

  const root = document.documentElement;

  if (options.mode !== undefined) {
    root.setAttribute(DATA_ATTRIBUTES.mode, options.mode);
    // Also set the 'class' for Tailwind dark mode
    if (options.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  if (options.ageGroup !== undefined) {
    if (options.ageGroup) {
      root.setAttribute(DATA_ATTRIBUTES.ageGroup, options.ageGroup);
    } else {
      root.removeAttribute(DATA_ATTRIBUTES.ageGroup);
    }
  }

  if (options.role !== undefined) {
    root.setAttribute(DATA_ATTRIBUTES.role, options.role);
  }

  if (options.highContrast !== undefined) {
    root.setAttribute(
      DATA_ATTRIBUTES.highContrast,
      options.highContrast.toString()
    );
  }

  if (options.reducedMotion !== undefined) {
    root.setAttribute(
      DATA_ATTRIBUTES.reducedMotion,
      options.reducedMotion.toString()
    );
  }
}

/**
 * Get current theme data attributes
 */
export function getThemeDataAttributes(): {
  mode: "light" | "dark" | null;
  ageGroup: string | null;
  role: string | null;
  highContrast: boolean;
  reducedMotion: boolean;
} {
  if (!isBrowser()) {
    return {
      mode: null,
      ageGroup: null,
      role: null,
      highContrast: false,
      reducedMotion: false,
    };
  }

  const root = document.documentElement;

  return {
    mode: root.getAttribute(DATA_ATTRIBUTES.mode) as "light" | "dark" | null,
    ageGroup: root.getAttribute(DATA_ATTRIBUTES.ageGroup),
    role: root.getAttribute(DATA_ATTRIBUTES.role),
    highContrast: root.getAttribute(DATA_ATTRIBUTES.highContrast) === "true",
    reducedMotion: root.getAttribute(DATA_ATTRIBUTES.reducedMotion) === "true",
  };
}

// ============================================================================
// Stylesheet Injection
// ============================================================================

/**
 * Inject a complete stylesheet
 */
export function injectStylesheet(css: string): void {
  const styleEl = getStyleElement();
  if (styleEl) {
    styleEl.textContent = css;
  }
}

/**
 * Append additional CSS to the theme stylesheet
 */
export function appendStyles(css: string): void {
  const styleEl = getStyleElement();
  if (styleEl) {
    styleEl.textContent += css;
  }
}

/**
 * Remove the theme stylesheet
 */
export function removeStylesheet(): void {
  if (!isBrowser()) return;

  const styleEl = document.getElementById(STYLE_ID);
  if (styleEl) {
    styleEl.remove();
  }
}

// ============================================================================
// System Preference Detection
// ============================================================================

/**
 * Get system color scheme preference
 */
export function getSystemColorScheme(): "light" | "dark" {
  if (!isBrowser()) return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Get system reduced motion preference
 */
export function getSystemReducedMotion(): boolean {
  if (!isBrowser()) return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Subscribe to system color scheme changes
 */
export function subscribeToColorSchemeChanges(
  callback: (scheme: "light" | "dark") => void
): () => void {
  if (!isBrowser()) return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? "dark" : "light");
  };

  mediaQuery.addEventListener("change", handler);

  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
}

/**
 * Subscribe to reduced motion preference changes
 */
export function subscribeToReducedMotionChanges(
  callback: (reduced: boolean) => void
): () => void {
  if (!isBrowser()) return () => {};

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener("change", handler);

  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
}

// ============================================================================
// Full Theme Application
// ============================================================================

/**
 * Apply a complete theme to the document
 */
export function applyTheme(
  tokens: DesignTokens,
  options: {
    mode: "light" | "dark";
    ageGroup?: string | null;
    role?: string;
    highContrast?: boolean;
    reducedMotion?: boolean;
  }
): void {
  // Inject CSS variables
  injectTokens(tokens);

  // Set data attributes
  setThemeDataAttributes(options);
}

/**
 * Initialize theme from stored preferences
 */
export function initializeTheme(
  defaultMode: "light" | "dark" | "system" = "system"
): "light" | "dark" {
  let resolvedMode: "light" | "dark";

  if (defaultMode === "system") {
    resolvedMode = getSystemColorScheme();
  } else {
    resolvedMode = defaultMode;
  }

  // Apply dark class immediately to prevent flash
  if (isBrowser()) {
    if (resolvedMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return resolvedMode;
}
