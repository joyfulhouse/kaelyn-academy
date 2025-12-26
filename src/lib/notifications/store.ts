/**
 * Notification Store
 * In-memory store for real-time notifications with event subscription
 */

import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationEvent,
  NotificationListener,
  NotificationStats,
  NotificationGroup,
} from "./types";

/**
 * Generate a unique notification ID
 */
function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Notification Store class
 * Manages notification state and subscriptions
 */
class NotificationStore {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<NotificationListener> = new Set();
  private maxNotifications = 100;

  /**
   * Subscribe to notification events
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: NotificationEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Notification listener error:", error);
      }
    });
  }

  /**
   * Add a new notification
   */
  add(notification: Omit<Notification, "id" | "timestamp" | "read" | "dismissed">): Notification {
    const newNotification: Notification = {
      ...notification,
      id: generateNotificationId(),
      timestamp: new Date(),
      read: false,
      dismissed: false,
    };

    this.notifications.set(newNotification.id, newNotification);
    this.emit({ type: "added", notification: newNotification });

    // Prune old notifications if over limit
    this.pruneOldNotifications();

    return newNotification;
  }

  /**
   * Get a notification by ID
   */
  get(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return Array.from(this.notifications.values())
      .filter((n) => !n.dismissed)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get unread notifications
   */
  getUnread(): Notification[] {
    return this.getAll().filter((n) => !n.read);
  }

  /**
   * Get notifications by type
   */
  getByType(type: NotificationType): Notification[] {
    return this.getAll().filter((n) => n.type === type);
  }

  /**
   * Get notifications by priority
   */
  getByPriority(priority: NotificationPriority): Notification[] {
    return this.getAll().filter((n) => n.priority === priority);
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.get(id);
    if (notification && !notification.read) {
      notification.read = true;
      this.notifications.set(id, notification);
      this.emit({ type: "read", notificationId: id });
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      if (!notification.read) {
        notification.read = true;
      }
    });
    this.emit({ type: "read-all" });
  }

  /**
   * Dismiss a notification
   */
  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.dismissed = true;
      this.notifications.set(id, notification);
      this.emit({ type: "removed", notificationId: id });
    }
  }

  /**
   * Remove a notification completely
   */
  remove(id: string): void {
    if (this.notifications.has(id)) {
      this.notifications.delete(id);
      this.emit({ type: "removed", notificationId: id });
    }
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications.clear();
    this.emit({ type: "cleared" });
  }

  /**
   * Get notification statistics
   */
  getStats(): NotificationStats {
    const all = this.getAll();
    const stats: NotificationStats = {
      total: all.length,
      unread: all.filter((n) => !n.read).length,
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
    };

    all.forEach((n) => {
      stats.byType[n.type]++;
      stats.byPriority[n.priority]++;
    });

    return stats;
  }

  /**
   * Group notifications by groupId
   */
  getGrouped(): NotificationGroup[] {
    const groups = new Map<string, NotificationGroup>();
    const ungrouped: Notification[] = [];

    this.getAll().forEach((notification) => {
      if (notification.groupId) {
        const existing = groups.get(notification.groupId);
        if (existing) {
          existing.notifications.push(notification);
          existing.count++;
          if (notification.timestamp > existing.latestTimestamp) {
            existing.latestTimestamp = notification.timestamp;
          }
        } else {
          groups.set(notification.groupId, {
            id: notification.groupId,
            title: notification.title,
            count: 1,
            latestTimestamp: notification.timestamp,
            notifications: [notification],
          });
        }
      } else {
        ungrouped.push(notification);
      }
    });

    // Sort groups by latest timestamp
    const sortedGroups = Array.from(groups.values()).sort(
      (a, b) => b.latestTimestamp.getTime() - a.latestTimestamp.getTime()
    );

    // Add ungrouped notifications as individual groups
    ungrouped.forEach((n) => {
      sortedGroups.push({
        id: n.id,
        title: n.title,
        count: 1,
        latestTimestamp: n.timestamp,
        notifications: [n],
      });
    });

    return sortedGroups;
  }

  /**
   * Prune old notifications when over limit
   */
  private pruneOldNotifications(): void {
    if (this.notifications.size <= this.maxNotifications) return;

    const sorted = Array.from(this.notifications.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const toRemove = sorted.slice(0, sorted.length - this.maxNotifications);
    toRemove.forEach((n) => this.notifications.delete(n.id));
  }

  /**
   * Remove expired notifications
   */
  pruneExpired(): void {
    const now = new Date();
    this.notifications.forEach((notification) => {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.remove(notification.id);
      }
    });
  }
}

// Singleton instance
export const notificationStore = new NotificationStore();

/**
 * Helper functions for creating notifications
 */
export function createInfoNotification(
  title: string,
  message: string,
  options?: Partial<Notification>
): Notification {
  return notificationStore.add({
    type: "info",
    priority: "normal",
    title,
    message,
    ...options,
  });
}

export function createSuccessNotification(
  title: string,
  message: string,
  options?: Partial<Notification>
): Notification {
  return notificationStore.add({
    type: "success",
    priority: "normal",
    title,
    message,
    ...options,
  });
}

export function createWarningNotification(
  title: string,
  message: string,
  options?: Partial<Notification>
): Notification {
  return notificationStore.add({
    type: "warning",
    priority: "high",
    title,
    message,
    ...options,
  });
}

export function createErrorNotification(
  title: string,
  message: string,
  options?: Partial<Notification>
): Notification {
  return notificationStore.add({
    type: "error",
    priority: "high",
    title,
    message,
    ...options,
  });
}

export function createAchievementNotification(
  title: string,
  message: string,
  options?: Partial<Notification>
): Notification {
  return notificationStore.add({
    type: "achievement",
    priority: "normal",
    title,
    message,
    icon: "🏆",
    ...options,
  });
}

export function createReminderNotification(
  title: string,
  message: string,
  options?: Partial<Notification>
): Notification {
  return notificationStore.add({
    type: "reminder",
    priority: "normal",
    title,
    message,
    icon: "⏰",
    ...options,
  });
}
