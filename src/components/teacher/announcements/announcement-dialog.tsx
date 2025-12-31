"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Megaphone, Save, Send } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  announcement?: Announcement | null; // null/undefined for create, object for edit
  onSuccess: () => void;
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  classId,
  className,
  announcement,
  onSuccess,
}: AnnouncementDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!announcement;

  // Reset form when dialog opens/closes or announcement changes
  useEffect(() => {
    if (open) {
      if (announcement) {
        setTitle(announcement.title);
        setContent(announcement.content);
        setPriority(announcement.priority);
      } else {
        setTitle("");
        setContent("");
        setPriority("normal");
      }
      setError(null);
    }
  }, [open, announcement]);

  const handleSubmit = async (publishNow: boolean) => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/teacher/classes/${classId}/announcements/${announcement.id}`
        : `/api/teacher/classes/${classId}/announcements`;

      const method = isEditing ? "PATCH" : "POST";

      const body = isEditing
        ? {
            title: title.trim(),
            content: content.trim(),
            priority,
            ...(publishNow && !announcement.publishedAt ? { publish: true } : {}),
          }
        : {
            title: title.trim(),
            content: content.trim(),
            priority,
            publishNow,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error ?? "Failed to save announcement");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityDescription = (p: string) => {
    switch (p) {
      case "normal":
        return "Standard announcement";
      case "important":
        return "Highlighted for attention";
      case "urgent":
        return "Critical - immediate attention required";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            {isEditing ? "Edit Announcement" : "New Announcement"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update announcement for ${className}`
              : `Create an announcement for ${className}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Announcement title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your announcement here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Normal
                  </div>
                </SelectItem>
                <SelectItem value="important">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    Important
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    Urgent
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getPriorityDescription(priority)}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isEditing && announcement?.publishedAt ? "Update" : "Publish Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
