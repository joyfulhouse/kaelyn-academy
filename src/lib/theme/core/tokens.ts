/**
 * Base Design Tokens
 *
 * This module defines the foundational design tokens for the theme system.
 * These tokens serve as the default values that theme layers can override.
 *
 * Color values use OKLCH format for perceptual uniformity:
 * oklch(L C H) where L=lightness(0-1), C=chroma(0-0.4), H=hue(0-360)
 *
 * @module theme/core/tokens
 */

import type {
  DesignTokens,
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  RadiusTokens,
  AnimationTokens,
  ShadowTokens,
  SemanticColors,
  ChartColors,
  SidebarColors,
  StatusColors,
  ColorValue,
} from "./types";

// ============================================================================
// Light Mode Colors
// ============================================================================

const lightSemanticColors: SemanticColors = {
  background: "oklch(1 0 0)" as ColorValue,
  foreground: "oklch(0.145 0 0)" as ColorValue,
  card: "oklch(1 0 0)" as ColorValue,
  cardForeground: "oklch(0.145 0 0)" as ColorValue,
  popover: "oklch(1 0 0)" as ColorValue,
  popoverForeground: "oklch(0.145 0 0)" as ColorValue,
  primary: "oklch(0.205 0 0)" as ColorValue,
  primaryForeground: "oklch(0.985 0 0)" as ColorValue,
  secondary: "oklch(0.97 0 0)" as ColorValue,
  secondaryForeground: "oklch(0.205 0 0)" as ColorValue,
  muted: "oklch(0.97 0 0)" as ColorValue,
  mutedForeground: "oklch(0.556 0 0)" as ColorValue,
  accent: "oklch(0.97 0 0)" as ColorValue,
  accentForeground: "oklch(0.205 0 0)" as ColorValue,
  destructive: "oklch(0.577 0.245 27.325)" as ColorValue,
  destructiveForeground: "oklch(0.985 0 0)" as ColorValue,
  border: "oklch(0.922 0 0)" as ColorValue,
  input: "oklch(0.922 0 0)" as ColorValue,
  ring: "oklch(0.708 0 0)" as ColorValue,
};

const lightChartColors: ChartColors = {
  chart1: "oklch(0.646 0.222 41.116)" as ColorValue,
  chart2: "oklch(0.6 0.118 184.704)" as ColorValue,
  chart3: "oklch(0.398 0.07 227.392)" as ColorValue,
  chart4: "oklch(0.828 0.189 84.429)" as ColorValue,
  chart5: "oklch(0.769 0.188 70.08)" as ColorValue,
};

const lightSidebarColors: SidebarColors = {
  sidebar: "oklch(0.985 0 0)" as ColorValue,
  sidebarForeground: "oklch(0.145 0 0)" as ColorValue,
  sidebarPrimary: "oklch(0.205 0 0)" as ColorValue,
  sidebarPrimaryForeground: "oklch(0.985 0 0)" as ColorValue,
  sidebarAccent: "oklch(0.97 0 0)" as ColorValue,
  sidebarAccentForeground: "oklch(0.205 0 0)" as ColorValue,
  sidebarBorder: "oklch(0.922 0 0)" as ColorValue,
  sidebarRing: "oklch(0.708 0 0)" as ColorValue,
};

const lightStatusColors: StatusColors = {
  success: "oklch(0.627 0.194 145.0)" as ColorValue,
  successForeground: "oklch(0.985 0 0)" as ColorValue,
  warning: "oklch(0.769 0.188 70.08)" as ColorValue,
  warningForeground: "oklch(0.205 0 0)" as ColorValue,
  error: "oklch(0.577 0.245 27.325)" as ColorValue,
  errorForeground: "oklch(0.985 0 0)" as ColorValue,
  info: "oklch(0.6 0.118 230.0)" as ColorValue,
  infoForeground: "oklch(0.985 0 0)" as ColorValue,
};

/**
 * Complete light mode color tokens
 */
export const lightColorTokens: ColorTokens = {
  semantic: lightSemanticColors,
  chart: lightChartColors,
  sidebar: lightSidebarColors,
  status: lightStatusColors,
};

// ============================================================================
// Dark Mode Colors
// ============================================================================

const darkSemanticColors: SemanticColors = {
  background: "oklch(0.145 0 0)" as ColorValue,
  foreground: "oklch(0.985 0 0)" as ColorValue,
  card: "oklch(0.205 0 0)" as ColorValue,
  cardForeground: "oklch(0.985 0 0)" as ColorValue,
  popover: "oklch(0.205 0 0)" as ColorValue,
  popoverForeground: "oklch(0.985 0 0)" as ColorValue,
  primary: "oklch(0.922 0 0)" as ColorValue,
  primaryForeground: "oklch(0.205 0 0)" as ColorValue,
  secondary: "oklch(0.269 0 0)" as ColorValue,
  secondaryForeground: "oklch(0.985 0 0)" as ColorValue,
  muted: "oklch(0.269 0 0)" as ColorValue,
  mutedForeground: "oklch(0.708 0 0)" as ColorValue,
  accent: "oklch(0.269 0 0)" as ColorValue,
  accentForeground: "oklch(0.985 0 0)" as ColorValue,
  destructive: "oklch(0.704 0.191 22.216)" as ColorValue,
  destructiveForeground: "oklch(0.985 0 0)" as ColorValue,
  border: "oklch(1 0 0 / 10%)" as ColorValue,
  input: "oklch(1 0 0 / 15%)" as ColorValue,
  ring: "oklch(0.556 0 0)" as ColorValue,
};

const darkChartColors: ChartColors = {
  chart1: "oklch(0.488 0.243 264.376)" as ColorValue,
  chart2: "oklch(0.696 0.17 162.48)" as ColorValue,
  chart3: "oklch(0.769 0.188 70.08)" as ColorValue,
  chart4: "oklch(0.627 0.265 303.9)" as ColorValue,
  chart5: "oklch(0.645 0.246 16.439)" as ColorValue,
};

const darkSidebarColors: SidebarColors = {
  sidebar: "oklch(0.205 0 0)" as ColorValue,
  sidebarForeground: "oklch(0.985 0 0)" as ColorValue,
  sidebarPrimary: "oklch(0.488 0.243 264.376)" as ColorValue,
  sidebarPrimaryForeground: "oklch(0.985 0 0)" as ColorValue,
  sidebarAccent: "oklch(0.269 0 0)" as ColorValue,
  sidebarAccentForeground: "oklch(0.985 0 0)" as ColorValue,
  sidebarBorder: "oklch(1 0 0 / 10%)" as ColorValue,
  sidebarRing: "oklch(0.556 0 0)" as ColorValue,
};

const darkStatusColors: StatusColors = {
  success: "oklch(0.696 0.17 145.0)" as ColorValue,
  successForeground: "oklch(0.145 0 0)" as ColorValue,
  warning: "oklch(0.828 0.189 84.429)" as ColorValue,
  warningForeground: "oklch(0.145 0 0)" as ColorValue,
  error: "oklch(0.704 0.191 22.216)" as ColorValue,
  errorForeground: "oklch(0.985 0 0)" as ColorValue,
  info: "oklch(0.696 0.17 230.0)" as ColorValue,
  infoForeground: "oklch(0.145 0 0)" as ColorValue,
};

/**
 * Complete dark mode color tokens
 */
export const darkColorTokens: ColorTokens = {
  semantic: darkSemanticColors,
  chart: darkChartColors,
  sidebar: darkSidebarColors,
  status: darkStatusColors,
};

// ============================================================================
// Typography Tokens
// ============================================================================

/**
 * Base typography tokens
 * Uses CSS variable references to integrate with Geist font loaded via next/font
 */
export const baseTypographyTokens: TypographyTokens = {
  families: {
    sans: "var(--font-geist-sans), system-ui, sans-serif",
    mono: "var(--font-geist-mono), ui-monospace, monospace",
    display: "var(--font-geist-sans), system-ui, sans-serif",
    handwriting: "'Comic Sans MS', cursive, sans-serif", // For early-elementary
  },
  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
  },
};

// ============================================================================
// Spacing Tokens
// ============================================================================

/**
 * Spacing scale based on 4px grid
 */
export const baseSpacingTokens: SpacingTokens = {
  0: "0",
  px: "1px",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  3.5: "0.875rem", // 14px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  7: "1.75rem", // 28px
  8: "2rem", // 32px
  9: "2.25rem", // 36px
  10: "2.5rem", // 40px
  11: "2.75rem", // 44px
  12: "3rem", // 48px
  14: "3.5rem", // 56px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  28: "7rem", // 112px
  32: "8rem", // 128px
  36: "9rem", // 144px
  40: "10rem", // 160px
  44: "11rem", // 176px
  48: "12rem", // 192px
  52: "13rem", // 208px
  56: "14rem", // 224px
  60: "15rem", // 240px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
};

// ============================================================================
// Radius Tokens
// ============================================================================

/**
 * Border radius tokens
 * Base radius is 0.625rem (10px) as defined in globals.css
 */
export const baseRadiusTokens: RadiusTokens = {
  none: "0",
  sm: "calc(0.625rem - 4px)", // 6px
  md: "calc(0.625rem - 2px)", // 8px
  lg: "0.625rem", // 10px
  xl: "calc(0.625rem + 4px)", // 14px
  "2xl": "calc(0.625rem + 8px)", // 18px
  "3xl": "1.5rem", // 24px
  full: "9999px",
};

// ============================================================================
// Animation Tokens
// ============================================================================

/**
 * Animation and transition tokens
 */
export const baseAnimationTokens: AnimationTokens = {
  timings: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  durations: {
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    300: "300ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },
  reduceMotion: false,
};

/**
 * Reduced motion animation tokens
 */
export const reducedMotionAnimationTokens: AnimationTokens = {
  ...baseAnimationTokens,
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
  reduceMotion: true,
};

// ============================================================================
// Shadow Tokens
// ============================================================================

/**
 * Box shadow tokens for light mode
 */
export const lightShadowTokens: ShadowTokens = {
  sm: "0 1px 2px 0 oklch(0 0 0 / 0.05)",
  md: "0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px oklch(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 oklch(0 0 0 / 0.05)",
  none: "none",
};

/**
 * Box shadow tokens for dark mode
 */
export const darkShadowTokens: ShadowTokens = {
  sm: "0 1px 2px 0 oklch(0 0 0 / 0.2)",
  md: "0 4px 6px -1px oklch(0 0 0 / 0.3), 0 2px 4px -2px oklch(0 0 0 / 0.2)",
  lg: "0 10px 15px -3px oklch(0 0 0 / 0.3), 0 4px 6px -4px oklch(0 0 0 / 0.2)",
  xl: "0 20px 25px -5px oklch(0 0 0 / 0.3), 0 8px 10px -6px oklch(0 0 0 / 0.2)",
  "2xl": "0 25px 50px -12px oklch(0 0 0 / 0.5)",
  inner: "inset 0 2px 4px 0 oklch(0 0 0 / 0.2)",
  none: "none",
};

// ============================================================================
// Complete Token Sets
// ============================================================================

/**
 * Complete light mode design tokens
 */
export const lightDesignTokens: DesignTokens = {
  colors: lightColorTokens,
  typography: baseTypographyTokens,
  spacing: baseSpacingTokens,
  radius: baseRadiusTokens,
  animations: baseAnimationTokens,
  shadows: lightShadowTokens,
};

/**
 * Complete dark mode design tokens
 */
export const darkDesignTokens: DesignTokens = {
  colors: darkColorTokens,
  typography: baseTypographyTokens,
  spacing: baseSpacingTokens,
  radius: baseRadiusTokens,
  animations: baseAnimationTokens,
  shadows: darkShadowTokens,
};

// ============================================================================
// Token Utilities
// ============================================================================

/**
 * Get design tokens for a specific mode
 */
export function getTokensForMode(mode: "light" | "dark"): DesignTokens {
  return mode === "dark" ? darkDesignTokens : lightDesignTokens;
}

/**
 * Get color tokens for a specific mode
 */
export function getColorTokensForMode(mode: "light" | "dark"): ColorTokens {
  return mode === "dark" ? darkColorTokens : lightColorTokens;
}
