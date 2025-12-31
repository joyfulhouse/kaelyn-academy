"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useTheme } from "./theme-provider";

/**
 * K-2 Grade UI Settings
 *
 * Provides age-adaptive UI features specifically designed for early elementary learners:
 * - Large touch targets (minimum 48px for accessibility, 64px+ for K-2)
 * - Read-aloud functionality using Web Speech API
 * - Simplified navigation with icons
 * - Bright, engaging color schemes
 * - Reduced cognitive load with simpler layouts
 */

export interface K2UISettings {
  /** Enable large buttons and touch targets (64px+ minimum) */
  largeButtons: boolean;
  /** Enable read-aloud functionality for text content */
  readAloudEnabled: boolean;
  /** Enable simplified navigation (fewer items, more icons) */
  simplifiedNav: boolean;
  /** Show icons alongside text in navigation */
  iconNavigation: boolean;
  /** Enable bouncy animations for engagement */
  bouncyAnimations: boolean;
  /** Show mascot helper */
  showMascot: boolean;
  /** Minimum touch target size in pixels */
  minTouchTarget: number;
  /** Base font size for readability */
  baseFontSize: number;
  /** Icon size for navigation and buttons */
  iconSize: number;
  /** Spacing multiplier for larger gaps */
  spacingMultiplier: number;
  /** Border radius for friendly rounded corners */
  borderRadius: string;
}

const K2_DEFAULTS: K2UISettings = {
  largeButtons: true,
  readAloudEnabled: true,
  simplifiedNav: true,
  iconNavigation: true,
  bouncyAnimations: true,
  showMascot: true,
  minTouchTarget: 64,
  baseFontSize: 18,
  iconSize: 28,
  spacingMultiplier: 1.5,
  borderRadius: "1.25rem",
};

const STANDARD_DEFAULTS: K2UISettings = {
  largeButtons: false,
  readAloudEnabled: false,
  simplifiedNav: false,
  iconNavigation: false,
  bouncyAnimations: false,
  showMascot: false,
  minTouchTarget: 44,
  baseFontSize: 16,
  iconSize: 20,
  spacingMultiplier: 1,
  borderRadius: "0.5rem",
};

interface GradeUIContextValue {
  /** Current UI settings based on grade level */
  settings: K2UISettings;
  /** Whether the learner is in K-2 grade range */
  isK2: boolean;
  /** Toggle read-aloud functionality */
  toggleReadAloud: () => void;
  /** Check if text is currently being spoken */
  isSpeaking: boolean;
  /** Speak text using Web Speech API */
  speak: (text: string) => void;
  /** Stop current speech */
  stopSpeaking: () => void;
  /** Update individual settings */
  updateSetting: <K extends keyof K2UISettings>(
    key: K,
    value: K2UISettings[K]
  ) => void;
}

const GradeUIContext = createContext<GradeUIContextValue | undefined>(undefined);

interface GradeUIProviderProps {
  children: ReactNode;
  /** Override default K2 settings */
  defaultSettings?: Partial<K2UISettings>;
}

export function GradeUIProvider({
  children,
  defaultSettings,
}: GradeUIProviderProps) {
  const { gradeLevel } = useTheme();
  const isK2 = gradeLevel <= 2;

  const [customSettings, setCustomSettings] = useState<Partial<K2UISettings>>(
    defaultSettings ?? {}
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Merge defaults with custom settings based on grade level
  const settings = useMemo<K2UISettings>(() => {
    const baseSettings = isK2 ? K2_DEFAULTS : STANDARD_DEFAULTS;
    return { ...baseSettings, ...customSettings };
  }, [isK2, customSettings]);

  const toggleReadAloud = useCallback(() => {
    setCustomSettings((prev) => ({
      ...prev,
      readAloudEnabled: !prev.readAloudEnabled,
    }));
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      console.warn("Web Speech API not supported in this browser");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure for young learners - slower, clearer speech
    utterance.rate = 0.85; // Slower pace for young learners
    utterance.pitch = 1.1; // Slightly higher pitch, more engaging
    utterance.volume = 1.0;

    // Try to find a friendly, clear voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.includes("Samantha") ||
          voice.name.includes("Karen") ||
          voice.name.includes("Victoria") ||
          voice.name.includes("Zira") ||
          voice.name.includes("Female"))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const updateSetting = useCallback(
    <K extends keyof K2UISettings>(key: K, value: K2UISettings[K]) => {
      setCustomSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const contextValue = useMemo<GradeUIContextValue>(
    () => ({
      settings,
      isK2,
      toggleReadAloud,
      isSpeaking,
      speak,
      stopSpeaking,
      updateSetting,
    }),
    [settings, isK2, toggleReadAloud, isSpeaking, speak, stopSpeaking, updateSetting]
  );

  return (
    <GradeUIContext.Provider value={contextValue}>
      {children}
    </GradeUIContext.Provider>
  );
}

/**
 * Hook to access grade-adaptive UI settings
 */
export function useGradeUI(): GradeUIContextValue {
  const context = useContext(GradeUIContext);
  if (context === undefined) {
    throw new Error("useGradeUI must be used within a GradeUIProvider");
  }
  return context;
}

/**
 * Hook to check if current learner is K-2
 */
export function useIsK2(): boolean {
  const { isK2 } = useGradeUI();
  return isK2;
}

/**
 * Hook to get K-2 UI settings
 */
export function useK2Settings(): K2UISettings {
  const { settings } = useGradeUI();
  return settings;
}
