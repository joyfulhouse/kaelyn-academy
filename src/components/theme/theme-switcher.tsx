"use client";

/**
 * Theme Switcher Component
 *
 * A dropdown menu for switching between light, dark, and system themes.
 *
 * @module components/theme/theme-switcher
 */

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeMode } from "./hooks/use-theme";
import type { ThemeMode } from "@/lib/theme";

export interface ThemeSwitcherProps {
  showLabel?: boolean;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export function ThemeSwitcher(props: ThemeSwitcherProps) {
  const { align = "end", side = "bottom" } = props;
  const { mode, resolvedMode, setMode, isDark } = useThemeMode();

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {isDark ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side}>
        <DropdownMenuItem
          onClick={() => handleModeChange("light")}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {mode === "light" && (
            <span className="ml-auto text-xs text-muted-foreground">
              Active
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleModeChange("dark")}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {mode === "dark" && (
            <span className="ml-auto text-xs text-muted-foreground">
              Active
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleModeChange("system")}
          className="cursor-pointer"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {mode === "system" && (
            <span className="ml-auto text-xs text-muted-foreground">
              ({resolvedMode})
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Simple theme toggle button (light/dark only)
 */
export function ThemeToggle() {
  const { toggleMode, isDark } = useThemeMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      className="h-9 w-9"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
