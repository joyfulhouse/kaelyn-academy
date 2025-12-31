"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Bot,
  User,
  Send,
  Calculator,
  BookOpen,
  Microscope,
  Landmark,
  Lightbulb,
  Sparkles,
  Loader2,
  Copy,
  Check,
  History,
  Plus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/theme-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { TutorConversation, TutorMessage } from "@/types/tutor";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  feedback?: "helpful" | "not_helpful" | null;
}

interface Learner {
  id: string;
  name: string;
  gradeLevel: number;
}

interface ConversationListItem {
  id: string;
  topic: string | null;
  status: string;
  startedAt: Date;
  updatedAt: Date;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi there! I'm your AI tutor. I'm here to help you learn and understand any topic. What would you like to learn about today?",
  timestamp: new Date(),
};

const subjects = [
  { id: "math", label: "Math", icon: Calculator },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "science", label: "Science", icon: Microscope },
  { id: "history", label: "History", icon: Landmark },
  { id: "general", label: "General", icon: Lightbulb },
] as const;

type SubjectId = (typeof subjects)[number]["id"];

function getSubjectLabel(subjectId: SubjectId): string {
  const labels: Record<SubjectId, string> = {
    math: "Mathematics",
    reading: "Reading & Language Arts",
    science: "Science",
    history: "History & Social Studies",
    general: "General Learning",
  };
  return labels[subjectId];
}

export default function AITutorPage() {
  const { status } = useSession();
  useTheme();

  // State
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState<SubjectId>("general");
  const [learner, setLearner] = useState<Learner | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Conversation management
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick questions
  const [quickQuestions, setQuickQuestions] = useState<string[]>([
    "Help me understand fractions",
    "What causes rain?",
    "Explain photosynthesis",
    "How do I solve word problems?",
    "What are the parts of speech?",
  ]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch learner profile
  const fetchLearner = useCallback(async () => {
    try {
      const response = await fetch("/api/learners");
      if (response.ok) {
        const result = await response.json();
        const learners = result.learners as Learner[];
        if (learners && learners.length > 0) {
          setLearner(learners[0]);
        }
      }
    } catch {
      // Continue without learner data
    }
  }, []);

  // Fetch conversations from database
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const response = await fetch("/api/learner/tutor/conversations?pageSize=50");
      if (response.ok) {
        const data = await response.json();
        setConversations(
          data.conversations.map((c: TutorConversation) => ({
            id: c.id,
            topic: c.topic,
            status: c.status,
            startedAt: new Date(c.startedAt),
            updatedAt: new Date(c.updatedAt),
          }))
        );
      }
    } catch {
      console.error("Failed to fetch conversations");
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Load a specific conversation
  const loadConversation = useCallback(async (convId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/learner/tutor/conversations/${convId}`);
      if (response.ok) {
        const data = await response.json();
        const conv = data.conversation;

        // Transform messages
        const loadedMessages: Message[] = conv.messages.map((m: TutorMessage) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
          feedback: m.metadata?.feedback,
        }));

        setMessages([WELCOME_MESSAGE, ...loadedMessages]);
        setCurrentConversationId(convId);
        setSidebarOpen(false);
      }
    } catch {
      console.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    const assistantId = `assistant-${Date.now() + 1}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/learner/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: userMessage,
          topic: getSubjectLabel(subject),
          provider: "anthropic",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      // Get conversation ID from header
      const newConversationId = response.headers.get("X-Conversation-Id");
      if (newConversationId && !currentConversationId) {
        setCurrentConversationId(newConversationId);
        // Refresh conversation list
        fetchConversations();
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedText = "";
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // First chunk contains metadata
        if (isFirstChunk && chunk.startsWith("data: ")) {
          isFirstChunk = false;
          const lines = chunk.split("\n\n");
          // Skip the metadata line
          if (lines.length > 1) {
            accumulatedText += lines.slice(1).join("");
          }
        } else {
          accumulatedText += chunk;
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulatedText } : m
          )
        );
      }

      // Update message with final ID if we got one
      if (newConversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, id: `db-${newConversationId}-${Date.now()}` }
              : m
          )
        );
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }

      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "I'm sorry, I couldn't process your question. Please try again!",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMessages([WELCOME_MESSAGE]);
    setCurrentConversationId(null);
    setIsLoading(false);
  }, []);

  // End current conversation
  const endConversation = async () => {
    if (!currentConversationId) return;

    try {
      await fetch(`/api/learner/tutor/conversations/${currentConversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: null }),
      });

      // Refresh conversations
      fetchConversations();
      startNewConversation();
    } catch {
      console.error("Failed to end conversation");
    }
  };

  // Copy message to clipboard
  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Fetch curriculum-based questions
  const fetchQuestions = useCallback(async (subj: SubjectId, grade: number) => {
    try {
      const response = await fetch(
        `/api/curriculum/questions?subject=${subj}&gradeLevel=${grade}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setQuickQuestions(data.questions);
        }
      }
    } catch {
      // Keep default questions
    }
  }, []);

  // Effects
  useEffect(() => {
    if (status === "authenticated") {
      fetchLearner();
      fetchConversations();
    }
  }, [status, fetchLearner, fetchConversations]);

  useEffect(() => {
    const gradeLevel = learner?.gradeLevel ?? 5;
    fetchQuestions(subject, gradeLevel);
  }, [subject, learner?.gradeLevel, fetchQuestions]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle for mobile */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <History className="h-4 w-4" />
                  <span className="sr-only">Conversation history</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Conversation History</SheetTitle>
                </SheetHeader>
                <ConversationList
                  conversations={conversations}
                  currentId={currentConversationId}
                  onSelect={loadConversation}
                  isLoading={isLoadingConversations}
                />
              </SheetContent>
            </Sheet>

            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                AI Tutor
              </h1>
              <p className="text-muted-foreground text-sm">
                Ask questions and get personalized explanations
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={startNewConversation}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            {subjects.map((s) => {
              const Icon = s.icon;
              return (
                <Button
                  key={s.id}
                  variant={subject === s.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSubject(s.id)}
                  className="gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{s.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Sidebar - Desktop */}
          <div className="hidden md:flex flex-col w-64 flex-shrink-0">
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startNewConversation}
                    title="New conversation"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 overflow-y-auto max-h-[calc(100vh-20rem)]">
                <ConversationList
                  conversations={conversations}
                  currentId={currentConversationId}
                  onSelect={loadConversation}
                  isLoading={isLoadingConversations}
                />
              </CardContent>
            </Card>
          </div>

          {/* Chat Container */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                  role="article"
                  aria-label={`${message.role === "user" ? "Your" : "AI Tutor"} message`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.role === "assistant"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }
                    >
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <User className="h-4 w-4" aria-hidden="true" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`group relative max-w-[80%] rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content.split("\n").map((line, i) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={i} className="font-bold mt-2">
                              {line.replace(/\*\*/g, "")}
                            </p>
                          );
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <p key={i} className="ml-4">
                              {`\u2022 ${line.substring(2)}`}
                            </p>
                          );
                        }
                        if (line.match(/^\d+\./)) {
                          return (
                            <p key={i} className="ml-4">
                              {line}
                            </p>
                          );
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>

                    {/* Message actions */}
                    {message.id !== "welcome" && message.role === "assistant" && (
                      <div className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-background"
                              onClick={() =>
                                copyToClipboard(message.content, message.id)
                              }
                              aria-label="Copy message"
                            >
                              {copiedId === message.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedId === message.id ? "Copied!" : "Copy message"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 bg-background ${
                                message.feedback === "helpful"
                                  ? "text-green-500"
                                  : ""
                              }`}
                              aria-label="Helpful"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Helpful</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 bg-background ${
                                message.feedback === "not_helpful"
                                  ? "text-red-500"
                                  : ""
                              }`}
                              aria-label="Not helpful"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Not helpful</TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    {/* Copy button for user messages */}
                    {message.id !== "welcome" && message.role === "user" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-foreground/20 hover:bg-primary-foreground/40"
                            onClick={() =>
                              copyToClipboard(message.content, message.id)
                            }
                            aria-label="Copy message"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copiedId === message.id ? "Copied!" : "Copy message"}
                        </TooltipContent>
                      </Tooltip>
                    )}

                    <div
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading &&
                messages[messages.length - 1]?.content === "" && (
                  <div
                    className="flex gap-3"
                    role="status"
                    aria-label="AI is thinking"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-sm p-4">
                      <div className="flex gap-1.5 items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="border-t p-4 bg-background">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1"
                  aria-label="Message input"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="gap-2"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </Button>
              </form>

              {/* Current conversation actions */}
              {currentConversationId && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Conversation saved
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchConversations()}
                      className="h-6 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-destructive hover:text-destructive"
                        >
                          End Chat
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>End this conversation?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will close the current conversation. You can still
                            view it in your history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={endConversation}>
                            End Chat
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}

              {!currentConversationId && (
                <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                  <Lightbulb className="h-3 w-3" aria-hidden="true" />
                  Tip: Select a subject above to get more focused help
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Questions */}
        <Card className="mt-4">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div
              className="flex flex-wrap gap-2"
              role="list"
              aria-label="Suggested questions"
            >
              {quickQuestions.map((question) => (
                <Badge
                  key={question}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setInput(question)}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setInput(question);
                    }
                  }}
                >
                  {question}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// Conversation List Component
function ConversationList({
  conversations,
  currentId,
  onSelect,
  isLoading,
}: {
  conversations: ConversationListItem[];
  currentId: string | null;
  onSelect: (convId: string) => void;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No conversations yet</p>
        <p className="text-xs">Start chatting to save history</p>
      </div>
    );
  }

  const getConversationIcon = (topic: string | null) => {
    if (!topic) return MessageSquare;
    const topicLower = topic.toLowerCase();
    if (topicLower.includes("math")) return Calculator;
    if (topicLower.includes("reading") || topicLower.includes("language"))
      return BookOpen;
    if (topicLower.includes("science")) return Microscope;
    if (topicLower.includes("history") || topicLower.includes("social"))
      return Landmark;
    return Lightbulb;
  };

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const Icon = getConversationIcon(conv.topic);
        const isActive = currentId === conv.id;
        const isCompleted = conv.status === "completed";

        return (
          <div
            key={conv.id}
            className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
              isActive ? "bg-accent" : "hover:bg-muted"
            } ${isCompleted ? "opacity-70" : ""}`}
            onClick={() => onSelect(conv.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelect(conv.id);
              }
            }}
            aria-label={`Load conversation: ${conv.topic || "Untitled"}`}
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                {conv.topic || "New conversation"}
              </p>
              <p className="text-xs text-muted-foreground">
                {conv.updatedAt.toLocaleDateString()}
              </p>
            </div>
            {isCompleted && (
              <Badge variant="outline" className="text-xs">
                Ended
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
