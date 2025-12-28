"use client";

/**
 * Theme Hooks
 *
 * React hooks for accessing and manipulating the theme system.
 *
 * @module components/theme/hooks/use-theme
 */

import { useContext, useCallback, useMemo } from "react";
import { ThemeContext } from "../theme-provider";
import type {
  ThemeMode,
  ResolvedThemeMode,
  AgeGroup,
  UserRole,
  AccessibilityPreferences,
  DesignTokens,
  ColorValue,
} from "@/lib/theme";
import { extractToken } from "@/lib/theme";

// ============================================================================
// Main Theme Hook
// ============================================================================

/**
 * Access the complete theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Access just the theme mode
 */
export function useThemeMode(): {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
} {
  const { state, actions } = useTheme();

  const toggleMode = useCallback(() => {
    if (state.mode === "system") {
      actions.setMode(state.resolvedMode === "dark" ? "light" : "dark");
    } else {
      actions.setMode(state.mode === "dark" ? "light" : "dark");
    }
  }, [state.mode, state.resolvedMode, actions]);

  return useMemo(
    () => ({
      mode: state.mode,
      resolvedMode: state.resolvedMode,
      setMode: actions.setMode,
      toggleMode,
      isDark: state.resolvedMode === "dark",
      isLight: state.resolvedMode === "light",
      isSystem: state.mode === "system",
    }),
    [state.mode, state.resolvedMode, actions.setMode, toggleMode]
  );
}

/**
 * Access just the age group settings
 */
export function useAgeGroup(): {
  ageGroup: AgeGroup | null;
  setAgeGroup: (ageGroup: AgeGroup | null) => void;
  isEarlyElementary: boolean;
  isUpperElementary: boolean;
  isMiddleSchool: boolean;
  isHighSchool: boolean;
} {
  const { state, actions } = useTheme();

  return useMemo(
    () => ({
      ageGroup: state.ageGroup,
      setAgeGroup: actions.setAgeGroup,
      isEarlyElementary: state.ageGroup === "early-elementary",
      isUpperElementary: state.ageGroup === "upper-elementary",
      isMiddleSchool: state.ageGroup === "middle-school",
      isHighSchool: state.ageGroup === "high-school",
    }),
    [state.ageGroup, actions.setAgeGroup]
  );
}

/**
 * Access just the user role settings
 */
export function useUserRole(): {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLearner: boolean;
  isParent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
} {
  const { state, actions } = useTheme();

  return useMemo(
    () => ({
      role: state.userRole,
      setRole: actions.setUserRole,
      isLearner: state.userRole === "learner",
      isParent: state.userRole === "parent",
      isTeacher: state.userRole === "teacher",
      isAdmin:
        state.userRole === "school_admin" ||
        state.userRole === "platform_admin",
    }),
    [state.userRole, actions.setUserRole]
  );
}

/**
 * Access just the accessibility settings
 */
export function useAccessibility(): {
  preferences: AccessibilityPreferences;
  setPreferences: (prefs: Partial<AccessibilityPreferences>) => void;
  toggleHighContrast: () => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontScale: AccessibilityPreferences["fontScaling"];
} {
  const { state, actions } = useTheme();

  return useMemo(
    () => ({
      preferences: state.accessibility,
      setPreferences: actions.setAccessibility,
      toggleHighContrast: actions.toggleHighContrast,
      isHighContrast: state.accessibility.highContrast,
      isReducedMotion: state.accessibility.reducedMotion === "reduce",
      fontScale: state.accessibility.fontScaling,
    }),
    [state.accessibility, actions.setAccessibility, actions.toggleHighContrast]
  );
}

/**
 * Access the design tokens
 */
export function useTokens(): DesignTokens | null {
  const { tokens } = useTheme();
  return tokens;
}

/**
 * Get a specific token value by path
 */
export function useToken<T = unknown>(path: string): T | undefined {
  const tokens = useTokens();

  return useMemo(() => {
    if (!tokens) return undefined;
    return extractToken<T>(tokens, path);
  }, [tokens, path]);
}

/**
 * Get a color token
 */
export function useColorToken(
  category: "semantic" | "chart" | "sidebar" | "status",
  name: string
): ColorValue | undefined {
  return useToken<ColorValue>(`colors.${category}.${name}`);
}

// ============================================================================
// Loading State Hook
// ============================================================================

/**
 * Check if theme is still loading
 */
export function useThemeLoading(): boolean {
  const { state } = useTheme();
  return state.isLoading;
}

// ============================================================================
// Organization Hook
// ============================================================================

/**
 * Access organization branding settings
 */
export function useOrganization(): {
  organizationId: string | null;
  setOrganization: (id: string | null) => void;
} {
  const { state, actions } = useTheme();

  return useMemo(
    () => ({
      organizationId: state.organizationId,
      setOrganization: actions.setOrganization,
    }),
    [state.organizationId, actions.setOrganization]
  );
}
