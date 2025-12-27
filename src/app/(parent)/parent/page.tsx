"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SubjectProgressChart,
  WeeklyActivityChart,
  CircularProgress,
} from "@/components/dashboard/progress-charts";
import { Download, Loader2 } from "lucide-react";
import { generateProgressReportPDF } from "@/lib/reports/pdf-generator";

interface Child {
  id: string;
  name: string;
  gradeLevel: number;
  avatarUrl?: string;
  lastActive: string;
  overallProgress: number;
  subjects: {
    subjectName: string;
    masteryLevel: number;
    completedLessons: number;
    totalLessons: number;
  }[];
}

export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Mock children data - in real app, fetch from API
  const [children] = useState<Child[]>([
    {
      id: "1",
      name: "Emma",
      gradeLevel: 3,
      lastActive: new Date().toISOString(),
      overallProgress: 78,
      subjects: [
        { subjectName: "Math", masteryLevel: 85, completedLessons: 18, totalLessons: 20 },
        { subjectName: "Reading", masteryLevel: 92, completedLessons: 22, totalLessons: 25 },
        { subjectName: "Science", masteryLevel: 70, completedLessons: 12, totalLessons: 18 },
        { subjectName: "History", masteryLevel: 65, completedLessons: 8, totalLessons: 15 },
      ],
    },
    {
      id: "2",
      name: "Liam",
      gradeLevel: 5,
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      overallProgress: 65,
      subjects: [
        { subjectName: "Math", masteryLevel: 72, completedLessons: 14, totalLessons: 22 },
        { subjectName: "Reading", masteryLevel: 68, completedLessons: 15, totalLessons: 25 },
        { subjectName: "Science", masteryLevel: 58, completedLessons: 10, totalLessons: 20 },
        { subjectName: "History", masteryLevel: 55, completedLessons: 8, totalLessons: 18 },
      ],
    },
  ]);

  const fetchData = useCallback(async () => {
    // TODO: Fetch children data from API
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [fetchData, children, selectedChild]);

  const currentChild = children.find((c) => c.id === selectedChild) || children[0];

  const mockWeeklyActivity = [
    { day: "Mon", minutes: 45, lessons: 2 },
    { day: "Tue", minutes: 30, lessons: 1 },
    { day: "Wed", minutes: 60, lessons: 3 },
    { day: "Thu", minutes: 25, lessons: 1 },
    { day: "Fri", minutes: 50, lessons: 2 },
    { day: "Sat", minutes: 15, lessons: 1 },
    { day: "Sun", minutes: 0, lessons: 0 },
  ];

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
        weeklyActivity: mockWeeklyActivity,
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const totalTimeThisWeek = mockWeeklyActivity.reduce((acc, d) => acc + d.minutes, 0);
  const totalLessonsThisWeek = mockWeeklyActivity.reduce((acc, d) => acc + d.lessons, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track your children&apos;s learning progress
          </p>
        </div>
        <Button
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2"
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
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200"
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={child.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-lg">
                    {child.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-semibold">{child.name}</div>
                  <div className="text-sm text-gray-500">Grade {child.gradeLevel}</div>
                  <div className="text-xs text-emerald-600">
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
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{currentChild.overallProgress}%</div>
                <div className="text-emerald-100 text-sm">Overall Progress</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{totalTimeThisWeek}</div>
                <div className="text-teal-100 text-sm">Minutes This Week</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">{totalLessonsThisWeek}</div>
                <div className="text-cyan-100 text-sm">Lessons This Week</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-gradient-to-br from-sky-500 to-sky-600 text-white">
              <CardContent className="p-4">
                <div className="text-3xl font-bold">A</div>
                <div className="text-sky-100 text-sm">Average Grade</div>
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
                  color="#10b981"
                />
                <div className="w-full space-y-3">
                  {currentChild.subjects.map((subject) => (
                    <div key={subject.subjectName}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{subject.subjectName}</span>
                        <span className="font-medium">{subject.masteryLevel}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
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
              <WeeklyActivityChart data={mockWeeklyActivity} />
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-0 shadow-md border-l-4 border-l-amber-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💡 Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">•</span>
                  <div>
                    <div className="font-medium">Focus on History</div>
                    <div className="text-sm text-gray-600">
                      {currentChild.name}&apos;s History mastery is below average. Consider adding 15 minutes of History practice daily.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 mt-1">•</span>
                  <div>
                    <div className="font-medium">Great Progress in Reading!</div>
                    <div className="text-sm text-gray-600">
                      {currentChild.name} is excelling in Reading. Consider challenging with advanced materials.
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1">•</span>
                  <div>
                    <div className="font-medium">Maintain Consistency</div>
                    <div className="text-sm text-gray-600">
                      Weekend study time dropped to 15 minutes. Encourage at least 30 minutes on weekends.
                    </div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
