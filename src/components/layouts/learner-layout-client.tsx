"use client";

import { type ReactNode } from "react";
import { GradeUIProvider } from "@/components/providers/grade-ui-provider";
import { K2StyleInjector } from "@/components/learner/k2-styles";
import { K2BottomNav } from "@/components/learner/k2-navigation";
import { useGradeUI } from "@/components/providers/grade-ui-provider";
import { cn } from "@/lib/utils";

/**
 * LearnerLayoutClient
 *
 * Client-side wrapper for the learner layout that provides:
 * - GradeUIProvider for K-2 specific settings
 * - K2 style injection
 * - Bottom navigation for mobile K-2 learners
 * - Responsive layout adjustments
 */

interface LearnerLayoutClientProps {
  children: ReactNode;
}

function LayoutInner({ children }: { children: ReactNode }) {
  const { isK2, settings } = useGradeUI();

  return (
    <>
      {/* Inject K-2 specific styles */}
      {isK2 && <K2StyleInjector />}

      {/* Main content with padding for bottom nav on mobile */}
      <div
        className={cn(
          "flex flex-col min-h-screen",
          isK2 && "md:pb-0 pb-20" // Padding for bottom nav on mobile
        )}
      >
        {children}
      </div>

      {/* Mobile bottom navigation for K-2 learners */}
      {isK2 && settings.simplifiedNav && (
        <div className="md:hidden">
          <K2BottomNav />
        </div>
      )}
    </>
  );
}

export function LearnerLayoutClient({ children }: LearnerLayoutClientProps) {
  return (
    <GradeUIProvider>
      <LayoutInner>{children}</LayoutInner>
    </GradeUIProvider>
  );
}

/**
 * K2ContentWrapper
 *
 * Wraps content with K-2 specific styling and spacing.
 * Use this for lesson content, activity pages, etc.
 */
interface K2ContentWrapperProps {
  children: ReactNode;
  className?: string;
  /** Add extra padding for touch-friendly spacing */
  padded?: boolean;
}

export function K2ContentWrapper({
  children,
  className,
  padded = true,
}: K2ContentWrapperProps) {
  const { isK2, settings } = useGradeUI();

  return (
    <div
      className={cn(
        "w-full",
        isK2 && [
          // Larger spacing for K-2
          padded && "px-6 py-8 md:px-8 md:py-10",
          // Larger text
          "text-lg",
          // Rounded corners on cards
          "[&_.card]:rounded-2xl",
          // Larger buttons within
          "[&_button]:min-h-[48px] [&_button]:rounded-xl",
        ],
        className
      )}
      style={{
        fontSize: isK2 ? `${settings.baseFontSize}px` : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * K2PageHeader
 *
 * Age-adaptive page header with large text and optional read-aloud.
 */
interface K2PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function K2PageHeader({
  title,
  description,
  children,
  className,
}: K2PageHeaderProps) {
  const { isK2 } = useGradeUI();

  return (
    <div
      className={cn(
        "flex flex-col gap-2 mb-6",
        isK2 && "gap-3 mb-8",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={cn(
              "font-bold text-foreground",
              isK2 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "mt-1 text-muted-foreground",
                isK2 ? "text-lg" : "text-base"
              )}
            >
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
