"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  type AgeGroup,
  type AgeTheme,
  getThemeForGrade,
  applyTheme,
  getAgeGroup,
} from "@/lib/theme/age-adaptive";

interface ThemeContextValue {
  gradeLevel: number;
  setGradeLevel: (level: number) => void;
  theme: AgeTheme;
  ageGroup: AgeGroup;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultGradeLevel?: number;
}

export function ThemeProvider({ children, defaultGradeLevel = 5 }: ThemeProviderProps) {
  const [gradeLevel, setGradeLevel] = useState(defaultGradeLevel);
  const [mounted, setMounted] = useState(false);

  const theme = getThemeForGrade(gradeLevel);
  const ageGroup = getAgeGroup(gradeLevel);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(gradeLevel);
    }
  }, [gradeLevel, mounted]);

  // Prevent flash of unstyled content
  useEffect(() => {
    if (mounted) {
      applyTheme(gradeLevel);
    }
  }, [mounted, gradeLevel]);

  return (
    <ThemeContext.Provider value={{ gradeLevel, setGradeLevel, theme, ageGroup }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useAgeGroup(): AgeGroup {
  const { ageGroup } = useTheme();
  return ageGroup;
}

export function useThemeConfig(): AgeTheme {
  const { theme } = useTheme();
  return theme;
}
