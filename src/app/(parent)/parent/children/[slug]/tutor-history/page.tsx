"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Calendar,
  Clock,
  MessageSquare,
  ChevronRight,
  Search,
  RefreshCw,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  TutorConversationWithLearner,
  TutorMessage,
  ParentConversationListResponse,
  ParentConversationDetailResponse,
} from "@/types/tutor";

interface ChildInfo {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export default function TutorHistoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const [conversations, setConversations] = useState<TutorConversationWithLearner[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<TutorConversationWithLearner | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<TutorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch child info from existing API
  const fetchChildInfo = useCallback(async () => {
    try {
      const response = await fetch("/api/parent/children");
      if (!response.ok) throw new Error("Failed to fetch children");
      const data = await response.json();
      const child = data.children?.find((c: { slug: string; id: string; name: string; avatarUrl: string | null }) =>
        c.slug === slug || c.name.toLowerCase().replace(/ /g, "-") === slug.toLowerCase()
      );
      if (child) {
        setChildInfo({ id: child.id, name: child.name, avatarUrl: child.avatarUrl });
      }
      return child?.id;
    } catch (err) {
      console.error("Error fetching child info:", err);
      return null;
    }
  }, [slug]);

  // Fetch conversations
  const fetchConversations = useCallback(async (childId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/parent/children/${childId}/tutor-conversations`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data: ParentConversationListResponse = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const childId = await fetchChildInfo();
      if (childId) {
        await fetchConversations(childId);
      } else {
        setError("Child not found");
        setIsLoading(false);
      }
    };
    init();
  }, [fetchChildInfo, fetchConversations]);

  // Fetch conversation detail
  const openConversation = async (conv: TutorConversationWithLearner) => {
    if (!childInfo) return;
    setSelectedConversation(conv);
    setDialogOpen(true);
    setIsLoadingDetail(true);

    try {
      const response = await fetch(
        `/api/parent/children/${childInfo.id}/tutor-conversations/${conv.id}`
      );
      if (!response.ok) throw new Error("Failed to load conversation");
      const data: ParentConversationDetailResponse = await response.json();
      setSelectedMessages(data.messages);
    } catch (err) {
      console.error("Error loading conversation:", err);
      setSelectedMessages([]);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (conv.topic?.toLowerCase().includes(query)) ||
      (conv.summary?.toLowerCase().includes(query))
    );
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDuration = (start: Date, end: Date | null) => {
    if (!end) return "Ongoing";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/parent/children/${slug}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {childInfo && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={childInfo.avatarUrl ?? undefined} />
                <AvatarFallback>{getInitials(childInfo.name)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-2xl font-bold">AI Tutor History</h1>
              <p className="text-muted-foreground">
                Review {childInfo?.name}&apos;s conversations with the AI tutor
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => childInfo && fetchConversations(childInfo.id)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations by topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* COPPA Notice */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                AI Tutor Conversation Monitoring
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                As part of our COPPA compliance, you can review all AI tutor interactions
                with your child. Conversations are monitored for age-appropriate content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation List */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "No conversations match your search"
                : "No AI tutor conversations yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <Card
              key={conv.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => openConversation(conv)}
            >
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {conv.topic || "General Conversation"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(conv.startedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(conv.startedAt, conv.endedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {conv.messageCount} messages
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={conv.status === "active" ? "default" : "secondary"}>
                      {conv.status}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                {conv.summary && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 ml-14">
                    {conv.summary}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conversation Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {selectedConversation?.topic || "Conversation Detail"}
            </DialogTitle>
            <DialogDescription>
              {selectedConversation && formatDate(selectedConversation.startedAt)}
              {selectedConversation?.endedAt && (
                <> • Duration: {formatDuration(selectedConversation.startedAt, selectedConversation.endedAt)}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[50vh] pr-4">
            {isLoadingDetail ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-16 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {selectedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`flex-1 p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
