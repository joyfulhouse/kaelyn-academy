/**
 * Notification Bell Component
 * Displays notification count and dropdown menu
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, X, ExternalLink } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification, NotificationType } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

const typeStyles: Record<NotificationType, { bg: string; icon: string }> = {
  info: { bg: "bg-blue-100 text-blue-800", icon: "ℹ️" },
  success: { bg: "bg-green-100 text-green-800", icon: "✓" },
  warning: { bg: "bg-yellow-100 text-yellow-800", icon: "⚠️" },
  error: { bg: "bg-red-100 text-red-800", icon: "✕" },
  achievement: { bg: "bg-purple-100 text-purple-800", icon: "🏆" },
  reminder: { bg: "bg-orange-100 text-orange-800", icon: "⏰" },
  message: { bg: "bg-gray-100 text-gray-800", icon: "💬" },
  system: { bg: "bg-gray-100 text-gray-800", icon: "⚙️" },
};

function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const style = typeStyles[notification.type];
  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <div
      className={cn(
        "p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors",
        !notification.read && "bg-blue-50/50"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm",
            style.bg
          )}
        >
          {notification.icon || style.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo}</span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
          {notification.actionUrl && (
            <a
              href={notification.actionUrl}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              {notification.actionLabel || "View"} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {!notification.read && (
            <button
              onClick={() => onRead(notification.id)}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDismiss(notification.id)}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell({ className }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } = useNotifications();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-full hover:bg-gray-100 transition-colors",
          isOpen && "bg-gray-100"
        )}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 max-h-96 bg-white rounded-lg shadow-lg border overflow-hidden z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onDismiss={dismiss}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50 text-center">
              <a href="/notifications" className="text-xs text-primary hover:underline">
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
