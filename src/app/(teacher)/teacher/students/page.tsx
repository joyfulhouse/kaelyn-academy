"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Users,
  GraduationCap,
  FileSpreadsheet,
  MessageSquare,
  Eye,
  BarChart3,
  Phone,
  X,
  StickyNote,
  Plus,
  Loader2,
  Pin,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
  gradeLevel: number;
  classId: string;
  className: string;
  progress: number;
  mastery: number;
  streak: number;
  trend: "up" | "down" | "stable";
  status: "excelling" | "on-track" | "needs-attention" | "struggling";
  lastActive: string | null;
}

interface ClassInfo {
  id: string;
  name: string;
}

interface Summary {
  total: number;
  excelling: number;
  struggling: number;
  avgProgress: number;
}

interface StudentNote {
  id: string;
  title: string | null;
  content: string;
  category: string;
  isPinned: boolean;
  isPrivate: boolean;
  createdAt: string;
  teacherName: string | null;
  isOwner: boolean;
}

function StudentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case "excelling":
      return <Badge className="bg-success">Excelling</Badge>;
    case "struggling":
      return <Badge variant="destructive">Struggling</Badge>;
    case "needs-attention":
      return <Badge className="bg-warning">Needs Attention</Badge>;
    default:
      return <Badge variant="secondary">On Track</Badge>;
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-success" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    default:
      return <span className="text-muted-foreground">—</span>;
  }
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatGradeLevel(grade: number): string {
  if (grade === 0) return "K";
  return String(grade);
}

export default function TeacherStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    excelling: 0,
    struggling: 0,
    avgProgress: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Message dialog
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<Student | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sending, setSending] = useState(false);

  // Notes dialog
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesStudent, setNotesStudent] = useState<Student | null>(null);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState("general");
  const [savingNote, setSavingNote] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setClasses(data.classes || []);
        setSummary(data.summary || {
          total: 0,
          excelling: 0,
          struggling: 0,
          avgProgress: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === "all" || student.classId === classFilter;
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = ["Name", "Class", "Grade", "Progress", "Mastery", "Streak", "Status", "Last Active"];
    const rows = filteredStudents.map((s) => [
      s.name,
      s.className,
      `Grade ${formatGradeLevel(s.gradeLevel)}`,
      `${s.progress}%`,
      `${s.mastery}%`,
      `${s.streak} days`,
      s.status,
      s.lastActive ? new Date(s.lastActive).toLocaleDateString() : "Never",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleSendMessage = async () => {
    if (!messageRecipient || !messageContent.trim()) return;
    setSending(true);

    try {
      // In a real app, this would send a notification to the parent
      // For now, we'll just simulate the action
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessageDialogOpen(false);
      setMessageRecipient(null);
      setMessageContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const openMessageDialog = (student: Student) => {
    setMessageRecipient(student);
    setMessageDialogOpen(true);
  };

  // Notes functions
  const fetchNotes = useCallback(async (learnerId: string) => {
    setNotesLoading(true);
    try {
      const response = await fetch(`/api/teacher/notes?learnerId=${learnerId}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  const openNotesDialog = (student: Student) => {
    setNotesStudent(student);
    setNotesDialogOpen(true);
    fetchNotes(student.id);
  };

  const handleAddNote = async () => {
    if (!notesStudent || !newNoteContent.trim()) return;
    setSavingNote(true);

    try {
      const response = await fetch("/api/teacher/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId: notesStudent.id,
          content: newNoteContent,
          category: newNoteCategory,
        }),
      });

      if (response.ok) {
        setNewNoteContent("");
        setNewNoteCategory("general");
        fetchNotes(notesStudent.id);
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/teacher/notes?id=${noteId}`, {
        method: "DELETE",
      });

      if (response.ok && notesStudent) {
        fetchNotes(notesStudent.id);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const response = await fetch("/api/teacher/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: noteId,
          isPinned: !currentPinned,
        }),
      });

      if (response.ok && notesStudent) {
        fetchNotes(notesStudent.id);
      }
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-info";
      case "behavioral":
        return "bg-warning";
      case "communication":
        return "bg-success";
      case "goals":
        return "bg-primary";
      default:
        return "bg-muted-foreground";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setClassFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery || classFilter !== "all" || statusFilter !== "all";

  if (loading) {
    return <StudentsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-xs text-muted-foreground">Total Students</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.excelling}</div>
                <div className="text-xs text-muted-foreground">Excelling</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.struggling}</div>
                <div className="text-xs text-muted-foreground">Need Help</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{summary.avgProgress}%</div>
                <div className="text-xs text-muted-foreground">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="excelling">Excelling</SelectItem>
            <SelectItem value="on-track">On Track</SelectItem>
            <SelectItem value="needs-attention">Needs Attention</SelectItem>
            <SelectItem value="struggling">Struggling</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Empty state */}
      {students.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No Students Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Students will appear here once they enroll in your classes
            </p>
            <Button asChild variant="outline">
              <Link href="/teacher/classes">Manage Classes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-1">No Students Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Students Table */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Mastery</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={`${student.id}-${student.classId}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Grade {formatGradeLevel(student.gradeLevel)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{student.className}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="h-2 w-16" />
                        <span className="text-sm">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.mastery}%</TableCell>
                    <TableCell>
                      {student.streak > 0 ? (
                        <span className="text-warning">{student.streak}d</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getTrendIcon(student.trend)}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimeAgo(student.lastActive)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/students?id=${student.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/students?id=${student.id}&tab=progress`}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Progress
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openNotesDialog(student)}>
                            <StickyNote className="h-4 w-4 mr-2" />
                            View Notes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openMessageDialog(student)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message to Parent
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openMessageDialog(student)}>
                            <Phone className="h-4 w-4 mr-2" />
                            Contact Parent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Parent</DialogTitle>
            <DialogDescription>
              Send a message to {messageRecipient?.name}&apos;s parent or guardian.
              They will receive a notification in their parent dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={messageRecipient?.avatarUrl || undefined} />
                  <AvatarFallback>
                    {messageRecipient?.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{messageRecipient?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {messageRecipient?.className}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageContent.trim() || sending}>
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Notes for {notesStudent?.name}
            </DialogTitle>
            <DialogDescription>
              Private notes about this student. Only you can see your notes.
            </DialogDescription>
          </DialogHeader>

          {/* Add New Note */}
          <div className="space-y-3 border-b pb-4">
            <div className="flex gap-2">
              <Select value={newNoteCategory} onValueChange={setNewNoteCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Add a new note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim() || savingNote}
              className="gap-2"
            >
              {savingNote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add Note
            </Button>
          </div>

          {/* Notes List */}
          <div className="space-y-3 mt-4">
            {notesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notes yet</p>
                <p className="text-sm">Add your first note above</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg border ${
                    note.isPinned ? "border-warning bg-warning/10" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getCategoryColor(note.category)}`}
                      />
                      <span className="text-xs text-muted-foreground capitalize">
                        {note.category}
                      </span>
                      {note.isPinned && (
                        <Pin className="h-3 w-3 text-warning" />
                      )}
                      {!note.isOwner && (
                        <Badge variant="outline" className="text-xs">
                          {note.teacherName}
                        </Badge>
                      )}
                    </div>
                    {note.isOwner && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleTogglePin(note.id, note.isPinned)}
                        >
                          <Pin className={`h-4 w-4 ${note.isPinned ? "text-warning" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
