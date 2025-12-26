"use client";

import { Bell, Search, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/theme-provider";

interface LearnerHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function LearnerHeader({ user }: LearnerHeaderProps) {
  const { theme } = useTheme();

  // Mock streak data - would come from API
  const currentStreak = 5;
  const totalStars = 1250;

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
                  <Flame className="h-4 w-4 text-orange-500" />
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
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{totalStars.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total stars earned</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>3 new notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
