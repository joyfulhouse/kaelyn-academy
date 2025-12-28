/**
 * Age-Adaptive Theme Presets
 *
 * These presets adapt the UI for different age groups, following
 * developmental and accessibility guidelines for K-12 education.
 *
 * Age Groups:
 * - Early Elementary (K-2): Ages 5-8, large touch targets, simple navigation
 * - Upper Elementary (3-5): Ages 8-11, gamification elements, medium complexity
 * - Middle School (6-8): Ages 11-14, standard UI, achievement systems
 * - High School (9-12): Ages 14-18, full features, professional aesthetics
 *
 * @module theme/presets/age
 */

import type {
  PartialDesignTokens,
  ThemeLayer,
  AgeGroup,
  ColorValue,
} from "../../core/types";
import { LAYER_PRIORITIES, createLayer } from "../../core/builder";

// ============================================================================
// Early Elementary (K-2)
// ============================================================================

/**
 * Early Elementary theme tokens
 * Large, friendly, colorful, with high contrast and simple navigation
 */
export const earlyElementaryTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Warmer, more saturated primary for engagement
      primary: "oklch(0.65 0.25 260)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Bright, cheerful accent
      accent: "oklch(0.75 0.2 85)" as ColorValue,
      accentForeground: "oklch(0.2 0 0)" as ColorValue,
    },
  },
  typography: {
    families: {
      // Rounded, friendly font for young readers
      sans: "var(--font-geist-sans), 'Comic Sans MS', cursive, sans-serif",
    },
    sizes: {
      xs: "0.875rem", // 14px (minimum for young readers)
      sm: "1rem", // 16px
      base: "1.125rem", // 18px
      lg: "1.375rem", // 22px
      xl: "1.625rem", // 26px
      "2xl": "2rem", // 32px
      "3xl": "2.5rem", // 40px
      "4xl": "3rem", // 48px
      "5xl": "3.75rem", // 60px
      "6xl": "4.5rem", // 72px
    },
    lineHeights: {
      normal: 1.7, // Extra line spacing for readability
      relaxed: 1.8,
      loose: 2.2,
    },
  },
  radius: {
    sm: "0.75rem", // 12px - More rounded
    md: "1rem", // 16px
    lg: "1.25rem", // 20px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
  },
  spacing: {
    // Larger touch targets
    4: "1.25rem", // 20px
    6: "2rem", // 32px
    8: "2.5rem", // 40px
  },
};

// ============================================================================
// Upper Elementary (3-5)
// ============================================================================

/**
 * Upper Elementary theme tokens
 * Balanced design with gamification elements
 */
export const upperElementaryTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Energetic but not overwhelming
      primary: "oklch(0.55 0.22 255)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Warm accent for achievements and rewards
      accent: "oklch(0.7 0.18 75)" as ColorValue,
      accentForeground: "oklch(0.2 0 0)" as ColorValue,
    },
  },
  typography: {
    sizes: {
      xs: "0.8125rem", // 13px
      sm: "0.9375rem", // 15px
      base: "1.0625rem", // 17px
      lg: "1.25rem", // 20px
      xl: "1.5rem", // 24px
      "2xl": "1.875rem", // 30px
      "3xl": "2.25rem", // 36px
      "4xl": "2.75rem", // 44px
      "5xl": "3.25rem", // 52px
      "6xl": "4rem", // 64px
    },
    lineHeights: {
      normal: 1.6,
      relaxed: 1.7,
    },
  },
  radius: {
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.25rem", // 20px
  },
};

// ============================================================================
// Middle School (6-8)
// ============================================================================

/**
 * Middle School theme tokens
 * More mature design with achievement systems
 */
export const middleSchoolTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Cooler, more sophisticated palette
      primary: "oklch(0.5 0.2 250)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Subtle accent
      accent: "oklch(0.65 0.15 175)" as ColorValue,
      accentForeground: "oklch(0.15 0 0)" as ColorValue,
    },
  },
  typography: {
    sizes: {
      xs: "0.75rem", // 12px (standard)
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
  },
  radius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.625rem", // 10px
    xl: "0.875rem", // 14px
  },
};

// ============================================================================
// High School (9-12)
// ============================================================================

/**
 * High School theme tokens
 * Professional, college-prep aesthetics
 */
export const highSchoolTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Professional, understated palette
      primary: "oklch(0.45 0.15 245)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Minimal accent
      accent: "oklch(0.6 0.1 200)" as ColorValue,
      accentForeground: "oklch(0.1 0 0)" as ColorValue,
    },
  },
  typography: {
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
    lineHeights: {
      normal: 1.5,
      relaxed: 1.6,
    },
  },
  radius: {
    sm: "0.25rem", // 4px - More angular/professional
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
  },
};

// ============================================================================
// Age Group Token Map
// ============================================================================

/**
 * Map of age group to their tokens
 */
export const ageGroupTokens: Record<AgeGroup, PartialDesignTokens> = {
  "early-elementary": earlyElementaryTokens,
  "upper-elementary": upperElementaryTokens,
  "middle-school": middleSchoolTokens,
  "high-school": highSchoolTokens,
};

// ============================================================================
// Layer Creation
// ============================================================================

/**
 * Create an age group theme layer
 */
export function createAgeGroupLayer(ageGroup: AgeGroup): ThemeLayer {
  const tokens = ageGroupTokens[ageGroup];
  return createLayer("age", ageGroup, tokens, LAYER_PRIORITIES.age);
}

/**
 * Get all age group layers
 */
export function getAllAgeGroupLayers(): ThemeLayer[] {
  return Object.keys(ageGroupTokens).map((ageGroup) =>
    createAgeGroupLayer(ageGroup as AgeGroup)
  );
}

// ============================================================================
// Dark Mode Variants
// ============================================================================

/**
 * Early Elementary dark mode adjustments
 */
export const earlyElementaryDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Maintain vibrancy in dark mode
      primary: "oklch(0.7 0.22 260)" as ColorValue,
      primaryForeground: "oklch(0.15 0 0)" as ColorValue,
      accent: "oklch(0.8 0.18 85)" as ColorValue,
      accentForeground: "oklch(0.15 0 0)" as ColorValue,
    },
  },
};

/**
 * Upper Elementary dark mode adjustments
 */
export const upperElementaryDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.65 0.2 255)" as ColorValue,
      primaryForeground: "oklch(0.15 0 0)" as ColorValue,
      accent: "oklch(0.75 0.16 75)" as ColorValue,
      accentForeground: "oklch(0.15 0 0)" as ColorValue,
    },
  },
};

/**
 * Middle School dark mode adjustments
 */
export const middleSchoolDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.6 0.18 250)" as ColorValue,
      primaryForeground: "oklch(0.1 0 0)" as ColorValue,
      accent: "oklch(0.7 0.13 175)" as ColorValue,
      accentForeground: "oklch(0.1 0 0)" as ColorValue,
    },
  },
};

/**
 * High School dark mode adjustments
 */
export const highSchoolDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.55 0.13 245)" as ColorValue,
      primaryForeground: "oklch(0.05 0 0)" as ColorValue,
      accent: "oklch(0.65 0.08 200)" as ColorValue,
      accentForeground: "oklch(0.05 0 0)" as ColorValue,
    },
  },
};

/**
 * Map of age group to their dark mode tokens
 */
export const ageGroupDarkTokens: Record<AgeGroup, PartialDesignTokens> = {
  "early-elementary": earlyElementaryDarkTokens,
  "upper-elementary": upperElementaryDarkTokens,
  "middle-school": middleSchoolDarkTokens,
  "high-school": highSchoolDarkTokens,
};

/**
 * Create an age group theme layer for dark mode
 */
export function createAgeGroupDarkLayer(ageGroup: AgeGroup): ThemeLayer {
  const tokens = ageGroupDarkTokens[ageGroup];
  return createLayer("age", `${ageGroup}-dark`, tokens, LAYER_PRIORITIES.age);
}
