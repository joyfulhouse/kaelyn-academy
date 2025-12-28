/**
 * Theme Components
 *
 * React components for the Kaelyn's Academy theme system.
 *
 * @module components/theme
 */

// Provider
export { ThemeProvider, ThemeContext } from "./theme-provider";
export type { ThemeProviderProps } from "./theme-provider";

// Init script (for preventing FOUC)
export { ThemeInitScript } from "./theme-init-script";

// Switcher components
export { ThemeSwitcher, ThemeToggle } from "./theme-switcher";
export type { ThemeSwitcherProps } from "./theme-switcher";

// Accessibility components
export { AccessibilityMenu, HighContrastToggle } from "./accessibility-menu";
export type { AccessibilityMenuProps } from "./accessibility-menu";

// Hooks
export {
  useTheme,
  useThemeMode,
  useAgeGroup,
  useUserRole,
  useAccessibility,
  useTokens,
  useToken,
  useColorToken,
  useThemeLoading,
  useOrganization,
} from "./hooks/use-theme";
