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
  Trash2,
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Learner {
  id: string;
  name: string;
  gradeLevel: number;
}

interface Conversation {
  id: string;
  title: string;
  subject: string;
  createdAt: Date;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

export default function AITutorPage() {
  const { status } = useSession();
  useTheme();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! I'm your AI tutor. I'm here to help you learn and understand any topic. What would you like to learn about today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("general");
  const [learner, setLearner] = useState<Learner | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState<string[]>([
    "Help me understand fractions",
    "What causes rain?",
    "Explain photosynthesis",
    "How do I solve word problems?",
    "What are the parts of speech?",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  function getSubjectLabel(subjectId: string): string {
    const labels: Record<string, string> = {
      math: "Mathematics",
      reading: "Reading & Language Arts",
      science: "Science",
      history: "History & Social Studies",
      general: "General Learning",
    };
    return labels[subjectId] || subjectId;
  }

  // Stream a message from the API
  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/agents/tutor/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerName: learner?.name || "Student",
          gradeLevel: learner?.gradeLevel ?? 5,
          subject: getSubjectLabel(subject),
          conceptName: subject,
          message: userMessage,
          conversationHistory,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Plain text stream from toTextStreamResponse
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulatedText } : m
          )
        );
      }

      // Save to conversation history
      if (currentConversationId) {
        updateConversation(currentConversationId, {
          content: accumulatedText,
        });
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // Request was cancelled
        return;
      }

      // Update the assistant message with error
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

  // Fetch curriculum-based questions
  const fetchQuestions = useCallback(async (subj: string, grade: number) => {
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

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tutor-conversations");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(
          parsed.map((c: Conversation) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          }))
        );
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("tutor-conversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLearner();
    }
  }, [status, fetchLearner]);

  useEffect(() => {
    const gradeLevel = learner?.gradeLevel ?? 5;
    fetchQuestions(subject, gradeLevel);
  }, [subject, learner?.gradeLevel, fetchQuestions]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
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

  const startNewConversation = () => {
    // Save current conversation if it has messages beyond welcome
    if (messages.length > 1 && !currentConversationId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: messages[1]?.content.slice(0, 50) + "..." || "New conversation",
        subject,
        createdAt: new Date(),
        messages: messages
          .filter((m) => m.id !== "welcome")
          .map((m) => ({
            role: m.role,
            content: m.content,
          })),
      };
      setConversations((prev) => [newConv, ...prev].slice(0, 20));
    }

    // Reset chat
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi there! I'm your AI tutor. I'm here to help you learn and understand any topic. What would you like to learn about today?",
      },
    ]);
    setCurrentConversationId(null);
  };

  const loadConversation = (conv: Conversation) => {
    setCurrentConversationId(conv.id);
    setSubject(conv.subject);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi there! I'm your AI tutor. I'm here to help you learn and understand any topic. What would you like to learn about today?",
      },
      ...conv.messages.map((m, i) => ({
        id: `hist-${i}`,
        role: m.role,
        content: m.content,
      })),
    ]);
    setSidebarOpen(false);
  };

  const updateConversation = (id: string, newMessage: { content: string }) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [
                ...c.messages,
                { role: "assistant" as const, content: newMessage.content },
              ],
            }
          : c
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      startNewConversation();
    }
  };

  const subjects = [
    { id: "math", label: "Math", icon: Calculator },
    { id: "reading", label: "Reading", icon: BookOpen },
    { id: "science", label: "Science", icon: Microscope },
    { id: "history", label: "History", icon: Landmark },
    { id: "general", label: "General", icon: Lightbulb },
  ];

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
                  onDelete={deleteConversation}
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
                  onDelete={deleteConversation}
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
                              • {line.substring(2)}
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

                    {/* Copy button */}
                    {message.id !== "welcome" && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
                              message.role === "user"
                                ? "bg-primary-foreground/20 hover:bg-primary-foreground/40"
                                : "bg-background"
                            }`}
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
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
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
              <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                <Lightbulb className="h-3 w-3" aria-hidden="true" />
                Tip: Select a subject above to get more focused help
              </p>
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
  onDelete,
}: {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (conv: Conversation) => void;
  onDelete: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No conversations yet</p>
        <p className="text-xs">Start chatting to save history</p>
      </div>
    );
  }

  const subjectIcons: Record<string, typeof Calculator> = {
    math: Calculator,
    reading: BookOpen,
    science: Microscope,
    history: Landmark,
    general: Lightbulb,
  };

  return (
    <div className="space-y-1">
      {conversations.map((conv) => {
        const Icon = subjectIcons[conv.subject] || Lightbulb;
        const isActive = currentId === conv.id;

        return (
          <div
            key={conv.id}
            className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
              isActive ? "bg-accent" : "hover:bg-muted"
            }`}
            onClick={() => onSelect(conv)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelect(conv);
              }
            }}
            aria-label={`Load conversation: ${conv.title}`}
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{conv.title}</p>
              <p className="text-xs text-muted-foreground">
                {conv.createdAt.toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              aria-label="Delete conversation"
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
