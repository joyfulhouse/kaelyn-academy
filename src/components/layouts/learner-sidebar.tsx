"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Sparkles,
  Target,
  Settings,
  HelpCircle,
  ChevronUp,
  LogOut,
  Home,
} from "lucide-react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

interface LearnerSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  gradeLevel?: number;
}

// Navigation items with K-2 specific properties
const mainNavItems = [
  {
    title: "Dashboard",
    k2Title: "Home", // Simplified label for K-2
    url: "/dashboard",
    icon: LayoutDashboard,
    k2Icon: Home,
    k2Color: "text-blue-500",
    k2Bg: "bg-blue-100",
    simplified: true, // Show in simplified K-2 nav
  },
  {
    title: "Subjects",
    k2Title: "Learn",
    url: "/subjects",
    icon: BookOpen,
    k2Color: "text-green-500",
    k2Bg: "bg-green-100",
    simplified: true,
  },
  {
    title: "Achievements",
    k2Title: "Stars",
    url: "/achievements",
    icon: Trophy,
    k2Color: "text-yellow-500",
    k2Bg: "bg-yellow-100",
    simplified: true,
  },
  {
    title: "AI Tutor",
    k2Title: "Helper",
    url: "/tutor",
    icon: Sparkles,
    k2Color: "text-purple-500",
    k2Bg: "bg-purple-100",
    simplified: true,
  },
  {
    title: "Practice",
    k2Title: "Practice",
    url: "/practice",
    icon: Target,
    k2Color: "text-pink-500",
    k2Bg: "bg-pink-100",
    simplified: false, // Hidden in simplified K-2 nav
  },
];

const secondaryNavItems = [
  {
    title: "Settings",
    k2Title: "Settings",
    url: "/settings",
    icon: Settings,
    k2Color: "text-gray-500",
    k2Bg: "bg-gray-100",
    simplified: false,
  },
  {
    title: "Help",
    k2Title: "Help",
    url: "/help",
    icon: HelpCircle,
    k2Color: "text-cyan-500",
    k2Bg: "bg-cyan-100",
    simplified: false,
  },
];

export function LearnerSidebar({ user, gradeLevel = 5 }: LearnerSidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isK2 = gradeLevel <= 2;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  // Filter items for K-2 simplified navigation
  const filteredMainItems = isK2
    ? mainNavItems.filter((item) => item.simplified)
    : mainNavItems;
  const filteredSecondaryItems = isK2
    ? secondaryNavItems.filter((item) => item.simplified)
    : secondaryNavItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className={cn("p-4", isK2 && "p-5")}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/icons/icon.svg"
            alt="Kaelyn's Academy"
            width={isK2 ? 48 : 40}
            height={isK2 ? 48 : 40}
            className="rounded-xl shadow-sm"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className={cn(
              "font-semibold text-foreground",
              isK2 ? "text-lg" : "text-base"
            )}>
              Kaelyn&apos;s Academy
            </span>
            <span className={cn(
              "text-muted-foreground",
              isK2 ? "text-sm" : "text-xs"
            )}>
              {theme.name}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isK2 ? "text-base font-bold" : ""}>
            {isK2 ? "My Learning" : "Learning"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                const Icon = ("k2Icon" in item && item.k2Icon && isK2) ? item.k2Icon : item.icon;
                const label = isK2 ? item.k2Title : item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                      className={cn(
                        isK2 && [
                          "h-14 px-4 rounded-xl text-base font-semibold",
                          "transition-all duration-200",
                          "hover:scale-105",
                          isActive && item.k2Bg,
                        ]
                      )}
                    >
                      <Link href={item.url}>
                        <div className={cn(
                          "flex items-center justify-center",
                          isK2 && [
                            "w-10 h-10 rounded-lg",
                            isActive ? item.k2Bg : "bg-muted",
                          ]
                        )}>
                          <Icon className={cn(
                            isK2 ? "h-6 w-6" : "h-4 w-4",
                            isK2 && isActive && item.k2Color
                          )} />
                        </div>
                        <span className={cn(
                          isK2 && isActive && item.k2Color
                        )}>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredSecondaryItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={isK2 ? "text-base font-bold" : ""}>
              Support
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSecondaryItems.map((item) => {
                  const isActive = pathname === item.url;
                  const label = isK2 ? item.k2Title : item.title;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={label}
                        className={cn(
                          isK2 && [
                            "h-14 px-4 rounded-xl text-base font-semibold",
                            "transition-all duration-200",
                            "hover:scale-105",
                            isActive && item.k2Bg,
                          ]
                        )}
                      >
                        <Link href={item.url}>
                          <div className={cn(
                            "flex items-center justify-center",
                            isK2 && [
                              "w-10 h-10 rounded-lg",
                              isActive ? item.k2Bg : "bg-muted",
                            ]
                          )}>
                            <item.icon className={cn(
                              isK2 ? "h-6 w-6" : "h-4 w-4",
                              isK2 && isActive && item.k2Color
                            )} />
                          </div>
                          <span className={cn(
                            isK2 && isActive && item.k2Color
                          )}>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side="top"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/logout" className="flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
