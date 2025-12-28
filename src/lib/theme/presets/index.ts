/**
 * Theme Presets
 *
 * This module exports all theme presets for different layers:
 * - Modes (light/dark)
 * - Age groups (early-elementary, upper-elementary, middle-school, high-school)
 * - User roles (learner, parent, teacher, admin)
 * - Accessibility (high-contrast, reduced-motion, font-scaling)
 *
 * @module theme/presets
 */

// Mode presets
export {
  createLightModeLayer,
  createDarkModeLayer,
  createModeLayer,
  getBaseTokensForMode,
  detectSystemColorScheme,
  resolveThemeMode,
  subscribeToColorSchemeChanges,
} from "./modes";

// Age group presets
export {
  earlyElementaryTokens,
  upperElementaryTokens,
  middleSchoolTokens,
  highSchoolTokens,
  ageGroupTokens,
  ageGroupDarkTokens,
  createAgeGroupLayer,
  createAgeGroupDarkLayer,
  getAllAgeGroupLayers,
} from "./age";

// Role presets
export {
  learnerTokens,
  learnerDarkTokens,
  parentTokens,
  parentDarkTokens,
  teacherTokens,
  teacherDarkTokens,
  schoolAdminTokens,
  schoolAdminDarkTokens,
  platformAdminTokens,
  platformAdminDarkTokens,
  guestTokens,
  guestDarkTokens,
  roleTokens,
  roleDarkTokens,
  createRoleLayer,
  getAllRoleLayers,
  defaultRoleGradients,
  defaultRoleDarkGradients,
  generateRoleGradientCSS,
  type RoleGradientConfig,
} from "./roles";

// Accessibility presets
export {
  highContrastLightTokens,
  highContrastDarkTokens,
  reducedMotionTokens,
  largeFontTokens,
  xLargeFontTokens,
  createHighContrastLayer,
  createReducedMotionLayer,
  createFontScalingLayer,
  createAccessibilityLayers,
  generateFocusIndicatorCSS,
  generateSkipLinkCSS,
  shouldEnableHighContrast,
  shouldReduceMotion,
  getSystemAccessibilityPreferences,
} from "./accessibility";
