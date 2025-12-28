/**
 * Role-Based Theme Presets
 *
 * These presets provide role-specific styling for different user types.
 * The user requested configurable role-specific background styles.
 *
 * @module theme/presets/roles
 */

import type {
  PartialDesignTokens,
  ThemeLayer,
  UserRole,
  ColorValue,
} from "../../core/types";
import { LAYER_PRIORITIES, createLayer } from "../../core/builder";

// ============================================================================
// Role Token Definitions
// ============================================================================

/**
 * Learner role theme tokens
 * Engaging, focused on learning with encouraging colors
 */
export const learnerTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Educational blue for focus and learning
      primary: "oklch(0.55 0.2 245)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Achievement gold accent
      accent: "oklch(0.75 0.18 85)" as ColorValue,
      accentForeground: "oklch(0.2 0 0)" as ColorValue,
    },
    sidebar: {
      // Learning-focused sidebar
      sidebar: "oklch(0.97 0.01 245)" as ColorValue,
      sidebarPrimary: "oklch(0.55 0.2 245)" as ColorValue,
      sidebarAccent: "oklch(0.92 0.02 245)" as ColorValue,
    },
  },
};

/**
 * Learner dark mode tokens
 */
export const learnerDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.65 0.18 245)" as ColorValue,
      primaryForeground: "oklch(0.1 0 0)" as ColorValue,
      accent: "oklch(0.8 0.16 85)" as ColorValue,
      accentForeground: "oklch(0.1 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.18 0.01 245)" as ColorValue,
      sidebarPrimary: "oklch(0.65 0.18 245)" as ColorValue,
      sidebarAccent: "oklch(0.22 0.02 245)" as ColorValue,
    },
  },
};

/**
 * Parent role theme tokens
 * Trustworthy, family-focused with warm undertones
 */
export const parentTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Trustworthy teal for monitoring
      primary: "oklch(0.5 0.15 175)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Family warmth accent
      accent: "oklch(0.7 0.14 35)" as ColorValue,
      accentForeground: "oklch(0.2 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.97 0.01 175)" as ColorValue,
      sidebarPrimary: "oklch(0.5 0.15 175)" as ColorValue,
      sidebarAccent: "oklch(0.92 0.02 175)" as ColorValue,
    },
  },
};

/**
 * Parent dark mode tokens
 */
export const parentDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.6 0.13 175)" as ColorValue,
      primaryForeground: "oklch(0.1 0 0)" as ColorValue,
      accent: "oklch(0.75 0.12 35)" as ColorValue,
      accentForeground: "oklch(0.1 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.18 0.01 175)" as ColorValue,
      sidebarPrimary: "oklch(0.6 0.13 175)" as ColorValue,
      sidebarAccent: "oklch(0.22 0.02 175)" as ColorValue,
    },
  },
};

/**
 * Teacher role theme tokens
 * Professional, classroom-management focused
 */
export const teacherTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Professional purple for authority
      primary: "oklch(0.5 0.18 280)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Energetic green for progress tracking
      accent: "oklch(0.65 0.18 145)" as ColorValue,
      accentForeground: "oklch(0.15 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.97 0.01 280)" as ColorValue,
      sidebarPrimary: "oklch(0.5 0.18 280)" as ColorValue,
      sidebarAccent: "oklch(0.92 0.02 280)" as ColorValue,
    },
  },
};

/**
 * Teacher dark mode tokens
 */
export const teacherDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.6 0.16 280)" as ColorValue,
      primaryForeground: "oklch(0.1 0 0)" as ColorValue,
      accent: "oklch(0.7 0.16 145)" as ColorValue,
      accentForeground: "oklch(0.1 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.18 0.01 280)" as ColorValue,
      sidebarPrimary: "oklch(0.6 0.16 280)" as ColorValue,
      sidebarAccent: "oklch(0.22 0.02 280)" as ColorValue,
    },
  },
};

/**
 * School Admin role theme tokens
 * Administrative, data-focused
 */
export const schoolAdminTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Administrative slate blue
      primary: "oklch(0.45 0.12 230)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Data-positive green accent
      accent: "oklch(0.6 0.15 160)" as ColorValue,
      accentForeground: "oklch(0.15 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.96 0.01 230)" as ColorValue,
      sidebarPrimary: "oklch(0.45 0.12 230)" as ColorValue,
      sidebarAccent: "oklch(0.91 0.02 230)" as ColorValue,
    },
  },
};

/**
 * School Admin dark mode tokens
 */
export const schoolAdminDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.55 0.1 230)" as ColorValue,
      primaryForeground: "oklch(0.1 0 0)" as ColorValue,
      accent: "oklch(0.65 0.13 160)" as ColorValue,
      accentForeground: "oklch(0.1 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.17 0.01 230)" as ColorValue,
      sidebarPrimary: "oklch(0.55 0.1 230)" as ColorValue,
      sidebarAccent: "oklch(0.21 0.02 230)" as ColorValue,
    },
  },
};

/**
 * Platform Admin role theme tokens
 * System-level, technical
 */
export const platformAdminTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Technical dark slate
      primary: "oklch(0.35 0.08 250)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Alert/action red accent
      accent: "oklch(0.6 0.2 25)" as ColorValue,
      accentForeground: "oklch(1 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.95 0.005 250)" as ColorValue,
      sidebarPrimary: "oklch(0.35 0.08 250)" as ColorValue,
      sidebarAccent: "oklch(0.9 0.01 250)" as ColorValue,
    },
  },
};

/**
 * Platform Admin dark mode tokens
 */
export const platformAdminDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.5 0.06 250)" as ColorValue,
      primaryForeground: "oklch(0.05 0 0)" as ColorValue,
      accent: "oklch(0.65 0.18 25)" as ColorValue,
      accentForeground: "oklch(1 0 0)" as ColorValue,
    },
    sidebar: {
      sidebar: "oklch(0.15 0.005 250)" as ColorValue,
      sidebarPrimary: "oklch(0.5 0.06 250)" as ColorValue,
      sidebarAccent: "oklch(0.19 0.01 250)" as ColorValue,
    },
  },
};

/**
 * Guest role theme tokens
 * Neutral, welcoming
 */
export const guestTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      // Welcoming neutral blue
      primary: "oklch(0.5 0.15 235)" as ColorValue,
      primaryForeground: "oklch(1 0 0)" as ColorValue,
      // Inviting accent
      accent: "oklch(0.7 0.12 200)" as ColorValue,
      accentForeground: "oklch(0.2 0 0)" as ColorValue,
    },
  },
};

/**
 * Guest dark mode tokens
 */
export const guestDarkTokens: PartialDesignTokens = {
  colors: {
    semantic: {
      primary: "oklch(0.6 0.13 235)" as ColorValue,
      primaryForeground: "oklch(0.1 0 0)" as ColorValue,
      accent: "oklch(0.75 0.1 200)" as ColorValue,
      accentForeground: "oklch(0.1 0 0)" as ColorValue,
    },
  },
};

// ============================================================================
// Role Token Maps
// ============================================================================

/**
 * Map of role to their light mode tokens
 */
export const roleTokens: Record<UserRole, PartialDesignTokens> = {
  learner: learnerTokens,
  parent: parentTokens,
  teacher: teacherTokens,
  school_admin: schoolAdminTokens,
  platform_admin: platformAdminTokens,
  guest: guestTokens,
};

/**
 * Map of role to their dark mode tokens
 */
export const roleDarkTokens: Record<UserRole, PartialDesignTokens> = {
  learner: learnerDarkTokens,
  parent: parentDarkTokens,
  teacher: teacherDarkTokens,
  school_admin: schoolAdminDarkTokens,
  platform_admin: platformAdminDarkTokens,
  guest: guestDarkTokens,
};

// ============================================================================
// Layer Creation
// ============================================================================

/**
 * Create a role theme layer
 */
export function createRoleLayer(
  role: UserRole,
  mode: "light" | "dark" = "light"
): ThemeLayer {
  const tokens = mode === "dark" ? roleDarkTokens[role] : roleTokens[role];
  return createLayer("role", role, tokens, LAYER_PRIORITIES.role);
}

/**
 * Get all role layers for a specific mode
 */
export function getAllRoleLayers(mode: "light" | "dark" = "light"): ThemeLayer[] {
  return Object.keys(roleTokens).map((role) =>
    createRoleLayer(role as UserRole, mode)
  );
}

// ============================================================================
// Background Gradient Configurations (User Requested: Configurable)
// ============================================================================

/**
 * Role-specific background gradient configurations
 * These can be customized per organization
 */
export interface RoleGradientConfig {
  enabled: boolean;
  startColor: ColorValue;
  endColor: ColorValue;
  angle: number;
  opacity: number;
}

/**
 * Default gradient configurations for each role
 */
export const defaultRoleGradients: Record<UserRole, RoleGradientConfig> = {
  learner: {
    enabled: true,
    startColor: "oklch(0.97 0.02 245)" as ColorValue,
    endColor: "oklch(0.98 0.01 85)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  parent: {
    enabled: true,
    startColor: "oklch(0.97 0.01 175)" as ColorValue,
    endColor: "oklch(0.98 0.01 35)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  teacher: {
    enabled: true,
    startColor: "oklch(0.97 0.02 280)" as ColorValue,
    endColor: "oklch(0.98 0.02 145)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  school_admin: {
    enabled: false,
    startColor: "oklch(0.97 0.01 230)" as ColorValue,
    endColor: "oklch(0.98 0.01 160)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  platform_admin: {
    enabled: false,
    startColor: "oklch(0.96 0.005 250)" as ColorValue,
    endColor: "oklch(0.97 0.005 250)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  guest: {
    enabled: false,
    startColor: "oklch(0.98 0.01 235)" as ColorValue,
    endColor: "oklch(0.99 0.005 200)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
};

/**
 * Dark mode gradient configurations
 */
export const defaultRoleDarkGradients: Record<UserRole, RoleGradientConfig> = {
  learner: {
    enabled: true,
    startColor: "oklch(0.17 0.02 245)" as ColorValue,
    endColor: "oklch(0.15 0.01 85)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  parent: {
    enabled: true,
    startColor: "oklch(0.17 0.01 175)" as ColorValue,
    endColor: "oklch(0.15 0.01 35)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  teacher: {
    enabled: true,
    startColor: "oklch(0.17 0.02 280)" as ColorValue,
    endColor: "oklch(0.15 0.02 145)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  school_admin: {
    enabled: false,
    startColor: "oklch(0.16 0.01 230)" as ColorValue,
    endColor: "oklch(0.15 0.01 160)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  platform_admin: {
    enabled: false,
    startColor: "oklch(0.15 0.005 250)" as ColorValue,
    endColor: "oklch(0.14 0.005 250)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
  guest: {
    enabled: false,
    startColor: "oklch(0.16 0.01 235)" as ColorValue,
    endColor: "oklch(0.15 0.005 200)" as ColorValue,
    angle: 135,
    opacity: 1,
  },
};

/**
 * Generate CSS for role gradient background
 */
export function generateRoleGradientCSS(
  role: UserRole,
  mode: "light" | "dark" = "light",
  customConfig?: Partial<RoleGradientConfig>
): string {
  const defaults = mode === "dark" ? defaultRoleDarkGradients : defaultRoleGradients;
  const config = { ...defaults[role], ...customConfig };

  if (!config.enabled) {
    return "";
  }

  return `linear-gradient(${config.angle}deg, ${config.startColor}, ${config.endColor})`;
}
