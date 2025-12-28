"use client";

/**
 * Theme Provider
 *
 * The central provider for the Kaelyn's Academy theme system.
 * Handles theme state, system preference detection, and CSS injection.
 *
 * @module components/theme/theme-provider
 */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ThemeMode,
  ResolvedThemeMode,
  AgeGroup,
  UserRole,
  AccessibilityPreferences,
  ThemeState,
  ThemeActions,
  ThemeContextValue,
  DesignTokens,
  ThemeConfig,
  OrganizationBranding,
} from "@/lib/theme";
import {
  DEFAULT_THEME_CONFIG,
  DEFAULT_ACCESSIBILITY,
  buildTheme,
  injectTokens,
  setThemeDataAttributes,
  getSystemColorScheme,
  getSystemReducedMotion,
  subscribeToSystemColorScheme,
  subscribeToReducedMotionChanges,
  createAgeGroupLayer,
  createAgeGroupDarkLayer,
  createRoleLayer,
} from "@/lib/theme";

// ============================================================================
// Context
// ============================================================================

export const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  mode: "kaelyns-academy-theme-mode",
  accessibility: "kaelyns-academy-accessibility",
} as const;

// ============================================================================
// Storage Helpers
// ============================================================================

function getStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    // Ignore parse errors
  }

  return defaultValue;
}

function setStoredValue<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Provider Props
// ============================================================================

export interface ThemeProviderProps {
  children: ReactNode;
  config?: Partial<ThemeConfig>;
  defaultAgeGroup?: AgeGroup | null;
  defaultRole?: UserRole;
  organizationBranding?: OrganizationBranding | null;
  disableSystemDetection?: boolean;
}

// ============================================================================
// Theme Provider Component
// ============================================================================

export function ThemeProvider({
  children,
  config: configOverrides,
  defaultAgeGroup = null,
  defaultRole = "guest",
  organizationBranding = null,
  disableSystemDetection = false,
}: ThemeProviderProps) {
  const config: ThemeConfig = useMemo(
    () => ({
      ...DEFAULT_THEME_CONFIG,
      ...configOverrides,
    }),
    [configOverrides]
  );

  // ============================================================================
  // State
  // ============================================================================

  const [mode, setModeState] = useState<ThemeMode>(() =>
    getStoredValue(STORAGE_KEYS.mode, config.defaultMode)
  );

  const [resolvedMode, setResolvedMode] = useState<ResolvedThemeMode>(() => {
    if (mode === "system") {
      return typeof window !== "undefined" ? getSystemColorScheme() : "light";
    }
    return mode;
  });

  const [ageGroup, setAgeGroupState] = useState<AgeGroup | null>(defaultAgeGroup);
  const [userRole, setUserRoleState] = useState<UserRole>(defaultRole);
  const [organizationId, setOrganizationIdState] = useState<string | null>(
    organizationBranding?.organizationId ?? null
  );

  const [accessibility, setAccessibilityState] = useState<AccessibilityPreferences>(
    () => {
      const stored = getStoredValue<AccessibilityPreferences | null>(
        STORAGE_KEYS.accessibility,
        null
      );

      if (stored) return stored;

      // Detect system preferences if not disabled
      if (!disableSystemDetection && typeof window !== "undefined") {
        return {
          ...DEFAULT_ACCESSIBILITY,
          reducedMotion: getSystemReducedMotion() ? "reduce" : "no-preference",
        };
      }

      return DEFAULT_ACCESSIBILITY;
    }
  );

  const [tokens, setTokens] = useState<DesignTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ============================================================================
  // Theme Building
  // ============================================================================

  const buildAndApplyTheme = useCallback(() => {
    try {
      // Build custom layers
      const customLayers = [];

      // Add age group layer if set
      if (ageGroup) {
        const ageLayer =
          resolvedMode === "dark"
            ? createAgeGroupDarkLayer(ageGroup)
            : createAgeGroupLayer(ageGroup);
        customLayers.push(ageLayer);
      }

      // Add role layer
      customLayers.push(createRoleLayer(userRole, resolvedMode));

      // Build the theme
      const resolvedTheme = buildTheme({
        mode: resolvedMode,
        ageGroup,
        userRole,
        accessibility,
        organizationBranding: organizationId ? organizationBranding : null,
        customLayers,
      });

      // Inject tokens into DOM
      injectTokens(resolvedTheme.tokens);

      // Set data attributes
      setThemeDataAttributes({
        mode: resolvedMode,
        ageGroup,
        role: userRole,
        highContrast: accessibility.highContrast,
        reducedMotion: accessibility.reducedMotion === "reduce",
      });

      setTokens(resolvedTheme.tokens);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to build theme"));
    } finally {
      setIsLoading(false);
    }
  }, [
    resolvedMode,
    ageGroup,
    userRole,
    accessibility,
    organizationId,
    organizationBranding,
  ]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Build and apply theme when dependencies change
  useEffect(() => {
    buildAndApplyTheme();
  }, [buildAndApplyTheme]);

  // Resolve system mode when mode is 'system'
  useEffect(() => {
    if (mode === "system") {
      setResolvedMode(getSystemColorScheme());
    } else {
      setResolvedMode(mode);
    }
  }, [mode]);

  // Subscribe to system color scheme changes
  useEffect(() => {
    if (mode !== "system" || disableSystemDetection) return;

    const unsubscribe = subscribeToSystemColorScheme((scheme) => {
      setResolvedMode(scheme);
    });

    return unsubscribe;
  }, [mode, disableSystemDetection]);

  // Subscribe to reduced motion changes
  useEffect(() => {
    if (disableSystemDetection) return;

    const unsubscribe = subscribeToReducedMotionChanges((reduced) => {
      setAccessibilityState((prev) => ({
        ...prev,
        reducedMotion: reduced ? "reduce" : "no-preference",
      }));
    });

    return unsubscribe;
  }, [disableSystemDetection]);

  // Persist mode to storage
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.mode, mode);
  }, [mode]);

  // Persist accessibility to storage
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.accessibility, accessibility);
  }, [accessibility]);

  // ============================================================================
  // Actions
  // ============================================================================

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const setAgeGroup = useCallback((newAgeGroup: AgeGroup | null) => {
    setAgeGroupState(newAgeGroup);
  }, []);

  const setUserRole = useCallback((newRole: UserRole) => {
    setUserRoleState(newRole);
  }, []);

  const setOrganization = useCallback((newOrgId: string | null) => {
    setOrganizationIdState(newOrgId);
  }, []);

  const setAccessibility = useCallback(
    (prefs: Partial<AccessibilityPreferences>) => {
      setAccessibilityState((prev) => ({
        ...prev,
        ...prefs,
      }));
    },
    []
  );

  const toggleHighContrast = useCallback(() => {
    setAccessibilityState((prev) => ({
      ...prev,
      highContrast: !prev.highContrast,
      colorScheme: prev.highContrast ? "normal" : "high-contrast",
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setModeState(config.defaultMode);
    setAgeGroupState(defaultAgeGroup);
    setUserRoleState(defaultRole);
    setAccessibilityState(DEFAULT_ACCESSIBILITY);
    setOrganizationIdState(organizationBranding?.organizationId ?? null);
  }, [config.defaultMode, defaultAgeGroup, defaultRole, organizationBranding]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const state: ThemeState = useMemo(
    () => ({
      mode,
      resolvedMode,
      ageGroup,
      userRole,
      organizationId,
      accessibility,
      resolvedTheme: tokens ? { tokens, layers: [], meta: {} as never } : null,
      isLoading,
      error,
    }),
    [
      mode,
      resolvedMode,
      ageGroup,
      userRole,
      organizationId,
      accessibility,
      tokens,
      isLoading,
      error,
    ]
  );

  const actions: ThemeActions = useMemo(
    () => ({
      setMode,
      setAgeGroup,
      setUserRole,
      setOrganization,
      setAccessibility,
      toggleHighContrast,
      resetToDefaults,
    }),
    [
      setMode,
      setAgeGroup,
      setUserRole,
      setOrganization,
      setAccessibility,
      toggleHighContrast,
      resetToDefaults,
    ]
  );

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      state,
      actions,
      tokens,
    }),
    [state, actions, tokens]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// Script for SSR Flash Prevention
// ============================================================================

/**
 * Inline script to prevent flash of unstyled content
 * Include this in the <head> before any content renders
 */
export const themeInitScript = `
(function() {
  try {
    var mode = localStorage.getItem('kaelyns-academy-theme-mode');
    mode = mode ? JSON.parse(mode) : 'system';

    var resolvedMode = mode;
    if (mode === 'system') {
      resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme-mode', resolvedMode);

    if (resolvedMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check for high contrast
    var a11y = localStorage.getItem('kaelyns-academy-accessibility');
    if (a11y) {
      a11y = JSON.parse(a11y);
      if (a11y.highContrast) {
        document.documentElement.setAttribute('data-high-contrast', 'true');
      }
      if (a11y.reducedMotion === 'reduce') {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
      }
    }
  } catch (e) {}
})();
`;
