"use client";

import { Search, Flame, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/components/providers/theme-provider";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";

interface LearnerHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  currentStreak: number;
  totalStars: number;
}

export function LearnerHeader({ user, currentStreak, totalStars }: LearnerHeaderProps) {
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search lessons, subjects..."
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Gamification Stats - visible on larger screens */}
        <TooltipProvider>
          <div className="hidden md:flex items-center gap-3">
            {/* Streak Counter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/50 text-accent-foreground">
                  <Flame className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">{currentStreak}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentStreak}-day learning streak!</p>
              </TooltipContent>
            </Tooltip>

            {/* Stars/Points */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/50 text-accent-foreground">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="text-sm font-medium">{totalStars.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total stars earned</p>
              </TooltipContent>
            </Tooltip>
          </div>

        </TooltipProvider>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Welcome message on larger screens */}
        <div className="hidden lg:flex flex-col items-end ml-2">
          <span className="text-sm font-medium text-foreground">
            Welcome, {user.name?.split(" ")[0] || "Learner"}
          </span>
          <span className="text-xs text-muted-foreground">
            Level 5 Explorer
          </span>
        </div>
      </div>
    </header>
  );
}
