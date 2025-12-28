/**
 * Core Theme Type Definitions
 *
 * This module defines the complete type system for the centralized theme architecture.
 * All theme-related types are defined here to ensure type safety across the application.
 *
 * @module theme/core/types
 */

// ============================================================================
// Base Enums and Constants
// ============================================================================

/**
 * Available theme modes (light/dark)
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Resolved theme mode (after system preference detection)
 */
export type ResolvedThemeMode = "light" | "dark";

/**
 * Age groups for adaptive UI theming
 * Maps to grade levels:
 * - early-elementary: K-2
 * - upper-elementary: 3-5
 * - middle-school: 6-8
 * - high-school: 9-12
 */
export type AgeGroup =
  | "early-elementary"
  | "upper-elementary"
  | "middle-school"
  | "high-school";

/**
 * User roles that can have specific theme variations
 */
export type UserRole =
  | "learner"
  | "parent"
  | "teacher"
  | "school_admin"
  | "platform_admin"
  | "guest";

/**
 * Accessibility preference options
 */
export type ReducedMotion = "no-preference" | "reduce";
export type ColorScheme = "normal" | "high-contrast";
export type FontScaling = "normal" | "large" | "x-large";

// ============================================================================
// Color Tokens
// ============================================================================

/**
 * OKLCH color value
 * Format: "oklch(L C H)" where:
 * - L: Lightness (0-1)
 * - C: Chroma (0-0.4+)
 * - H: Hue (0-360)
 */
export type OklchColor = `oklch(${string})`;

/**
 * Color with optional alpha
 */
export type ColorValue = OklchColor | `oklch(${string} / ${string})`;

/**
 * Semantic color scale for a single color
 */
export interface ColorScale {
  50: ColorValue;
  100: ColorValue;
  200: ColorValue;
  300: ColorValue;
  400: ColorValue;
  500: ColorValue;
  600: ColorValue;
  700: ColorValue;
  800: ColorValue;
  900: ColorValue;
  950: ColorValue;
}

/**
 * Core semantic colors used throughout the application
 */
export interface SemanticColors {
  background: ColorValue;
  foreground: ColorValue;
  card: ColorValue;
  cardForeground: ColorValue;
  popover: ColorValue;
  popoverForeground: ColorValue;
  primary: ColorValue;
  primaryForeground: ColorValue;
  secondary: ColorValue;
  secondaryForeground: ColorValue;
  muted: ColorValue;
  mutedForeground: ColorValue;
  accent: ColorValue;
  accentForeground: ColorValue;
  destructive: ColorValue;
  destructiveForeground: ColorValue;
  border: ColorValue;
  input: ColorValue;
  ring: ColorValue;
}

/**
 * Chart-specific colors
 */
export interface ChartColors {
  chart1: ColorValue;
  chart2: ColorValue;
  chart3: ColorValue;
  chart4: ColorValue;
  chart5: ColorValue;
}

/**
 * Sidebar-specific colors
 */
export interface SidebarColors {
  sidebar: ColorValue;
  sidebarForeground: ColorValue;
  sidebarPrimary: ColorValue;
  sidebarPrimaryForeground: ColorValue;
  sidebarAccent: ColorValue;
  sidebarAccentForeground: ColorValue;
  sidebarBorder: ColorValue;
  sidebarRing: ColorValue;
}

/**
 * Status and feedback colors
 */
export interface StatusColors {
  success: ColorValue;
  successForeground: ColorValue;
  warning: ColorValue;
  warningForeground: ColorValue;
  error: ColorValue;
  errorForeground: ColorValue;
  info: ColorValue;
  infoForeground: ColorValue;
}

/**
 * Complete color token set
 */
export interface ColorTokens {
  semantic: SemanticColors;
  chart: ChartColors;
  sidebar: SidebarColors;
  status: StatusColors;
}

// ============================================================================
// Typography Tokens
// ============================================================================

/**
 * Font family definitions
 */
export interface FontFamilies {
  sans: string;
  mono: string;
  display?: string;
  handwriting?: string;
}

/**
 * Font size scale
 */
export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
  "5xl": string;
  "6xl": string;
}

/**
 * Font weight options
 */
export interface FontWeights {
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
}

/**
 * Line height scale
 */
export interface LineHeights {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

/**
 * Letter spacing scale
 */
export interface LetterSpacing {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

/**
 * Complete typography token set
 */
export interface TypographyTokens {
  families: FontFamilies;
  sizes: FontSizes;
  weights: FontWeights;
  lineHeights: LineHeights;
  letterSpacing: LetterSpacing;
}

// ============================================================================
// Spacing and Layout Tokens
// ============================================================================

/**
 * Spacing scale (based on 4px grid)
 */
export interface SpacingTokens {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

/**
 * Border radius tokens
 */
export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  full: string;
}

// ============================================================================
// Animation Tokens
// ============================================================================

/**
 * Transition timing functions
 */
export interface TransitionTimings {
  linear: string;
  in: string;
  out: string;
  inOut: string;
}

/**
 * Transition durations
 */
export interface TransitionDurations {
  75: string;
  100: string;
  150: string;
  200: string;
  300: string;
  500: string;
  700: string;
  1000: string;
}

/**
 * Animation tokens
 */
export interface AnimationTokens {
  timings: TransitionTimings;
  durations: TransitionDurations;
  reduceMotion: boolean;
}

// ============================================================================
// Shadow Tokens
// ============================================================================

/**
 * Box shadow definitions
 */
export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  inner: string;
  none: string;
}

// ============================================================================
// Theme Composition
// ============================================================================

/**
 * A complete set of design tokens for a theme
 */
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  animations: AnimationTokens;
  shadows: ShadowTokens;
}

/**
 * Partial design tokens for theme layers/overrides
 */
export type PartialDesignTokens = DeepPartial<DesignTokens>;

/**
 * Theme layer types in order of precedence (lowest to highest)
 */
export type ThemeLayerType =
  | "base"
  | "mode"
  | "age"
  | "role"
  | "accessibility"
  | "organization";

/**
 * A theme layer with its tokens and metadata
 */
export interface ThemeLayer {
  type: ThemeLayerType;
  name: string;
  tokens: PartialDesignTokens;
  priority: number;
}

/**
 * Computed/resolved theme with all layers merged
 */
export interface ResolvedTheme {
  tokens: DesignTokens;
  layers: ThemeLayer[];
  meta: ThemeMeta;
}

/**
 * Theme metadata
 */
export interface ThemeMeta {
  mode: ResolvedThemeMode;
  ageGroup: AgeGroup | null;
  userRole: UserRole;
  organizationId: string | null;
  accessibility: AccessibilityPreferences;
  computedAt: number;
}

// ============================================================================
// Accessibility
// ============================================================================

/**
 * User's accessibility preferences
 */
export interface AccessibilityPreferences {
  reducedMotion: ReducedMotion;
  colorScheme: ColorScheme;
  fontScaling: FontScaling;
  highContrast: boolean;
}

/**
 * Default accessibility preferences
 */
export const DEFAULT_ACCESSIBILITY: AccessibilityPreferences = {
  reducedMotion: "no-preference",
  colorScheme: "normal",
  fontScaling: "normal",
  highContrast: false,
};

// ============================================================================
// Organization Branding
// ============================================================================

/**
 * Organization-specific branding configuration
 */
export interface OrganizationBranding {
  organizationId: string;
  name: string;
  logo?: {
    light?: string;
    dark?: string;
  };
  colors?: {
    primary?: ColorValue;
    primaryForeground?: ColorValue;
    secondary?: ColorValue;
    secondaryForeground?: ColorValue;
    accent?: ColorValue;
    accentForeground?: ColorValue;
  };
  typography?: {
    fontFamily?: string;
    displayFont?: string;
  };
  customTokens?: PartialDesignTokens;
}

// ============================================================================
// Theme Context
// ============================================================================

/**
 * Current theme state
 */
export interface ThemeState {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  ageGroup: AgeGroup | null;
  userRole: UserRole;
  organizationId: string | null;
  accessibility: AccessibilityPreferences;
  resolvedTheme: ResolvedTheme | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Theme actions available to consumers
 */
export interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  setAgeGroup: (ageGroup: AgeGroup | null) => void;
  setUserRole: (role: UserRole) => void;
  setOrganization: (organizationId: string | null) => void;
  setAccessibility: (prefs: Partial<AccessibilityPreferences>) => void;
  toggleHighContrast: () => void;
  resetToDefaults: () => void;
}

/**
 * Complete theme context value
 */
export interface ThemeContextValue {
  state: ThemeState;
  actions: ThemeActions;
  tokens: DesignTokens | null;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Theme system configuration
 */
export interface ThemeConfig {
  defaultMode: ThemeMode;
  defaultAgeGroup: AgeGroup | null;
  storageKey: string;
  enableSystemPreference: boolean;
  enableOrganizationBranding: boolean;
  enableAccessibilityFeatures: boolean;
  cacheTimeout: number;
}

/**
 * Default theme configuration
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  defaultMode: "system",
  defaultAgeGroup: null,
  storageKey: "kaelyns-academy-theme",
  enableSystemPreference: true,
  enableOrganizationBranding: true,
  enableAccessibilityFeatures: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep partial type for nested optional properties
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * CSS variable name type
 */
export type CSSVariableName = `--${string}`;

/**
 * CSS variable map
 */
export type CSSVariables = Record<CSSVariableName, string>;

// ============================================================================
// Grade Level Mapping
// ============================================================================

/**
 * Grade level string type
 */
export type GradeLevel =
  | "K"
  | "1st"
  | "2nd"
  | "3rd"
  | "4th"
  | "5th"
  | "6th"
  | "7th"
  | "8th"
  | "9th"
  | "10th"
  | "11th"
  | "12th";

/**
 * Map grade level to age group
 */
export function gradeToAgeGroup(grade: GradeLevel | null): AgeGroup | null {
  if (!grade) return null;

  const earlyElementary: GradeLevel[] = ["K", "1st", "2nd"];
  const upperElementary: GradeLevel[] = ["3rd", "4th", "5th"];
  const middleSchool: GradeLevel[] = ["6th", "7th", "8th"];

  if (earlyElementary.includes(grade)) return "early-elementary";
  if (upperElementary.includes(grade)) return "upper-elementary";
  if (middleSchool.includes(grade)) return "middle-school";
  return "high-school";
}

/**
 * Get display name for age group
 */
export function getAgeGroupDisplayName(ageGroup: AgeGroup): string {
  const names: Record<AgeGroup, string> = {
    "early-elementary": "Early Elementary (K-2)",
    "upper-elementary": "Upper Elementary (3-5)",
    "middle-school": "Middle School (6-8)",
    "high-school": "High School (9-12)",
  };
  return names[ageGroup];
}
