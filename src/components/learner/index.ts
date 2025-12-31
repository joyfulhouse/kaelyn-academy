/**
 * K-2 Age-Adaptive UI Components
 *
 * This module exports all components designed for K-2 (early elementary) learners.
 * These components feature:
 * - Large touch targets (64px+ minimum)
 * - Read-aloud functionality using Web Speech API
 * - Simplified navigation with icons
 * - Bright, engaging colors
 * - Bouncy, fun animations
 * - High contrast for accessibility
 * - Mobile/tablet optimized layouts
 *
 * @module components/learner
 */

// Read Aloud Components
export {
  ReadAloud,
  ReadAloudButton,
  ReadAloudToggle,
} from "./read-aloud";

// Adaptive Button Components
export {
  AdaptiveButton,
  AdaptiveIconButton,
  K2Button,
  adaptiveButtonVariants,
  type AdaptiveButtonProps,
  type AdaptiveIconButtonProps,
  type K2ButtonProps,
} from "./adaptive-button";

// Navigation Components
export {
  K2Navigation,
  K2BottomNav,
  K2NavCard,
  IconNavItem,
  K2_NAV_ITEMS,
  type K2NavItem,
} from "./k2-navigation";

// Style Components
export {
  K2StyleInjector,
  K2Wrapper,
  K2Text,
  K2_CSS_VARIABLES,
  K2_GLOBAL_STYLES,
} from "./k2-styles";
