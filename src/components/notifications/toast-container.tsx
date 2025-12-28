/**
 * Toast Container Component
 * Displays toast notifications in a corner of the screen
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Notification, NotificationType } from "@/lib/notifications/types";
import { notificationStore } from "@/lib/notifications/store";
import { cn } from "@/lib/utils";

interface ToastContainerProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  maxToasts?: number;
  autoHideDuration?: number;
}

const positionStyles = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
};

const typeStyles: Record<
  NotificationType,
  { bg: string; border: string; icon: React.ReactNode }
> = {
  info: {
    bg: "bg-info/10",
    border: "border-info/30",
    icon: <Info className="w-5 h-5 text-info" />,
  },
  success: {
    bg: "bg-success/10",
    border: "border-success/30",
    icon: <CheckCircle className="w-5 h-5 text-success" />,
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: <AlertTriangle className="w-5 h-5 text-warning" />,
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    icon: <AlertCircle className="w-5 h-5 text-destructive" />,
  },
  achievement: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    icon: <span className="text-xl">🏆</span>,
  },
  reminder: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: <span className="text-xl">⏰</span>,
  },
  message: {
    bg: "bg-muted",
    border: "border-border",
    icon: <span className="text-xl">💬</span>,
  },
  system: {
    bg: "bg-muted",
    border: "border-border",
    icon: <span className="text-xl">⚙️</span>,
  },
};

interface ToastItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

function ToastItem({ notification, onDismiss }: ToastItemProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const style = typeStyles[notification.type];

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(notification.id), 200);
  }, [notification.id, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-md",
        "transform transition-all duration-200",
        style.bg,
        style.border,
        isLeaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">{style.icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 hover:bg-muted rounded-full transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

export function ToastContainer({
  position = "top-right",
  maxToasts = 5,
  autoHideDuration = 5000,
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to new notifications
    const unsubscribe = notificationStore.subscribe((event) => {
      if (event.type === "added") {
        setToasts((prev) => {
          const newToasts = [event.notification, ...prev].slice(0, maxToasts);
          return newToasts;
        });

        // Auto-dismiss after duration
        if (autoHideDuration > 0) {
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== event.notification.id));
          }, autoHideDuration);
        }
      }
    });

    return unsubscribe;
  }, [maxToasts, autoHideDuration]);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    notificationStore.dismiss(id);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col gap-2",
        positionStyles[position]
      )}
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} notification={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

export default ToastContainer;
