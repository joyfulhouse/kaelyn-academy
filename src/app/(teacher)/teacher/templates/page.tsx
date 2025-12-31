"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  MoreVertical,
  Search,
  Filter,
  X,
  Loader2,
  AlertTriangle,
  Copy,
  Pencil,
  Trash2,
  Share2,
  Globe,
  User,
  Users,
  Clock,
  Target,
  BookOpen,
  ClipboardList,
  FileQuestion,
  Presentation,
  GraduationCap,
  Dumbbell,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  id: string;
  name: string;
  description: string | null;
  templateType: string;
  instructions: string | null;
  questions: string | null;
  defaultTimeLimit: number | null;
  defaultTotalPoints: number;
  defaultPassingScore: number;
  defaultAllowLateSubmissions: boolean;
  defaultMaxAttempts: number;
  isShared: boolean;
  isPublic: boolean;
  usageCount: number;
  tags: string[] | null;
  gradeLevel: number | null;
  isOwn: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateSummary {
  total: number;
  my: number;
  shared: number;
  public: number;
  byType: Record<string, number>;
}

interface TeacherClass {
  id: string;
  name: string;
  gradeLevel: number;
}

const TEMPLATE_TYPES = [
  { value: "homework", label: "Homework", icon: ClipboardList },
  { value: "quiz", label: "Quiz", icon: FileQuestion },
  { value: "project", label: "Project", icon: Presentation },
  { value: "exam", label: "Exam", icon: GraduationCap },
  { value: "practice", label: "Practice", icon: Dumbbell },
  { value: "worksheet", label: "Worksheet", icon: FileSpreadsheet },
];

function getTemplateIcon(type: string) {
  const templateType = TEMPLATE_TYPES.find((t) => t.value === type);
  return templateType?.icon || FileText;
}

function getGradeLevelLabel(level: number | null) {
  if (level === null) return "All Grades";
  if (level === 0) return "Kindergarten";
  return `Grade ${level}`;
}

function TemplatesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-10 w-96" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [summary, setSummary] = useState<TemplateSummary>({
    total: 0,
    my: 0,
    shared: 0,
    public: 0,
    byType: {},
  });
  const [classes, setClasses] = useState<TeacherClass[]>([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [ownershipFilter, setOwnershipFilter] = useState<"all" | "my" | "shared">("all");

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createAssignmentDialogOpen, setCreateAssignmentDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    templateType: "homework",
    instructions: "",
    defaultTotalPoints: "100",
    defaultPassingScore: "70",
    defaultMaxAttempts: "1",
    defaultTimeLimit: "",
    defaultAllowLateSubmissions: true,
    isShared: false,
    gradeLevel: "",
  });

  // Create assignment form state
  const [assignmentFormData, setAssignmentFormData] = useState({
    classId: "",
    title: "",
    dueDate: "",
    dueTime: "23:59",
  });

  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      templateType: "homework",
      instructions: "",
      defaultTotalPoints: "100",
      defaultPassingScore: "70",
      defaultMaxAttempts: "1",
      defaultTimeLimit: "",
      defaultAllowLateSubmissions: true,
      isShared: false,
      gradeLevel: "",
    });
  };

  const populateFormFromTemplate = (template: Template) => {
    setFormData({
      name: template.name,
      description: template.description || "",
      templateType: template.templateType,
      instructions: template.instructions || "",
      defaultTotalPoints: String(template.defaultTotalPoints),
      defaultPassingScore: String(template.defaultPassingScore),
      defaultMaxAttempts: String(template.defaultMaxAttempts),
      defaultTimeLimit: template.defaultTimeLimit ? String(template.defaultTimeLimit) : "",
      defaultAllowLateSubmissions: template.defaultAllowLateSubmissions,
      isShared: template.isShared,
      gradeLevel: template.gradeLevel !== null ? String(template.gradeLevel) : "",
    });
  };

  const fetchData = useCallback(async () => {
    try {
      const [templatesRes, classesRes] = await Promise.all([
        fetch("/api/teacher/templates"),
        fetch("/api/teacher/classes"),
      ]);

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
        setSummary(data.summary || {
          total: 0,
          my: 0,
          shared: 0,
          public: 0,
          byType: {},
        });
      }

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !t.name.toLowerCase().includes(query) &&
          !(t.description?.toLowerCase().includes(query)) &&
          !(t.instructions?.toLowerCase().includes(query))
        ) {
          return false;
        }
      }
      // Type filter
      if (typeFilter.length > 0 && !typeFilter.includes(t.templateType)) {
        return false;
      }
      // Ownership filter
      if (ownershipFilter === "my" && !t.isOwn) return false;
      if (ownershipFilter === "shared" && t.isOwn) return false;
      return true;
    });
  }, [templates, searchQuery, typeFilter, ownershipFilter]);

  const handleCreateTemplate = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/teacher/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          templateType: formData.templateType,
          instructions: formData.instructions || undefined,
          defaultTotalPoints: parseInt(formData.defaultTotalPoints, 10),
          defaultPassingScore: parseInt(formData.defaultPassingScore, 10),
          defaultMaxAttempts: parseInt(formData.defaultMaxAttempts, 10),
          defaultTimeLimit: formData.defaultTimeLimit
            ? parseInt(formData.defaultTimeLimit, 10)
            : null,
          defaultAllowLateSubmissions: formData.defaultAllowLateSubmissions,
          isShared: formData.isShared,
          gradeLevel: formData.gradeLevel
            ? parseInt(formData.gradeLevel, 10)
            : null,
        }),
      });

      if (response.ok) {
        await fetchData();
        setCreateDialogOpen(false);
        resetFormData();
      }
    } catch (error) {
      console.error("Failed to create template:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/teacher/templates/${selectedTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          templateType: formData.templateType,
          instructions: formData.instructions || null,
          defaultTotalPoints: parseInt(formData.defaultTotalPoints, 10),
          defaultPassingScore: parseInt(formData.defaultPassingScore, 10),
          defaultMaxAttempts: parseInt(formData.defaultMaxAttempts, 10),
          defaultTimeLimit: formData.defaultTimeLimit
            ? parseInt(formData.defaultTimeLimit, 10)
            : null,
          defaultAllowLateSubmissions: formData.defaultAllowLateSubmissions,
          isShared: formData.isShared,
          gradeLevel: formData.gradeLevel
            ? parseInt(formData.gradeLevel, 10)
            : null,
        }),
      });

      if (response.ok) {
        await fetchData();
        setEditDialogOpen(false);
        setSelectedTemplate(null);
        resetFormData();
      }
    } catch (error) {
      console.error("Failed to update template:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/teacher/templates/${selectedTemplate.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
        setDeleteDialogOpen(false);
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const response = await fetch("/api/teacher/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          templateType: template.templateType,
          instructions: template.instructions,
          defaultTotalPoints: template.defaultTotalPoints,
          defaultPassingScore: template.defaultPassingScore,
          defaultMaxAttempts: template.defaultMaxAttempts,
          defaultTimeLimit: template.defaultTimeLimit,
          defaultAllowLateSubmissions: template.defaultAllowLateSubmissions,
          isShared: false,
          gradeLevel: template.gradeLevel,
        }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to duplicate template:", error);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedTemplate || !assignmentFormData.classId) return;
    setSubmitting(true);
    try {
      let dueDateISO: string | undefined;
      if (assignmentFormData.dueDate) {
        dueDateISO = new Date(
          `${assignmentFormData.dueDate}T${assignmentFormData.dueTime || "23:59"}`
        ).toISOString();
      }

      const response = await fetch(
        `/api/teacher/templates/${selectedTemplate.id}/create-assignment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            classId: assignmentFormData.classId,
            title: assignmentFormData.title || undefined,
            dueDate: dueDateISO,
          }),
        }
      );

      if (response.ok) {
        await fetchData();
        setCreateAssignmentDialogOpen(false);
        setSelectedTemplate(null);
        setAssignmentFormData({
          classId: "",
          title: "",
          dueDate: "",
          dueTime: "23:59",
        });
      }
    } catch (error) {
      console.error("Failed to create assignment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (template: Template) => {
    setSelectedTemplate(template);
    populateFormFromTemplate(template);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (template: Template) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const openCreateAssignmentDialog = (template: Template) => {
    setSelectedTemplate(template);
    setAssignmentFormData({
      classId: "",
      title: template.name,
      dueDate: "",
      dueTime: "23:59",
    });
    setCreateAssignmentDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter([]);
    setOwnershipFilter("all");
  };

  const hasActiveFilters = searchQuery || typeFilter.length > 0 || ownershipFilter !== "all";

  if (loading) {
    return <TemplatesSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assignment Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable assignment templates
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            resetFormData();
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-info/10">
                <User className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.my}</div>
                <div className="text-xs text-muted-foreground">My Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.shared}</div>
                <div className="text-xs text-muted-foreground">Shared</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-warning/10">
                <Globe className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.public}</div>
                <div className="text-xs text-muted-foreground">Public</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Type
              {typeFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {typeFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            {TEMPLATE_TYPES.map((type) => (
              <DropdownMenuCheckboxItem
                key={type.value}
                checked={typeFilter.includes(type.value)}
                onCheckedChange={(checked) => {
                  setTypeFilter(
                    checked
                      ? [...typeFilter, type.value]
                      : typeFilter.filter((t) => t !== type.value)
                  );
                }}
              >
                {type.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={ownershipFilter} onValueChange={(v) => setOwnershipFilter(v as typeof ownershipFilter)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="my">
            My Templates ({filteredTemplates.filter((t) => t.isOwn).length})
          </TabsTrigger>
          <TabsTrigger value="shared">
            Shared ({filteredTemplates.filter((t) => !t.isOwn).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={ownershipFilter} className="mt-6">
          {filteredTemplates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-1">No Templates Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {ownershipFilter === "my"
                    ? "Create your first template to save time on assignments"
                    : "No templates match your search criteria"}
                </p>
                {ownershipFilter === "my" && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const Icon = getTemplateIcon(template.templateType);
                return (
                  <Card key={template.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {TEMPLATE_TYPES.find((t) => t.value === template.templateType)?.label || template.templateType}
                              </Badge>
                              {template.isShared && (
                                <Badge variant="secondary" className="text-xs">
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Shared
                                </Badge>
                              )}
                              {template.isPublic && (
                                <Badge variant="secondary" className="text-xs">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openCreateAssignmentDialog(template)}>
                              <ClipboardList className="h-4 w-4 mr-2" />
                              Create Assignment
                            </DropdownMenuItem>
                            {template.isOwn && (
                              <>
                                <DropdownMenuItem onClick={() => openEditDialog(template)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Template
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            {template.isOwn && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => openDeleteDialog(template)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {template.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {template.description}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {template.defaultTotalPoints} pts
                        </div>
                        {template.defaultTimeLimit && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {template.defaultTimeLimit} min
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {getGradeLevelLabel(template.gradeLevel)}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClipboardList className="h-3 w-3" />
                          Used {template.usageCount}x
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Template Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Template</DialogTitle>
            <DialogDescription>
              Create a reusable template to quickly generate assignments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekly Vocabulary Quiz"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateType">Type *</Label>
                <Select
                  value={formData.templateType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, templateType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this template..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Default instructions for assignments created from this template..."
                value={formData.instructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPoints">Total Points</Label>
                <Input
                  id="totalPoints"
                  type="number"
                  min="1"
                  value={formData.defaultTotalPoints}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultTotalPoints: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing %</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.defaultPassingScore}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultPassingScore: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Select
                  value={formData.defaultMaxAttempts}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, defaultMaxAttempts: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="10">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (min)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  placeholder="No limit"
                  value={formData.defaultTimeLimit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultTimeLimit: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Target Grade</Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gradeLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Grades</SelectItem>
                    <SelectItem value="0">Kindergarten</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        Grade {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label htmlFor="lateSubmissions">Allow Late Submissions</Label>
                <Switch
                  id="lateSubmissions"
                  checked={formData.defaultAllowLateSubmissions}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, defaultAllowLateSubmissions: checked }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <Label htmlFor="isShared">Share with organization</Label>
                <p className="text-xs text-muted-foreground">
                  Other teachers in your organization can use this template
                </p>
              </div>
              <Switch
                id="isShared"
                checked={formData.isShared}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isShared: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={submitting || !formData.name}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update your template settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Template Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-templateType">Type *</Label>
                <Select
                  value={formData.templateType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, templateType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructions">Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Total Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.defaultTotalPoints}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultTotalPoints: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Passing %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.defaultPassingScore}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultPassingScore: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Attempts</Label>
                <Select
                  value={formData.defaultMaxAttempts}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, defaultMaxAttempts: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="10">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Limit (min)</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="No limit"
                  value={formData.defaultTimeLimit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultTimeLimit: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Grade</Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gradeLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Grades</SelectItem>
                    <SelectItem value="0">Kindergarten</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={String(g)}>
                        Grade {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label>Allow Late Submissions</Label>
                <Switch
                  checked={formData.defaultAllowLateSubmissions}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, defaultAllowLateSubmissions: checked }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <Label>Share with organization</Label>
                <p className="text-xs text-muted-foreground">
                  Other teachers can use this template
                </p>
              </div>
              <Switch
                checked={formData.isShared}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isShared: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate} disabled={submitting || !formData.name}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Assignment from Template Dialog */}
      <Dialog open={createAssignmentDialogOpen} onOpenChange={setCreateAssignmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>
              Create an assignment from template: <strong>{selectedTemplate?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assignment-class">Class *</Label>
              {classes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No classes found.{" "}
                  <Link href="/teacher/classes/new" className="text-primary hover:underline">
                    Create a class
                  </Link>{" "}
                  first.
                </p>
              ) : (
                <Select
                  value={assignmentFormData.classId}
                  onValueChange={(value) =>
                    setAssignmentFormData((prev) => ({ ...prev, classId: value }))
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
            <div className="space-y-2">
              <Label htmlFor="assignment-title">Assignment Title</Label>
              <Input
                id="assignment-title"
                placeholder={selectedTemplate?.name}
                value={assignmentFormData.title}
                onChange={(e) =>
                  setAssignmentFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use template name
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-dueDate">Due Date</Label>
                <Input
                  id="assignment-dueDate"
                  type="date"
                  value={assignmentFormData.dueDate}
                  onChange={(e) =>
                    setAssignmentFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-dueTime">Due Time</Label>
                <Input
                  id="assignment-dueTime"
                  type="time"
                  value={assignmentFormData.dueTime}
                  onChange={(e) =>
                    setAssignmentFormData((prev) => ({ ...prev, dueTime: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAssignmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAssignment}
              disabled={submitting || !assignmentFormData.classId}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Assignment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Template?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedTemplate?.name}</span>?
              <br /><br />
              This action cannot be undone. Existing assignments created from this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Template"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
