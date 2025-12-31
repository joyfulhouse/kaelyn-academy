"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

/**
 * Live Region Component
 * Announces dynamic content changes to screen readers
 * WCAG 2.1 Success Criterion 4.1.3: Status Messages
 */

type Politeness = "polite" | "assertive" | "off";

interface LiveRegionContextType {
  announce: (message: string, politeness?: Politeness) => void;
  announcePolite: (message: string) => void;
  announceAssertive: (message: string) => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null);

export function useLiveAnnouncer() {
  const context = useContext(LiveRegionContext);
  if (!context) {
    throw new Error("useLiveAnnouncer must be used within a LiveRegionProvider");
  }
  return context;
}

interface LiveRegionProviderProps {
  children: React.ReactNode;
}

export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [politeAnnouncement, setPoliteAnnouncement] = useState("");
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState("");

  const announce = useCallback((message: string, politeness: Politeness = "polite") => {
    if (politeness === "assertive") {
      setAssertiveAnnouncement("");
      // Small delay to ensure screen readers pick up the change
      setTimeout(() => setAssertiveAnnouncement(message), 50);
    } else if (politeness === "polite") {
      setPoliteAnnouncement("");
      setTimeout(() => setPoliteAnnouncement(message), 50);
    }
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, "polite");
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, "assertive");
  }, [announce]);

  // Clear announcements after they've been read
  useEffect(() => {
    if (politeAnnouncement) {
      const timer = setTimeout(() => setPoliteAnnouncement(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [politeAnnouncement]);

  useEffect(() => {
    if (assertiveAnnouncement) {
      const timer = setTimeout(() => setAssertiveAnnouncement(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [assertiveAnnouncement]);

  return (
    <LiveRegionContext.Provider value={{ announce, announcePolite, announceAssertive }}>
      {children}
      {/* Polite live region - used for non-urgent updates */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeAnnouncement}
      </div>
      {/* Assertive live region - used for urgent updates */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveAnnouncement}
      </div>
    </LiveRegionContext.Provider>
  );
}

/**
 * Standalone live region for simple use cases
 */
interface LiveRegionProps {
  message: string;
  politeness?: Politeness;
  clearAfter?: number;
}

export function LiveRegion({
  message,
  politeness = "polite",
  clearAfter = 1000,
}: LiveRegionProps) {
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    setDisplayMessage(message);
    if (message && clearAfter > 0) {
      const timer = setTimeout(() => setDisplayMessage(""), clearAfter);
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {displayMessage}
    </div>
  );
}
