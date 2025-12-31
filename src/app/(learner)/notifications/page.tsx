"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Trophy,
  BookOpen,
  MessageCircle,
  Flame,
  Clock,
  Check,
  Trash2,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type NotificationType = "achievement" | "lesson" | "message" | "streak" | "reminder" | "assignment_due" | "progress_report" | "system" | "announcement";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string | null;
  metadata?: {
    achievementId?: string;
    assignmentId?: string;
    learnerId?: string;
    icon?: string;
  };
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "achievement":
      return <Trophy className="h-5 w-5 text-warning" />;
    case "lesson":
      return <BookOpen className="h-5 w-5 text-info" />;
    case "message":
      return <MessageCircle className="h-5 w-5 text-success" />;
    case "streak":
      return <Flame className="h-5 w-5 text-warning" />;
    case "reminder":
    case "assignment_due":
      return <Clock className="h-5 w-5 text-primary" />;
    case "progress_report":
      return <AlertCircle className="h-5 w-5 text-info" />;
    case "system":
    case "announcement":
      return <Bell className="h-5 w-5 text-primary" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-60 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(
    (n) => filter === "all" || n.type === filter
  );

  const markAllAsRead = async () => {
    setActionLoading("markAll");
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (response.ok) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const markAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      if (response.ok) {
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNotification = async (id: string) => {
    setActionLoading(`delete-${id}`);
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      if (response.ok) {
        const notification = notifications.find((n) => n.id === id);
        setNotifications(notifications.filter((n) => n.id !== id));
        if (notification && !notification.read) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const clearAll = async () => {
    setActionLoading("clearAll");
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true }),
      });
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Stay updated on your learning progress
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="gap-2"
              disabled={actionLoading === "markAll"}
            >
              {actionLoading === "markAll" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Mark All Read
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as NotificationType | "all")}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="achievement" className="gap-1">
            <Trophy className="h-3 w-3" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="lesson" className="gap-1">
            <BookOpen className="h-3 w-3" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="message" className="gap-1">
            <MessageCircle className="h-3 w-3" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="streak" className="gap-1">
            <Flame className="h-3 w-3" />
            Streaks
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              {filter === "all"
                ? "You're all caught up!"
                : `No ${filter} notifications`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.read ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-medium ${!notification.read ? "text-primary" : ""}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(notification.time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {notification.link && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={notification.link}>View</Link>
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          disabled={actionLoading === notification.id}
                        >
                          {actionLoading === notification.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Mark as read"
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                        disabled={actionLoading === `delete-${notification.id}`}
                      >
                        {actionLoading === `delete-${notification.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Clear All */}
      {notifications.length > 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={clearAll}
            className="text-muted-foreground"
            disabled={actionLoading === "clearAll"}
          >
            {actionLoading === "clearAll" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Clearing...
              </>
            ) : (
              "Clear all notifications"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
