/**
 * Centralized Theme System
 *
 * This is the main entry point for the Kaelyn's Academy theme system.
 * It provides a complete, type-safe theming solution with support for:
 *
 * - Light/Dark mode with system preference detection
 * - Age-adaptive themes for K-12 education
 * - Role-based styling (learner, parent, teacher, admin)
 * - Accessibility features (high contrast, reduced motion, font scaling)
 * - Organization branding customization
 *
 * @module theme
 */

// ============================================================================
// Core Types
// ============================================================================

export type {
  // Base types
  ThemeMode,
  ResolvedThemeMode,
  AgeGroup,
  UserRole,

  // Accessibility types
  ReducedMotion,
  ColorScheme,
  FontScaling,
  AccessibilityPreferences,

  // Color types
  OklchColor,
  ColorValue,
  ColorScale,
  SemanticColors,
  ChartColors,
  SidebarColors,
  StatusColors,
  ColorTokens,

  // Typography types
  FontFamilies,
  FontSizes,
  FontWeights,
  LineHeights,
  LetterSpacing,
  TypographyTokens,

  // Other token types
  SpacingTokens,
  RadiusTokens,
  AnimationTokens,
  ShadowTokens,
  TransitionTimings,
  TransitionDurations,

  // Theme composition types
  DesignTokens,
  PartialDesignTokens,
  ThemeLayerType,
  ThemeLayer,
  ResolvedTheme,
  ThemeMeta,

  // Organization types
  OrganizationBranding,

  // Context types
  ThemeState,
  ThemeActions,
  ThemeContextValue,

  // Configuration types
  ThemeConfig,

  // Utility types
  DeepPartial,
  RequireFields,
  CSSVariableName,
  CSSVariables,
  GradeLevel,
} from "./core/types";

// Export functions from types
export {
  gradeToAgeGroup,
  getAgeGroupDisplayName,
  DEFAULT_ACCESSIBILITY,
  DEFAULT_THEME_CONFIG,
} from "./core/types";

// ============================================================================
// Core Tokens
// ============================================================================

export {
  // Light mode tokens
  lightColorTokens,
  lightDesignTokens,
  lightShadowTokens,

  // Dark mode tokens
  darkColorTokens,
  darkDesignTokens,
  darkShadowTokens,

  // Base tokens
  baseTypographyTokens,
  baseSpacingTokens,
  baseRadiusTokens,
  baseAnimationTokens,
  reducedMotionAnimationTokens,

  // Token utilities
  getTokensForMode,
  getColorTokensForMode,
} from "./core/tokens";

// ============================================================================
// Theme Builder
// ============================================================================

export {
  // Builder class
  ThemeBuilder,
  type ThemeBuildConfig,

  // Layer creation
  LAYER_PRIORITIES,
  createLayer,
  createModeLayer as createBaseModeLayer,
  createAccessibilityLayer,
  createOrganizationLayer,

  // Quick build functions
  buildTheme,
  buildLightTheme,
  buildDarkTheme,

  // Caching
  ThemeCache,
  themeCache,
} from "./core/builder";

// ============================================================================
// Theme Merger
// ============================================================================

export {
  // Core merge functions
  deepMerge,
  mergeAll,

  // Layer management
  sortLayersByPriority,
  mergeThemeLayers,
  filterLayersByType,
  removeLayersByType,

  // Token manipulation
  extractToken,
  setToken,

  // Comparison
  diffObjects,
  areTokensEqual,

  // Validation
  validateRequiredTokens,

  // Immutability
  freezeDeep,
  cloneDeep,
} from "./core/merger";

// ============================================================================
// CSS Generation
// ============================================================================

export {
  // Variable generation
  generateCSSVariables,
  cssVariablesToString,
  generateStylesheet,

  // Style objects
  generateStyleObject,
  tokensToStyleObject,

  // Diff-based updates
  generateDiffVariables,

  // Utility classes
  generateUtilityClasses,

  // Layer-specific CSS
  generateAgeGroupCSS,
  generateRoleCSS,
} from "./css/generator";

// ============================================================================
// CSS Injection
// ============================================================================

export {
  // Variable injection
  injectCSSVariables,
  removeCSSVariables,
  clearCSSVariables,

  // Token injection
  injectTokens,
  updateTokens,

  // Data attributes
  setThemeDataAttributes,
  getThemeDataAttributes,

  // Stylesheet management
  injectStylesheet,
  appendStyles,
  removeStylesheet,

  // System preference detection
  getSystemColorScheme,
  getSystemReducedMotion,
  subscribeToColorSchemeChanges as subscribeToSystemColorScheme,
  subscribeToReducedMotionChanges,

  // Full theme application
  applyTheme,
  initializeTheme,
} from "./css/injector";

// ============================================================================
// Presets
// ============================================================================

export * from "./presets";
