/**
 * Age-Adaptive Theming System
 *
 * Adjusts UI appearance based on learner's grade level:
 * - K-2 (ages 5-7): Playful, large elements, bright colors
 * - 3-5 (ages 8-10): Engaging, balanced, vibrant colors
 * - 6-8 (ages 11-13): Modern, clean, muted colors
 * - 9-12 (ages 14-18): Professional, minimal, sophisticated
 *
 * Uses OKLCH color space for perceptual uniformity and integrates
 * with shadcn/ui CSS variable system.
 */

export type AgeGroup = "early-elementary" | "late-elementary" | "middle-school" | "high-school";

export interface AgeTheme {
  group: AgeGroup;
  gradeRange: [number, number];
  name: string;
  description: string;
  colors: {
    // Primary brand colors
    primary: string;
    primaryForeground: string;
    // Secondary colors
    secondary: string;
    secondaryForeground: string;
    // Accent for highlights
    accent: string;
    accentForeground: string;
    // Background layers
    background: string;
    foreground: string;
    // Card surfaces
    card: string;
    cardForeground: string;
    // Muted elements
    muted: string;
    mutedForeground: string;
    // Borders and inputs
    border: string;
    input: string;
    ring: string;
    // Semantic colors
    success: string;
    warning: string;
    destructive: string;
    // Chart colors
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    // Sidebar specific
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
  };
  typography: {
    baseFontSize: string;
    headingScale: number;
    fontFamily: string;
    lineHeight: string;
  };
  spacing: {
    base: string;
    scale: number;
  };
  borderRadius: string;
  animations: {
    enabled: boolean;
    speed: "slow" | "normal" | "fast";
    bouncy: boolean;
  };
  elements: {
    buttonSize: "lg" | "default" | "sm";
    iconSize: number;
    cardPadding: string;
    showMascot: boolean;
  };
}

const themes: Record<AgeGroup, AgeTheme> = {
  "early-elementary": {
    group: "early-elementary",
    gradeRange: [0, 2],
    name: "Playful Explorer",
    description: "Bright, playful design with large touch targets and friendly visuals",
    colors: {
      // Warm, inviting blue-purple primary
      primary: "oklch(0.65 0.2 260)",
      primaryForeground: "oklch(0.98 0 0)",
      // Soft lavender secondary
      secondary: "oklch(0.92 0.05 280)",
      secondaryForeground: "oklch(0.25 0.05 280)",
      // Sunny yellow accent
      accent: "oklch(0.85 0.15 85)",
      accentForeground: "oklch(0.25 0.08 85)",
      // Warm cream background
      background: "oklch(0.98 0.01 85)",
      foreground: "oklch(0.2 0.02 260)",
      // White cards with soft shadow feel
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.2 0.02 260)",
      // Soft muted tones
      muted: "oklch(0.94 0.02 260)",
      mutedForeground: "oklch(0.5 0.03 260)",
      // Borders
      border: "oklch(0.9 0.02 260)",
      input: "oklch(0.92 0.02 260)",
      ring: "oklch(0.65 0.2 260)",
      // Semantic
      success: "oklch(0.7 0.18 145)",
      warning: "oklch(0.8 0.15 75)",
      destructive: "oklch(0.6 0.22 25)",
      // Charts - rainbow-like for engagement
      chart1: "oklch(0.65 0.2 260)",
      chart2: "oklch(0.7 0.18 145)",
      chart3: "oklch(0.8 0.15 75)",
      chart4: "oklch(0.7 0.2 310)",
      chart5: "oklch(0.65 0.2 30)",
      // Sidebar
      sidebar: "oklch(0.96 0.02 260)",
      sidebarForeground: "oklch(0.2 0.02 260)",
      sidebarPrimary: "oklch(0.65 0.2 260)",
      sidebarPrimaryForeground: "oklch(0.98 0 0)",
      sidebarAccent: "oklch(0.92 0.05 280)",
      sidebarAccentForeground: "oklch(0.25 0.05 280)",
      sidebarBorder: "oklch(0.9 0.02 260)",
    },
    typography: {
      baseFontSize: "18px",
      headingScale: 1.4,
      fontFamily: "'Nunito', 'Comic Neue', system-ui, sans-serif",
      lineHeight: "1.8",
    },
    spacing: {
      base: "1.5rem",
      scale: 1.25,
    },
    borderRadius: "1.25rem",
    animations: {
      enabled: true,
      speed: "slow",
      bouncy: true,
    },
    elements: {
      buttonSize: "lg",
      iconSize: 24,
      cardPadding: "2rem",
      showMascot: true,
    },
  },
  "late-elementary": {
    group: "late-elementary",
    gradeRange: [3, 5],
    name: "Adventure Mode",
    description: "Vibrant, engaging design with balanced interactivity",
    colors: {
      // Sky blue primary
      primary: "oklch(0.68 0.18 235)",
      primaryForeground: "oklch(0.98 0 0)",
      // Soft teal secondary
      secondary: "oklch(0.93 0.04 180)",
      secondaryForeground: "oklch(0.25 0.04 180)",
      // Energetic orange accent
      accent: "oklch(0.78 0.16 50)",
      accentForeground: "oklch(0.25 0.08 50)",
      // Light sky background
      background: "oklch(0.98 0.008 235)",
      foreground: "oklch(0.18 0.02 235)",
      // Clean white cards
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.18 0.02 235)",
      // Subtle muted
      muted: "oklch(0.95 0.015 235)",
      mutedForeground: "oklch(0.48 0.02 235)",
      // Borders
      border: "oklch(0.91 0.015 235)",
      input: "oklch(0.93 0.015 235)",
      ring: "oklch(0.68 0.18 235)",
      // Semantic
      success: "oklch(0.72 0.17 155)",
      warning: "oklch(0.82 0.14 70)",
      destructive: "oklch(0.62 0.2 22)",
      // Charts
      chart1: "oklch(0.68 0.18 235)",
      chart2: "oklch(0.72 0.17 155)",
      chart3: "oklch(0.78 0.16 50)",
      chart4: "oklch(0.68 0.18 290)",
      chart5: "oklch(0.82 0.14 70)",
      // Sidebar
      sidebar: "oklch(0.97 0.01 235)",
      sidebarForeground: "oklch(0.18 0.02 235)",
      sidebarPrimary: "oklch(0.68 0.18 235)",
      sidebarPrimaryForeground: "oklch(0.98 0 0)",
      sidebarAccent: "oklch(0.93 0.04 180)",
      sidebarAccentForeground: "oklch(0.25 0.04 180)",
      sidebarBorder: "oklch(0.91 0.015 235)",
    },
    typography: {
      baseFontSize: "16px",
      headingScale: 1.35,
      fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
      lineHeight: "1.7",
    },
    spacing: {
      base: "1.25rem",
      scale: 1.2,
    },
    borderRadius: "1rem",
    animations: {
      enabled: true,
      speed: "normal",
      bouncy: true,
    },
    elements: {
      buttonSize: "default",
      iconSize: 20,
      cardPadding: "1.5rem",
      showMascot: true,
    },
  },
  "middle-school": {
    group: "middle-school",
    gradeRange: [6, 8],
    name: "Modern Focus",
    description: "Clean, modern design with professional aesthetics",
    colors: {
      // Indigo primary
      primary: "oklch(0.55 0.22 270)",
      primaryForeground: "oklch(0.98 0 0)",
      // Soft violet secondary
      secondary: "oklch(0.94 0.03 270)",
      secondaryForeground: "oklch(0.22 0.04 270)",
      // Teal accent
      accent: "oklch(0.72 0.12 185)",
      accentForeground: "oklch(0.22 0.06 185)",
      // Cool neutral background
      background: "oklch(0.985 0.003 270)",
      foreground: "oklch(0.15 0.015 270)",
      // Crisp white cards
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.15 0.015 270)",
      // Neutral muted
      muted: "oklch(0.96 0.01 270)",
      mutedForeground: "oklch(0.45 0.015 270)",
      // Borders
      border: "oklch(0.92 0.01 270)",
      input: "oklch(0.94 0.01 270)",
      ring: "oklch(0.55 0.22 270)",
      // Semantic
      success: "oklch(0.68 0.16 155)",
      warning: "oklch(0.78 0.12 75)",
      destructive: "oklch(0.58 0.18 25)",
      // Charts - more muted palette
      chart1: "oklch(0.55 0.22 270)",
      chart2: "oklch(0.68 0.16 155)",
      chart3: "oklch(0.72 0.12 185)",
      chart4: "oklch(0.6 0.18 300)",
      chart5: "oklch(0.78 0.12 75)",
      // Sidebar
      sidebar: "oklch(0.975 0.005 270)",
      sidebarForeground: "oklch(0.15 0.015 270)",
      sidebarPrimary: "oklch(0.55 0.22 270)",
      sidebarPrimaryForeground: "oklch(0.98 0 0)",
      sidebarAccent: "oklch(0.94 0.03 270)",
      sidebarAccentForeground: "oklch(0.22 0.04 270)",
      sidebarBorder: "oklch(0.92 0.01 270)",
    },
    typography: {
      baseFontSize: "15px",
      headingScale: 1.3,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      lineHeight: "1.65",
    },
    spacing: {
      base: "1rem",
      scale: 1.15,
    },
    borderRadius: "0.75rem",
    animations: {
      enabled: true,
      speed: "normal",
      bouncy: false,
    },
    elements: {
      buttonSize: "default",
      iconSize: 18,
      cardPadding: "1.25rem",
      showMascot: false,
    },
  },
  "high-school": {
    group: "high-school",
    gradeRange: [9, 12],
    name: "Professional",
    description: "Sophisticated, minimal design for mature learners",
    colors: {
      // Deep indigo primary
      primary: "oklch(0.48 0.22 275)",
      primaryForeground: "oklch(0.98 0 0)",
      // Subtle gray secondary
      secondary: "oklch(0.95 0.01 275)",
      secondaryForeground: "oklch(0.2 0.02 275)",
      // Muted teal accent
      accent: "oklch(0.65 0.1 185)",
      accentForeground: "oklch(0.18 0.04 185)",
      // Pure neutral background
      background: "oklch(0.99 0 0)",
      foreground: "oklch(0.12 0.01 275)",
      // Clean cards
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.12 0.01 275)",
      // Subtle muted
      muted: "oklch(0.965 0.005 275)",
      mutedForeground: "oklch(0.42 0.01 275)",
      // Borders
      border: "oklch(0.93 0.005 275)",
      input: "oklch(0.95 0.005 275)",
      ring: "oklch(0.48 0.22 275)",
      // Semantic
      success: "oklch(0.62 0.14 155)",
      warning: "oklch(0.75 0.1 75)",
      destructive: "oklch(0.55 0.16 25)",
      // Charts - sophisticated palette
      chart1: "oklch(0.48 0.22 275)",
      chart2: "oklch(0.62 0.14 155)",
      chart3: "oklch(0.65 0.1 185)",
      chart4: "oklch(0.55 0.16 300)",
      chart5: "oklch(0.75 0.1 75)",
      // Sidebar
      sidebar: "oklch(0.98 0.003 275)",
      sidebarForeground: "oklch(0.12 0.01 275)",
      sidebarPrimary: "oklch(0.48 0.22 275)",
      sidebarPrimaryForeground: "oklch(0.98 0 0)",
      sidebarAccent: "oklch(0.95 0.01 275)",
      sidebarAccentForeground: "oklch(0.2 0.02 275)",
      sidebarBorder: "oklch(0.93 0.005 275)",
    },
    typography: {
      baseFontSize: "14px",
      headingScale: 1.25,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      lineHeight: "1.6",
    },
    spacing: {
      base: "0.875rem",
      scale: 1.1,
    },
    borderRadius: "0.5rem",
    animations: {
      enabled: true,
      speed: "fast",
      bouncy: false,
    },
    elements: {
      buttonSize: "sm",
      iconSize: 16,
      cardPadding: "1rem",
      showMascot: false,
    },
  },
};

/**
 * Get the appropriate age group for a grade level
 */
export function getAgeGroup(gradeLevel: number): AgeGroup {
  if (gradeLevel <= 2) return "early-elementary";
  if (gradeLevel <= 5) return "late-elementary";
  if (gradeLevel <= 8) return "middle-school";
  return "high-school";
}

/**
 * Get the theme configuration for a grade level
 */
export function getThemeForGrade(gradeLevel: number): AgeTheme {
  const group = getAgeGroup(gradeLevel);
  return themes[group];
}

/**
 * Get all available themes
 */
export function getAllThemes(): AgeTheme[] {
  return Object.values(themes);
}

/**
 * Get theme by group name
 */
export function getThemeByGroup(group: AgeGroup): AgeTheme {
  return themes[group];
}

/**
 * Generate CSS custom properties for shadcn integration
 */
export function getThemeCSSVariables(theme: AgeTheme): Record<string, string> {
  const { colors, typography, borderRadius, animations } = theme;

  return {
    // shadcn semantic colors
    "--background": colors.background,
    "--foreground": colors.foreground,
    "--card": colors.card,
    "--card-foreground": colors.cardForeground,
    "--popover": colors.card,
    "--popover-foreground": colors.cardForeground,
    "--primary": colors.primary,
    "--primary-foreground": colors.primaryForeground,
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.secondaryForeground,
    "--muted": colors.muted,
    "--muted-foreground": colors.mutedForeground,
    "--accent": colors.accent,
    "--accent-foreground": colors.accentForeground,
    "--destructive": colors.destructive,
    "--border": colors.border,
    "--input": colors.input,
    "--ring": colors.ring,
    // Chart colors
    "--chart-1": colors.chart1,
    "--chart-2": colors.chart2,
    "--chart-3": colors.chart3,
    "--chart-4": colors.chart4,
    "--chart-5": colors.chart5,
    // Sidebar
    "--sidebar": colors.sidebar,
    "--sidebar-foreground": colors.sidebarForeground,
    "--sidebar-primary": colors.sidebarPrimary,
    "--sidebar-primary-foreground": colors.sidebarPrimaryForeground,
    "--sidebar-accent": colors.sidebarAccent,
    "--sidebar-accent-foreground": colors.sidebarAccentForeground,
    "--sidebar-border": colors.sidebarBorder,
    "--sidebar-ring": colors.ring,
    // Semantic colors (custom)
    "--success": colors.success,
    "--warning": colors.warning,
    // Typography
    "--font-size-base": typography.baseFontSize,
    "--font-family": typography.fontFamily,
    "--line-height": typography.lineHeight,
    // Border radius
    "--radius": borderRadius,
    // Animations
    "--animation-speed": animations.speed === "slow" ? "0.4s" : animations.speed === "fast" ? "0.15s" : "0.25s",
    "--animation-timing": animations.bouncy ? "cubic-bezier(0.68, -0.55, 0.265, 1.55)" : "cubic-bezier(0.4, 0, 0.2, 1)",
  };
}

/**
 * Apply theme to document root - integrates with shadcn CSS variables
 */
export function applyTheme(gradeLevel: number): void {
  if (typeof document === "undefined") return;

  const theme = getThemeForGrade(gradeLevel);
  const variables = getThemeCSSVariables(theme);

  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Update theme data attributes
  root.dataset.ageGroup = theme.group;
  root.dataset.themeName = theme.name;

  // Remove old theme classes and add new one
  root.classList.remove(
    "theme-early-elementary",
    "theme-late-elementary",
    "theme-middle-school",
    "theme-high-school"
  );
  root.classList.add(`theme-${theme.group}`);
}

/**
 * React hook-compatible theme getter
 */
export function useAgeTheme(gradeLevel: number): AgeTheme {
  return getThemeForGrade(gradeLevel);
}
