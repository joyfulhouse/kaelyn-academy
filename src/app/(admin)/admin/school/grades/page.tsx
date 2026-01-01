"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GraduationCap,
  Save,
  Loader2,
  Settings,
  BookOpen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GradeConfig {
  grade: string;
  enabled: boolean;
  defaultSubjects: string[];
  weeklyHours: number;
  assessmentFrequency: "weekly" | "biweekly" | "monthly";
  aiTutoringEnabled: boolean;
  parentReportsEnabled: boolean;
}

export default function GradeDefaultsPage() {
  const [grades, setGrades] = useState<GradeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGradeDefaults();
  }, []);

  const fetchGradeDefaults = async () => {
    try {
      const res = await fetch("/api/admin/school/grades");
      if (res.ok) {
        const data = await res.json();
        setGrades(data.grades || []);
      } else {
        // Mock data
        setGrades([
          { grade: "K", enabled: true, defaultSubjects: ["Math", "Reading"], weeklyHours: 15, assessmentFrequency: "monthly", aiTutoringEnabled: true, parentReportsEnabled: true },
          { grade: "1", enabled: true, defaultSubjects: ["Math", "Reading", "Science"], weeklyHours: 18, assessmentFrequency: "biweekly", aiTutoringEnabled: true, parentReportsEnabled: true },
          { grade: "2", enabled: true, defaultSubjects: ["Math", "Reading", "Science"], weeklyHours: 20, assessmentFrequency: "biweekly", aiTutoringEnabled: true, parentReportsEnabled: true },
          { grade: "3", enabled: true, defaultSubjects: ["Math", "Reading", "Science", "History"], weeklyHours: 22, assessmentFrequency: "weekly", aiTutoringEnabled: true, parentReportsEnabled: true },
          { grade: "4", enabled: true, defaultSubjects: ["Math", "Reading", "Science", "History"], weeklyHours: 24, assessmentFrequency: "weekly", aiTutoringEnabled: true, parentReportsEnabled: true },
          { grade: "5", enabled: true, defaultSubjects: ["Math", "Reading", "Science", "History", "Technology"], weeklyHours: 25, assessmentFrequency: "weekly", aiTutoringEnabled: true, parentReportsEnabled: true },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch grade defaults:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/grades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades }),
      });
    } catch (error) {
      console.error("Failed to save grade defaults:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateGrade = (gradeLevel: string, updates: Partial<GradeConfig>) => {
    setGrades(grades.map((g) =>
      g.grade === gradeLevel ? { ...g, ...updates } : g
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grade Level Defaults</h1>
          <p className="text-muted-foreground">
            Configure default settings for each grade level.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Grades</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.filter((g) => g.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Weekly Hours</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(grades.reduce((sum, g) => sum + g.weeklyHours, 0) / grades.length)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Tutoring Enabled</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.filter((g) => g.aiTutoringEnabled).length} / {grades.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Configuration Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Level Configuration</CardTitle>
          <CardDescription>
            Set defaults for subjects, hours, and features per grade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Weekly Hours</TableHead>
                <TableHead>Assessments</TableHead>
                <TableHead>AI Tutoring</TableHead>
                <TableHead>Parent Reports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.grade}>
                  <TableCell className="font-medium">
                    {grade.grade === "K" ? "Kindergarten" : `Grade ${grade.grade}`}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={grade.enabled}
                      onCheckedChange={(checked) =>
                        updateGrade(grade.grade, { enabled: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {grade.defaultSubjects.length} subjects
                    </span>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={grade.weeklyHours}
                      onChange={(e) =>
                        updateGrade(grade.grade, { weeklyHours: parseInt(e.target.value) || 0 })
                      }
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      className="text-sm border rounded px-2 py-1"
                      value={grade.assessmentFrequency}
                      onChange={(e) =>
                        updateGrade(grade.grade, {
                          assessmentFrequency: e.target.value as GradeConfig["assessmentFrequency"],
                        })
                      }
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={grade.aiTutoringEnabled}
                      onCheckedChange={(checked) =>
                        updateGrade(grade.grade, { aiTutoringEnabled: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={grade.parentReportsEnabled}
                      onCheckedChange={(checked) =>
                        updateGrade(grade.grade, { parentReportsEnabled: checked })
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
