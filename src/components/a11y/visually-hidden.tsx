"use client";

/**
 * Visually Hidden Component
 * Hides content visually while keeping it accessible to screen readers
 * WCAG 2.1 Success Criterion 1.3.1: Info and Relationships
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  /** When true, becomes visible on focus (for skip links) */
  focusable?: boolean;
  /** Additional class names */
  className?: string;
  /** Element tag to render */
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label";
}

export function VisuallyHidden({
  children,
  focusable = false,
  className,
  as = "span",
}: VisuallyHiddenProps) {
  const baseClassName = cn(
    // Base visually hidden styles (sr-only equivalent)
    "absolute w-px h-px p-0 -m-px overflow-hidden",
    "whitespace-nowrap border-0",
    "[clip:rect(0,0,0,0)]",
    // When focusable, show on focus
    focusable && [
      "focus:static focus:w-auto focus:h-auto focus:m-0",
      "focus:overflow-visible focus:whitespace-normal",
      "focus:[clip:auto]",
    ],
    className
  );

  switch (as) {
    case "div":
      return <div className={baseClassName}>{children}</div>;
    case "p":
      return <p className={baseClassName}>{children}</p>;
    case "h1":
      return <h1 className={baseClassName}>{children}</h1>;
    case "h2":
      return <h2 className={baseClassName}>{children}</h2>;
    case "h3":
      return <h3 className={baseClassName}>{children}</h3>;
    case "h4":
      return <h4 className={baseClassName}>{children}</h4>;
    case "h5":
      return <h5 className={baseClassName}>{children}</h5>;
    case "h6":
      return <h6 className={baseClassName}>{children}</h6>;
    case "label":
      return <label className={baseClassName}>{children}</label>;
    default:
      return <span className={baseClassName}>{children}</span>;
  }
}

/**
 * Screen reader only text - simplified version
 */
interface SrOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function SrOnly({ children, className }: SrOnlyProps) {
  return <span className={cn("sr-only", className)}>{children}</span>;
}

/**
 * Text that provides additional context for screen readers
 * without affecting visual layout
 */
interface A11yTextProps {
  /** The actual visual text */
  children: React.ReactNode;
  /** Additional text for screen readers only */
  srLabel?: string;
  /** Text to prepend for screen readers */
  srPrefix?: string;
  /** Text to append for screen readers */
  srSuffix?: string;
}

export function A11yText({
  children,
  srLabel,
  srPrefix,
  srSuffix,
}: A11yTextProps) {
  // If there's a complete replacement label, use that
  if (srLabel) {
    return (
      <>
        <span aria-hidden="true">{children}</span>
        <SrOnly>{srLabel}</SrOnly>
      </>
    );
  }

  // Otherwise, use prefix/suffix pattern
  return (
    <>
      {srPrefix && <SrOnly>{srPrefix} </SrOnly>}
      {children}
      {srSuffix && <SrOnly> {srSuffix}</SrOnly>}
    </>
  );
}
