"use client";

import { useEffect } from "react";
import { useGradeUI } from "@/components/providers/grade-ui-provider";

/**
 * K2StyleInjector Component
 *
 * Injects CSS custom properties and styles specific to K-2 learners.
 * This component should be placed in the layout to apply K-2 specific
 * styling across the entire application.
 *
 * Features:
 * - Bright, engaging color palette
 * - Large touch targets (CSS variables)
 * - Rounded corners for friendly appearance
 * - Bouncy animations
 * - High contrast for accessibility
 */

// K-2 specific CSS custom properties
const K2_CSS_VARIABLES = `
  /* K-2 Playful Color Palette */
  --k2-color-red: oklch(0.65 0.25 25);
  --k2-color-orange: oklch(0.75 0.22 55);
  --k2-color-yellow: oklch(0.88 0.18 95);
  --k2-color-green: oklch(0.72 0.2 145);
  --k2-color-blue: oklch(0.65 0.22 255);
  --k2-color-purple: oklch(0.6 0.25 300);
  --k2-color-pink: oklch(0.7 0.2 350);
  --k2-color-cyan: oklch(0.78 0.15 200);

  /* Touch Target Sizes */
  --k2-touch-target-sm: 48px;
  --k2-touch-target-md: 64px;
  --k2-touch-target-lg: 80px;
  --k2-touch-target-xl: 96px;

  /* Spacing Multipliers */
  --k2-spacing-multiplier: 1.5;
  --k2-gap-sm: calc(0.5rem * var(--k2-spacing-multiplier));
  --k2-gap-md: calc(1rem * var(--k2-spacing-multiplier));
  --k2-gap-lg: calc(1.5rem * var(--k2-spacing-multiplier));
  --k2-gap-xl: calc(2rem * var(--k2-spacing-multiplier));

  /* Typography */
  --k2-font-size-base: 18px;
  --k2-font-size-lg: 22px;
  --k2-font-size-xl: 28px;
  --k2-font-size-2xl: 36px;
  --k2-font-weight: 700;
  --k2-line-height: 1.8;
  --k2-letter-spacing: 0.02em;

  /* Border Radius */
  --k2-radius-sm: 0.75rem;
  --k2-radius-md: 1rem;
  --k2-radius-lg: 1.25rem;
  --k2-radius-xl: 1.5rem;
  --k2-radius-2xl: 2rem;
  --k2-radius-full: 9999px;

  /* Shadows */
  --k2-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --k2-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
  --k2-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --k2-shadow-xl: 0 12px 48px rgba(0, 0, 0, 0.15);

  /* Animations */
  --k2-animation-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --k2-animation-spring: cubic-bezier(0.5, 1.5, 0.5, 1);
  --k2-animation-duration-fast: 150ms;
  --k2-animation-duration-normal: 250ms;
  --k2-animation-duration-slow: 400ms;
`;

// K-2 specific global styles
const K2_GLOBAL_STYLES = `
  /* Apply K-2 theme class for targeted styling */
  .theme-early-elementary {
    ${K2_CSS_VARIABLES}
  }

  /* Large buttons and inputs */
  .theme-early-elementary button,
  .theme-early-elementary [role="button"],
  .theme-early-elementary a[class*="button"],
  .theme-early-elementary .k2-touch-target {
    min-height: var(--k2-touch-target-md);
    min-width: var(--k2-touch-target-md);
    border-radius: var(--k2-radius-lg);
    font-weight: var(--k2-font-weight);
    letter-spacing: var(--k2-letter-spacing);
  }

  /* Enhanced focus states */
  .theme-early-elementary :focus-visible {
    outline: 4px solid var(--primary);
    outline-offset: 3px;
    border-radius: var(--k2-radius-md);
  }

  /* Card styling */
  .theme-early-elementary [data-slot="card"],
  .theme-early-elementary .card {
    border-radius: var(--k2-radius-xl);
    padding: var(--k2-gap-lg);
    box-shadow: var(--k2-shadow-md);
  }

  /* Input fields */
  .theme-early-elementary input,
  .theme-early-elementary textarea,
  .theme-early-elementary select {
    min-height: var(--k2-touch-target-md);
    font-size: var(--k2-font-size-lg);
    border-radius: var(--k2-radius-lg);
    padding: var(--k2-gap-md);
  }

  /* Navigation items */
  .theme-early-elementary nav a,
  .theme-early-elementary [role="navigation"] a {
    min-height: var(--k2-touch-target-lg);
    padding: var(--k2-gap-md);
    border-radius: var(--k2-radius-lg);
  }

  /* Bouncy hover animations */
  .theme-early-elementary .k2-bouncy {
    transition: transform var(--k2-animation-duration-normal) var(--k2-animation-bounce);
  }

  .theme-early-elementary .k2-bouncy:hover {
    transform: scale(1.05);
  }

  .theme-early-elementary .k2-bouncy:active {
    transform: scale(0.95);
  }

  /* Fun gradient backgrounds */
  .theme-early-elementary .k2-gradient-rainbow {
    background: linear-gradient(
      135deg,
      var(--k2-color-red) 0%,
      var(--k2-color-orange) 16%,
      var(--k2-color-yellow) 32%,
      var(--k2-color-green) 48%,
      var(--k2-color-cyan) 64%,
      var(--k2-color-blue) 80%,
      var(--k2-color-purple) 100%
    );
  }

  .theme-early-elementary .k2-gradient-primary {
    background: linear-gradient(
      135deg,
      var(--k2-color-blue) 0%,
      var(--k2-color-purple) 100%
    );
  }

  .theme-early-elementary .k2-gradient-success {
    background: linear-gradient(
      135deg,
      var(--k2-color-green) 0%,
      var(--k2-color-cyan) 100%
    );
  }

  .theme-early-elementary .k2-gradient-warning {
    background: linear-gradient(
      135deg,
      var(--k2-color-yellow) 0%,
      var(--k2-color-orange) 100%
    );
  }

  /* Wiggle animation for fun elements */
  @keyframes k2-wiggle {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  .theme-early-elementary .k2-wiggle:hover {
    animation: k2-wiggle 0.3s ease-in-out infinite;
  }

  /* Pulse animation for attention */
  @keyframes k2-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .theme-early-elementary .k2-pulse {
    animation: k2-pulse 2s ease-in-out infinite;
  }

  /* Float animation for decorative elements */
  @keyframes k2-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .theme-early-elementary .k2-float {
    animation: k2-float 3s ease-in-out infinite;
  }

  /* Large, readable headings */
  .theme-early-elementary h1 {
    font-size: var(--k2-font-size-2xl);
    font-weight: 800;
    letter-spacing: var(--k2-letter-spacing);
    line-height: 1.2;
  }

  .theme-early-elementary h2 {
    font-size: var(--k2-font-size-xl);
    font-weight: 700;
  }

  .theme-early-elementary h3 {
    font-size: var(--k2-font-size-lg);
    font-weight: 600;
  }

  .theme-early-elementary p,
  .theme-early-elementary span,
  .theme-early-elementary li {
    font-size: var(--k2-font-size-base);
    line-height: var(--k2-line-height);
  }

  /* Icon sizing */
  .theme-early-elementary .k2-icon {
    width: 28px;
    height: 28px;
  }

  .theme-early-elementary .k2-icon-lg {
    width: 36px;
    height: 36px;
  }

  .theme-early-elementary .k2-icon-xl {
    width: 48px;
    height: 48px;
  }
`;

/**
 * Injects K-2 specific styles into the document
 */
export function K2StyleInjector() {
  const { isK2 } = useGradeUI();

  useEffect(() => {
    if (!isK2) return;

    // Create style element if it doesn't exist
    const styleId = "k2-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = K2_GLOBAL_STYLES;

    // Cleanup on unmount or when no longer K-2
    return () => {
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, [isK2]);

  return null;
}

/**
 * K2Wrapper - Wraps children with K-2 specific styles
 */
interface K2WrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Force K-2 styling regardless of grade level */
  force?: boolean;
}

export function K2Wrapper({ children, className, force = false }: K2WrapperProps) {
  const { isK2 } = useGradeUI();

  if (!isK2 && !force) {
    return <>{children}</>;
  }

  return (
    <div className={`theme-early-elementary ${className ?? ""}`}>
      <K2StyleInjector />
      {children}
    </div>
  );
}

/**
 * Helper component for K-2 styled text that can be read aloud
 */
interface K2TextProps {
  children: React.ReactNode;
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3";
  className?: string;
}

export function K2Text({ children, as: Component = "p", className }: K2TextProps) {
  const { isK2 } = useGradeUI();

  return (
    <Component
      className={`${isK2 ? "text-lg leading-relaxed font-medium" : ""} ${className ?? ""}`}
    >
      {children}
    </Component>
  );
}

export { K2_CSS_VARIABLES, K2_GLOBAL_STYLES };
