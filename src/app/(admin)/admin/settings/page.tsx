"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import type { SystemSettingsData } from "@/lib/db/schema/settings";

const defaultSettings: SystemSettingsData = {
  general: {
    siteName: "Kaelyn's Academy",
    supportEmail: "support@kaelyns.academy",
    maintenanceMode: false,
    registrationOpen: true,
  },
  learning: {
    defaultDifficulty: 3,
    adaptiveDifficultyEnabled: true,
    lessonTimeLimit: 45,
    maxDailyLessons: 10,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    parentDigestFrequency: "weekly",
    achievementAlerts: true,
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireStrongPasswords: true,
    twoFactorRequired: false,
  },
  ai: {
    aiTutoringEnabled: true,
    maxQuestionsPerDay: 50,
    contentModerationLevel: "medium",
    responseTimeout: 30,
  },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettingsData>(defaultSettings);
  const [activeTab, setActiveTab] = useState<keyof SystemSettingsData>("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        } else {
          setError("Failed to load settings");
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save settings");
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { key: keyof SystemSettingsData; label: string; icon: string }[] = [
    { key: "general", label: "General", icon: "⚙️" },
    { key: "learning", label: "Learning", icon: "📚" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "security", label: "Security", icon: "🔒" },
    { key: "ai", label: "AI Settings", icon: "🤖" },
  ];

  const updateSetting = <K extends keyof SystemSettingsData>(
    category: K,
    key: keyof SystemSettingsData[K],
    value: SystemSettingsData[K][keyof SystemSettingsData[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <main className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main id="main-content" className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure platform-wide settings and preferences.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1" aria-label="Settings categories">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
                aria-current={activeTab === tab.key ? "page" : undefined}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <input
                    id="siteName"
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting("general", "siteName", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable access for non-admin users</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting("general", "maintenanceMode", !settings.general.maintenanceMode)
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.general.maintenanceMode ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.general.maintenanceMode}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.general.maintenanceMode ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Open Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting("general", "registrationOpen", !settings.general.registrationOpen)
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.general.registrationOpen ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.general.registrationOpen}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.general.registrationOpen ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "learning" && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Settings</CardTitle>
                <CardDescription>Configure learning experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultDifficulty">Default Difficulty Level</Label>
                  <select
                    id="defaultDifficulty"
                    value={settings.learning.defaultDifficulty}
                    onChange={(e) =>
                      updateSetting("learning", "defaultDifficulty", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value={1}>Beginner</option>
                    <option value={2}>Easy</option>
                    <option value={3}>Medium</option>
                    <option value={4}>Hard</option>
                    <option value={5}>Expert</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Adaptive Difficulty</Label>
                    <p className="text-sm text-muted-foreground">Auto-adjust difficulty based on performance</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting(
                        "learning",
                        "adaptiveDifficultyEnabled",
                        !settings.learning.adaptiveDifficultyEnabled
                      )
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.learning.adaptiveDifficultyEnabled ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.learning.adaptiveDifficultyEnabled}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.learning.adaptiveDifficultyEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonTimeLimit">Lesson Time Limit (minutes)</Label>
                  <input
                    id="lessonTimeLimit"
                    type="number"
                    min={10}
                    max={120}
                    value={settings.learning.lessonTimeLimit}
                    onChange={(e) =>
                      updateSetting("learning", "lessonTimeLimit", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDailyLessons">Max Daily Lessons</Label>
                  <input
                    id="maxDailyLessons"
                    type="number"
                    min={1}
                    max={50}
                    value={settings.learning.maxDailyLessons}
                    onChange={(e) =>
                      updateSetting("learning", "maxDailyLessons", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting(
                        "notifications",
                        "emailNotifications",
                        !settings.notifications.emailNotifications
                      )
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.notifications.emailNotifications ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.notifications.emailNotifications}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.notifications.emailNotifications ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send push notifications to devices</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting(
                        "notifications",
                        "pushNotifications",
                        !settings.notifications.pushNotifications
                      )
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.notifications.pushNotifications ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.notifications.pushNotifications}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.notifications.pushNotifications ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentDigest">Parent Digest Frequency</Label>
                  <select
                    id="parentDigest"
                    value={settings.notifications.parentDigestFrequency}
                    onChange={(e) =>
                      updateSetting(
                        "notifications",
                        "parentDigestFrequency",
                        e.target.value as "daily" | "weekly" | "monthly"
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Achievement Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify parents of child achievements</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting(
                        "notifications",
                        "achievementAlerts",
                        !settings.notifications.achievementAlerts
                      )
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.notifications.achievementAlerts ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.notifications.achievementAlerts}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.notifications.achievementAlerts ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <input
                    id="sessionTimeout"
                    type="number"
                    min={5}
                    max={1440}
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      updateSetting("security", "sessionTimeout", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <input
                    id="maxLoginAttempts"
                    type="number"
                    min={3}
                    max={10}
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      updateSetting("security", "maxLoginAttempts", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Strong Passwords</Label>
                    <p className="text-sm text-muted-foreground">Enforce password complexity rules</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting(
                        "security",
                        "requireStrongPasswords",
                        !settings.security.requireStrongPasswords
                      )
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.security.requireStrongPasswords ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.security.requireStrongPasswords}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.security.requireStrongPasswords ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication Required</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting(
                        "security",
                        "twoFactorRequired",
                        !settings.security.twoFactorRequired
                      )
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.security.twoFactorRequired ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.security.twoFactorRequired}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.security.twoFactorRequired ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "ai" && (
            <Card>
              <CardHeader>
                <CardTitle>AI Settings</CardTitle>
                <CardDescription>Configure AI tutor behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI Tutoring</Label>
                    <p className="text-sm text-muted-foreground">Enable AI-powered tutoring features</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting("ai", "aiTutoringEnabled", !settings.ai.aiTutoringEnabled)
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.ai.aiTutoringEnabled ? "bg-primary" : "bg-muted"
                    }`}
                    role="switch"
                    aria-checked={settings.ai.aiTutoringEnabled}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        settings.ai.aiTutoringEnabled ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxQuestions">Max Questions Per Day (per user)</Label>
                  <input
                    id="maxQuestions"
                    type="number"
                    min={10}
                    max={500}
                    value={settings.ai.maxQuestionsPerDay}
                    onChange={(e) =>
                      updateSetting("ai", "maxQuestionsPerDay", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moderation">Content Moderation Level</Label>
                  <select
                    id="moderation"
                    value={settings.ai.contentModerationLevel}
                    onChange={(e) =>
                      updateSetting(
                        "ai",
                        "contentModerationLevel",
                        e.target.value as "low" | "medium" | "high"
                      )
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="low">Low - Basic filtering</option>
                    <option value="medium">Medium - Standard filtering</option>
                    <option value="high">High - Strict filtering</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responseTimeout">Response Timeout (seconds)</Label>
                  <input
                    id="responseTimeout"
                    type="number"
                    min={10}
                    max={120}
                    value={settings.ai.responseTimeout}
                    onChange={(e) =>
                      updateSetting("ai", "responseTimeout", Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="mt-6 flex items-center justify-end gap-4">
            {saveStatus === "success" && (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Saved successfully
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
