"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  User,
  Bell,
  Palette,
  Volume2,
  Moon,
  Sun,
  Monitor,
  Save,
  Camera,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvatarPicker, getAvatarById } from "@/components/ui/avatar-picker";

interface SettingsData {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large" | "extra-large";
  soundEnabled: boolean;
  soundVolume: number;
  notifications: {
    achievements: boolean;
    reminders: boolean;
    messages: boolean;
  };
  accessibility: {
    readAloud: boolean;
  };
  displayName: string;
  avatarUrl: string | null;
  avatarId: string | null;
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [hasChanges, setHasChanges] = useState(false);

  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([70]);
  const [notifyAchievements, setNotifyAchievements] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [fontSize, setFontSize] = useState("medium");
  const [readAloud, setReadAloud] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/learner/settings");
        if (response.ok) {
          const data = await response.json();
          const settings: SettingsData = data.settings;

          // Apply fetched settings
          if (settings.theme) setTheme(settings.theme);
          setFontSize(settings.fontSize);
          setSoundEnabled(settings.soundEnabled);
          setSoundVolume([settings.soundVolume]);
          setNotifyAchievements(settings.notifications.achievements);
          setNotifyReminders(settings.notifications.reminders);
          setNotifyMessages(settings.notifications.messages);
          setReadAloud(settings.accessibility.readAloud);
          setDisplayName(settings.displayName);
          setAvatarUrl(settings.avatarUrl);
          setAvatarId(settings.avatarId);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
        setMounted(true);
      }
    }
    fetchSettings();
  }, [setTheme]);

  // Track changes
  const markChanged = useCallback(() => {
    setHasChanges(true);
    setSaveStatus("idle");
  }, []);

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const response = await fetch("/api/learner/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          fontSize,
          soundEnabled,
          soundVolume: soundVolume[0],
          notifications: {
            achievements: notifyAchievements,
            reminders: notifyReminders,
            messages: notifyMessages,
          },
          accessibility: {
            readAloud,
          },
          displayName,
          avatarId,
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
        setHasChanges(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your learning experience
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600">Failed to save</span>
          )}
          <Button
            className="gap-2"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="sound" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Sound
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Choose an avatar to represent you
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                {avatarId ? (
                  <AvatarFallback
                    className={`text-4xl ${getAvatarById(avatarId)?.color || "bg-primary/10"}`}
                  >
                    {getAvatarById(avatarId)?.emoji}
                  </AvatarFallback>
                ) : avatarUrl ? (
                  <AvatarImage src={avatarUrl} />
                ) : (
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {displayName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2">
                <AvatarPicker
                  currentAvatar={avatarId}
                  displayName={displayName}
                  onSelect={(id) => {
                    setAvatarId(id);
                    markChanged();
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Choose from our fun avatar collection
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Name</CardTitle>
              <CardDescription>
                This is how you appear to teachers and classmates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    markChanged();
                  }}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose how you want the app to look
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {mounted ? (
                  <>
                    <button
                      onClick={() => {
                        setTheme("light");
                        markChanged();
                      }}
                      className={`p-4 rounded-lg border-2 transition-colors relative ${
                        theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {theme === "light" && (
                        <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                      )}
                      <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-sm font-medium">Light</p>
                    </button>
                    <button
                      onClick={() => {
                        setTheme("dark");
                        markChanged();
                      }}
                      className={`p-4 rounded-lg border-2 transition-colors relative ${
                        theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {theme === "dark" && (
                        <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                      )}
                      <Moon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium">Dark</p>
                    </button>
                    <button
                      onClick={() => {
                        setTheme("system");
                        markChanged();
                      }}
                      className={`p-4 rounded-lg border-2 transition-colors relative ${
                        theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {theme === "system" && (
                        <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                      )}
                      <Monitor className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">System</p>
                      {theme === "system" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ({resolvedTheme})
                        </p>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="col-span-3 h-24 bg-muted animate-pulse rounded-lg" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Text Size</CardTitle>
              <CardDescription>
                Adjust the size of text throughout the app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={fontSize} onValueChange={(val) => {
                setFontSize(val);
                markChanged();
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium (Default)</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Achievement Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you earn badges or complete goals
                  </p>
                </div>
                <Switch
                  checked={notifyAchievements}
                  onCheckedChange={(val) => {
                    setNotifyAchievements(val);
                    markChanged();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Study Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders to keep your streak going
                  </p>
                </div>
                <Switch
                  checked={notifyReminders}
                  onCheckedChange={(val) => {
                    setNotifyReminders(val);
                    markChanged();
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new messages from teachers
                  </p>
                </div>
                <Switch
                  checked={notifyMessages}
                  onCheckedChange={(val) => {
                    setNotifyMessages(val);
                    markChanged();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sound Settings */}
        <TabsContent value="sound" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sound Effects</CardTitle>
              <CardDescription>
                Control sounds for achievements and feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for achievements, correct answers, and more
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={(val) => {
                    setSoundEnabled(val);
                    markChanged();
                  }}
                />
              </div>

              {soundEnabled && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Volume</Label>
                    <span className="text-sm text-muted-foreground">{soundVolume[0]}%</span>
                  </div>
                  <Slider
                    value={soundVolume}
                    onValueChange={(val) => {
                      setSoundVolume(val);
                      markChanged();
                    }}
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>
                Settings to make learning easier for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Read Aloud</Label>
                  <p className="text-sm text-muted-foreground">
                    Have lesson text read out loud to you
                  </p>
                </div>
                <Switch
                  checked={readAloud}
                  onCheckedChange={(val) => {
                    setReadAloud(val);
                    markChanged();
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      )}
    </div>
  );
}
