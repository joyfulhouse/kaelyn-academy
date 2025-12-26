/**
 * Notifications Hook
 * React hook for managing real-time notifications
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Notification,
  NotificationType,
  NotificationStats,
  NotificationGroup,
} from "@/lib/notifications/types";
import {
  notificationStore,
  createInfoNotification,
  createSuccessNotification,
  createWarningNotification,
  createErrorNotification,
  createAchievementNotification,
  createReminderNotification,
} from "@/lib/notifications/store";

export interface UseNotificationsResult {
  notifications: Notification[];
  unread: Notification[];
  unreadCount: number;
  stats: NotificationStats;
  groups: NotificationGroup[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  clear: () => void;
  notify: {
    info: (title: string, message: string, options?: Partial<Notification>) => Notification;
    success: (title: string, message: string, options?: Partial<Notification>) => Notification;
    warning: (title: string, message: string, options?: Partial<Notification>) => Notification;
    error: (title: string, message: string, options?: Partial<Notification>) => Notification;
    achievement: (title: string, message: string, options?: Partial<Notification>) => Notification;
    reminder: (title: string, message: string, options?: Partial<Notification>) => Notification;
  };
  getByType: (type: NotificationType) => Notification[];
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
      achievement: 0,
      reminder: 0,
      message: 0,
      system: 0,
    },
    byPriority: {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0,
    },
  });

  // Refresh state from store
  const refreshState = useCallback(() => {
    setNotifications(notificationStore.getAll());
    setStats(notificationStore.getStats());
  }, []);

  // Subscribe to notification events
  useEffect(() => {
    // Initial load
    refreshState();

    // Subscribe to updates
    const unsubscribe = notificationStore.subscribe(() => {
      refreshState();
    });

    // Periodically prune expired notifications
    const pruneInterval = setInterval(() => {
      notificationStore.pruneExpired();
    }, 60000); // Every minute

    return () => {
      unsubscribe();
      clearInterval(pruneInterval);
    };
  }, [refreshState]);

  const unread = useMemo(() => notifications.filter((n) => !n.read), [notifications]);
  const unreadCount = unread.length;

  const groups = useMemo(() => notificationStore.getGrouped(), [notifications]);

  const markAsRead = useCallback((id: string) => {
    notificationStore.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationStore.markAllAsRead();
  }, []);

  const dismiss = useCallback((id: string) => {
    notificationStore.dismiss(id);
  }, []);

  const clear = useCallback(() => {
    notificationStore.clear();
  }, []);

  const getByType = useCallback((type: NotificationType) => {
    return notificationStore.getByType(type);
  }, []);

  const notify = useMemo(
    () => ({
      info: createInfoNotification,
      success: createSuccessNotification,
      warning: createWarningNotification,
      error: createErrorNotification,
      achievement: createAchievementNotification,
      reminder: createReminderNotification,
    }),
    []
  );

  return {
    notifications,
    unread,
    unreadCount,
    stats,
    groups,
    markAsRead,
    markAllAsRead,
    dismiss,
    clear,
    notify,
    getByType,
  };
}

/**
 * Hook for toast-style notifications that auto-dismiss
 */
export function useToast() {
  const { notify, dismiss } = useNotifications();

  const toast = useCallback(
    (
      type: "info" | "success" | "warning" | "error",
      title: string,
      message: string,
      duration = 5000
    ) => {
      const notification = notify[type](title, message);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(notification.id);
        }, duration);
      }

      return notification;
    },
    [notify, dismiss]
  );

  return {
    toast,
    info: (title: string, message: string, duration?: number) =>
      toast("info", title, message, duration),
    success: (title: string, message: string, duration?: number) =>
      toast("success", title, message, duration),
    warning: (title: string, message: string, duration?: number) =>
      toast("warning", title, message, duration),
    error: (title: string, message: string, duration?: number) =>
      toast("error", title, message, duration),
  };
}
