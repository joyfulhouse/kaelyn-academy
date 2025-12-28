"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import {
  SubjectDialog,
  UnitDialog,
  LessonDialog,
  DeleteDialog,
} from "@/components/admin/curriculum-dialogs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Subject {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconName?: string;
  color?: string;
  unitsCount: number;
  lessonsCount: number;
  isPublished: boolean;
}

interface Unit {
  id: string;
  title: string;
  slug: string;
  description?: string;
  subjectId: string;
  gradeLevel: number;
  lessonsCount: number;
  isPublished: boolean;
  estimatedMinutes?: number;
}

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description?: string;
  unitId: string;
  estimatedMinutes?: number;
  difficultyLevel?: number;
  isPublished: boolean;
  content?: {
    type: "text" | "video" | "interactive" | "quiz" | "game";
    body?: string;
  };
}

interface CurriculumData {
  subjects: Subject[];
  units: Unit[];
  stats: {
    totalSubjects: number;
    totalUnits: number;
    totalLessons: number;
    publishedUnits: number;
  };
}

export default function AdminCurriculumPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"subjects" | "units" | "lessons">("subjects");
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<CurriculumData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  // Dialog states
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>();
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>();
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "subject" | "unit" | "lesson";
    id: string;
    name: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedSubject) params.set("subjectId", selectedSubject);

      const response = await fetch(`/api/admin/curriculum?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch curriculum data");
      }

      const curriculumData = await response.json();
      setData(curriculumData);
    } catch (err) {
      console.error("Failed to fetch curriculum:", err);
      setError(err instanceof Error ? err.message : "Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSubject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search - use a ref to avoid infinite loops
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    if (!initialLoadDoneRef.current) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchData]);

  useEffect(() => {
    if (data) {
      initialLoadDoneRef.current = true;
    }
  }, [data]);

  // Fetch lessons when a unit is selected
  const fetchLessons = useCallback(async (unitId: string) => {
    setLessonsLoading(true);
    try {
      const response = await fetch(`/api/admin/curriculum/lessons?unitId=${unitId}`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      }
    } catch (err) {
      console.error("Failed to fetch lessons:", err);
    } finally {
      setLessonsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      fetchLessons(selectedUnit);
    }
  }, [selectedUnit, fetchLessons]);

  // Dialog handlers
  const handleCreateSubject = () => {
    setEditingSubject(undefined);
    setSubjectDialogOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectDialogOpen(true);
  };

  const handleCreateUnit = () => {
    setEditingUnit(undefined);
    setUnitDialogOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitDialogOpen(true);
  };

  const handleCreateLesson = () => {
    setEditingLesson(undefined);
    setLessonDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonDialogOpen(true);
  };

  const handleDelete = (type: "subject" | "unit" | "lesson", id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const endpoints = {
      subject: "/api/admin/curriculum/subjects",
      unit: "/api/admin/curriculum/units",
      lesson: "/api/admin/curriculum/lessons",
    };

    const response = await fetch(`${endpoints[deleteTarget.type]}?id=${deleteTarget.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      if (deleteTarget.type === "lesson" && selectedUnit) {
        fetchLessons(selectedUnit);
      } else {
        fetchData();
      }
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Curriculum Management</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjects = data?.subjects || [];
  const units = data?.units || [];
  const stats = data?.stats || { totalSubjects: 0, totalUnits: 0, totalLessons: 0, publishedUnits: 0 };

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnits = units.filter((u) =>
    (!selectedSubject || u.subjectId === selectedSubject) &&
    u.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedSubjects = subjects.filter((s) => s.isPublished).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Curriculum Management</h1>
          <p className="text-muted-foreground mt-1">Manage subjects, units, and lessons</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCreateSubject}>
              New Subject
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCreateUnit}>
              New Unit
            </DropdownMenuItem>
            {selectedUnit && (
              <DropdownMenuItem onClick={handleCreateLesson}>
                New Lesson
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.totalSubjects}</div>
            <div className="text-sm text-muted-foreground">Subjects</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.totalUnits}</div>
            <div className="text-sm text-muted-foreground">Units</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{stats.totalLessons}</div>
            <div className="text-sm text-muted-foreground">Total Lessons</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-info">{publishedSubjects}/{stats.totalSubjects}</div>
            <div className="text-sm text-muted-foreground">Published</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              {(["subjects", "units", "lessons"] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
            <div className="flex-1">
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === "subjects" && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Core subject areas in the curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No subjects found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedSubject(subject.id);
                      setActiveTab("units");
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: subject.color || "#6b7280" }}
                      >
                        {subject.name[0]}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        subject.isPublished
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {subject.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{subject.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {subject.unitsCount} units • {subject.lessonsCount} lessons
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubject(subject);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete("subject", subject.id, subject.name);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {/* Add New Subject Card */}
                <button
                  type="button"
                  onClick={handleCreateSubject}
                  className="p-4 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center text-muted-foreground hover:text-primary min-h-[180px]"
                >
                  <Plus className="h-8 w-8 mb-2" />
                  <div className="font-medium">Add Subject</div>
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "units" && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Units</CardTitle>
                <CardDescription>
                  {selectedSubject
                    ? `Showing units for ${subjects.find((s) => s.id === selectedSubject)?.name}`
                    : "All units across subjects"}
                </CardDescription>
              </div>
              {selectedSubject && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedSubject(null)}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredUnits.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No units found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground text-sm">Unit</th>
                      <th className="pb-3 font-medium text-muted-foreground text-sm">Subject</th>
                      <th className="pb-3 font-medium text-muted-foreground text-sm">Grade</th>
                      <th className="pb-3 font-medium text-muted-foreground text-sm">Lessons</th>
                      <th className="pb-3 font-medium text-muted-foreground text-sm">Status</th>
                      <th className="pb-3 font-medium text-muted-foreground text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map((unit) => {
                      const subject = subjects.find((s) => s.id === unit.subjectId);
                      return (
                        <tr key={unit.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                          <td className="py-4 font-medium text-foreground">{unit.title}</td>
                          <td className="py-4">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: subject?.color || "#6b7280" }}
                            >
                              {subject?.name || "Unknown"}
                            </span>
                          </td>
                          <td className="py-4 text-muted-foreground">
                            {unit.gradeLevel === 0 ? "K" : `Grade ${unit.gradeLevel}`}
                          </td>
                          <td className="py-4 text-muted-foreground">{unit.lessonsCount}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              unit.isPublished
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {unit.isPublished ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUnit(unit)}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUnit(unit.id);
                                  setActiveTab("lessons");
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Lessons
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete("unit", unit.id, unit.title)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "lessons" && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Lessons</CardTitle>
                <CardDescription>
                  {selectedUnit
                    ? `Lessons in ${units.find((u) => u.id === selectedUnit)?.title}`
                    : "Select a unit to view lessons"}
                </CardDescription>
              </div>
              {selectedUnit && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedUnit(null)}>
                    Clear Selection
                  </Button>
                  <Button size="sm" onClick={handleCreateLesson}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Lesson
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedUnit ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">📚</div>
                <p>Select a unit to view its lessons</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("units")}>
                  Browse Units
                </Button>
              </div>
            ) : lessonsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">📝</div>
                <p>No lessons in this unit yet</p>
                <Button className="mt-4" onClick={handleCreateLesson}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create First Lesson
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{lesson.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {lesson.estimatedMinutes && (
                            <span>{lesson.estimatedMinutes} min</span>
                          )}
                          {lesson.difficultyLevel && (
                            <span>Difficulty: {lesson.difficultyLevel}/5</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            lesson.isPublished
                              ? "bg-success/20 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {lesson.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLesson(lesson)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete("lesson", lesson.id, lesson.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <SubjectDialog
        open={subjectDialogOpen}
        onOpenChange={setSubjectDialogOpen}
        subject={editingSubject}
        onSuccess={fetchData}
      />

      <UnitDialog
        open={unitDialogOpen}
        onOpenChange={setUnitDialogOpen}
        unit={editingUnit}
        subjects={subjects}
        onSuccess={fetchData}
      />

      {selectedUnit && (
        <LessonDialog
          open={lessonDialogOpen}
          onOpenChange={setLessonDialogOpen}
          lesson={editingLesson}
          unitId={selectedUnit}
          subjectName={
            subjects.find(
              (s) => s.id === units.find((u) => u.id === selectedUnit)?.subjectId
            )?.name
          }
          gradeLevel={units.find((u) => u.id === selectedUnit)?.gradeLevel}
          onSuccess={() => fetchLessons(selectedUnit)}
        />
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`Delete ${deleteTarget?.type || "item"}?`}
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
