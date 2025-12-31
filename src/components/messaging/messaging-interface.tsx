"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageCircle,
  Send,
  Plus,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Participant {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  isEdited?: boolean;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  readBy: Array<{ userId: string; readAt: string }>;
}

interface Conversation {
  id: string;
  subject: string;
  type: string;
  status: string;
  createdAt: string;
  lastMessageAt: string | null;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  participants: Participant[];
  learner: { id: string; name: string } | null;
}

interface MessagingInterfaceProps {
  userRole: "parent" | "teacher";
  userId: string;
  recipientOptions?: Array<{ id: string; name: string; role: string }>;
  learnerOptions?: Array<{ id: string; name: string }>;
}

export function MessagingInterface({
  userRole,
  userId,
  recipientOptions = [],
  learnerOptions = [],
}: MessagingInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newConvSubject, setNewConvSubject] = useState("");
  const [newConvRecipient, setNewConvRecipient] = useState("");
  const [newConvLearner, setNewConvLearner] = useState("");
  const [newConvType, setNewConvType] = useState("general");
  const [newConvMessage, setNewConvMessage] = useState("");
  const [creatingConv, setCreatingConv] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/messaging/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const response = await fetch(`/api/messaging/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/messaging/conversations/${selectedConversation}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        // Update conversation list
        fetchConversations();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  // Create new conversation
  const createConversation = async () => {
    if (!newConvSubject.trim() || !newConvRecipient || !newConvMessage.trim()) return;

    setCreatingConv(true);
    try {
      const response = await fetch("/api/messaging/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newConvSubject,
          recipientId: newConvRecipient,
          learnerId: newConvLearner || undefined,
          type: newConvType,
          initialMessage: newConvMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShowNewDialog(false);
        setNewConvSubject("");
        setNewConvRecipient("");
        setNewConvLearner("");
        setNewConvType("general");
        setNewConvMessage("");
        fetchConversations();
        setSelectedConversation(data.conversation.id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setCreatingConv(false);
    }
  };

  // Poll for new messages
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation);
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(interval);
    }
  }, [selectedConversation, fetchMessages]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter conversations by search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants.some((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Get other participant for display
  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.id !== userId) || conv.participants[0];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Conversation List */}
      <Card className={`w-full md:w-80 flex-shrink-0 flex flex-col ${selectedConversation ? "hidden md:flex" : "flex"}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Select value={newConvRecipient} onValueChange={setNewConvRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipientOptions.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} ({r.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {userRole === "teacher" && learnerOptions.length > 0 && (
                    <div className="space-y-2">
                      <Label>Regarding Student (optional)</Label>
                      <Select value={newConvLearner} onValueChange={setNewConvLearner}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {learnerOptions.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={newConvSubject}
                      onChange={(e) => setNewConvSubject(e.target.value)}
                      placeholder="Enter subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newConvType} onValueChange={setNewConvType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="progress_report">Progress Report</SelectItem>
                        <SelectItem value="behavior">Behavior</SelectItem>
                        <SelectItem value="scheduling">Scheduling</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={newConvMessage}
                      onChange={(e) => setNewConvMessage(e.target.value)}
                      placeholder="Write your message..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createConversation}
                    disabled={!newConvSubject || !newConvRecipient || !newConvMessage || creatingConv}
                  >
                    {creatingConv ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isSelected = selectedConversation === conv.id;

                  return (
                    <div
                      key={conv.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected ? "bg-accent" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={other?.image || undefined} />
                          <AvatarFallback>
                            {other?.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm truncate">{other?.name}</p>
                            {conv.lastMessageAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conv.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.subject}
                          </p>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 w-5 p-0 justify-center">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className={`flex-1 flex flex-col ${selectedConversation ? "flex" : "hidden md:flex"}`}>
        {selectedConversation && selectedConv ? (
          <>
            {/* Thread Header */}
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getOtherParticipant(selectedConv)?.image || undefined} />
                  <AvatarFallback>
                    {getOtherParticipant(selectedConv)?.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{getOtherParticipant(selectedConv)?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedConv.subject}</p>
                </div>
                {selectedConv.learner && (
                  <Badge variant="secondary">
                    Re: {selectedConv.learner.name}
                  </Badge>
                )}
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                {loadingMessages ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender.id === userId;
                      const isRead = msg.readBy.length > 0;

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                        >
                          {!isOwn && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={msg.sender.image || undefined} />
                              <AvatarFallback>
                                {msg.sender.name?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                            <div
                              className={`rounded-2xl p-3 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                                isOwn ? "justify-end" : ""
                              }`}
                            >
                              <span>{formatTime(msg.createdAt)}</span>
                              {isOwn && (
                                isRead ? (
                                  <CheckCheck className="h-3 w-3 text-primary" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Input */}
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="min-h-10 max-h-32 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button type="submit" disabled={!newMessage.trim() || sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose from your messages on the left</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
