"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ClipboardCheck,
  Plus,
  MoreVertical,
  Search,
  X,
  Loader2,
  AlertTriangle,
  Copy,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PerformanceLevel {
  id?: string;
  name: string;
  description?: string;
  points: number;
  percentage: number;
  sortOrder: number;
}

interface Criterion {
  id?: string;
  name: string;
  description?: string;
  maxPoints: number;
  weight: number;
  sortOrder: number;
  performanceLevels: PerformanceLevel[];
}

interface Rubric {
  id: string;
  name: string;
  description: string | null;
  totalPoints: number;
  isTemplate: boolean;
  isPublic: boolean;
  criteriaCount: number;
  createdAt: string;
  updatedAt: string;
  criteria?: Criterion[];
}

interface RubricSummary {
  total: number;
  templates: number;
}

// Default performance levels template
const DEFAULT_LEVELS: Omit<PerformanceLevel, "sortOrder">[] = [
  { name: "Excellent", description: "Exceeds expectations", points: 25, percentage: 100 },
  { name: "Proficient", description: "Meets expectations", points: 20, percentage: 80 },
  { name: "Developing", description: "Approaching expectations", points: 15, percentage: 60 },
  { name: "Beginning", description: "Below expectations", points: 10, percentage: 40 },
];

function RubricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

// Rubric Builder/Editor Component
function RubricBuilder({
  rubric,
  onSave,
  onCancel,
  saving,
}: {
  rubric?: Rubric | null;
  onSave: (data: {
    name: string;
    description?: string;
    totalPoints: number;
    isTemplate: boolean;
    isPublic: boolean;
    criteria: Criterion[];
  }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(rubric?.name || "");
  const [description, setDescription] = useState(rubric?.description || "");
  const [isTemplate, setIsTemplate] = useState(rubric?.isTemplate || false);
  const [isPublic, setIsPublic] = useState(rubric?.isPublic || false);
  const [criteria, setCriteria] = useState<Criterion[]>(
    rubric?.criteria || [
      {
        name: "Content Quality",
        description: "Quality and accuracy of content",
        maxPoints: 25,
        weight: 1.0,
        sortOrder: 0,
        performanceLevels: DEFAULT_LEVELS.map((l, i) => ({ ...l, sortOrder: i })),
      },
    ]
  );

  const totalPoints = useMemo(
    () => criteria.reduce((sum, c) => sum + c.maxPoints, 0),
    [criteria]
  );

  const addCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      {
        name: `Criterion ${prev.length + 1}`,
        description: "",
        maxPoints: 25,
        weight: 1.0,
        sortOrder: prev.length,
        performanceLevels: DEFAULT_LEVELS.map((l, i) => ({
          ...l,
          sortOrder: i,
        })),
      },
    ]);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length <= 1) return;
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, updates: Partial<Criterion>) => {
    setCriteria((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...updates } : c))
    );
  };

  const updatePerformanceLevel = (
    criterionIndex: number,
    levelIndex: number,
    updates: Partial<PerformanceLevel>
  ) => {
    setCriteria((prev) =>
      prev.map((c, i) =>
        i === criterionIndex
          ? {
              ...c,
              performanceLevels: c.performanceLevels.map((l, j) =>
                j === levelIndex ? { ...l, ...updates } : l
              ),
            }
          : c
      )
    );
  };

  const addPerformanceLevel = (criterionIndex: number) => {
    setCriteria((prev) =>
      prev.map((c, i) =>
        i === criterionIndex
          ? {
              ...c,
              performanceLevels: [
                ...c.performanceLevels,
                {
                  name: "New Level",
                  description: "",
                  points: 0,
                  percentage: 0,
                  sortOrder: c.performanceLevels.length,
                },
              ],
            }
          : c
      )
    );
  };

  const removePerformanceLevel = (criterionIndex: number, levelIndex: number) => {
    const criterion = criteria[criterionIndex];
    if (criterion.performanceLevels.length <= 2) return;

    setCriteria((prev) =>
      prev.map((c, i) =>
        i === criterionIndex
          ? {
              ...c,
              performanceLevels: c.performanceLevels.filter((_, j) => j !== levelIndex),
            }
          : c
      )
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (criteria.length === 0) return;

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      totalPoints,
      isTemplate,
      isPublic,
      criteria: criteria.map((c, i) => ({
        ...c,
        sortOrder: i,
        performanceLevels: c.performanceLevels.map((l, j) => ({
          ...l,
          sortOrder: j,
        })),
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Rubric Info */}
      <Card>
        <CardHeader>
          <CardTitle>Rubric Details</CardTitle>
          <CardDescription>
            Basic information about this grading rubric
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rubric-name">Rubric Name *</Label>
            <Input
              id="rubric-name"
              placeholder="e.g., Essay Writing Rubric"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rubric-description">Description</Label>
            <Textarea
              id="rubric-description"
              placeholder="Describe what this rubric evaluates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">Save as template</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">Share with other teachers</span>
            </label>
          </div>
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Total Points: <span className="font-semibold text-foreground">{totalPoints}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Grading Criteria</h3>
            <p className="text-sm text-muted-foreground">
              Define the criteria and performance levels for evaluation
            </p>
          </div>
          <Button onClick={addCriterion} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Criterion
          </Button>
        </div>

        {criteria.map((criterion, criterionIndex) => (
          <Card key={criterionIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Input
                    value={criterion.name}
                    onChange={(e) =>
                      updateCriterion(criterionIndex, { name: e.target.value })
                    }
                    placeholder="Criterion name"
                    className="font-semibold"
                  />
                  <Input
                    value={criterion.description || ""}
                    onChange={(e) =>
                      updateCriterion(criterionIndex, { description: e.target.value })
                    }
                    placeholder="Brief description..."
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground">Max:</Label>
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={criterion.maxPoints}
                      onChange={(e) =>
                        updateCriterion(criterionIndex, {
                          maxPoints: parseInt(e.target.value) || 25,
                        })
                      }
                      className="w-20"
                    />
                  </div>
                  {criteria.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCriterion(criterionIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Performance Levels</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addPerformanceLevel(criterionIndex)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Level
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[25%]">Level Name</TableHead>
                        <TableHead className="w-[40%]">Description</TableHead>
                        <TableHead className="w-[15%] text-center">Points</TableHead>
                        <TableHead className="w-[15%] text-center">%</TableHead>
                        <TableHead className="w-[5%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criterion.performanceLevels.map((level, levelIndex) => (
                        <TableRow key={levelIndex}>
                          <TableCell>
                            <Input
                              value={level.name}
                              onChange={(e) =>
                                updatePerformanceLevel(criterionIndex, levelIndex, {
                                  name: e.target.value,
                                })
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={level.description || ""}
                              onChange={(e) =>
                                updatePerformanceLevel(criterionIndex, levelIndex, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="What does this level look like?"
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={criterion.maxPoints}
                              value={level.points}
                              onChange={(e) =>
                                updatePerformanceLevel(criterionIndex, levelIndex, {
                                  points: parseInt(e.target.value) || 0,
                                })
                              }
                              className="h-8 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={level.percentage}
                              onChange={(e) =>
                                updatePerformanceLevel(criterionIndex, levelIndex, {
                                  percentage: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="h-8 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            {criterion.performanceLevels.length > 2 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  removePerformanceLevel(criterionIndex, levelIndex)
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : rubric ? (
            "Update Rubric"
          ) : (
            "Create Rubric"
          )}
        </Button>
      </div>
    </div>
  );
}

// Rubric Preview Component
function RubricPreview({ rubric }: { rubric: Rubric }) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold">{rubric.name}</h3>
        {rubric.description && (
          <p className="text-muted-foreground mt-1">{rubric.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>Total Points: <strong>{rubric.totalPoints}</strong></span>
          {rubric.isTemplate && <Badge variant="secondary">Template</Badge>}
          {rubric.isPublic && <Badge variant="outline">Shared</Badge>}
        </div>
      </div>

      {rubric.criteria?.map((criterion, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{criterion.name}</h4>
                {criterion.description && (
                  <p className="text-sm text-muted-foreground">{criterion.description}</p>
                )}
              </div>
              <Badge>{criterion.maxPoints} pts</Badge>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {criterion.performanceLevels.map((level, j) => (
                  <TableHead key={j} className="text-center">
                    <div className="font-medium">{level.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {level.points} pts ({level.percentage}%)
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {criterion.performanceLevels.map((level, j) => (
                  <TableCell key={j} className="align-top text-sm">
                    {level.description || "-"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

export default function RubricsPage() {
  const [loading, setLoading] = useState(true);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [summary, setSummary] = useState<RubricSummary>({ total: 0, templates: 0 });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [builderOpen, setBuilderOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingRubric, setLoadingRubric] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/rubrics");
      if (response.ok) {
        const data = await response.json();
        setRubrics(data.rubrics || []);
        setSummary(data.summary || { total: 0, templates: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch rubrics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch full rubric details for editing/preview
  const fetchRubricDetails = async (id: string): Promise<Rubric | null> => {
    setLoadingRubric(true);
    try {
      const response = await fetch(`/api/teacher/rubrics/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data.rubric;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch rubric details:", error);
      return null;
    } finally {
      setLoadingRubric(false);
    }
  };

  // Filter rubrics
  const filteredRubrics = useMemo(() => {
    return rubrics.filter((r) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !r.name.toLowerCase().includes(query) &&
          !r.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [rubrics, searchQuery]);

  const templateRubrics = filteredRubrics.filter((r) => r.isTemplate);
  const regularRubrics = filteredRubrics.filter((r) => !r.isTemplate);

  const handleCreateRubric = () => {
    setSelectedRubric(null);
    setBuilderOpen(true);
  };

  const handleEditRubric = async (rubric: Rubric) => {
    const fullRubric = await fetchRubricDetails(rubric.id);
    if (fullRubric) {
      setSelectedRubric(fullRubric);
      setBuilderOpen(true);
    }
  };

  const handlePreviewRubric = async (rubric: Rubric) => {
    const fullRubric = await fetchRubricDetails(rubric.id);
    if (fullRubric) {
      setSelectedRubric(fullRubric);
      setPreviewOpen(true);
    }
  };

  const handleDuplicateRubric = async (rubric: Rubric) => {
    const fullRubric = await fetchRubricDetails(rubric.id);
    if (fullRubric) {
      setSaving(true);
      try {
        const response = await fetch("/api/teacher/rubrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${fullRubric.name} (Copy)`,
            description: fullRubric.description,
            totalPoints: fullRubric.totalPoints,
            isTemplate: false,
            isPublic: false,
            criteria: fullRubric.criteria,
          }),
        });

        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error("Failed to duplicate rubric:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveRubric = async (data: {
    name: string;
    description?: string;
    totalPoints: number;
    isTemplate: boolean;
    isPublic: boolean;
    criteria: Criterion[];
  }) => {
    setSaving(true);
    try {
      const url = selectedRubric
        ? `/api/teacher/rubrics/${selectedRubric.id}`
        : "/api/teacher/rubrics";
      const method = selectedRubric ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchData();
        setBuilderOpen(false);
        setSelectedRubric(null);
      }
    } catch (error) {
      console.error("Failed to save rubric:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRubric = async () => {
    if (!selectedRubric) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/teacher/rubrics/${selectedRubric.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
        setDeleteDialogOpen(false);
        setSelectedRubric(null);
      }
    } catch (error) {
      console.error("Failed to delete rubric:", error);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (rubric: Rubric) => {
    setSelectedRubric(rubric);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return <RubricsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rubrics</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage grading rubrics for consistent evaluation
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreateRubric}>
          <Plus className="h-4 w-4" />
          Create Rubric
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-xs text-muted-foreground">Total Rubrics</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-info/10">
                <FileText className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.templates}</div>
                <div className="text-xs text-muted-foreground">Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/10">
                <Layers className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.total - summary.templates}</div>
                <div className="text-xs text-muted-foreground">Active Rubrics</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rubrics..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Empty state */}
      {rubrics.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No Rubrics Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first rubric to start grading with consistent criteria
            </p>
            <Button onClick={handleCreateRubric}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rubric
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Rubrics Tabs */
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({filteredRubrics.length})</TabsTrigger>
            <TabsTrigger value="rubrics">Rubrics ({regularRubrics.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates ({templateRubrics.length})</TabsTrigger>
          </TabsList>

          {["all", "rubrics", "templates"].map((tabValue) => {
            let tabRubrics = filteredRubrics;
            if (tabValue === "rubrics") tabRubrics = regularRubrics;
            else if (tabValue === "templates") tabRubrics = templateRubrics;

            return (
              <TabsContent key={tabValue} value={tabValue} className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {tabRubrics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No rubrics in this category</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Criteria</TableHead>
                            <TableHead>Total Points</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tabRubrics.map((rubric) => (
                            <TableRow key={rubric.id}>
                              <TableCell>
                                <button
                                  onClick={() => handlePreviewRubric(rubric)}
                                  className="font-medium hover:text-primary transition-colors text-left"
                                >
                                  {rubric.name}
                                </button>
                                {rubric.description && (
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {rubric.description}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{rubric.criteriaCount}</TableCell>
                              <TableCell>{rubric.totalPoints}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {rubric.isTemplate && (
                                    <Badge variant="secondary">Template</Badge>
                                  )}
                                  {rubric.isPublic && (
                                    <Badge variant="outline">Shared</Badge>
                                  )}
                                  {!rubric.isTemplate && !rubric.isPublic && (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {new Date(rubric.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handlePreviewRubric(rubric)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditRubric(rubric)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicateRubric(rubric)}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => openDeleteDialog(rubric)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Rubric Builder Dialog */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRubric ? "Edit Rubric" : "Create New Rubric"}
            </DialogTitle>
            <DialogDescription>
              {selectedRubric
                ? "Update the rubric details and criteria below"
                : "Define criteria and performance levels for consistent grading"}
            </DialogDescription>
          </DialogHeader>
          {loadingRubric ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <RubricBuilder
              rubric={selectedRubric}
              onSave={handleSaveRubric}
              onCancel={() => {
                setBuilderOpen(false);
                setSelectedRubric(null);
              }}
              saving={saving}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rubric Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rubric Preview</DialogTitle>
          </DialogHeader>
          {loadingRubric ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : selectedRubric ? (
            <RubricPreview rubric={selectedRubric} />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Rubric?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedRubric?.name}</span>?
              <br />
              <br />
              This action cannot be undone. If this rubric is linked to any
              assignments, they will no longer have a rubric attached.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRubric}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Rubric"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
