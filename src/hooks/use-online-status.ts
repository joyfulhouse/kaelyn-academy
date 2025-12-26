"use client";

import { useState, useEffect, useCallback } from "react";

interface OnlineStatusOptions {
  /** Callback when going online */
  onOnline?: () => void;
  /** Callback when going offline */
  onOffline?: () => void;
}

/**
 * Hook to track online/offline status
 * Returns true when online, false when offline
 */
export function useOnlineStatus(options: OnlineStatusOptions = {}): boolean {
  const { onOnline, onOffline } = options;

  // Default to true for SSR safety
  const [isOnline, setIsOnline] = useState(true);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    onOnline?.();
  }, [onOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    onOffline?.();
  }, [onOffline]);

  useEffect(() => {
    // Set initial value from navigator
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return isOnline;
}

/**
 * Hook to sync data when coming back online
 */
interface UseSyncOnReconnectOptions {
  /** The sync function to call when coming back online */
  syncFn: () => Promise<void>;
  /** Whether auto-sync is enabled */
  enabled?: boolean;
}

export function useSyncOnReconnect({ syncFn, enabled = true }: UseSyncOnReconnectOptions) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const sync = useCallback(async () => {
    if (!enabled) return;

    setIsSyncing(true);
    setError(null);

    try {
      await syncFn();
      setLastSynced(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Sync failed"));
    } finally {
      setIsSyncing(false);
    }
  }, [syncFn, enabled]);

  useOnlineStatus({
    onOnline: sync,
  });

  return {
    isSyncing,
    lastSynced,
    error,
    sync,
  };
}
