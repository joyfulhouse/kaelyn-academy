"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Download,
  BookOpen,
  Target,
  Award,
  Loader2,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvatarById } from "@/components/ui/avatar-picker";

interface Child {
  id: string;
  name: string;
  gradeLevel: number;
  avatarUrl: string | null;
  preferences: {
    avatarId?: string;
  } | null;
  slug: string;
}

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  masteryLevel: number;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number;
}

interface WeeklyActivity {
  day: string;
  date: string;
  minutes: number;
  lessons: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  type: string;
  earnedAt: string;
}

interface ChildProgress {
  subjects: SubjectProgress[];
  weeklyActivity: WeeklyActivity[];
  currentStreak: number;
  longestStreak: number;
  achievementCount: number;
  recentAchievements: Achievement[];
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-44" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

function generateChildSlug(name: string, allNames: string[]): string {
  const parts = name.toLowerCase().split(" ");
  const firstName = parts[0];
  const middleInitial = parts.length > 2 ? parts[1][0] : null;
  const sameFirstName = allNames.filter(
    (n) => n.toLowerCase().startsWith(firstName + " ") && n !== name
  );
  if (sameFirstName.length > 0 && middleInitial) {
    return `${firstName}-${middleInitial}`;
  }
  return firstName;
}

export default function ParentReportsPage() {
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childProgress, setChildProgress] = useState<Record<string, ChildProgress>>({});
  const [dateRange, setDateRange] = useState("30days");
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchChildren = useCallback(async () => {
    try {
      const response = await fetch("/api/parent/children");
      if (response.ok) {
        const data = await response.json();
        const childrenData = data.children || [];

        const allNames = childrenData.map((c: Child) => c.name);
        const childrenWithSlugs = childrenData.map((child: Child) => ({
          ...child,
          slug: generateChildSlug(child.name, allNames),
        }));

        setChildren(childrenWithSlugs);
        if (childrenWithSlugs.length > 0) {
          setSelectedChildId(childrenWithSlugs[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async (childId: string) => {
    if (childProgress[childId]) return;

    try {
      const progressRes = await fetch(`/api/progress?learnerId=${childId}`);
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        const summary = progressData.summary || {};

        const achievementsRes = await fetch(`/api/achievements?learnerId=${childId}`);
        let recentAchievements: Achievement[] = [];
        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json();
          recentAchievements = (achievementsData.achievements || [])
            .filter((a: { earned: boolean }) => a.earned)
            .slice(0, 5)
            .map((a: { id: string; name: string; description: string; iconUrl?: string; type: string; earnedAt?: string }) => ({
              id: a.id,
              name: a.name,
              description: a.description,
              iconUrl: a.iconUrl,
              type: a.type,
              earnedAt: a.earnedAt || new Date().toISOString(),
            }));
        }

        setChildProgress((prev) => ({
          ...prev,
          [childId]: {
            subjects: summary.subjects || [],
            weeklyActivity: summary.weeklyActivity || [],
            currentStreak: summary.currentStreak || 0,
            longestStreak: summary.longestStreak || 0,
            achievementCount: summary.achievementCount || 0,
            recentAchievements,
          },
        }));
      }
    } catch (error) {
      console.error(`Failed to fetch progress for child ${childId}:`, error);
    }
  }, [childProgress]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    if (selectedChildId) {
      fetchProgress(selectedChildId);
    }
  }, [selectedChildId, fetchProgress]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      window.print();
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <ReportsSkeleton />;
  }

  const child = children.find((c) => c.id === selectedChildId);
  const progress = childProgress[selectedChildId] || {
    subjects: [],
    weeklyActivity: [],
    currentStreak: 0,
    longestStreak: 0,
    achievementCount: 0,
    recentAchievements: [],
  };

  const overallProgress =
    progress.subjects.length > 0
      ? Math.round(
          progress.subjects.reduce((acc, s) => acc + s.masteryLevel, 0) /
            progress.subjects.length
        )
      : 0;

  const totalLessons = progress.subjects.reduce(
    (acc, s) => acc + s.completedLessons,
    0
  );

  const totalTimeMinutes = progress.subjects.reduce(
    (acc, s) => acc + (s.totalTimeSpent || 0),
    0
  );
  const totalTimeHours = Math.round(totalTimeMinutes / 60);

  const avatarData = child?.preferences?.avatarId
    ? getAvatarById(child.preferences.avatarId)
    : null;

  const achievementIcons: Record<string, { icon: string; color: string }> = {
    milestone: { icon: "yellow", color: "text-warning bg-warning/10" },
    streak: { icon: "orange", color: "text-warning bg-warning/10" },
    mastery: { icon: "blue", color: "text-info bg-info/10" },
    completion: { icon: "green", color: "text-success bg-success/10" },
    exploration: { icon: "purple", color: "text-primary bg-primary/10" },
  };

  return (
    <div className="space-y-6 print:space-y-4" ref={reportRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Progress Reports</h1>
          <p className="text-muted-foreground mt-1">
            Detailed insights into your children&apos;s learning
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <FileText className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-center">
          Kaelyn&apos;s Academy - Progress Report
        </h1>
        <p className="text-center text-muted-foreground">
          Generated on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 print:hidden">
        <Select value={selectedChildId} onValueChange={setSelectedChildId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="semester">This Semester</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No Children Found</h3>
            <p className="text-sm text-muted-foreground">
              Add a child to start seeing progress reports
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Child Overview */}
          <Card className="print:shadow-none print:border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  {avatarData ? (
                    <AvatarFallback className={`text-3xl ${avatarData.color}`}>
                      {avatarData.emoji}
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {child?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{child?.name}</h2>
                  <p className="text-muted-foreground">
                    Grade {child?.gradeLevel === 0 ? "K" : child?.gradeLevel}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">
                    {overallProgress}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Overall Progress
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-3xl font-bold">{progress.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-3xl font-bold">{totalLessons}</div>
                  <div className="text-sm text-muted-foreground">Lessons Done</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-3xl font-bold">{totalTimeHours}h</div>
                  <div className="text-sm text-muted-foreground">Total Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>
                Detailed breakdown by subject for {child?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {progress.subjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No subject progress yet. Start learning to see results!
                </p>
              ) : (
                progress.subjects.map((subject) => {
                  const progressPercent =
                    subject.totalLessons > 0
                      ? Math.round(
                          (subject.completedLessons / subject.totalLessons) * 100
                        )
                      : 0;

                  return (
                    <div key={subject.subjectId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <span className="font-medium">{subject.subjectName}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {subject.completedLessons} lessons completed
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">
                              {subject.masteryLevel}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Mastery
                            </div>
                          </div>
                        </div>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Weekly Summary */}
          <div className="grid lg:grid-cols-2 gap-6 print:grid-cols-1">
            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                  Learning time over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progress.weeklyActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No activity this week yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {progress.weeklyActivity.map((day) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <div className="w-12 text-sm text-muted-foreground">
                          {day.day}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 bg-primary rounded"
                              style={{
                                width: `${Math.min((day.minutes / 60) * 100, 100)}%`,
                              }}
                            />
                            <span className="text-sm font-medium">
                              {day.minutes} min
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>
                  Badges earned ({progress.achievementCount} total)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress.recentAchievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No achievements earned yet
                    </p>
                  </div>
                ) : (
                  progress.recentAchievements.map((achievement) => {
                    const style =
                      achievementIcons[achievement.type] || { icon: "gray", color: "text-muted-foreground bg-muted" };
                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${style.color}`}
                      >
                        {achievement.type === "streak" ? (
                          <Flame className="h-8 w-8" />
                        ) : achievement.type === "mastery" ? (
                          <Target className="h-8 w-8" />
                        ) : (
                          <Award className="h-8 w-8" />
                        )}
                        <div>
                          <div className="font-medium text-foreground">{achievement.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="print:shadow-none print:border-0">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions to improve {child?.name}&apos;s learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.subjects.length === 0 ? (
                <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                  <h4 className="font-medium text-info mb-1">
                    Get Started
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Start with any subject to receive personalized learning
                    recommendations based on progress and performance.
                  </p>
                </div>
              ) : (
                <>
                  {progress.subjects
                    .filter((s) => s.masteryLevel < 70)
                    .slice(0, 2)
                    .map((subject) => (
                      <div
                        key={subject.subjectId}
                        className="p-4 bg-info/10 border border-info/20 rounded-lg"
                      >
                        <h4 className="font-medium text-info mb-1">
                          Focus on {subject.subjectName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {subject.subjectName} mastery is at {subject.masteryLevel}%.
                          Consider spending extra time on practice activities to
                          improve understanding.
                        </p>
                      </div>
                    ))}
                  {progress.subjects
                    .filter((s) => s.masteryLevel >= 85)
                    .slice(0, 1)
                    .map((subject) => (
                      <div
                        key={subject.subjectId}
                        className="p-4 bg-success/10 border border-success/20 rounded-lg"
                      >
                        <h4 className="font-medium text-success mb-1">
                          Excellent Progress in {subject.subjectName}!
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {subject.subjectName} mastery is at {subject.masteryLevel}%!
                          Keep up the great work and consider exploring advanced
                          topics.
                        </p>
                      </div>
                    ))}
                  {progress.currentStreak >= 7 && (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                      <h4 className="font-medium text-warning mb-1">
                        Amazing Streak!
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {child?.name} has maintained a {progress.currentStreak}-day
                        learning streak! Consistency is key to mastering new skills.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
