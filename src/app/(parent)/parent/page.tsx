"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SubjectProgressChart,
  WeeklyActivityChart,
  CircularProgress,
} from "@/components/dashboard/progress-charts";
import { Download, Loader2, Lightbulb, Target, Trophy, Heart, Clock, RefreshCw } from "lucide-react";
import { generateProgressReportPDF } from "@/lib/reports/pdf-generator";
import { colors } from "@/lib/colors";

interface SubjectProgress {
  subjectName: string;
  masteryLevel: number;
  completedLessons: number;
  totalLessons: number;
}

interface WeeklyDay {
  day: string;
  minutes: number;
  lessons: number;
}

interface Child {
  id: string;
  name: string;
  gradeLevel: number;
  avatarUrl?: string;
  lastActive: string;
  overallProgress: number;
  subjects: SubjectProgress[];
  weeklyActivity: WeeklyDay[];
}

interface Recommendation {
  type: "focus" | "celebrate" | "encourage" | "challenge" | "routine";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionItems?: string[];
}

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsSummary, setRecommendationsSummary] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      // Fetch children from API
      const childrenResponse = await fetch("/api/parent/children");
      if (!childrenResponse.ok) {
        throw new Error("Failed to fetch children");
      }
      const childrenData = await childrenResponse.json();

      // Map API response to Child interface
      const mappedChildren: Child[] = (childrenData.children || []).map((child: {
        id: string;
        name: string;
        gradeLevel: number;
        avatarUrl?: string;
        progress?: {
          overallProgress: number;
          subjects: SubjectProgress[];
        };
        lastActive?: string;
        weeklyActivity?: WeeklyDay[];
      }) => ({
        id: child.id,
        name: child.name,
        gradeLevel: child.gradeLevel,
        avatarUrl: child.avatarUrl,
        lastActive: child.lastActive || new Date().toISOString(),
        overallProgress: child.progress?.overallProgress || 0,
        subjects: child.progress?.subjects || [],
        weeklyActivity: child.weeklyActivity || [
          { day: "Mon", minutes: 0, lessons: 0 },
          { day: "Tue", minutes: 0, lessons: 0 },
          { day: "Wed", minutes: 0, lessons: 0 },
          { day: "Thu", minutes: 0, lessons: 0 },
          { day: "Fri", minutes: 0, lessons: 0 },
          { day: "Sat", minutes: 0, lessons: 0 },
          { day: "Sun", minutes: 0, lessons: 0 },
        ],
      }));

      setChildren(mappedChildren);

      if (mappedChildren.length > 0 && !selectedChild) {
        setSelectedChild(mappedChildren[0].id);
      }
    } catch (err) {
      console.error("Error fetching children:", err);
      setError(err instanceof Error ? err.message : "Failed to load children");
    } finally {
      setLoading(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch AI recommendations when child changes
  const fetchRecommendations = useCallback(async (childId: string) => {
    setRecommendationsLoading(true);
    try {
      const response = await fetch(`/api/parent/recommendations?childId=${childId}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setRecommendationsSummary(data.summary || "");
      } else {
        // Use empty recommendations on error
        setRecommendations([]);
        setRecommendationsSummary("");
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setRecommendations([]);
      setRecommendationsSummary("");
    } finally {
      setRecommendationsLoading(false);
    }
  }, []);

  // Fetch recommendations when selected child changes
  useEffect(() => {
    if (selectedChild) {
      fetchRecommendations(selectedChild);
    }
  }, [selectedChild, fetchRecommendations]);

  const currentChild = children.find((c) => c.id === selectedChild) || children[0];

  const handleDownloadReport = async () => {
    if (!currentChild) return;

    setIsGeneratingReport(true);
    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 300));

      generateProgressReportPDF({
        name: currentChild.name,
        gradeLevel: currentChild.gradeLevel,
        overallProgress: currentChild.overallProgress,
        subjects: currentChild.subjects,
        weeklyActivity: currentChild.weeklyActivity,
      });
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-role-parent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Parent Dashboard</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Parent Dashboard</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No children registered yet.</p>
            <Button asChild>
              <a href="/parent/children/add">Add a Child</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate weekly totals from current child's data
  const weeklyActivity = currentChild?.weeklyActivity || [];
  const totalTimeThisWeek = weeklyActivity.reduce((acc, d) => acc + d.minutes, 0);
  const totalLessonsThisWeek = weeklyActivity.reduce((acc, d) => acc + d.lessons, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Parent Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your children&apos;s learning progress
          </p>
        </div>
        <Button
          variant="outline"
          className="border-role-parent/30 text-role-parent hover:bg-role-parent/10 gap-2"
          onClick={handleDownloadReport}
          disabled={isGeneratingReport || !currentChild}
        >
          {isGeneratingReport ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isGeneratingReport ? "Generating..." : "Download Report"}
        </Button>
      </div>

      {/* Child Selector */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Your Children</CardTitle>
          <CardDescription>Select a child to view their progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all min-w-[200px] ${
                  selectedChild === child.id
                    ? "border-role-parent bg-role-parent/10"
                    : "border-border hover:border-role-parent/50"
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={child.avatarUrl} />
                  <AvatarFallback className="bg-role-parent text-white text-lg">
                    {child.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-semibold text-foreground">{child.name}</div>
                  <div className="text-sm text-muted-foreground">Grade {child.gradeLevel}</div>
                  <div className="text-xs text-role-parent">
                    {child.overallProgress}% complete
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {currentChild && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-md bg-role-parent text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{currentChild.overallProgress}%</div>
                <div className="text-white/80 text-sm">Overall Progress</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-success text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{totalTimeThisWeek}</div>
                <div className="text-white/80 text-sm">Minutes This Week</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-info text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{totalLessonsThisWeek}</div>
                <div className="text-white/80 text-sm">Lessons This Week</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-primary text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">A</div>
                <div className="text-white/80 text-sm">Average Grade</div>
              </CardContent>
            </Card>
          </div>

          {/* Subject Progress */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-0 shadow-md">
              <CardHeader>
                <CardTitle>{currentChild.name}&apos;s Subject Progress</CardTitle>
                <CardDescription>Mastery and completion by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <SubjectProgressChart data={currentChild.subjects} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <CircularProgress
                  value={currentChild.overallProgress}
                  label="Overall"
                  color={colors.chart.green}
                />
                <div className="w-full space-y-3">
                  {currentChild.subjects.map((subject) => (
                    <div key={subject.subjectName}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-foreground">{subject.subjectName}</span>
                        <span className="font-medium text-foreground">{subject.masteryLevel}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-role-parent rounded-full transition-all"
                          style={{ width: `${subject.masteryLevel}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Weekly Study Activity</CardTitle>
              <CardDescription>Study time and lessons completed this week</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyActivityChart data={weeklyActivity} />
            </CardContent>
          </Card>

          {/* AI-Powered Recommendations */}
          <Card className="border-0 shadow-md border-l-4 border-l-warning">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Personalized Recommendations
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchRecommendations(currentChild.id)}
                  disabled={recommendationsLoading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`h-4 w-4 ${recommendationsLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardTitle>
              {recommendationsSummary && (
                <CardDescription>{recommendationsSummary}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {recommendationsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No recommendations available yet. Complete more activities to receive personalized guidance!
                </p>
              ) : (
                <ul className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-0.5">
                        {rec.type === "focus" && <Target className="h-5 w-5 text-warning" />}
                        {rec.type === "celebrate" && <Trophy className="h-5 w-5 text-success" />}
                        {rec.type === "encourage" && <Heart className="h-5 w-5 text-destructive" />}
                        {rec.type === "challenge" && <Lightbulb className="h-5 w-5 text-info" />}
                        {rec.type === "routine" && <Clock className="h-5 w-5 text-primary" />}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2 text-foreground">
                          {rec.title}
                          {rec.priority === "high" && (
                            <span className="text-xs bg-warning/20 text-warning px-1.5 py-0.5 rounded">
                              Priority
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {rec.description}
                        </div>
                        {rec.actionItems && rec.actionItems.length > 0 && (
                          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                            {rec.actionItems.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-center gap-1.5">
                                <span className="h-1 w-1 bg-muted-foreground rounded-full" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
