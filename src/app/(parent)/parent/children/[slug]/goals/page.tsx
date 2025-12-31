"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Plus,
  Calendar,
  Trophy,
  BookOpen,
  Clock,
  Flame,
  Activity,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Pause,
  Play,
  Check,
  Loader2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

// Type definitions
interface GoalConfig {
  recurrence?: "daily" | "weekly" | "monthly" | "once";
  resetDay?: number;
  reminderEnabled?: boolean;
  reminderTime?: string;
  rewardDescription?: string;
  difficultyLevel?: 1 | 2 | 3 | 4 | 5;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  metricType: string;
  targetValue: number;
  currentValue: number | null;
  subjectId: string | null;
  subjectName: string | null;
  config: GoalConfig | null;
  startDate: string;
  endDate: string | null;
  status: "active" | "completed" | "expired" | "paused";
  completedAt: string | null;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

const METRIC_TYPE_OPTIONS = [
  { value: "lessons_per_week", label: "Lessons per Week", icon: BookOpen, unit: "lessons" },
  { value: "minutes_per_day", label: "Minutes per Day", icon: Clock, unit: "minutes" },
  { value: "mastery_level", label: "Mastery Level", icon: Trophy, unit: "%" },
  { value: "streak_days", label: "Streak Days", icon: Flame, unit: "days" },
  { value: "activities_completed", label: "Activities Completed", icon: Activity, unit: "activities" },
  { value: "subject_progress", label: "Subject Progress", icon: Target, unit: "%" },
  { value: "custom", label: "Custom Goal", icon: Target, unit: "" },
] as const;

const RECURRENCE_OPTIONS = [
  { value: "once", label: "One-time goal" },
  { value: "daily", label: "Daily recurring" },
  { value: "weekly", label: "Weekly recurring" },
  { value: "monthly", label: "Monthly recurring" },
] as const;

function getMetricIcon(metricType: string) {
  const option = METRIC_TYPE_OPTIONS.find(o => o.value === metricType);
  if (option) {
    const Icon = option.icon;
    return <Icon className="h-4 w-4" />;
  }
  return <Target className="h-4 w-4" />;
}

function getMetricUnit(metricType: string): string {
  const option = METRIC_TYPE_OPTIONS.find(o => o.value === metricType);
  return option?.unit ?? "";
}

function getStatusBadge(status: Goal["status"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-success">Active</Badge>;
    case "completed":
      return <Badge className="bg-primary">Completed</Badge>;
    case "expired":
      return <Badge variant="secondary">Expired</Badge>;
    case "paused":
      return <Badge variant="outline">Paused</Badge>;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ChildGoalsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [childName, setChildName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Expanded goals for viewing details
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    metricType: "lessons_per_week",
    targetValue: 5,
    recurrence: "weekly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    rewardDescription: "",
  });

  // Fetch goals
  const fetchGoals = useCallback(async () => {
    try {
      const response = await fetch(`/api/parent/children/${slug}/goals`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
        setChildName(data.childName || "");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch goals");
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      setError("Failed to load goals");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      metricType: "lessons_per_week",
      targetValue: 5,
      recurrence: "weekly",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      rewardDescription: "",
    });
  };

  // Handle create goal
  const handleCreateGoal = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/parent/children/${slug}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          metricType: formData.metricType,
          targetValue: formData.targetValue,
          config: {
            recurrence: formData.recurrence,
            rewardDescription: formData.rewardDescription || undefined,
          },
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        }),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchGoals();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create goal");
      }
    } catch (err) {
      console.error("Failed to create goal:", err);
      setError("Failed to create goal");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit goal
  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description ?? "",
      metricType: goal.metricType,
      targetValue: goal.targetValue,
      recurrence: goal.config?.recurrence ?? "weekly",
      startDate: new Date(goal.startDate).toISOString().split("T")[0],
      endDate: goal.endDate ? new Date(goal.endDate).toISOString().split("T")[0] : "",
      rewardDescription: goal.config?.rewardDescription ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/parent/children/${slug}/goals/${editingGoal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          targetValue: formData.targetValue,
          config: {
            recurrence: formData.recurrence,
            rewardDescription: formData.rewardDescription || undefined,
          },
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        }),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setEditingGoal(null);
        resetForm();
        fetchGoals();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update goal");
      }
    } catch (err) {
      console.error("Failed to update goal:", err);
      setError("Failed to update goal");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete goal
  const handleDeleteGoal = async () => {
    if (!deletingGoalId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/parent/children/${slug}/goals/${deletingGoalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setDeletingGoalId(null);
        fetchGoals();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete goal");
      }
    } catch (err) {
      console.error("Failed to delete goal:", err);
      setError("Failed to delete goal");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle pause/resume goal
  const handleTogglePause = async (goal: Goal) => {
    const newStatus = goal.status === "paused" ? "active" : "paused";
    try {
      const response = await fetch(`/api/parent/children/${slug}/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchGoals();
      }
    } catch (err) {
      console.error("Failed to toggle pause:", err);
    }
  };

  // Handle complete goal
  const handleCompleteGoal = async (goal: Goal) => {
    try {
      const response = await fetch(`/api/parent/children/${slug}/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (response.ok) {
        fetchGoals();
      }
    } catch (err) {
      console.error("Failed to complete goal:", err);
    }
  };

  // Toggle expanded goal
  const toggleExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  // Separate goals by status
  const activeGoals = goals.filter(g => g.status === "active");
  const pausedGoals = goals.filter(g => g.status === "paused");
  const completedGoals = goals.filter(g => g.status === "completed");
  const expiredGoals = goals.filter(g => g.status === "expired");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/parent/children/${slug}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Learning Goals</h1>
            <p className="text-muted-foreground">
              Set and track goals for {childName || "your child"}
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Learning Goal</DialogTitle>
              <DialogDescription>
                Set a new learning goal for {childName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Complete 5 math lessons this week"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about the goal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metricType">Goal Type</Label>
                  <Select
                    value={formData.metricType}
                    onValueChange={(val) => setFormData({ ...formData, metricType: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {METRIC_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetValue">
                    Target Value ({getMetricUnit(formData.metricType) || "units"})
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    min={1}
                    max={10000}
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrence">Recurrence</Label>
                <Select
                  value={formData.recurrence}
                  onValueChange={(val) => setFormData({ ...formData, recurrence: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardDescription">Reward (optional)</Label>
                <Input
                  id="rewardDescription"
                  placeholder="e.g., Extra screen time on Saturday"
                  value={formData.rewardDescription}
                  onChange={(e) => setFormData({ ...formData, rewardDescription: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGoal} disabled={isSaving || !formData.title}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Goal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4 text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <Target className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{activeGoals.length}</div>
                  <div className="text-xs text-muted-foreground">Active Goals</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedGoals.length}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <Pause className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pausedGoals.length}</div>
                  <div className="text-xs text-muted-foreground">Paused</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-info/10">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{goals.length}</div>
                  <div className="text-xs text-muted-foreground">Total Goals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Goals Message */}
      {goals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create learning goals to help {childName} stay motivated and track progress.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              Active Goals
            </CardTitle>
            <CardDescription>Currently working towards these goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {getMetricIcon(goal.metricType)}
                    </div>
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.currentValue ?? 0} / {goal.targetValue} {getMetricUnit(goal.metricType)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(goal.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpanded(goal.id)}
                    >
                      {expandedGoals.has(goal.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Progress value={goal.progressPercent} className="h-2" />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Started {formatDate(goal.startDate)}</span>
                  <span>{goal.progressPercent}% complete</span>
                </div>

                {expandedGoals.has(goal.id) && (
                  <div className="pt-3 border-t space-y-3">
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                    {goal.config?.rewardDescription && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-warning" />
                        <span>Reward: {goal.config.rewardDescription}</span>
                      </div>
                    )}
                    {goal.endDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>Ends {formatDate(goal.endDate)}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(goal)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePause(goal)}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteGoal(goal)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Complete
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setDeletingGoalId(goal.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Paused Goals */}
      {pausedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-warning" />
              Paused Goals
            </CardTitle>
            <CardDescription>Temporarily paused goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pausedGoals.map((goal) => (
              <div
                key={goal.id}
                className="border rounded-lg p-4 space-y-3 opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {getMetricIcon(goal.metricType)}
                    </div>
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.currentValue ?? 0} / {goal.targetValue} {getMetricUnit(goal.metricType)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(goal.status)}
                </div>
                <Progress value={goal.progressPercent} className="h-2" />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePause(goal)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeletingGoalId(goal.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Completed Goals
            </CardTitle>
            <CardDescription>Successfully achieved goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="border rounded-lg p-4 space-y-2 bg-success/5 border-success/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-success/10">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Completed {goal.completedAt ? formatDate(goal.completedAt) : ""}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(goal.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Expired Goals */}
      {expiredGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              Expired Goals
            </CardTitle>
            <CardDescription>Goals that have passed their end date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expiredGoals.map((goal) => (
              <div
                key={goal.id}
                className="border rounded-lg p-4 space-y-2 opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      {getMetricIcon(goal.metricType)}
                    </div>
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Reached {goal.progressPercent}% - Expired {goal.endDate ? formatDate(goal.endDate) : ""}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(goal.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update the goal details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Goal Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-targetValue">
                Target Value ({getMetricUnit(formData.metricType) || "units"})
              </Label>
              <Input
                id="edit-targetValue"
                type="number"
                min={1}
                max={10000}
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End Date (optional)</Label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rewardDescription">Reward (optional)</Label>
              <Input
                id="edit-rewardDescription"
                value={formData.rewardDescription}
                onChange={(e) => setFormData({ ...formData, rewardDescription: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGoal} disabled={isSaving || !formData.title}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this goal and all its progress history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
