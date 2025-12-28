/**
 * Accessibility Theme Presets
 *
 * These presets provide accessibility-focused theme variants including
 * high contrast modes and reduced motion settings.
 *
 * Follows WCAG 2.1 AA and AAA guidelines where applicable.
 *
 * @module theme/presets/accessibility
 */

import type {
  PartialDesignTokens,
  ThemeLayer,
  AccessibilityPreferences,
  ColorValue,
} from "../../core/types";
import { LAYER_PRIORITIES, createLayer } from "../../core/builder";

// ============================================================================
// High Contrast Light Mode
// ============================================================================

/**
 * High contrast light mode tokens
 * WCAG AAA compliant (7:1 contrast ratio minimum)
 */
export const highContrastLightTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Maximum contrast background/foreground
      background: "oklch(1 0 0)" as ColorValue,
      foreground: "oklch(0 0 0)" as ColorValue,
      card: "oklch(1 0 0)" as ColorValue,
      cardForeground: "oklch(0 0 0)" as ColorValue,
      popover: "oklch(1 0 0)" as ColorValue,
      popoverForeground: "oklch(0 0 0)" as ColorValue,

      // High contrast primary - deep blue
      primary: "oklch(0.3 0.15 250)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,

      // High contrast secondary - dark gray
      secondary: "oklch(0.9 0 0)" as ColorValue,
      secondaryForeground: "oklch(0 0 0)" as ColorValue,

      // Muted but still visible
      muted: "oklch(0.92 0 0)" as ColorValue,
      mutedForeground: "oklch(0.25 0 0)" as ColorValue,

      // Accent - high contrast gold
      accent: "oklch(0.6 0.2 85)" as ColorValue,
      accentForeground: "oklch(0 0 0)" as ColorValue,

      // Error/destructive - high contrast red
      destructive: "oklch(0.45 0.3 25)" as ColorValue,
      destructiveForeground: "oklch(1 0 0)" as ColorValue,

      // Strong borders
      border: "oklch(0.3 0 0)" as ColorValue,
      input: "oklch(0.3 0 0)" as ColorValue,
      ring: "oklch(0 0 0)" as ColorValue,
    },
    status: {
      success: "oklch(0.35 0.2 145)" as ColorValue,
      successForeground: "oklch(1 0 0)" as ColorValue,
      warning: "oklch(0.55 0.22 85)" as ColorValue,
      warningForeground: "oklch(0 0 0)" as ColorValue,
      error: "oklch(0.45 0.3 25)" as ColorValue,
      errorForeground: "oklch(1 0 0)" as ColorValue,
      info: "oklch(0.35 0.18 250)" as ColorValue,
      infoForeground: "oklch(1 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.95 0 0)" as ColorValue,
      sidebarForeground: "oklch(0 0 0)" as ColorValue,
      sidebarPrimary: "oklch(0.3 0.15 250)" as ColorValue,
      sidebarPrimaryForeground: "oklch(1 0 0)" as ColorValue,
      sidebarAccent: "oklch(0.88 0 0)" as ColorValue,
      sidebarAccentForeground: "oklch(0 0 0)" as ColorValue,
      sidebarBorder: "oklch(0.3 0 0)" as ColorValue,
      sidebarRing: "oklch(0 0 0)" as ColorValue,
    },
  },
  shadows: {
    sm: "0 1px 2px 0 oklch(0 0 0 / 0.15)",
    md: "0 4px 6px -1px oklch(0 0 0 / 0.2), 0 2px 4px -2px oklch(0 0 0 / 0.15)",
    lg: "0 10px 15px -3px oklch(0 0 0 / 0.2), 0 4px 6px -4px oklch(0 0 0 / 0.15)",
    xl: "0 20px 25px -5px oklch(0 0 0 / 0.2), 0 8px 10px -6px oklch(0 0 0 / 0.15)",
    "2xl": "0 25px 50px -12px oklch(0 0 0 / 0.35)",
    inner: "inset 0 2px 4px 0 oklch(0 0 0 / 0.1)",
    none: "none",
  },
};

// ============================================================================
// High Contrast Dark Mode
// ============================================================================

/**
 * High contrast dark mode tokens
 * WCAG AAA compliant (7:1 contrast ratio minimum)
 */
export const highContrastDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Pure black background with white text
      background: "oklch(0 0 0)" as ColorValue,
      foreground: "oklch(1 0 0)" as ColorValue,
      card: "oklch(0.08 0 0)" as ColorValue,
      cardForeground: "oklch(1 0 0)" as ColorValue,
      popover: "oklch(0.08 0 0)" as ColorValue,
      popoverForeground: "oklch(1 0 0)" as ColorValue,

      // High contrast primary - bright blue
      primary: "oklch(0.75 0.18 250)" as ColorValue,
      primaryForeground: "oklch(0 0 0)" as ColorValue,

      // High contrast secondary
      secondary: "oklch(0.2 0 0)" as ColorValue,
      secondaryForeground: "oklch(1 0 0)" as ColorValue,

      // Muted
      muted: "oklch(0.15 0 0)" as ColorValue,
      mutedForeground: "oklch(0.8 0 0)" as ColorValue,

      // Accent - bright gold
      accent: "oklch(0.85 0.18 85)" as ColorValue,
      accentForeground: "oklch(0 0 0)" as ColorValue,

      // Error/destructive - bright red
      destructive: "oklch(0.7 0.25 25)" as ColorValue,
      destructiveForeground: "oklch(0 0 0)" as ColorValue,

      // Strong borders in white
      border: "oklch(0.7 0 0)" as ColorValue,
      input: "oklch(0.7 0 0)" as ColorValue,
      ring: "oklch(1 0 0)" as ColorValue,
    },
    status: {
      success: "oklch(0.75 0.18 145)" as ColorValue,
      successForeground: "oklch(0 0 0)" as ColorValue,
      warning: "oklch(0.85 0.18 85)" as ColorValue,
      warningForeground: "oklch(0 0 0)" as ColorValue,
      error: "oklch(0.7 0.25 25)" as ColorValue,
      errorForeground: "oklch(0 0 0)" as ColorValue,
      info: "oklch(0.75 0.15 250)" as ColorValue,
      infoForeground: "oklch(0 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.05 0 0)" as ColorValue,
      sidebarForeground: "oklch(1 0 0)" as ColorValue,
      sidebarPrimary: "oklch(0.75 0.18 250)" as ColorValue,
      sidebarPrimaryForeground: "oklch(0 0 0)" as ColorValue,
      sidebarAccent: "oklch(0.12 0 0)" as ColorValue,
      sidebarAccentForeground: "oklch(1 0 0)" as ColorValue,
      sidebarBorder: "oklch(0.7 0 0)" as ColorValue,
      sidebarRing: "oklch(1 0 0)" as ColorValue,
    },
  },
  shadows: {
    sm: "0 1px 2px 0 oklch(0 0 0 / 0.5)",
    md: "0 4px 6px -1px oklch(0 0 0 / 0.6), 0 2px 4px -2px oklch(0 0 0 / 0.4)",
    lg: "0 10px 15px -3px oklch(0 0 0 / 0.6), 0 4px 6px -4px oklch(0 0 0 / 0.4)",
    xl: "0 20px 25px -5px oklch(0 0 0 / 0.6), 0 8px 10px -6px oklch(0 0 0 / 0.4)",
    "2xl": "0 25px 50px -12px oklch(0 0 0 / 0.8)",
    inner: "inset 0 2px 4px 0 oklch(0 0 0 / 0.4)",
    none: "none",
  },
};

// ============================================================================
// Reduced Motion Tokens
// ============================================================================

/**
 * Reduced motion animation tokens
 * Disables or minimizes all animations
 */
export const reducedMotionTokens: PartialDesignTokens = {
  animations: {
    reduceMotion: true,
    durations: {
      75: "0ms",
      100: "0ms",
      150: "0ms",
      200: "0ms",
      300: "0ms",
      500: "0ms",
      700: "0ms",
      1000: "0ms",
    },
  },
};

// ============================================================================
// Large Font Tokens
// ============================================================================

/**
 * Large font size tokens
 * Increases all font sizes by approximately 20%
 */
export const largeFontTokens: PartialDesignTokens = {
  typography: {
    sizes: {
      xs: "0.9rem", // 14.4px
      sm: "1.05rem", // 16.8px
      base: "1.2rem", // 19.2px
      lg: "1.35rem", // 21.6px
      xl: "1.5rem", // 24px
      "2xl": "1.8rem", // 28.8px
      "3xl": "2.25rem", // 36px
      "4xl": "2.7rem", // 43.2px
      "5xl": "3.6rem", // 57.6px
      "6xl": "4.5rem", // 72px
    },
  },
};

/**
 * Extra large font size tokens
 * Increases all font sizes by approximately 40%
 */
export const xLargeFontTokens: PartialDesignTokens = {
  typography: {
    sizes: {
      xs: "1.05rem", // 16.8px
      sm: "1.225rem", // 19.6px
      base: "1.4rem", // 22.4px
      lg: "1.575rem", // 25.2px
      xl: "1.75rem", // 28px
      "2xl": "2.1rem", // 33.6px
      "3xl": "2.625rem", // 42px
      "4xl": "3.15rem", // 50.4px
      "5xl": "4.2rem", // 67.2px
      "6xl": "5.25rem", // 84px
    },
  },
};

// ============================================================================
// Layer Creation
// ============================================================================

/**
 * Create a high contrast theme layer
 */
export function createHighContrastLayer(mode: "light" | "dark"): ThemeLayer {
  const tokens =
    mode === "dark" ? highContrastDarkTokens : highContrastLightTokens;
  return createLayer(
    "accessibility",
    `high-contrast-${mode}`,
    tokens,
    LAYER_PRIORITIES.accessibility
  );
}

/**
 * Create a reduced motion theme layer
 */
export function createReducedMotionLayer(): ThemeLayer {
  return createLayer(
    "accessibility",
    "reduced-motion",
    reducedMotionTokens,
    LAYER_PRIORITIES.accessibility - 10 // Slightly lower priority than high contrast
  );
}

/**
 * Create a font scaling theme layer
 */
export function createFontScalingLayer(
  scale: "normal" | "large" | "x-large"
): ThemeLayer {
  if (scale === "normal") {
    return createLayer("accessibility", "normal-font", {}, 0);
  }

  const tokens = scale === "x-large" ? xLargeFontTokens : largeFontTokens;
  return createLayer(
    "accessibility",
    `${scale}-font`,
    tokens,
    LAYER_PRIORITIES.accessibility - 5
  );
}

/**
 * Create all accessibility layers based on preferences
 */
export function createAccessibilityLayers(
  prefs: AccessibilityPreferences,
  mode: "light" | "dark"
): ThemeLayer[] {
  const layers: ThemeLayer[] = [];

  // Add high contrast if enabled
  if (prefs.highContrast || prefs.colorScheme === "high-contrast") {
    layers.push(createHighContrastLayer(mode));
  }

  // Add reduced motion if enabled
  if (prefs.reducedMotion === "reduce") {
    layers.push(createReducedMotionLayer());
  }

  // Add font scaling if not normal
  if (prefs.fontScaling !== "normal") {
    layers.push(createFontScalingLayer(prefs.fontScaling));
  }

  return layers;
}

// ============================================================================
// CSS Generation for Accessibility
// ============================================================================

/**
 * Generate CSS for focus indicators
 * High contrast mode needs more visible focus rings
 */
export function generateFocusIndicatorCSS(highContrast: boolean): string {
  if (highContrast) {
    return `
:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

a:focus-visible,
button:focus-visible,
[role="button"]:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px var(--background);
}
`;
  }

  return `
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}
`;
}

/**
 * Generate CSS for skip links
 */
export function generateSkipLinkCSS(): string {
  return `
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 9999;
  padding: 1rem;
  background: var(--background);
  color: var(--foreground);
  border: 2px solid var(--border);
  text-decoration: none;
  font-weight: 600;
}

.skip-link:focus {
  left: 1rem;
  top: 1rem;
}
`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if high contrast mode should be enabled based on system preferences
 */
export function shouldEnableHighContrast(): boolean {
  if (typeof window === "undefined") return false;

  // Check for Windows High Contrast Mode
  return window.matchMedia("(forced-colors: active)").matches;
}

/**
 * Check if reduced motion should be enabled based on system preferences
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get default accessibility preferences based on system settings
 */
export function getSystemAccessibilityPreferences(): AccessibilityPreferences {
  return {
    reducedMotion: shouldReduceMotion() ? "reduce" : "no-preference",
    colorScheme: shouldEnableHighContrast() ? "high-contrast" : "normal",
    fontScaling: "normal",
    highContrast: shouldEnableHighContrast(),
  };
}
