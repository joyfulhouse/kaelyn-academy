"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SystemSettings {
  general: {
    siteName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    registrationOpen: boolean;
  };
  learning: {
    defaultDifficulty: number;
    adaptiveDifficultyEnabled: boolean;
    lessonTimeLimit: number;
    maxDailyLessons: number;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    parentDigestFrequency: "daily" | "weekly" | "monthly";
    achievementAlerts: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireStrongPasswords: boolean;
    twoFactorRequired: boolean;
  };
  ai: {
    aiTutoringEnabled: boolean;
    maxQuestionsPerDay: number;
    contentModerationLevel: "low" | "medium" | "high";
    responseTimeout: number;
  };
}

const defaultSettings: SystemSettings = {
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
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<keyof SystemSettings>("general");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const tabs: { key: keyof SystemSettings; label: string; icon: string }[] = [
    { key: "general", label: "General", icon: "⚙️" },
    { key: "learning", label: "Learning", icon: "📚" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "security", label: "Security", icon: "🔒" },
    { key: "ai", label: "AI Settings", icon: "🤖" },
  ];

  const updateSetting = <K extends keyof SystemSettings>(
    category: K,
    key: keyof SystemSettings[K],
    value: SystemSettings[K][keyof SystemSettings[K]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  return (
    <main id="main-content" className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure platform-wide settings and preferences.
        </p>
      </div>

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
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
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
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Disable access for non-admin users</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting("general", "maintenanceMode", !settings.general.maintenanceMode)
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.general.maintenanceMode ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={settings.general.maintenanceMode}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.general.maintenanceMode ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Open Registration</Label>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting("general", "registrationOpen", !settings.general.registrationOpen)
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.general.registrationOpen ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={settings.general.registrationOpen}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
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
                    className="w-full px-3 py-2 border rounded-md"
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
                    <p className="text-sm text-gray-500">Auto-adjust difficulty based on performance</p>
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
                      settings.learning.adaptiveDifficultyEnabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={settings.learning.adaptiveDifficultyEnabled}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
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
                    className="w-full px-3 py-2 border rounded-md"
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
                    className="w-full px-3 py-2 border rounded-md"
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
                    <p className="text-sm text-gray-500">Send email notifications to users</p>
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
                      settings.notifications.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={settings.notifications.emailNotifications}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.notifications.emailNotifications ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Send push notifications to devices</p>
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
                      settings.notifications.pushNotifications ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={settings.notifications.pushNotifications}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
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
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
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
                    className="w-full px-3 py-2 border rounded-md"
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
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Strong Passwords</Label>
                    <p className="text-sm text-gray-500">Enforce password complexity rules</p>
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
                      settings.security.requireStrongPasswords ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={settings.security.requireStrongPasswords}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        settings.security.requireStrongPasswords ? "translate-x-7" : "translate-x-1"
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
                    <p className="text-sm text-gray-500">Enable AI-powered tutoring features</p>
                  </div>
                  <button
                    onClick={() =>
                      updateSetting("ai", "aiTutoringEnabled", !settings.ai.aiTutoringEnabled)
                    }
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.ai.aiTutoringEnabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={settings.ai.aiTutoringEnabled}
                  >
                    <span
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
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
                    className="w-full px-3 py-2 border rounded-md"
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
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low - Basic filtering</option>
                    <option value="medium">Medium - Standard filtering</option>
                    <option value="high">High - Strict filtering</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
