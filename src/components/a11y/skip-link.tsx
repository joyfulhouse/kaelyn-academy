"use client";

/**
 * Skip Link Component
 * Allows keyboard users to skip to main content
 * WCAG 2.1 Success Criterion 2.4.1: Bypass Blocks
 */

import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Visually hidden by default
        "sr-only",
        // Visible on focus
        "focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999]",
        "focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring",
        "focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Multiple skip links for complex pages
 */
interface SkipLinksProps {
  links: Array<{
    href: string;
    label: string;
  }>;
  className?: string;
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  return (
    <nav
      aria-label="Skip links"
      className={cn("contents", className)}
    >
      {links.map((link) => (
        <SkipLink key={link.href} href={link.href}>
          {link.label}
        </SkipLink>
      ))}
    </nav>
  );
}
