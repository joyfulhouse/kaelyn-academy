/**
 * Centralized Color System
 *
 * This file provides color values for JavaScript contexts (Three.js, Recharts, etc.)
 * that cannot use Tailwind CSS classes directly.
 *
 * These values should match the CSS custom properties defined in globals.css
 * and automatically adapt to dark mode via CSS custom properties where possible.
 */

// Semantic colors - use these for consistent theming
// Values match the light mode defaults; for dark mode, use CSS custom properties
export const colors = {
  // Primary palette
  primary: {
    DEFAULT: "#3b82f6", // blue-500
    light: "#60a5fa",   // blue-400
    dark: "#2563eb",    // blue-600
    muted: "#93c5fd",   // blue-300
  },

  // Status colors
  success: {
    DEFAULT: "#22c55e", // green-500
    light: "#4ade80",   // green-400
    dark: "#16a34a",    // green-600
    muted: "#86efac",   // green-300
  },

  warning: {
    DEFAULT: "#f59e0b", // amber-500
    light: "#fbbf24",   // amber-400
    dark: "#d97706",    // amber-600
    muted: "#fcd34d",   // amber-300
  },

  destructive: {
    DEFAULT: "#ef4444", // red-500
    light: "#f87171",   // red-400
    dark: "#dc2626",    // red-600
    muted: "#fca5a5",   // red-300
  },

  info: {
    DEFAULT: "#3b82f6", // blue-500
    light: "#60a5fa",   // blue-400
    dark: "#2563eb",    // blue-600
    muted: "#93c5fd",   // blue-300
  },

  // Accent colors for visualizations
  accent: {
    purple: "#8b5cf6",  // violet-500
    cyan: "#06b6d4",    // cyan-500
    pink: "#ec4899",    // pink-500
    indigo: "#6366f1",  // indigo-500
    teal: "#14b8a6",    // teal-500
    orange: "#f97316",  // orange-500
  },

  // Neutral colors
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
  },

  // Chart-specific palette (designed for accessibility)
  chart: {
    blue: "#3b82f6",
    green: "#22c55e",
    purple: "#8b5cf6",
    orange: "#f97316",
    pink: "#ec4899",
    cyan: "#06b6d4",
    // For grid lines and borders
    grid: "#e5e7eb",
    gridDark: "#374151",
  },

  // 3D visualization colors
  three: {
    // Axis colors (standard convention)
    axisX: "#ef4444", // Red for X
    axisY: "#22c55e", // Green for Y
    axisZ: "#3b82f6", // Blue for Z

    // Interactive states
    default: "#3b82f6",
    hover: "#60a5fa",
    selected: "#22c55e",
    disabled: "#d1d5db",

    // Educational elements
    positive: "#22c55e",
    negative: "#ef4444",
    neutral: "#6b7280",
    highlight: "#fbbf24",

    // Background/floor
    floor: "#888888",
    background: "#f8fafc",

    // Text on 3D elements
    text: "#1f2937",
    textMuted: "#6b7280",
  },

  // Avatar background colors (pastel palette for decorative use)
  avatar: {
    amber: "bg-warning/20",
    orange: "bg-warning/30",
    yellow: "bg-warning/10",
    green: "bg-success/20",
    blue: "bg-info/20",
    purple: "bg-primary/20",
    pink: "bg-destructive/10",
    gray: "bg-muted",
    slate: "bg-muted",
    indigo: "bg-info/30",
    red: "bg-destructive/20",
  },
} as const;

// Subject-specific gradients (Tailwind classes)
export const subjectGradients = {
  math: "from-primary to-info",
  reading: "from-success to-success/70",
  science: "from-accent-purple to-primary",
  history: "from-warning to-warning/70",
  technology: "from-info to-accent-cyan",
} as const;

// Role colors
export const roleColors = {
  admin: {
    bg: "bg-role-admin",
    text: "text-role-admin",
    hex: "#dc2626", // red-600
  },
  teacher: {
    bg: "bg-role-teacher",
    text: "text-role-teacher",
    hex: "#2563eb", // blue-600
  },
  parent: {
    bg: "bg-role-parent",
    text: "text-role-parent",
    hex: "#16a34a", // green-600
  },
  learner: {
    bg: "bg-role-learner",
    text: "text-role-learner",
    hex: "#9333ea", // purple-600
  },
} as const;

// Helper to get CSS custom property value
export function getCSSColor(varName: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// Type exports
export type SemanticColor = keyof typeof colors;
export type ChartColor = keyof typeof colors.chart;
export type ThreeColor = keyof typeof colors.three;
