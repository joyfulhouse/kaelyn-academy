"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Save,
  Loader2,
  MessageSquare,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AISettings {
  tutoring: {
    enabled: boolean;
    maxQuestionsPerDay: number;
    responseTimeout: number;
    defaultModel: string;
    temperature: number;
    maxTokens: number;
  };
  moderation: {
    enabled: boolean;
    level: "low" | "medium" | "high" | "strict";
    autoReject: boolean;
    flaggedCategories: string[];
  };
  prompts: {
    systemPrompt: string;
    welcomeMessage: string;
    errorMessage: string;
  };
  limits: {
    dailyTokenLimit: number;
    perUserTokenLimit: number;
    concurrentRequests: number;
  };
}

const defaultSettings: AISettings = {
  tutoring: {
    enabled: true,
    maxQuestionsPerDay: 50,
    responseTimeout: 30,
    defaultModel: "claude-3-5-sonnet-latest",
    temperature: 0.7,
    maxTokens: 2048,
  },
  moderation: {
    enabled: true,
    level: "medium",
    autoReject: false,
    flaggedCategories: ["violence", "adult", "hate"],
  },
  prompts: {
    systemPrompt:
      "You are a friendly and helpful educational AI tutor. Explain concepts in age-appropriate language.",
    welcomeMessage: "Hi! I'm your AI tutor. How can I help you learn today?",
    errorMessage: "I'm sorry, I couldn't process that request. Please try again.",
  },
  limits: {
    dailyTokenLimit: 1000000,
    perUserTokenLimit: 10000,
    concurrentRequests: 50,
  },
};

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<keyof AISettings>("tutoring");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/ai-settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch AI settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Failed to save AI settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Tutor Settings</h1>
          <p className="text-muted-foreground">
            Configure AI tutoring behavior, moderation, and usage limits.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection("tutoring")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeSection === "tutoring"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Bot className="h-4 w-4" />
                Tutoring
              </button>
              <button
                onClick={() => setActiveSection("moderation")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeSection === "moderation"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Shield className="h-4 w-4" />
                Moderation
              </button>
              <button
                onClick={() => setActiveSection("prompts")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeSection === "prompts"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Prompts
              </button>
              <button
                onClick={() => setActiveSection("limits")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeSection === "limits"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Zap className="h-4 w-4" />
                Limits
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === "tutoring" && (
            <Card>
              <CardHeader>
                <CardTitle>Tutoring Configuration</CardTitle>
                <CardDescription>
                  Configure AI tutor behavior and response settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable AI Tutoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow students to interact with the AI tutor
                    </p>
                  </div>
                  <Switch
                    checked={settings.tutoring.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        tutoring: { ...settings.tutoring, enabled: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Model</Label>
                  <Select
                    value={settings.tutoring.defaultModel}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        tutoring: { ...settings.tutoring, defaultModel: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="claude-3-opus-latest">Claude 3 Opus</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Questions Per Day: {settings.tutoring.maxQuestionsPerDay}</Label>
                  <Slider
                    value={[settings.tutoring.maxQuestionsPerDay]}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        tutoring: { ...settings.tutoring, maxQuestionsPerDay: value[0] },
                      })
                    }
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Temperature: {settings.tutoring.temperature}</Label>
                  <Slider
                    value={[settings.tutoring.temperature * 100]}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        tutoring: { ...settings.tutoring, temperature: value[0] / 100 },
                      })
                    }
                    max={100}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower = more focused, Higher = more creative
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Response Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={settings.tutoring.responseTimeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          tutoring: {
                            ...settings.tutoring,
                            responseTimeout: parseInt(e.target.value) || 30,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={settings.tutoring.maxTokens}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          tutoring: {
                            ...settings.tutoring,
                            maxTokens: parseInt(e.target.value) || 2048,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "moderation" && (
            <Card>
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>
                  Configure AI content filtering and moderation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Content Moderation</Label>
                    <p className="text-sm text-muted-foreground">
                      Filter AI responses for inappropriate content
                    </p>
                  </div>
                  <Switch
                    checked={settings.moderation.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        moderation: { ...settings.moderation, enabled: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Moderation Level</Label>
                  <Select
                    value={settings.moderation.level}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        moderation: {
                          ...settings.moderation,
                          level: value as AISettings["moderation"]["level"],
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minimal filtering</SelectItem>
                      <SelectItem value="medium">Medium - Standard (Recommended)</SelectItem>
                      <SelectItem value="high">High - Strict filtering</SelectItem>
                      <SelectItem value="strict">Strict - Maximum safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Reject Flagged Content</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically reject responses that trigger moderation
                    </p>
                  </div>
                  <Switch
                    checked={settings.moderation.autoReject}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        moderation: { ...settings.moderation, autoReject: checked },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "prompts" && (
            <Card>
              <CardHeader>
                <CardTitle>System Prompts</CardTitle>
                <CardDescription>
                  Configure the AI tutor's personality and responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>System Prompt</Label>
                  <Textarea
                    value={settings.prompts.systemPrompt}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        prompts: { ...settings.prompts, systemPrompt: e.target.value },
                      })
                    }
                    rows={4}
                    placeholder="Define the AI tutor's behavior and personality..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Welcome Message</Label>
                  <Textarea
                    value={settings.prompts.welcomeMessage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        prompts: { ...settings.prompts, welcomeMessage: e.target.value },
                      })
                    }
                    rows={2}
                    placeholder="Initial greeting for students..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Error Message</Label>
                  <Textarea
                    value={settings.prompts.errorMessage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        prompts: { ...settings.prompts, errorMessage: e.target.value },
                      })
                    }
                    rows={2}
                    placeholder="Message shown when an error occurs..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "limits" && (
            <Card>
              <CardHeader>
                <CardTitle>Usage Limits</CardTitle>
                <CardDescription>
                  Configure token and request limits for AI usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Daily Token Limit</Label>
                    <Input
                      type="number"
                      value={settings.limits.dailyTokenLimit}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          limits: {
                            ...settings.limits,
                            dailyTokenLimit: parseInt(e.target.value) || 1000000,
                          },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Platform-wide daily limit
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Per-User Token Limit</Label>
                    <Input
                      type="number"
                      value={settings.limits.perUserTokenLimit}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          limits: {
                            ...settings.limits,
                            perUserTokenLimit: parseInt(e.target.value) || 10000,
                          },
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Daily limit per user
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Concurrent Requests</Label>
                  <Input
                    type="number"
                    value={settings.limits.concurrentRequests}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        limits: {
                          ...settings.limits,
                          concurrentRequests: parseInt(e.target.value) || 50,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum simultaneous AI requests
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
