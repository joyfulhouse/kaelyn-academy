"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Award,
  ChevronDown,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const children = [
  { id: "emma", name: "Emma Johnson", grade: 3 },
  { id: "liam", name: "Liam Johnson", grade: 5 },
];

const weeklyData = [
  { week: "Week 1", emma: 45, liam: 30 },
  { week: "Week 2", emma: 52, liam: 35 },
  { week: "Week 3", emma: 58, liam: 28 },
  { week: "Week 4", emma: 65, liam: 42 },
];

const subjectProgress = {
  emma: [
    { name: "Math", progress: 85, change: 5, lessons: 42, mastery: 88 },
    { name: "Reading", progress: 92, change: 3, lessons: 46, mastery: 90 },
    { name: "Science", progress: 70, change: -2, lessons: 35, mastery: 72 },
    { name: "History", progress: 65, change: 8, lessons: 33, mastery: 68 },
  ],
  liam: [
    { name: "Math", progress: 72, change: 4, lessons: 36, mastery: 70 },
    { name: "Reading", progress: 68, change: 2, lessons: 34, mastery: 65 },
    { name: "Science", progress: 58, change: 6, lessons: 14, mastery: 60 },
    { name: "History", progress: 55, change: -1, lessons: 14, mastery: 58 },
  ],
};

export default function ParentReportsPage() {
  const [selectedChild, setSelectedChild] = useState("emma");
  const [dateRange, setDateRange] = useState("30days");

  const child = children.find((c) => c.id === selectedChild);
  const subjects = subjectProgress[selectedChild as keyof typeof subjectProgress];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Progress Reports</h1>
          <p className="text-muted-foreground mt-1">
            Detailed insights into your children&apos;s learning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.name}
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

      {/* Child Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {child?.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{child?.name}</h2>
              <p className="text-muted-foreground">Grade {child?.grade}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">78%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-3xl font-bold">156</div>
              <div className="text-sm text-muted-foreground">Lessons Done</div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-3xl font-bold">72h</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Performance</CardTitle>
          <CardDescription>
            Detailed breakdown by subject for {child?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subjects.map((subject) => (
            <div key={subject.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {subject.lessons} lessons completed
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{subject.mastery}%</div>
                    <div className="text-xs text-muted-foreground">Mastery</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {subject.change > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">+{subject.change}%</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">{subject.change}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Progress value={subject.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Learning time over the past 4 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((week) => (
                <div key={week.week} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-muted-foreground">{week.week}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 bg-primary rounded"
                        style={{ width: `${(week[selectedChild as "emma" | "liam"] / 70) * 100}%` }}
                      />
                      <span className="text-sm font-medium">
                        {week[selectedChild as "emma" | "liam"]} min
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Badges earned in the selected period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="font-medium">Math Whiz</div>
                <div className="text-sm text-muted-foreground">Completed 10 math lessons</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-medium">Reading Champion</div>
                <div className="text-sm text-muted-foreground">90% mastery in Reading</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <div className="font-medium">Dedicated Learner</div>
                <div className="text-sm text-muted-foreground">10-day learning streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Personalized suggestions to improve {child?.name}&apos;s learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
              Focus on Science
            </h4>
            <p className="text-sm text-muted-foreground">
              Science shows a slight decline (-2%). Consider setting aside extra time for
              Science lessons this week to get back on track.
            </p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">
              Great Progress in History!
            </h4>
            <p className="text-sm text-muted-foreground">
              History improved by 8% this period. Keep up the momentum with the
              upcoming American Revolution unit!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
