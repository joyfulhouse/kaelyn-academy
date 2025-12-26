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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/theme-provider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Learner {
  id: string;
  name: string;
  gradeLevel: number;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface TutorResponse {
  response: string;
  suggestedActivity?: string;
  difficultyAdjustment?: number;
  confidence?: number;
  encouragement?: string;
  conversationId?: string;
}

export default function AITutorPage() {
  const { status } = useSession();
  useTheme(); // Apply theme
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your AI tutor. I'm here to help you learn and understand any topic. What would you like to learn about today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("general");
  const [learner, setLearner] = useState<Learner | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    } catch (error) {
      console.error("Failed to fetch learner:", error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLearner();
    }
  }, [status, fetchLearner]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      // Build conversation history from messages (excluding welcome)
      const conversationHistory: ConversationMessage[] = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Map subject to topic name for better context
      const subjectLabels: Record<string, string> = {
        math: "Mathematics",
        reading: "Reading & Language Arts",
        science: "Science",
        history: "History & Social Studies",
        general: "General Learning",
      };

      const response = await fetch("/api/agents/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerName: learner?.name || "Student",
          gradeLevel: learner?.gradeLevel ?? 5,
          subject: subjectLabels[subject] || subject,
          topic: subjectLabels[subject] || "General",
          conceptName: currentInput.slice(0, 100),
          studentMessage: currentInput,
          conversationHistory,
          conversationId,
          provider: "anthropic",
          tier: "balanced",
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data: TutorResponse = await response.json();

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      let responseContent = data.response;

      if (data.encouragement) {
        responseContent = `${data.encouragement}\n\n${responseContent}`;
      }

      if (data.suggestedActivity) {
        responseContent += `\n\n**Suggested Activity:**\n${data.suggestedActivity}`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't process your question. Please try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Tutor
          </h1>
          <p className="text-muted-foreground text-sm">
            Ask questions and get personalized explanations
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
                {s.label}
              </Button>
            );
          })}
        </div>
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
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
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
                    return <p key={i}>{line}</p>;
                  })}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
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

          {loading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-bl-sm p-4">
                <div className="flex gap-1.5 items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
            <Lightbulb className="h-3 w-3" />
            Tip: Select a subject above to get more focused help
          </p>
        </div>
      </Card>

      {/* Quick Questions */}
      <Card className="mt-4">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex flex-wrap gap-2">
            {[
              "Help me understand fractions",
              "What causes rain?",
              "Explain photosynthesis",
              "How do I solve word problems?",
              "What are the parts of speech?",
            ].map((question) => (
              <Badge
                key={question}
                variant="secondary"
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => setInput(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
