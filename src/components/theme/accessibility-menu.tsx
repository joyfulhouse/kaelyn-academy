"use client";

/**
 * Accessibility Menu Component
 *
 * Provides controls for accessibility preferences including:
 * - High contrast mode (WCAG AAA compliant)
 * - Reduced motion
 * - Font scaling
 *
 * @module components/theme/accessibility-menu
 */

import { Accessibility, Contrast, Eye, Type, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessibility } from "./hooks/use-theme";
import type { FontScaling } from "@/lib/theme";

export interface AccessibilityMenuProps {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export function AccessibilityMenu({
  align = "end",
  side = "bottom",
}: AccessibilityMenuProps) {
  const {
    setPreferences,
    toggleHighContrast,
    isHighContrast,
    isReducedMotion,
    fontScale,
  } = useAccessibility();

  const handleFontScaleChange = (scale: FontScaling) => {
    setPreferences({ fontScaling: scale });
  };

  const handleReducedMotionToggle = () => {
    setPreferences({
      reducedMotion: isReducedMotion ? "no-preference" : "reduce",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Accessibility settings"
        >
          <Accessibility className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Accessibility
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* High Contrast Toggle */}
        <DropdownMenuItem
          onClick={toggleHighContrast}
          className="cursor-pointer"
        >
          <Contrast className="mr-2 h-4 w-4" />
          <span className="flex-1">High Contrast</span>
          {isHighContrast && <Check className="h-4 w-4 text-success" />}
        </DropdownMenuItem>

        {/* Reduced Motion Toggle */}
        <DropdownMenuItem
          onClick={handleReducedMotionToggle}
          className="cursor-pointer"
        >
          <Zap className="mr-2 h-4 w-4" />
          <span className="flex-1">Reduce Motion</span>
          {isReducedMotion && <Check className="h-4 w-4 text-success" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
          <Type className="h-3 w-3" />
          Font Size
        </DropdownMenuLabel>

        {/* Font Size Options */}
        <DropdownMenuItem
          onClick={() => handleFontScaleChange("normal")}
          className="cursor-pointer"
        >
          <span className="mr-2 w-4 text-center text-sm">A</span>
          <span className="flex-1">Normal</span>
          {fontScale === "normal" && <Check className="h-4 w-4 text-success" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleFontScaleChange("large")}
          className="cursor-pointer"
        >
          <span className="mr-2 w-4 text-center text-base font-medium">A</span>
          <span className="flex-1">Large (+20%)</span>
          {fontScale === "large" && <Check className="h-4 w-4 text-success" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleFontScaleChange("x-large")}
          className="cursor-pointer"
        >
          <span className="mr-2 w-4 text-center text-lg font-bold">A</span>
          <span className="flex-1">Extra Large (+40%)</span>
          {fontScale === "x-large" && (
            <Check className="h-4 w-4 text-success" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Simple high contrast toggle button
 */
export function HighContrastToggle() {
  const { toggleHighContrast, isHighContrast } = useAccessibility();

  return (
    <Button
      variant={isHighContrast ? "default" : "ghost"}
      size="icon"
      onClick={toggleHighContrast}
      className="h-9 w-9"
      aria-label={
        isHighContrast ? "Disable high contrast" : "Enable high contrast"
      }
      aria-pressed={isHighContrast}
    >
      <Contrast className="h-4 w-4" />
    </Button>
  );
}
