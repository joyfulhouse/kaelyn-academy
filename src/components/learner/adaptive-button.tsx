"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useGradeUI } from "@/components/providers/grade-ui-provider";

/**
 * AdaptiveButton Component
 *
 * An age-adaptive button that automatically adjusts its size, styling,
 * and interactivity based on the learner's grade level.
 *
 * For K-2 learners:
 * - Extra large touch targets (64px+ height)
 * - Rounded, friendly corners
 * - Bouncy animation on hover/press
 * - Larger icons and text
 * - Higher contrast colors
 *
 * For older learners:
 * - Standard button sizing
 * - Professional appearance
 * - Subtle hover effects
 */

const adaptiveButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // K-2 specific variants
        success: "bg-green-500 text-white hover:bg-green-600 shadow-md",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md",
        fun: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        default: "h-10 px-4 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        // K-2 specific sizes
        "k2-sm": "h-12 px-4 text-base rounded-xl",
        "k2-default": "h-14 px-6 text-lg rounded-2xl",
        "k2-lg": "h-16 px-8 text-xl rounded-2xl",
        "k2-xl": "h-20 px-10 text-2xl rounded-3xl",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
        // K-2 icon sizes
        "k2-icon": "h-14 w-14 rounded-xl",
        "k2-icon-lg": "h-16 w-16 rounded-2xl",
        "k2-icon-xl": "h-20 w-20 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Map standard sizes to K-2 sizes
const K2_SIZE_MAP: Record<string, string> = {
  sm: "k2-sm",
  default: "k2-default",
  lg: "k2-lg",
  icon: "k2-icon",
  "icon-sm": "k2-icon",
  "icon-lg": "k2-icon-lg",
};

export interface AdaptiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adaptiveButtonVariants> {
  asChild?: boolean;
  /** Override automatic size adaptation */
  forceSize?: boolean;
  /** Icon to display (enhanced for K-2) */
  icon?: React.ReactNode;
  /** Position of icon */
  iconPosition?: "left" | "right";
  /** Show loading state */
  loading?: boolean;
}

const AdaptiveButton = React.forwardRef<HTMLButtonElement, AdaptiveButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      forceSize = false,
      icon,
      iconPosition = "left",
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const { settings, isK2 } = useGradeUI();

    // Determine effective size based on grade level
    const effectiveSize = React.useMemo(() => {
      if (forceSize || !isK2) return size;
      const sizeKey = size ?? "default";
      return (K2_SIZE_MAP[sizeKey] ?? sizeKey) as VariantProps<typeof adaptiveButtonVariants>["size"];
    }, [forceSize, isK2, size]);

    // K-2 specific styles
    const k2Styles = React.useMemo(() => {
      if (!isK2) return "";
      return cn(
        // Bouncy animation
        settings.bouncyAnimations && [
          "transform transition-transform duration-200",
          "hover:scale-105 active:scale-95",
          "hover:shadow-lg active:shadow-md",
        ],
        // Extra visual feedback
        "focus:ring-4 focus:ring-primary/30",
        // Font weight for readability
        "font-bold tracking-wide"
      );
    }, [isK2, settings.bouncyAnimations]);

    const Comp = asChild ? Slot : "button";

    // Loading spinner for K-2
    const LoadingSpinner = () => (
      <svg
        className={cn(
          "animate-spin",
          isK2 ? "h-6 w-6" : "h-4 w-4"
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Icon wrapper with size adaptation
    const IconWrapper = ({ iconElement }: { iconElement: React.ReactNode }) => (
      <span
        className={cn(
          "flex items-center justify-center",
          isK2 ? "[&>svg]:h-6 [&>svg]:w-6" : "[&>svg]:h-4 [&>svg]:w-4"
        )}
      >
        {iconElement}
      </span>
    );

    return (
      <Comp
        className={cn(
          adaptiveButtonVariants({ variant, size: effectiveSize }),
          k2Styles,
          className
        )}
        ref={ref}
        disabled={loading || props.disabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {icon && iconPosition === "left" && <IconWrapper iconElement={icon} />}
            {children}
            {icon && iconPosition === "right" && <IconWrapper iconElement={icon} />}
          </>
        )}
      </Comp>
    );
  }
);
AdaptiveButton.displayName = "AdaptiveButton";

/**
 * AdaptiveIconButton - Icon-only button with age-adaptive sizing
 */
export interface AdaptiveIconButtonProps
  extends Omit<AdaptiveButtonProps, "children" | "icon" | "iconPosition"> {
  icon: React.ReactNode;
  label: string; // Required for accessibility
}

const AdaptiveIconButton = React.forwardRef<HTMLButtonElement, AdaptiveIconButtonProps>(
  ({ icon, label, size = "icon", className, ...props }, ref) => {
    const { isK2, settings } = useGradeUI();

    const effectiveSize = React.useMemo(() => {
      if (!isK2) return size;
      const sizeMap: Record<string, string> = {
        "icon-sm": "k2-icon",
        icon: "k2-icon",
        "icon-lg": "k2-icon-lg",
      };
      return (sizeMap[size ?? "icon"] ?? "k2-icon") as VariantProps<typeof adaptiveButtonVariants>["size"];
    }, [isK2, size]);

    return (
      <AdaptiveButton
        ref={ref}
        size={effectiveSize}
        forceSize
        className={cn(
          "p-0",
          isK2 && settings.bouncyAnimations && "hover:rotate-3",
          className
        )}
        aria-label={label}
        title={label}
        {...props}
      >
        <span
          className={cn(
            "flex items-center justify-center",
            isK2 ? "[&>svg]:h-7 [&>svg]:w-7" : "[&>svg]:h-5 [&>svg]:w-5"
          )}
        >
          {icon}
        </span>
      </AdaptiveButton>
    );
  }
);
AdaptiveIconButton.displayName = "AdaptiveIconButton";

/**
 * K2Button - Explicitly styled for K-2 learners (always uses K-2 styling)
 */
export interface K2ButtonProps extends Omit<AdaptiveButtonProps, "forceSize"> {
  /** Fun animated effect */
  animated?: boolean;
}

const K2Button = React.forwardRef<HTMLButtonElement, K2ButtonProps>(
  ({ className, animated = true, variant = "default", size = "default", ...props }, ref) => {
    // Map to K-2 sizes explicitly
    const k2Size = (K2_SIZE_MAP[size ?? "default"] ?? "k2-default") as VariantProps<typeof adaptiveButtonVariants>["size"];

    return (
      <AdaptiveButton
        ref={ref}
        variant={variant}
        size={k2Size}
        forceSize
        className={cn(
          "font-bold tracking-wide",
          animated && [
            "transform transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "hover:shadow-lg active:shadow-md",
            "focus:ring-4 focus:ring-primary/30",
          ],
          className
        )}
        {...props}
      />
    );
  }
);
K2Button.displayName = "K2Button";

export { AdaptiveButton, AdaptiveIconButton, K2Button, adaptiveButtonVariants };
