/**
 * Theme Builder
 *
 * This module provides the theme composition engine that merges multiple
 * theme layers in the correct order of precedence to produce a resolved theme.
 *
 * Layer precedence (lowest to highest):
 * 1. Base (default tokens)
 * 2. Mode (light/dark)
 * 3. Age (grade-level adaptations)
 * 4. Role (user role styling)
 * 5. Accessibility (high contrast, etc.)
 * 6. Organization (custom branding)
 *
 * @module theme/core/builder
 */

import type {
  DesignTokens,
  PartialDesignTokens,
  ThemeLayer,
  ThemeLayerType,
  ResolvedTheme,
  ThemeMeta,
  ResolvedThemeMode,
  AgeGroup,
  UserRole,
  AccessibilityPreferences,
  OrganizationBranding,
} from "./types";
import { lightDesignTokens, darkDesignTokens } from "./tokens";
import { mergeThemeLayers, cloneDeep } from "./merger";

// ============================================================================
// Layer Priority Constants
// ============================================================================

/**
 * Default priority values for each layer type
 * Higher numbers = higher precedence (applied later)
 */
export const LAYER_PRIORITIES: Record<ThemeLayerType, number> = {
  base: 0,
  mode: 100,
  age: 200,
  role: 300,
  accessibility: 400,
  organization: 500,
};

// ============================================================================
// Theme Builder Class
// ============================================================================

/**
 * Configuration for building a theme
 */
export interface ThemeBuildConfig {
  mode: ResolvedThemeMode;
  ageGroup?: AgeGroup | null;
  userRole?: UserRole;
  accessibility?: AccessibilityPreferences;
  organizationBranding?: OrganizationBranding | null;
  customLayers?: ThemeLayer[];
}

/**
 * Theme Builder - composes theme layers into a resolved theme
 */
export class ThemeBuilder {
  private layers: ThemeLayer[] = [];
  private baseTokens: DesignTokens;
  private config: ThemeBuildConfig;

  constructor(config: ThemeBuildConfig) {
    this.config = config;
    this.baseTokens =
      config.mode === "dark" ? cloneDeep(darkDesignTokens) : cloneDeep(lightDesignTokens);
  }

  /**
   * Add a theme layer
   */
  addLayer(layer: ThemeLayer): this {
    this.layers.push(layer);
    return this;
  }

  /**
   * Add a layer from partial tokens
   */
  addTokens(
    type: ThemeLayerType,
    name: string,
    tokens: PartialDesignTokens
  ): this {
    this.layers.push({
      type,
      name,
      tokens,
      priority: LAYER_PRIORITIES[type],
    });
    return this;
  }

  /**
   * Remove all layers of a specific type
   */
  removeLayerType(type: ThemeLayerType): this {
    this.layers = this.layers.filter((layer) => layer.type !== type);
    return this;
  }

  /**
   * Get all current layers
   */
  getLayers(): ThemeLayer[] {
    return [...this.layers];
  }

  /**
   * Build the final resolved theme
   */
  build(): ResolvedTheme {
    // Add any custom layers from config
    if (this.config.customLayers) {
      this.layers.push(...this.config.customLayers);
    }

    // Merge all layers
    const tokens = mergeThemeLayers(this.baseTokens, this.layers);

    // Build metadata
    const meta: ThemeMeta = {
      mode: this.config.mode,
      ageGroup: this.config.ageGroup ?? null,
      userRole: this.config.userRole ?? "guest",
      organizationId: this.config.organizationBranding?.organizationId ?? null,
      accessibility: this.config.accessibility ?? {
        reducedMotion: "no-preference",
        colorScheme: "normal",
        fontScaling: "normal",
        highContrast: false,
      },
      computedAt: Date.now(),
    };

    return {
      tokens,
      layers: [...this.layers],
      meta,
    };
  }

  /**
   * Create a new builder with the same configuration
   */
  clone(): ThemeBuilder {
    const builder = new ThemeBuilder(this.config);
    builder.layers = [...this.layers];
    return builder;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a theme layer from partial tokens
 */
export function createLayer(
  type: ThemeLayerType,
  name: string,
  tokens: PartialDesignTokens,
  priority?: number
): ThemeLayer {
  return {
    type,
    name,
    tokens,
    priority: priority ?? LAYER_PRIORITIES[type],
  };
}

/**
 * Create a mode layer
 */
export function createModeLayer(mode: ResolvedThemeMode): ThemeLayer {
  // Mode layer uses the base tokens for that mode
  // Additional mode-specific overrides can be added here
  return createLayer("mode", `${mode}-mode`, {});
}

/**
 * Create an accessibility layer
 */
export function createAccessibilityLayer(
  prefs: AccessibilityPreferences
): ThemeLayer {
  const tokens: PartialDesignTokens = {};

  // Apply reduced motion
  if (prefs.reducedMotion === "reduce") {
    tokens.animations = {
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
    };
  }

  // Apply font scaling
  if (prefs.fontScaling === "large") {
    tokens.typography = {
      sizes: {
        xs: "0.875rem",
        sm: "1rem",
        base: "1.125rem",
        lg: "1.25rem",
        xl: "1.5rem",
        "2xl": "1.75rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
        "5xl": "3.5rem",
        "6xl": "4.5rem",
      },
    };
  } else if (prefs.fontScaling === "x-large") {
    tokens.typography = {
      sizes: {
        xs: "1rem",
        sm: "1.125rem",
        base: "1.25rem",
        lg: "1.5rem",
        xl: "1.75rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "4xl": "3rem",
        "5xl": "4rem",
        "6xl": "5rem",
      },
    };
  }

  return createLayer("accessibility", "accessibility", tokens);
}

/**
 * Create an organization branding layer
 */
export function createOrganizationLayer(
  branding: OrganizationBranding
): ThemeLayer {
  const tokens: PartialDesignTokens = {};

  // Apply color overrides
  if (branding.colors) {
    tokens.colors = {
      semantic: {} as PartialDesignTokens["colors"] extends { semantic: infer S } ? S : never,
    };

    if (branding.colors.primary) {
      (tokens.colors.semantic as Record<string, unknown>).primary = branding.colors.primary;
    }
    if (branding.colors.primaryForeground) {
      (tokens.colors.semantic as Record<string, unknown>).primaryForeground = branding.colors.primaryForeground;
    }
    if (branding.colors.secondary) {
      (tokens.colors.semantic as Record<string, unknown>).secondary = branding.colors.secondary;
    }
    if (branding.colors.secondaryForeground) {
      (tokens.colors.semantic as Record<string, unknown>).secondaryForeground = branding.colors.secondaryForeground;
    }
    if (branding.colors.accent) {
      (tokens.colors.semantic as Record<string, unknown>).accent = branding.colors.accent;
    }
    if (branding.colors.accentForeground) {
      (tokens.colors.semantic as Record<string, unknown>).accentForeground = branding.colors.accentForeground;
    }
  }

  // Apply typography overrides
  if (branding.typography) {
    const families: Record<string, string> = {};

    if (branding.typography.fontFamily) {
      families.sans = branding.typography.fontFamily;
    }
    if (branding.typography.displayFont) {
      families.display = branding.typography.displayFont;
    }

    if (Object.keys(families).length > 0) {
      tokens.typography = { families };
    }
  }

  // Merge any custom tokens
  if (branding.customTokens) {
    return createLayer(
      "organization",
      `org-${branding.organizationId}`,
      { ...tokens, ...branding.customTokens }
    );
  }

  return createLayer("organization", `org-${branding.organizationId}`, tokens);
}

// ============================================================================
// Quick Build Functions
// ============================================================================

/**
 * Build a theme with minimal configuration
 */
export function buildTheme(config: ThemeBuildConfig): ResolvedTheme {
  const builder = new ThemeBuilder(config);

  // Add mode layer (base tokens already include mode-specific colors)
  builder.addLayer(createModeLayer(config.mode));

  // Add accessibility layer if preferences provided
  if (config.accessibility) {
    builder.addLayer(createAccessibilityLayer(config.accessibility));
  }

  // Add organization branding layer if provided
  if (config.organizationBranding) {
    builder.addLayer(createOrganizationLayer(config.organizationBranding));
  }

  return builder.build();
}

/**
 * Build a simple light theme
 */
export function buildLightTheme(
  options?: Partial<Omit<ThemeBuildConfig, "mode">>
): ResolvedTheme {
  return buildTheme({ ...options, mode: "light" });
}

/**
 * Build a simple dark theme
 */
export function buildDarkTheme(
  options?: Partial<Omit<ThemeBuildConfig, "mode">>
): ResolvedTheme {
  return buildTheme({ ...options, mode: "dark" });
}

// ============================================================================
// Cache
// ============================================================================

/**
 * Simple theme cache for performance
 */
export class ThemeCache {
  private cache = new Map<string, { theme: ResolvedTheme; timestamp: number }>();
  private maxAge: number;

  constructor(maxAgeMs = 5 * 60 * 1000) {
    this.maxAge = maxAgeMs;
  }

  /**
   * Generate cache key from config
   */
  private getKey(config: ThemeBuildConfig): string {
    return JSON.stringify({
      mode: config.mode,
      ageGroup: config.ageGroup,
      userRole: config.userRole,
      accessibility: config.accessibility,
      orgId: config.organizationBranding?.organizationId,
    });
  }

  /**
   * Get cached theme or build new one
   */
  getOrBuild(config: ThemeBuildConfig): ResolvedTheme {
    const key = this.getKey(config);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      return cached.theme;
    }

    const theme = buildTheme(config);
    this.cache.set(key, { theme, timestamp: Date.now() });
    return theme;
  }

  /**
   * Invalidate all cached themes
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Invalidate themes for a specific organization
   */
  invalidateOrganization(organizationId: string): void {
    for (const [key] of this.cache) {
      if (key.includes(organizationId)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Global theme cache instance
 */
export const themeCache = new ThemeCache();
