/**
 * CSS Variable Generator
 *
 * This module converts design tokens to CSS custom properties (variables).
 * It handles the transformation from our structured token format to the
 * flat CSS variable format expected by Tailwind and shadcn/ui.
 *
 * @module theme/css/generator
 */

import type {
  DesignTokens,
  ColorTokens,
  SemanticColors,
  ChartColors,
  SidebarColors,
  StatusColors,
  CSSVariables,
  CSSVariableName,
} from "../core/types";

// ============================================================================
// Token to CSS Variable Mapping
// ============================================================================

/**
 * Generate CSS variables from semantic colors
 */
function generateSemanticColorVars(colors: SemanticColors): CSSVariables {
  const vars: CSSVariables = {};

  const mappings: Record<keyof SemanticColors, string> = {
    background: "--background",
    foreground: "--foreground",
    card: "--card",
    cardForeground: "--card-foreground",
    popover: "--popover",
    popoverForeground: "--popover-foreground",
    primary: "--primary",
    primaryForeground: "--primary-foreground",
    secondary: "--secondary",
    secondaryForeground: "--secondary-foreground",
    muted: "--muted",
    mutedForeground: "--muted-foreground",
    accent: "--accent",
    accentForeground: "--accent-foreground",
    destructive: "--destructive",
    destructiveForeground: "--destructive-foreground",
    border: "--border",
    input: "--input",
    ring: "--ring",
  };

  for (const [key, varName] of Object.entries(mappings)) {
    const value = colors[key as keyof SemanticColors];
    if (value) {
      vars[varName as CSSVariableName] = value;
    }
  }

  return vars;
}

/**
 * Generate CSS variables from chart colors
 */
function generateChartColorVars(colors: ChartColors): CSSVariables {
  return {
    "--chart-1": colors.chart1,
    "--chart-2": colors.chart2,
    "--chart-3": colors.chart3,
    "--chart-4": colors.chart4,
    "--chart-5": colors.chart5,
  };
}

/**
 * Generate CSS variables from sidebar colors
 */
function generateSidebarColorVars(colors: SidebarColors): CSSVariables {
  return {
    "--sidebar": colors.sidebar,
    "--sidebar-foreground": colors.sidebarForeground,
    "--sidebar-primary": colors.sidebarPrimary,
    "--sidebar-primary-foreground": colors.sidebarPrimaryForeground,
    "--sidebar-accent": colors.sidebarAccent,
    "--sidebar-accent-foreground": colors.sidebarAccentForeground,
    "--sidebar-border": colors.sidebarBorder,
    "--sidebar-ring": colors.sidebarRing,
  };
}

/**
 * Generate CSS variables from status colors
 */
function generateStatusColorVars(colors: StatusColors): CSSVariables {
  return {
    "--success": colors.success,
    "--success-foreground": colors.successForeground,
    "--warning": colors.warning,
    "--warning-foreground": colors.warningForeground,
    "--error": colors.error,
    "--error-foreground": colors.errorForeground,
    "--info": colors.info,
    "--info-foreground": colors.infoForeground,
  };
}

/**
 * Generate all color CSS variables
 */
function generateColorVars(colors: ColorTokens): CSSVariables {
  return {
    ...generateSemanticColorVars(colors.semantic),
    ...generateChartColorVars(colors.chart),
    ...generateSidebarColorVars(colors.sidebar),
    ...generateStatusColorVars(colors.status),
  };
}

/**
 * Generate radius CSS variables
 */
function generateRadiusVars(tokens: DesignTokens): CSSVariables {
  return {
    "--radius": tokens.radius.lg, // Base radius
    "--radius-sm": tokens.radius.sm,
    "--radius-md": tokens.radius.md,
    "--radius-lg": tokens.radius.lg,
    "--radius-xl": tokens.radius.xl,
  };
}

/**
 * Generate typography CSS variables
 */
function generateTypographyVars(tokens: DesignTokens): CSSVariables {
  return {
    "--font-sans": tokens.typography.families.sans,
    "--font-mono": tokens.typography.families.mono,
    ...(tokens.typography.families.display && {
      "--font-display": tokens.typography.families.display,
    }),
    ...(tokens.typography.families.handwriting && {
      "--font-handwriting": tokens.typography.families.handwriting,
    }),
  };
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generate all CSS variables from design tokens
 */
export function generateCSSVariables(tokens: DesignTokens): CSSVariables {
  return {
    ...generateColorVars(tokens.colors),
    ...generateRadiusVars(tokens),
    ...generateTypographyVars(tokens),
  };
}

/**
 * Convert CSS variables to a CSS string
 */
export function cssVariablesToString(
  vars: CSSVariables,
  selector = ":root"
): string {
  const entries = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");

  return `${selector} {\n${entries}\n}`;
}

/**
 * Generate a complete CSS stylesheet from tokens
 */
export function generateStylesheet(
  lightTokens: DesignTokens,
  darkTokens: DesignTokens
): string {
  const lightVars = generateCSSVariables(lightTokens);
  const darkVars = generateCSSVariables(darkTokens);

  const lightCSS = cssVariablesToString(lightVars, ":root");
  const darkCSS = cssVariablesToString(darkVars, ".dark");

  return `${lightCSS}\n\n${darkCSS}`;
}

// ============================================================================
// Inline Style Generation
// ============================================================================

/**
 * Generate inline style object from CSS variables
 * For use with React's style prop
 */
export function generateStyleObject(
  vars: CSSVariables
): Record<string, string> {
  const style: Record<string, string> = {};

  for (const [name, value] of Object.entries(vars)) {
    // React style props use camelCase without the -- prefix
    style[name] = value;
  }

  return style;
}

/**
 * Generate a style object that can be spread onto an element
 */
export function tokensToStyleObject(
  tokens: DesignTokens
): Record<string, string> {
  return generateStyleObject(generateCSSVariables(tokens));
}

// ============================================================================
// Diff-based Updates
// ============================================================================

/**
 * Generate only the CSS variables that differ between two token sets
 */
export function generateDiffVariables(
  oldTokens: DesignTokens,
  newTokens: DesignTokens
): CSSVariables {
  const oldVars = generateCSSVariables(oldTokens);
  const newVars = generateCSSVariables(newTokens);
  const diff: CSSVariables = {};

  for (const [name, value] of Object.entries(newVars)) {
    if (oldVars[name as CSSVariableName] !== value) {
      diff[name as CSSVariableName] = value;
    }
  }

  return diff;
}

// ============================================================================
// CSS Class Utilities
// ============================================================================

/**
 * Generate Tailwind-compatible CSS classes for theme colors
 * This creates utility classes like .bg-primary, .text-primary, etc.
 */
export function generateUtilityClasses(): string {
  const semanticColors = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "destructive-foreground",
    "border",
    "input",
    "ring",
  ];

  const statusColors = [
    "success",
    "success-foreground",
    "warning",
    "warning-foreground",
    "error",
    "error-foreground",
    "info",
    "info-foreground",
  ];

  let css = "/* Theme utility classes */\n";

  for (const color of [...semanticColors, ...statusColors]) {
    css += `.bg-${color} { background-color: var(--${color}); }\n`;
    css += `.text-${color} { color: var(--${color}); }\n`;
    css += `.border-${color} { border-color: var(--${color}); }\n`;
  }

  return css;
}

// ============================================================================
// Age-Adaptive CSS Generation
// ============================================================================

/**
 * Generate age-group specific CSS overrides
 */
export function generateAgeGroupCSS(
  ageGroup: string,
  tokens: DesignTokens
): string {
  const vars = generateCSSVariables(tokens);
  return cssVariablesToString(vars, `[data-age-group="${ageGroup}"]`);
}

/**
 * Generate role-specific CSS overrides
 */
export function generateRoleCSS(role: string, tokens: DesignTokens): string {
  const vars = generateCSSVariables(tokens);
  return cssVariablesToString(vars, `[data-user-role="${role}"]`);
}
