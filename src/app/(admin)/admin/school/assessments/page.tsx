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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  Users,
  FileText,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Assessment {
  id: string;
  name: string;
  subject: string;
  grades: string[];
  type: "quiz" | "test" | "standardized" | "benchmark";
  scheduledDate: string;
  duration: number;
  status: "scheduled" | "in_progress" | "completed" | "grading";
  studentsAssigned: number;
  studentsCompleted: number;
}

export default function AssessmentCalendarPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await fetch("/api/admin/school/assessments");
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || []);
      } else {
        // Mock data
        setAssessments([
          { id: "1", name: "Math Unit 3 Test", subject: "Math", grades: ["3", "4"], type: "test", scheduledDate: "2026-01-15", duration: 45, status: "scheduled", studentsAssigned: 107, studentsCompleted: 0 },
          { id: "2", name: "Reading Comprehension Quiz", subject: "Reading", grades: ["3"], type: "quiz", scheduledDate: "2026-01-10", duration: 20, status: "scheduled", studentsAssigned: 55, studentsCompleted: 0 },
          { id: "3", name: "Science Benchmark Q2", subject: "Science", grades: ["4", "5"], type: "benchmark", scheduledDate: "2026-01-08", duration: 60, status: "in_progress", studentsAssigned: 112, studentsCompleted: 45 },
          { id: "4", name: "State Math Assessment", subject: "Math", grades: ["3", "4", "5"], type: "standardized", scheduledDate: "2026-03-15", duration: 90, status: "scheduled", studentsAssigned: 162, studentsCompleted: 0 },
          { id: "5", name: "History Chapter Quiz", subject: "History", grades: ["5"], type: "quiz", scheduledDate: "2025-12-18", duration: 25, status: "completed", studentsAssigned: 62, studentsCompleted: 62 },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAssessment(null);
    setDialogOpen(true);
  };

  const handleEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDialogOpen(false);
      fetchAssessments();
    } catch (error) {
      console.error("Failed to save assessment:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800"><Users className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "grading":
        return <Badge className="bg-purple-100 text-purple-800"><FileText className="h-3 w-3 mr-1" />Grading</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      quiz: "bg-green-100 text-green-800",
      test: "bg-blue-100 text-blue-800",
      benchmark: "bg-purple-100 text-purple-800",
      standardized: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
  };

  const stats = {
    upcoming: assessments.filter((a) => a.status === "scheduled").length,
    inProgress: assessments.filter((a) => a.status === "in_progress").length,
    completed: assessments.filter((a) => a.status === "completed").length,
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
          <h1 className="text-3xl font-bold">Assessment Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage assessments for all grades.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Assessment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Assessments scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
          <CardDescription>
            View and manage scheduled assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Grades</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.name}</TableCell>
                  <TableCell>{assessment.subject}</TableCell>
                  <TableCell>{assessment.grades.join(", ")}</TableCell>
                  <TableCell>{getTypeBadge(assessment.type)}</TableCell>
                  <TableCell>{new Date(assessment.scheduledDate).toLocaleDateString()}</TableCell>
                  <TableCell>{assessment.duration} min</TableCell>
                  <TableCell>
                    {assessment.studentsCompleted}/{assessment.studentsAssigned}
                  </TableCell>
                  <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(assessment)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAssessment ? "Edit Assessment" : "Schedule Assessment"}
            </DialogTitle>
            <DialogDescription>
              Configure assessment details and schedule
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assessment Name</Label>
              <Input placeholder="e.g., Math Unit 3 Test" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select defaultValue={editingAssessment?.subject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue={editingAssessment?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="benchmark">Benchmark</SelectItem>
                    <SelectItem value="standardized">Standardized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" defaultValue={45} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
