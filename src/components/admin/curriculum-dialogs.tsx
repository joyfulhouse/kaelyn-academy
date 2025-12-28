"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { colors } from "@/lib/colors";

// Subject Dialog
interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: {
    id: string;
    name: string;
    description?: string;
    iconName?: string;
    color?: string;
  };
  onSuccess: () => void;
}

const COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
];

const ICONS = [
  "Calculator",
  "BookOpen",
  "Microscope",
  "Landmark",
  "Laptop",
  "Palette",
  "Globe",
  "Atom",
  "Music",
  "PenTool",
];

export function SubjectDialog({
  open,
  onOpenChange,
  subject,
  onSuccess,
}: SubjectDialogProps) {
  const isEditing = !!subject;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(subject?.name || "");
  const [description, setDescription] = useState(subject?.description || "");
  const [iconName, setIconName] = useState(subject?.iconName || "BookOpen");
  const [color, setColor] = useState(subject?.color || "#3b82f6");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing
        ? { id: subject.id, name, description, iconName, color }
        : { name, description, iconName, color };

      const response = await fetch("/api/admin/curriculum/subjects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save subject");
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIconName("BookOpen");
    setColor("#3b82f6");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Subject" : "Create Subject"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the subject details below."
              : "Add a new subject to the curriculum."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Mathematics"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of the subject"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Icon</Label>
                <Select value={iconName} onValueChange={setIconName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: c.value }}
                          />
                          {c.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Unit Dialog
interface UnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: {
    id: string;
    title: string;
    description?: string;
    subjectId: string;
    gradeLevel: number;
    estimatedMinutes?: number;
    isPublished: boolean;
  };
  subjects: Array<{ id: string; name: string; color?: string }>;
  onSuccess: () => void;
}

const GRADE_LEVELS = [
  { value: 0, label: "Kindergarten" },
  { value: 1, label: "1st Grade" },
  { value: 2, label: "2nd Grade" },
  { value: 3, label: "3rd Grade" },
  { value: 4, label: "4th Grade" },
  { value: 5, label: "5th Grade" },
  { value: 6, label: "6th Grade" },
  { value: 7, label: "7th Grade" },
  { value: 8, label: "8th Grade" },
  { value: 9, label: "9th Grade" },
  { value: 10, label: "10th Grade" },
  { value: 11, label: "11th Grade" },
  { value: 12, label: "12th Grade" },
];

export function UnitDialog({
  open,
  onOpenChange,
  unit,
  subjects,
  onSuccess,
}: UnitDialogProps) {
  const isEditing = !!unit;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(unit?.title || "");
  const [description, setDescription] = useState(unit?.description || "");
  const [subjectId, setSubjectId] = useState(unit?.subjectId || "");
  const [gradeLevel, setGradeLevel] = useState(unit?.gradeLevel ?? 0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    unit?.estimatedMinutes?.toString() || ""
  );
  const [isPublished, setIsPublished] = useState(unit?.isPublished || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = isEditing ? "PUT" : "POST";
      const body = {
        ...(isEditing && { id: unit.id }),
        title,
        description,
        subjectId,
        gradeLevel,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        isPublished,
      };

      const response = await fetch("/api/admin/curriculum/units", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save unit");
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSubjectId("");
    setGradeLevel(0);
    setEstimatedMinutes("");
    setIsPublished(false);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Unit" : "Create Unit"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the unit details below."
              : "Add a new unit to a subject curriculum."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Addition"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What students will learn in this unit"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Select value={subjectId} onValueChange={setSubjectId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: subject.color || colors.neutral[500] }}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Grade Level</Label>
                <Select
                  value={gradeLevel.toString()}
                  onValueChange={(v) => setGradeLevel(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value.toString()}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimatedMinutes">Duration (minutes)</Label>
                <Input
                  id="estimatedMinutes"
                  type="number"
                  min="1"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  placeholder="e.g., 45"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="isPublished">Published</Label>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !subjectId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Lesson Dialog
interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson?: {
    id: string;
    title: string;
    description?: string;
    unitId: string;
    estimatedMinutes?: number;
    difficultyLevel?: number;
    isPublished: boolean;
    content?: {
      type: "text" | "video" | "interactive" | "quiz" | "game";
      body?: string;
    };
  };
  unitId: string;
  subjectName?: string;
  gradeLevel?: number;
  onSuccess: () => void;
}

export function LessonDialog({
  open,
  onOpenChange,
  lesson,
  unitId,
  subjectName = "General",
  gradeLevel = 5,
  onSuccess,
}: LessonDialogProps) {
  const isEditing = !!lesson;
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [contentType, setContentType] = useState<"text" | "video" | "interactive" | "quiz" | "game">(
    lesson?.content?.type || "text"
  );
  const [contentBody, setContentBody] = useState(lesson?.content?.body || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    lesson?.estimatedMinutes?.toString() || ""
  );
  const [difficultyLevel, setDifficultyLevel] = useState(lesson?.difficultyLevel || 1);
  const [isPublished, setIsPublished] = useState(lesson?.isPublished || false);

  const handleGenerateContent = async () => {
    if (!title.trim()) {
      setError("Please enter a title first");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject: subjectName,
          gradeLevel,
          description,
          difficultyLevel,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : 30,
          includeVisualization: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate content");
      }

      const { content } = await response.json();

      // Format generated content as markdown
      let markdown = `# ${content.title}\n\n`;
      markdown += `${content.introduction}\n\n`;

      if (content.concepts && content.concepts.length > 0) {
        markdown += "## Key Concepts\n\n";
        for (const concept of content.concepts) {
          markdown += `### ${concept.title}\n\n`;
          markdown += `${concept.explanation}\n\n`;
          if (concept.examples && concept.examples.length > 0) {
            markdown += "**Examples:**\n";
            for (const example of concept.examples) {
              markdown += `- ${example}\n`;
            }
            markdown += "\n";
          }
          if (concept.keyTerms && concept.keyTerms.length > 0) {
            markdown += "**Key Terms:**\n";
            for (const term of concept.keyTerms) {
              markdown += `- **${term.term}**: ${term.definition}\n`;
            }
            markdown += "\n";
          }
        }
      }

      if (content.summary) {
        markdown += "## Summary\n\n";
        markdown += `${content.summary}\n`;
      }

      setContentBody(markdown);
      setContentType("text");

      // Update description if empty
      if (!description && content.introduction) {
        const firstSentence = content.introduction.split(".")[0] + ".";
        setDescription(firstSentence);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = isEditing ? "PUT" : "POST";
      const body = {
        ...(isEditing && { id: lesson.id }),
        unitId: lesson?.unitId || unitId,
        title,
        description,
        content: {
          type: contentType,
          body: contentBody,
        },
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : undefined,
        difficultyLevel,
        isPublished,
      };

      const response = await fetch("/api/admin/curriculum/lessons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save lesson");
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContentType("text");
    setContentBody("");
    setEstimatedMinutes("");
    setDifficultyLevel(1);
    setIsPublished(false);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lesson" : "Create Lesson"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the lesson details below."
              : "Add a new lesson to the unit."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lesson-title">Title</Label>
              <Input
                id="lesson-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Adding Single Digits"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What students will learn in this lesson"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as typeof contentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Lesson</SelectItem>
                  <SelectItem value="video">Video Lesson</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content-body">Content (Markdown)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateContent}
                  disabled={generating || !title.trim()}
                  className="gap-1"
                >
                  {generating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {generating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                id="content-body"
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                placeholder="# Lesson Content&#10;&#10;Write your lesson content here using Markdown, or click 'Generate with AI' to create content automatically..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lesson-duration">Duration (min)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  min="1"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  placeholder="15"
                />
              </div>
              <div className="grid gap-2">
                <Label>Difficulty (1-5)</Label>
                <Select
                  value={difficultyLevel.toString()}
                  onValueChange={(v) => setDifficultyLevel(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level} - {["Beginner", "Easy", "Medium", "Hard", "Expert"][level - 1]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="lesson-published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="lesson-published">Published</Label>
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || generating}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
