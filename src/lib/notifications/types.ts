/**
 * Notification Types
 * Defines types for real-time notifications
 */

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "achievement"
  | "reminder"
  | "message"
  | "system";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type NotificationChannel = "in-app" | "email" | "push" | "sms";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  groupId?: string;
}

export interface NotificationPreferences {
  channels: NotificationChannel[];
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
  };
  byType: Partial<Record<NotificationType, NotificationChannelPreference>>;
}

export interface NotificationChannelPreference {
  enabled: boolean;
  channels: NotificationChannel[];
}

export interface NotificationGroup {
  id: string;
  title: string;
  count: number;
  latestTimestamp: Date;
  notifications: Notification[];
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Event types for notification subscriptions
export type NotificationEvent =
  | { type: "added"; notification: Notification }
  | { type: "updated"; notification: Notification }
  | { type: "removed"; notificationId: string }
  | { type: "read"; notificationId: string }
  | { type: "read-all" }
  | { type: "cleared" };

export type NotificationListener = (event: NotificationEvent) => void;
