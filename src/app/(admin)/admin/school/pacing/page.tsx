"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Save,
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PacingUnit {
  id: string;
  unit: string;
  subject: string;
  grade: string;
  startDate: string;
  endDate: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  status: "on_track" | "ahead" | "behind" | "not_started";
}

export default function PacingGuidesPage() {
  const [units, setUnits] = useState<PacingUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const fetchPacingGuides = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (gradeFilter !== "all") params.set("grade", gradeFilter);
      if (subjectFilter !== "all") params.set("subject", subjectFilter);

      const res = await fetch(`/api/admin/school/pacing?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUnits(data.units || []);
      } else {
        // Mock data
        setUnits([
          { id: "1", unit: "Numbers & Operations", subject: "Math", grade: "3", startDate: "2025-09-01", endDate: "2025-10-15", lessonsTotal: 24, lessonsCompleted: 24, status: "ahead" },
          { id: "2", unit: "Fractions", subject: "Math", grade: "3", startDate: "2025-10-16", endDate: "2025-11-30", lessonsTotal: 20, lessonsCompleted: 18, status: "on_track" },
          { id: "3", unit: "Geometry Basics", subject: "Math", grade: "3", startDate: "2025-12-01", endDate: "2026-01-15", lessonsTotal: 18, lessonsCompleted: 8, status: "on_track" },
          { id: "4", unit: "Reading Comprehension", subject: "Reading", grade: "3", startDate: "2025-09-01", endDate: "2025-12-20", lessonsTotal: 36, lessonsCompleted: 28, status: "behind" },
          { id: "5", unit: "Life Science", subject: "Science", grade: "3", startDate: "2025-09-01", endDate: "2025-11-15", lessonsTotal: 22, lessonsCompleted: 22, status: "ahead" },
          { id: "6", unit: "Earth Science", subject: "Science", grade: "3", startDate: "2025-11-16", endDate: "2026-02-01", lessonsTotal: 18, lessonsCompleted: 6, status: "on_track" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch pacing guides:", error);
    } finally {
      setLoading(false);
    }
  }, [gradeFilter, subjectFilter]);

  useEffect(() => {
    fetchPacingGuides();
  }, [fetchPacingGuides]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to save pacing guides:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ahead":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Ahead</Badge>;
      case "on_track":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />On Track</Badge>;
      case "behind":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Behind</Badge>;
      case "not_started":
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredUnits = units.filter((unit) => {
    if (gradeFilter !== "all" && unit.grade !== gradeFilter) return false;
    if (subjectFilter !== "all" && unit.subject !== subjectFilter) return false;
    return true;
  });

  const stats = {
    onTrack: units.filter((u) => u.status === "on_track").length,
    ahead: units.filter((u) => u.status === "ahead").length,
    behind: units.filter((u) => u.status === "behind").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pacing Guides</h1>
          <p className="text-muted-foreground">
            Monitor curriculum pacing and adjust schedules.
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
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.onTrack}</div>
            <p className="text-xs text-muted-foreground">Units on schedule</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahead</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ahead}</div>
            <p className="text-xs text-muted-foreground">Units ahead of pace</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Behind</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.behind}</div>
            <p className="text-xs text-muted-foreground">Units need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pacing Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Curriculum Pacing</CardTitle>
              <CardDescription>
                Track progress against planned schedules
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {["K", "1", "2", "3", "4", "5"].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g === "K" ? "Kindergarten" : `Grade ${g}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="Reading">Reading</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.unit}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{unit.subject}</Badge>
                  </TableCell>
                  <TableCell>{unit.grade}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(unit.startDate).toLocaleDateString()} -{" "}
                    {new Date(unit.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(unit.lessonsCompleted / unit.lessonsTotal) * 100}
                        className="w-24"
                      />
                      <span className="text-sm">
                        {unit.lessonsCompleted}/{unit.lessonsTotal}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(unit.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
