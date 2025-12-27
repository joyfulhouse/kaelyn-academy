"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Target,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeacherClass {
  id: string;
  name: string;
  gradeLevel: number;
  studentCount: number;
}

// Curriculum lessons - will be fetched from API when curriculum feature is ready
const curriculumLessons = [
  { id: "math-fractions-1", title: "Introduction to Fractions", subject: "Math", duration: 30 },
  { id: "math-fractions-2", title: "Adding Fractions", subject: "Math", duration: 25 },
  { id: "math-decimals-1", title: "Understanding Decimals", subject: "Math", duration: 30 },
  { id: "math-geometry-1", title: "Basic Shapes", subject: "Math", duration: 20 },
  { id: "reading-comp-1", title: "Main Idea", subject: "Reading", duration: 25 },
  { id: "reading-comp-2", title: "Supporting Details", subject: "Reading", duration: 25 },
];

export default function NewAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    classId: "",
    dueDate: "",
    dueTime: "23:59",
    totalPoints: "100",
    passingScore: "70",
    allowLateSubmissions: true,
    maxAttempts: "1",
    selectedLessons: [] as string[],
  });

  // Fetch teacher's classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch("/api/teacher/classes");
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build due date ISO string if both date and time are provided
      let dueDateISO: string | undefined;
      if (formData.dueDate) {
        dueDateISO = new Date(`${formData.dueDate}T${formData.dueTime || "23:59"}`).toISOString();
      }

      const response = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          instructions: formData.instructions || undefined,
          classId: formData.classId,
          dueDate: dueDateISO,
          totalPoints: parseInt(formData.totalPoints, 10),
          passingScore: parseInt(formData.passingScore, 10),
          allowLateSubmissions: formData.allowLateSubmissions,
          maxAttempts: formData.maxAttempts === "unlimited" ? 10 : parseInt(formData.maxAttempts, 10),
          lessonIds: formData.selectedLessons.length > 0 ? formData.selectedLessons : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create assignment");
      }

      router.push("/teacher/assignments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (lessonId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedLessons: prev.selectedLessons.includes(lessonId)
        ? prev.selectedLessons.filter((id) => id !== lessonId)
        : [...prev.selectedLessons, lessonId],
    }));
  };

  const selectedClass = classes.find((c) => c.id === formData.classId);

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/teacher/assignments"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Link>

        <h1 className="text-3xl font-bold text-foreground">Create Assignment</h1>
        <p className="text-muted-foreground mt-1">
          Create a new assignment for your students
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
                <CardDescription>
                  Basic information about the assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Fractions Practice Quiz"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this assignment covers..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions for Students</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Step-by-step instructions for completing this assignment..."
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Curriculum Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Linked Lessons
                </CardTitle>
                <CardDescription>
                  Select curriculum lessons to include in this assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {curriculumLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.selectedLessons.includes(lesson.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => toggleLesson(lesson.id)}
                    >
                      <Checkbox
                        checked={formData.selectedLessons.includes(lesson.id)}
                        onCheckedChange={() => toggleLesson(lesson.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{lesson.title}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {lesson.subject}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration} min
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.selectedLessons.length > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">
                      {formData.selectedLessons.length} lesson(s) selected
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Estimated time:{" "}
                      {curriculumLessons
                        .filter((l) => formData.selectedLessons.includes(l.id))
                        .reduce((acc, l) => acc + l.duration, 0)}{" "}
                      minutes
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Class Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Assign To</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  {loadingClasses ? (
                    <div className="h-10 flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading classes...
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No classes found.{" "}
                      <Link href="/teacher/classes/new" className="text-primary hover:underline">
                        Create a class
                      </Link>{" "}
                      first.
                    </div>
                  ) : (
                    <Select
                      value={formData.classId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, classId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedClass && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This assignment will be sent to {selectedClass.studentCount}{" "}
                      students in Grade {selectedClass.gradeLevel === 0 ? "K" : selectedClass.gradeLevel}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dueTime: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Grading */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Grading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalPoints">Total Points</Label>
                  <Input
                    id="totalPoints"
                    type="number"
                    min="1"
                    value={formData.totalPoints}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        totalPoints: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        passingScore: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Select
                    value={formData.maxAttempts}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, maxAttempts: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="2">2 attempts</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="lateSubmissions">Allow Late Submissions</Label>
                  <Switch
                    id="lateSubmissions"
                    checked={formData.allowLateSubmissions}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        allowLateSubmissions: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Assignment"}
              </Button>
              <Button type="button" variant="outline" className="w-full">
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
