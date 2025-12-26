"use client";

import { useState } from "react";
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
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NotificationType = "achievement" | "lesson" | "message" | "streak" | "reminder";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "New Badge Earned!",
    message: "You earned the 'Math Whiz' badge for completing 10 math lessons!",
    time: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    actionUrl: "/achievements",
  },
  {
    id: "2",
    type: "streak",
    title: "12 Day Streak!",
    message: "Amazing! You've been learning for 12 days in a row. Keep it up!",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: "3",
    type: "lesson",
    title: "New Lesson Available",
    message: "Check out the new lesson on Multiplication Tables in Math!",
    time: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
    actionUrl: "/subjects/math",
  },
  {
    id: "4",
    type: "message",
    title: "Message from Mrs. Smith",
    message: "Great job on your reading assignment! Keep up the excellent work.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: "5",
    type: "reminder",
    title: "Time for Your Daily Learning!",
    message: "You haven't completed a lesson today. Let's keep that streak going!",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true,
  },
  {
    id: "6",
    type: "achievement",
    title: "Level Up!",
    message: "You've reached Level 5 in Reading! New content is now unlocked.",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    read: true,
    actionUrl: "/subjects/reading",
  },
];

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "achievement":
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case "lesson":
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case "message":
      return <MessageCircle className="h-5 w-5 text-green-500" />;
    case "streak":
      return <Flame className="h-5 w-5 text-orange-500" />;
    case "reminder":
      return <Clock className="h-5 w-5 text-purple-500" />;
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<NotificationType | "all">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter(
    (n) => filter === "all" || n.type === filter
  );

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

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
            <Button variant="outline" onClick={markAllAsRead} className="gap-2">
              <Check className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href="/settings">
              <Settings className="h-4 w-4" />
            </a>
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
                      {notification.actionUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={notification.actionUrl}>View</a>
                        </Button>
                      )}
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
          <Button variant="ghost" onClick={clearAll} className="text-muted-foreground">
            Clear all notifications
          </Button>
        </div>
      )}
    </div>
  );
}
