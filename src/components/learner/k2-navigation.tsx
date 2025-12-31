"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useMemo } from "react";
import {
  Home,
  BookOpen,
  Trophy,
  Sparkles,
  Target,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGradeUI } from "@/components/providers/grade-ui-provider";

/**
 * K2Navigation Component
 *
 * A simplified, icon-focused navigation system designed for K-2 learners.
 * Features:
 * - Large, colorful icons with clear visual hierarchy
 * - Minimal text (icon-first design)
 * - Reduced number of navigation items
 * - High contrast active states
 * - Bouncy, engaging animations
 * - Touch-friendly spacing (64px+ targets)
 */

export interface K2NavItem {
  /** Display label (short, simple words) */
  label: string;
  /** URL path */
  href: string;
  /** Icon component */
  icon: LucideIcon;
  /** Background color for the icon (Tailwind class) */
  bgColor: string;
  /** Icon color (Tailwind class) */
  iconColor: string;
  /** Optional emoji for extra fun */
  emoji?: string;
  /** Whether to show this item in simplified mode */
  simplified?: boolean;
}

// Default K-2 navigation items (simplified set)
export const K2_NAV_ITEMS: K2NavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    emoji: undefined,
    simplified: true,
  },
  {
    label: "Learn",
    href: "/subjects",
    icon: BookOpen,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    emoji: undefined,
    simplified: true,
  },
  {
    label: "Stars",
    href: "/achievements",
    icon: Trophy,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    emoji: undefined,
    simplified: true,
  },
  {
    label: "Helper",
    href: "/tutor",
    icon: Sparkles,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    emoji: undefined,
    simplified: true,
  },
  {
    label: "Practice",
    href: "/practice",
    icon: Target,
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    emoji: undefined,
    simplified: false,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    bgColor: "bg-gray-100 dark:bg-gray-800/30",
    iconColor: "text-gray-600 dark:text-gray-400",
    emoji: undefined,
    simplified: false,
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    emoji: undefined,
    simplified: false,
  },
];

interface K2NavButtonProps {
  item: K2NavItem;
  isActive: boolean;
  showLabel?: boolean;
}

function K2NavButton({ item, isActive, showLabel = true }: K2NavButtonProps) {
  const { settings } = useGradeUI();
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl",
        "min-w-[80px] min-h-[80px]",
        "transition-all duration-200",
        // Base styles
        "border-2 border-transparent",
        // Active state
        isActive
          ? [
              item.bgColor,
              "border-current",
              "shadow-lg scale-105",
              item.iconColor.replace("text-", "border-"),
            ]
          : [
              "hover:bg-muted/50",
              settings.bouncyAnimations && "hover:scale-105 active:scale-95",
            ],
        // Focus styles
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Icon container */}
      <div
        className={cn(
          "flex items-center justify-center",
          "w-12 h-12 rounded-xl",
          item.bgColor,
          settings.bouncyAnimations && "transition-transform group-hover:scale-110"
        )}
      >
        <Icon
          className={cn(
            "w-7 h-7",
            item.iconColor,
            isActive && "animate-pulse"
          )}
          strokeWidth={2.5}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={cn(
            "text-sm font-bold tracking-wide",
            isActive ? item.iconColor : "text-muted-foreground"
          )}
        >
          {item.emoji && <span className="mr-1">{item.emoji}</span>}
          {item.label}
        </span>
      )}
    </Link>
  );
}

interface K2NavigationProps {
  /** Custom navigation items */
  items?: K2NavItem[];
  /** Show only simplified items (true) or all items (false) */
  simplified?: boolean;
  /** Show labels under icons */
  showLabels?: boolean;
  /** Orientation of the navigation */
  orientation?: "horizontal" | "vertical";
  /** Additional class names */
  className?: string;
}

export function K2Navigation({
  items = K2_NAV_ITEMS,
  simplified,
  showLabels = true,
  orientation = "horizontal",
  className,
}: K2NavigationProps) {
  const pathname = usePathname();
  const { settings, isK2 } = useGradeUI();

  // Determine if we should show simplified navigation
  const useSimplified = simplified ?? (isK2 && settings.simplifiedNav);

  const filteredItems = useMemo(() => {
    if (useSimplified) {
      return items.filter((item) => item.simplified);
    }
    return items;
  }, [items, useSimplified]);

  return (
    <nav
      className={cn(
        "flex gap-2 p-2",
        orientation === "horizontal" ? "flex-row flex-wrap justify-center" : "flex-col",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {filteredItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <K2NavButton
            key={item.href}
            item={item}
            isActive={isActive}
            showLabel={showLabels}
          />
        );
      })}
    </nav>
  );
}

/**
 * K2BottomNav - Fixed bottom navigation for mobile K-2 learners
 */
interface K2BottomNavProps {
  items?: K2NavItem[];
  className?: string;
}

export function K2BottomNav({
  items = K2_NAV_ITEMS.filter((i) => i.simplified),
  className,
}: K2BottomNavProps) {
  const pathname = usePathname();
  const { settings } = useGradeUI();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "flex items-center justify-around",
        "bg-background/95 backdrop-blur-lg",
        "border-t-2 border-border",
        "px-2 py-1 pb-safe", // pb-safe for iOS home indicator
        "safe-area-inset-bottom",
        className
      )}
      role="navigation"
      aria-label="Bottom navigation"
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center",
              "min-w-[64px] min-h-[64px] p-2",
              "rounded-xl",
              "transition-all duration-200",
              isActive
                ? [item.bgColor, "scale-110"]
                : [
                    "opacity-70 hover:opacity-100",
                    settings.bouncyAnimations && "active:scale-95",
                  ],
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={cn(
                "w-6 h-6",
                isActive ? item.iconColor : "text-muted-foreground"
              )}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span
              className={cn(
                "text-xs font-bold mt-0.5",
                isActive ? item.iconColor : "text-muted-foreground"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * K2NavCard - Large, card-style navigation for dashboard grids
 */
interface K2NavCardProps {
  item: K2NavItem;
  description?: string;
  className?: string;
}

export function K2NavCard({ item, description, className }: K2NavCardProps) {
  const { settings } = useGradeUI();
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-6",
        "rounded-3xl border-2",
        item.bgColor,
        item.iconColor.replace("text-", "border-").replace("-600", "-200"),
        "transition-all duration-200",
        settings.bouncyAnimations && [
          "hover:scale-105 active:scale-95",
          "hover:shadow-xl",
        ],
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
        className
      )}
    >
      {/* Large icon */}
      <div
        className={cn(
          "flex items-center justify-center",
          "w-16 h-16 rounded-2xl",
          "bg-white/50 dark:bg-black/20"
        )}
      >
        <Icon className={cn("w-10 h-10", item.iconColor)} strokeWidth={2} />
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-xl font-bold tracking-wide",
          item.iconColor.replace("-600", "-800").replace("-400", "-200")
        )}
      >
        {item.emoji && <span className="mr-2">{item.emoji}</span>}
        {item.label}
      </span>

      {/* Optional description */}
      {description && (
        <span className="text-sm text-muted-foreground text-center">
          {description}
        </span>
      )}
    </Link>
  );
}

/**
 * IconNavItem - Single icon-based navigation item
 */
interface IconNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Color class for the icon (e.g., "text-primary") */
  iconColor?: string;
  active?: boolean;
  className?: string;
  children?: ReactNode;
}

export function IconNavItem({
  href,
  icon: Icon,
  label,
  iconColor = "text-primary",
  active = false,
  className,
  children,
}: IconNavItemProps) {
  const { settings } = useGradeUI();

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "rounded-xl",
        "transition-all duration-200",
        active
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
        settings.bouncyAnimations && "hover:scale-102 active:scale-98",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      aria-current={active ? "page" : undefined}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          "w-10 h-10 rounded-lg",
          active ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : iconColor)} />
      </div>
      <span className="font-medium">{label}</span>
      {children}
    </Link>
  );
}
