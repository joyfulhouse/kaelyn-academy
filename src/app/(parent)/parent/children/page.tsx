"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  UserPlus,
  Settings,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  Loader2,
  Trash2,
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
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvatarById } from "@/components/ui/avatar-picker";

interface Child {
  id: string;
  name: string;
  gradeLevel: number;
  avatarUrl: string | null;
  lastActiveAt: string | null;
  createdAt: string;
  preferences: {
    avatarId?: string;
  } | null;
  parentalControls: {
    screenTimeLimit?: number;
    allowedSubjects?: string[];
    contentFiltering?: string;
  } | null;
  slug: string;
}

interface ChildProgress {
  overall: number;
  streak: number;
  totalLessons: number;
  achievements: number;
  subjects: Array<{
    name: string;
    progress: number;
    mastery: number;
  }>;
}

// Helper to generate unique slug from child name
function generateChildSlug(name: string, allNames: string[]): string {
  const parts = name.toLowerCase().split(" ");
  const firstName = parts[0];
  const middleInitial = parts.length > 2 ? parts[1][0] : null;

  // Check if there are other children with the same first name
  const sameFirstName = allNames.filter(n =>
    n.toLowerCase().startsWith(firstName + " ") && n !== name
  );

  if (sameFirstName.length > 0 && middleInitial) {
    return `${firstName}-${middleInitial}`;
  }

  return firstName;
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function ChildrenSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-60 mt-2" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-96 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ChildrenPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [childProgress, setChildProgress] = useState<Record<string, ChildProgress>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchChildren = useCallback(async () => {
    try {
      const response = await fetch("/api/parent/children");
      if (response.ok) {
        const data = await response.json();
        const childrenData = data.children || [];

        // Generate slugs for all children
        const allNames = childrenData.map((c: Child) => c.name);
        const childrenWithSlugs = childrenData.map((child: Child) => ({
          ...child,
          slug: generateChildSlug(child.name, allNames),
        }));

        setChildren(childrenWithSlugs);

        // Fetch progress for each child
        for (const child of childrenWithSlugs) {
          try {
            const progressRes = await fetch(`/api/progress?learnerId=${child.id}`);
            if (progressRes.ok) {
              const progressData = await progressRes.json();
              const summary = progressData.summary || {};

              // Calculate overall progress
              const subjects = summary.subjects || [];
              const overallProgress = subjects.length > 0
                ? Math.round(subjects.reduce((acc: number, s: { masteryLevel?: number }) =>
                    acc + (s.masteryLevel || 0), 0) / subjects.length)
                : 0;

              const totalLessons = subjects.reduce((acc: number, s: { completedLessons?: number }) =>
                acc + (s.completedLessons || 0), 0);

              setChildProgress(prev => ({
                ...prev,
                [child.id]: {
                  overall: overallProgress,
                  streak: summary.currentStreak || 0,
                  totalLessons,
                  achievements: summary.achievementCount || 0,
                  subjects: subjects.map((s: { subjectName: string; masteryLevel?: number; completedLessons?: number; totalLessons?: number }) => ({
                    name: s.subjectName,
                    progress: s.totalLessons && s.totalLessons > 0
                      ? Math.round(((s.completedLessons || 0) / s.totalLessons) * 100)
                      : 0,
                    mastery: s.masteryLevel || 0,
                  })),
                },
              }));
            }
          } catch (err) {
            console.error(`Failed to fetch progress for child ${child.id}:`, err);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleDeleteChild = async () => {
    if (!childToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/parent/children/${childToDelete.slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setChildren(children.filter(c => c.id !== childToDelete.id));
        setDeleteDialogOpen(false);
        setChildToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete child:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <ChildrenSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Children</h1>
          <p className="text-muted-foreground mt-1">
            Manage your children's accounts and monitor their progress
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/parent/children/add">
            <UserPlus className="h-4 w-4" />
            Add Child
          </Link>
        </Button>
      </div>

      {/* Children Cards */}
      {children.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {children.map((child) => {
            const progress = childProgress[child.id] || {
              overall: 0,
              streak: 0,
              totalLessons: 0,
              achievements: 0,
              subjects: [],
            };
            const avatarData = child.preferences?.avatarId
              ? getAvatarById(child.preferences.avatarId)
              : null;

            return (
              <Card key={child.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        {avatarData ? (
                          <AvatarFallback className={`text-3xl ${avatarData.color}`}>
                            {avatarData.emoji}
                          </AvatarFallback>
                        ) : child.avatarUrl ? (
                          <AvatarImage src={child.avatarUrl} />
                        ) : (
                          <AvatarFallback className="text-xl bg-primary/10 text-primary">
                            {child.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{child.name}</CardTitle>
                        <CardDescription>
                          Grade {child.gradeLevel === 0 ? "K" : child.gradeLevel}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Active {formatTimeAgo(child.lastActiveAt)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/parent/children/${child.slug}`}>
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/parent/children/${child.slug}/controls`}>
                            <Shield className="h-4 w-4 mr-2" />
                            Parental Controls
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/parent/children/${child.slug}/settings`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Account Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setChildToDelete(child);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Child
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {progress.overall}%
                      </div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {progress.streak}
                      </div>
                      <div className="text-xs text-muted-foreground">Day Streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {progress.totalLessons}
                      </div>
                      <div className="text-xs text-muted-foreground">Lessons</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {progress.achievements}
                      </div>
                      <div className="text-xs text-muted-foreground">Badges</div>
                    </div>
                  </div>

                  {/* Subject Progress */}
                  {progress.subjects.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Subject Progress</h4>
                      {progress.subjects.slice(0, 4).map((subject) => (
                        <div key={subject.name}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{subject.name}</span>
                            <span className="text-muted-foreground">
                              {subject.mastery}% mastery
                            </span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Controls Summary */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        Daily limit: {child.parentalControls?.screenTimeLimit || 60} min
                      </span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {child.parentalControls?.contentFiltering || "moderate"} filtering
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/parent/children/${child.slug}`}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        View Progress
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/parent/children/${child.slug}/controls`}>
                        <Shield className="h-4 w-4 mr-2" />
                        Controls
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Add Child CTA */}
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-1">
            {children.length === 0 ? "Add Your First Child" : "Add Another Child"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a learner account for {children.length === 0 ? "your" : "another"} child
          </p>
          <Button asChild>
            <Link href="/parent/children/add">Add Child</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Child Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {childToDelete?.name}'s account? This action cannot
              be undone and all their progress data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChild}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
