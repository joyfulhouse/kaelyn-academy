"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreVertical,
  Megaphone,
  Edit,
  Trash2,
  Send,
  FileText,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { AnnouncementDialog } from "./announcement-dialog";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementsListProps {
  classId: string;
  className: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "urgent":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Urgent
        </Badge>
      );
    case "important":
      return (
        <Badge className="bg-warning text-warning-foreground gap-1">
          <AlertTriangle className="h-3 w-3" />
          Important
        </Badge>
      );
    default:
      return null;
  }
}

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-8 w-8" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AnnouncementsList({ classId, className }: AnnouncementsListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.set("status", filter);
      }
      const response = await fetch(
        `/api/teacher/classes/${classId}/announcements?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const data = await response.json();
      setAnnouncements(data.announcements);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [classId, filter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setDialogOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/teacher/classes/${classId}/announcements/${deletingId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete announcement");
      fetchAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await fetch(
        `/api/teacher/classes/${classId}/announcements/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publish: true }),
        }
      );
      if (!response.ok) throw new Error("Failed to publish announcement");
      fetchAnnouncements();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    }
  };

  const handleDialogSuccess = () => {
    fetchAnnouncements();
  };

  // Filter announcements based on current filter
  const filteredAnnouncements = announcements.filter((a) => {
    if (filter === "published") return a.publishedAt !== null;
    if (filter === "draft") return a.publishedAt === null;
    return true;
  });

  const publishedCount = announcements.filter((a) => a.publishedAt !== null).length;
  const draftCount = announcements.filter((a) => a.publishedAt === null).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </h3>
          <p className="text-sm text-muted-foreground">
            Post announcements to students in this class
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({announcements.length})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedCount})
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts ({draftCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <AnnouncementsSkeleton />
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No announcements yet</p>
              <p className="text-sm">
                {filter === "draft"
                  ? "You have no draft announcements"
                  : filter === "published"
                  ? "You haven't published any announcements"
                  : "Create your first announcement to keep students informed"}
              </p>
              {filter === "all" && (
                <Button onClick={handleCreate} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Announcement
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((announcement) => (
            <Card
              key={announcement.id}
              className={announcement.publishedAt === null ? "border-dashed" : ""}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{announcement.title}</h4>
                      {getPriorityBadge(announcement.priority)}
                      {announcement.publishedAt === null && (
                        <Badge variant="outline" className="gap-1">
                          <FileText className="h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {announcement.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {announcement.publishedAt
                        ? `Published ${formatRelativeTime(announcement.publishedAt)}`
                        : `Created ${formatRelativeTime(announcement.createdAt)}`}
                      {announcement.updatedAt !== announcement.createdAt && " (edited)"}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {announcement.publishedAt === null && (
                        <DropdownMenuItem onClick={() => handlePublish(announcement.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Publish Now
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(announcement.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        classId={classId}
        className={className}
        announcement={editingAnnouncement}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
