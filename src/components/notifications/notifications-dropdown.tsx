"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Award,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Flame,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "achievement" | "lesson" | "message" | "streak" | "reminder";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  data?: Record<string, unknown>;
}

// Sample notifications - in production, these would come from the database
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "New Badge Earned!",
    message: "You earned the 'First Steps' badge for completing your first lesson.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    link: "/achievements",
  },
  {
    id: "2",
    type: "streak",
    title: "Keep Your Streak!",
    message: "You're on a 3-day learning streak! Don't break it - learn something today.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    link: "/subjects",
  },
  {
    id: "3",
    type: "lesson",
    title: "New Lesson Available",
    message: "A new lesson 'Introduction to Fractions' is ready for you!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    link: "/subjects/math",
  },
  {
    id: "4",
    type: "message",
    title: "Message from Teacher",
    message: "Great work on your last assignment! Keep it up.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
  },
];

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  achievement: Award,
  lesson: BookOpen,
  message: MessageSquare,
  streak: Flame,
  reminder: Star,
};

const notificationColors: Record<string, string> = {
  achievement: "text-amber-500 bg-amber-500/10",
  lesson: "text-blue-500 bg-blue-500/10",
  message: "text-green-500 bg-green-500/10",
  streak: "text-orange-500 bg-orange-500/10",
  reminder: "text-purple-500 bg-purple-500/10",
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => {
              const IconComponent = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || "text-gray-500 bg-gray-500/10";

              const content = (
                <div
                  className={`flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer relative group ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div
                    className={`p-2 rounded-full shrink-0 ${colorClass}`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(notification.timestamp)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-2 top-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );

              return notification.link ? (
                <Link
                  key={notification.id}
                  href={notification.link}
                  onClick={() => {
                    markAsRead(notification.id);
                    setOpen(false);
                  }}
                >
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })}
          </ScrollArea>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link
            href="/notifications"
            className="w-full text-center text-sm text-primary"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationsDropdown;
