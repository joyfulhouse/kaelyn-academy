"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { Volume2, VolumeX, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGradeUI } from "@/components/providers/grade-ui-provider";

/**
 * ReadAloud Component
 *
 * Provides text-to-speech functionality for K-2 learners using the Web Speech API.
 * Features:
 * - Automatic read-aloud when enabled in settings
 * - Visual play/pause controls
 * - Highlighting of currently spoken word (optional)
 * - Child-friendly voice selection
 * - Adjustable speech rate for young learners
 */

interface ReadAloudProps {
  /** Text content to be read aloud */
  text: string;
  /** Optional class name for the container */
  className?: string;
  /** Children to render (the visible text) */
  children?: ReactNode;
  /** Auto-play when component mounts (only if readAloud enabled) */
  autoPlay?: boolean;
  /** Show inline controls */
  showControls?: boolean;
  /** Size of the control buttons */
  controlSize?: "sm" | "default" | "lg";
  /** Custom label for accessibility */
  label?: string;
  /** Callback when speech starts */
  onStart?: () => void;
  /** Callback when speech ends */
  onEnd?: () => void;
}

export function ReadAloud({
  text,
  className,
  children,
  autoPlay = false,
  showControls = true,
  controlSize = "default",
  label,
  onStart,
  onEnd,
}: ReadAloudProps) {
  const { settings, isSpeaking, speak, stopSpeaking } = useGradeUI();
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Clean text for speech (remove markdown, special chars)
  const cleanText = useCallback((rawText: string): string => {
    return rawText
      .replace(/[#*_~`]/g, "") // Remove markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }, []);

  const handleSpeak = useCallback(() => {
    const cleanedText = cleanText(text);
    if (cleanedText) {
      speak(cleanedText);
      setLocalSpeaking(true);
      setIsPaused(false);
      onStart?.();
    }
  }, [text, cleanText, speak, onStart]);

  const handleStop = useCallback(() => {
    stopSpeaking();
    setLocalSpeaking(false);
    setIsPaused(false);
    onEnd?.();
  }, [stopSpeaking, onEnd]);

  const handlePause = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  const handleReplay = useCallback(() => {
    handleStop();
    setTimeout(() => handleSpeak(), 100);
  }, [handleStop, handleSpeak]);

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay && settings.readAloudEnabled && !isSpeaking) {
      handleSpeak();
    }
    // Cleanup on unmount
    return () => {
      if (localSpeaking) {
        stopSpeaking();
      }
    };
  }, [autoPlay, settings.readAloudEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync local state with global speaking state
  useEffect(() => {
    if (!isSpeaking && localSpeaking) {
      setLocalSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    }
  }, [isSpeaking, localSpeaking, onEnd]);

  // Don't render controls if read-aloud is disabled
  if (!settings.readAloudEnabled) {
    return <>{children}</>;
  }

  const buttonSizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-14 w-14", // Larger for K-2
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const effectiveSize = settings.largeButtons && controlSize === "default" ? "lg" : controlSize;

  return (
    <div className={cn("group relative", className)}>
      {/* Text content with optional hover effect */}
      <div
        className={cn(
          "transition-all duration-200",
          localSpeaking && "bg-primary/5 rounded-lg p-2 -m-2"
        )}
        role="region"
        aria-label={label ?? "Read aloud content"}
        aria-live="polite"
      >
        {children ?? text}
      </div>

      {/* Read-aloud controls */}
      {showControls && (
        <div
          className={cn(
            "flex items-center gap-2 mt-3",
            "transition-opacity duration-200"
          )}
          role="group"
          aria-label="Read aloud controls"
        >
          {/* Main play/stop button */}
          {!localSpeaking ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleSpeak}
              className={cn(
                buttonSizeClasses[effectiveSize],
                "rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
                settings.bouncyAnimations &&
                  "transition-transform hover:scale-110 active:scale-95"
              )}
              aria-label="Read text aloud"
            >
              <Volume2 className={iconSizeClasses[effectiveSize]} />
            </Button>
          ) : (
            <>
              {/* Pause/Resume button */}
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handlePause}
                className={cn(
                  buttonSizeClasses[effectiveSize],
                  "rounded-full bg-warning text-warning-foreground hover:bg-warning/90",
                  settings.bouncyAnimations &&
                    "transition-transform hover:scale-110 active:scale-95"
                )}
                aria-label={isPaused ? "Resume reading" : "Pause reading"}
              >
                {isPaused ? (
                  <Play className={iconSizeClasses[effectiveSize]} />
                ) : (
                  <Pause className={iconSizeClasses[effectiveSize]} />
                )}
              </Button>

              {/* Stop button */}
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleStop}
                className={cn(
                  buttonSizeClasses[effectiveSize],
                  "rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  settings.bouncyAnimations &&
                    "transition-transform hover:scale-110 active:scale-95"
                )}
                aria-label="Stop reading"
              >
                <VolumeX className={iconSizeClasses[effectiveSize]} />
              </Button>

              {/* Replay button */}
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleReplay}
                className={cn(
                  buttonSizeClasses[effectiveSize],
                  "rounded-full",
                  settings.bouncyAnimations &&
                    "transition-transform hover:scale-110 active:scale-95"
                )}
                aria-label="Replay from beginning"
              >
                <RotateCcw className={iconSizeClasses[effectiveSize]} />
              </Button>
            </>
          )}

          {/* Speaking indicator */}
          {localSpeaking && !isPaused && (
            <div className="flex items-center gap-1 ml-2" aria-hidden="true">
              <span className="animate-pulse text-sm text-primary font-medium">
                Reading...
              </span>
              <div className="flex gap-0.5">
                <div
                  className="w-1 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ReadAloudButton - Standalone button to trigger read-aloud for any text
 */
interface ReadAloudButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  children?: ReactNode;
}

export function ReadAloudButton({
  text,
  className,
  size = "default",
  variant = "default",
  children,
}: ReadAloudButtonProps) {
  const { settings, isSpeaking, speak, stopSpeaking } = useGradeUI();
  const [isThisSpeaking, setIsThisSpeaking] = useState(false);

  const handleClick = useCallback(() => {
    if (isThisSpeaking) {
      stopSpeaking();
      setIsThisSpeaking(false);
    } else {
      speak(text);
      setIsThisSpeaking(true);
    }
  }, [text, isThisSpeaking, speak, stopSpeaking]);

  // Reset local state when global speaking stops
  useEffect(() => {
    if (!isSpeaking && isThisSpeaking) {
      setIsThisSpeaking(false);
    }
  }, [isSpeaking, isThisSpeaking]);

  if (!settings.readAloudEnabled) {
    return null;
  }

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4",
    lg: "h-14 px-6 text-lg",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const effectiveSize = settings.largeButtons ? "lg" : size;

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleClick}
      className={cn(
        sizeClasses[effectiveSize],
        "gap-2 rounded-full",
        settings.bouncyAnimations &&
          "transition-transform hover:scale-105 active:scale-95",
        className
      )}
      aria-label={isThisSpeaking ? "Stop reading" : "Read aloud"}
    >
      {isThisSpeaking ? (
        <VolumeX className={iconSizes[effectiveSize]} />
      ) : (
        <Volume2 className={iconSizes[effectiveSize]} />
      )}
      {children ?? (isThisSpeaking ? "Stop" : "Read Aloud")}
    </Button>
  );
}

/**
 * ReadAloudToggle - Toggle button for read-aloud settings
 */
interface ReadAloudToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ReadAloudToggle({
  className,
  showLabel = true,
}: ReadAloudToggleProps) {
  const { settings, toggleReadAloud, isK2 } = useGradeUI();

  if (!isK2) {
    return null;
  }

  return (
    <Button
      type="button"
      variant={settings.readAloudEnabled ? "default" : "outline"}
      onClick={toggleReadAloud}
      className={cn(
        "gap-2 rounded-full",
        settings.largeButtons && "h-14 px-6 text-lg",
        settings.bouncyAnimations &&
          "transition-transform hover:scale-105 active:scale-95",
        className
      )}
      aria-pressed={settings.readAloudEnabled}
      aria-label={
        settings.readAloudEnabled
          ? "Disable read aloud feature"
          : "Enable read aloud feature"
      }
    >
      {settings.readAloudEnabled ? (
        <Volume2 className={settings.largeButtons ? "h-6 w-6" : "h-5 w-5"} />
      ) : (
        <VolumeX className={settings.largeButtons ? "h-6 w-6" : "h-5 w-5"} />
      )}
      {showLabel && (settings.readAloudEnabled ? "Read Aloud On" : "Read Aloud Off")}
    </Button>
  );
}
