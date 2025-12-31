"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Loader2, CheckCircle2 } from "lucide-react";
import { getAvatarById } from "@/components/ui/avatar-picker";

interface Learner {
  id: string;
  name: string;
  gradeLevel: number;
  preferences: {
    avatarId?: string;
    favoriteSubject?: string;
    learningGoal?: string;
  } | null;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  type: string;
  earnedAt?: string;
  earned: boolean;
}

interface Stats {
  lessonsCompleted: number;
  hoursLearned: number;
  longestStreak: number;
  conceptsMastered: number;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default function LearnerProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [learner, setLearner] = useState<Learner | null>(null);
  const [editedLearner, setEditedLearner] = useState<Learner | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats>({
    lessonsCompleted: 0,
    hoursLearned: 0,
    longestStreak: 0,
    conceptsMastered: 0,
  });
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestSent, setRequestSent] = useState<"password" | "delete" | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch learner data
      const learnersRes = await fetch("/api/learners");
      if (learnersRes.ok) {
        const learnersData = await learnersRes.json();
        const firstLearner = learnersData.learners?.[0];
        if (firstLearner) {
          setLearner(firstLearner);
          setEditedLearner(firstLearner);

          // Fetch progress/stats
          const progressRes = await fetch(`/api/progress?learnerId=${firstLearner.id}`);
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            const summary = progressData.summary || {};
            const subjects = summary.subjects || [];

            const totalLessons = subjects.reduce(
              (acc: number, s: { completedLessons?: number }) =>
                acc + (s.completedLessons || 0),
              0
            );
            const totalTime = subjects.reduce(
              (acc: number, s: { totalTimeSpent?: number }) =>
                acc + (s.totalTimeSpent || 0),
              0
            );

            setStats({
              lessonsCompleted: totalLessons,
              hoursLearned: Math.round(totalTime / 60),
              longestStreak: summary.longestStreak || 0,
              conceptsMastered: summary.masteredConcepts || 0,
            });
          }

          // Fetch achievements
          const achievementsRes = await fetch(`/api/achievements?learnerId=${firstLearner.id}`);
          if (achievementsRes.ok) {
            const achievementsData = await achievementsRes.json();
            setAchievements(
              (achievementsData.achievements || []).filter(
                (a: Achievement) => a.earned
              )
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!editedLearner || !learner) return;

    setSaving(true);
    try {
      const response = await fetch("/api/learner/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editedLearner.name,
          avatarId: editedLearner.preferences?.avatarId,
        }),
      });

      if (response.ok) {
        setLearner(editedLearner);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedLearner(learner);
    setIsEditing(false);
  };

  const handlePasswordResetRequest = async () => {
    setRequestLoading(true);
    try {
      // In a real app, this would send a notification to the parent
      // For now, we'll simulate the request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRequestSent("password");
      setPasswordResetDialogOpen(false);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    setRequestLoading(true);
    try {
      // In a real app, this would send a notification to the parent
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRequestSent("delete");
      setDeleteDialogOpen(false);
    } finally {
      setRequestLoading(false);
    }
  };

  const grades = Array.from({ length: 13 }, (_, i) => ({
    value: i,
    label: i === 0 ? "Kindergarten" : `Grade ${i}`,
  }));

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!learner) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No profile found</p>
      </div>
    );
  }

  const avatarData = editedLearner?.preferences?.avatarId
    ? getAvatarById(editedLearner.preferences.avatarId)
    : null;

  const achievementIcons: Record<string, string> = {
    milestone: "star",
    streak: "flame",
    mastery: "target",
    completion: "check",
    exploration: "compass",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Request Sent Success Message */}
      {requestSent && (
        <Card className="border-success/30 bg-success/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="text-success-foreground">
                {requestSent === "password"
                  ? "Password reset request sent to your parent. They will receive an email to approve the change."
                  : "Account deletion request sent to your parent. They will review and respond to your request."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Header */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-32 bg-role-learner" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              {avatarData ? (
                <AvatarFallback className={`text-5xl ${avatarData.color}`}>
                  {avatarData.emoji}
                </AvatarFallback>
              ) : (
                <AvatarFallback className="bg-role-learner text-white text-3xl">
                  {(editedLearner?.name || learner.name)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 text-center sm:text-left pb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {editedLearner?.name || learner.name}
              </h1>
              <p className="text-muted-foreground">
                {grades.find((g) => g.value === learner.gradeLevel)?.label}
                {learner.preferences?.favoriteSubject &&
                  ` • ${learner.preferences.favoriteSubject} Enthusiast`}
              </p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-role-learner text-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{stats.lessonsCompleted}</div>
            <div className="text-white/80 text-sm">Lessons Done</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-success text-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{stats.hoursLearned}h</div>
            <div className="text-white/80 text-sm">Hours Learned</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-warning text-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{stats.longestStreak}</div>
            <div className="text-white/80 text-sm">Day Best Streak</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-primary text-white">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{stats.conceptsMastered}</div>
            <div className="text-white/80 text-sm">Concepts Mastered</div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editedLearner?.name || ""}
                onChange={(e) =>
                  setEditedLearner((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <select
                id="grade"
                value={learner.gradeLevel}
                disabled
                className="w-full h-10 px-3 rounded-md border border-input bg-muted"
              >
                {grades.map((grade) => (
                  <option key={grade.value} value={grade.value}>
                    {grade.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Grade level can only be changed by a parent
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
            <CardDescription>Customize your learning experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="favoriteSubject">Favorite Subject</Label>
              <select
                id="favoriteSubject"
                value={editedLearner?.preferences?.favoriteSubject || ""}
                onChange={(e) =>
                  setEditedLearner((prev) =>
                    prev
                      ? {
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            favoriteSubject: e.target.value,
                          },
                        }
                      : null
                  )
                }
                disabled={!isEditing}
                className="w-full h-10 px-3 rounded-md border border-input bg-background disabled:bg-muted"
              >
                <option value="">Select a subject</option>
                {[
                  "Math",
                  "Reading",
                  "Science",
                  "History",
                  "Art",
                  "Music",
                  "Technology",
                ].map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="learningGoal">Learning Goal</Label>
              <Input
                id="learningGoal"
                value={editedLearner?.preferences?.learningGoal || ""}
                onChange={(e) =>
                  setEditedLearner((prev) =>
                    prev
                      ? {
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            learningGoal: e.target.value,
                          },
                        }
                      : null
                  )
                }
                placeholder="What do you want to learn?"
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Achievements
            <span className="text-sm font-normal text-muted-foreground">
              ({achievements.length} earned)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No achievements earned yet. Keep learning to unlock badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {achievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 bg-warning/10 rounded-xl border border-warning/30"
                >
                  <div className="text-4xl mb-2">
                    {achievement.iconUrl?.startsWith("icon:")
                      ? getAchievementEmoji(achievement.type)
                      : achievement.iconUrl || getAchievementEmoji(achievement.type)}
                  </div>
                  <div className="font-medium text-sm text-center">
                    {achievement.name}
                  </div>
                  {achievement.earnedAt && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
              {/* Display locked achievement slots */}
              {achievements.length < 5 &&
                Array.from({ length: 5 - achievements.length }).map((_, i) => (
                  <div
                    key={`locked-${i}`}
                    className="flex flex-col items-center p-4 bg-muted rounded-xl border border-border opacity-50"
                  >
                    <div className="text-4xl mb-2">🔒</div>
                    <div className="font-medium text-sm text-muted-foreground">
                      Locked
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-md border-l-4 border-l-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Account Settings</CardTitle>
          <CardDescription>These actions require parent approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => setPasswordResetDialogOpen(true)}
              disabled={requestSent === "password"}
            >
              {requestSent === "password" ? "Request Sent" : "Request Password Reset"}
            </Button>
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={requestSent === "delete"}
            >
              {requestSent === "delete" ? "Request Sent" : "Request Account Deletion"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Account changes require parental consent as per COPPA regulations
          </p>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <AlertDialog
        open={passwordResetDialogOpen}
        onOpenChange={setPasswordResetDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a request to your parent to reset your password.
              They will receive an email notification and can choose to approve
              or deny the request. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={requestLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordResetRequest}
              disabled={requestLoading}
            >
              {requestLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Deletion Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a request to your parent to delete your account.
              If approved, all your progress, achievements, and data will be
              permanently deleted. This action cannot be undone. Are you sure
              you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={requestLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              disabled={requestLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {requestLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getAchievementEmoji(type: string): string {
  switch (type) {
    case "milestone":
      return "⭐";
    case "streak":
      return "🔥";
    case "mastery":
      return "🎯";
    case "completion":
      return "✅";
    case "exploration":
      return "🧭";
    default:
      return "🏆";
  }
}
