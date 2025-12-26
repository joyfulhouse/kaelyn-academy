/**
 * Accessibility Components
 * WCAG 2.1 AA Compliant Utilities
 */

// Skip links for keyboard navigation
export { SkipLink, SkipLinks } from "./skip-link";

// Live regions for dynamic announcements
export {
  LiveRegion,
  LiveRegionProvider,
  useLiveAnnouncer,
} from "./live-region";

// Focus management
export { FocusTrap, useFocusTrap } from "./focus-trap";

// Keyboard navigation utilities
export {
  useArrowNavigation,
  useRovingTabIndex,
  useEscapeKey,
  useFocusVisible,
} from "./keyboard-navigation";

// Visually hidden content
export { VisuallyHidden, SrOnly, A11yText } from "./visually-hidden";
