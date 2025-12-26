"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Clock,
  Eye,
  Bell,
  Lock,
  Settings,
  Save,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for children
const children = [
  { id: "1", name: "Emma Johnson", gradeLevel: 3 },
  { id: "2", name: "Liam Johnson", gradeLevel: 5 },
];

export default function ParentalControlsPage() {
  const [selectedChild, setSelectedChild] = useState(children[0].id);
  const [saving, setSaving] = useState(false);

  // Control settings state
  const [controls, setControls] = useState({
    // Time limits
    dailyLimitEnabled: true,
    dailyLimit: 60, // minutes
    weekendLimit: 90,
    breakReminders: true,
    breakInterval: 30, // minutes

    // Content filtering
    contentFilterLevel: "strict",
    blockExternalLinks: true,
    requireApprovalForNew: false,

    // Notifications
    dailySummary: true,
    progressAlerts: true,
    achievementAlerts: true,
    inactivityAlerts: true,
    inactivityThreshold: 3, // days

    // Privacy
    shareProgressWithTeacher: true,
    showOnClassLeaderboard: true,
    allowMessagesFromTeacher: true,
  });

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const currentChild = children.find((c) => c.id === selectedChild);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/parent/children"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Children
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Parental Controls
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage safety settings and screen time limits
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Child Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="shrink-0">Select Child:</Label>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name} (Grade {child.gradeLevel})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="time" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time">Time Limits</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Time Limits */}
        <TabsContent value="time" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Screen Time
              </CardTitle>
              <CardDescription>
                Set limits on how long {currentChild?.name} can use the platform each day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Daily Limit</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically pause learning when limit is reached
                  </p>
                </div>
                <Switch
                  checked={controls.dailyLimitEnabled}
                  onCheckedChange={(checked) =>
                    setControls((prev) => ({ ...prev, dailyLimitEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Weekday Limit</Label>
                    <span className="text-sm font-medium">
                      {controls.dailyLimit} minutes
                    </span>
                  </div>
                  <Slider
                    value={[controls.dailyLimit]}
                    onValueChange={([value]) =>
                      setControls((prev) => ({ ...prev, dailyLimit: value }))
                    }
                    min={15}
                    max={180}
                    step={15}
                    disabled={!controls.dailyLimitEnabled}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>15 min</span>
                    <span>3 hours</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Weekend Limit</Label>
                    <span className="text-sm font-medium">
                      {controls.weekendLimit} minutes
                    </span>
                  </div>
                  <Slider
                    value={[controls.weekendLimit]}
                    onValueChange={([value]) =>
                      setControls((prev) => ({ ...prev, weekendLimit: value }))
                    }
                    min={15}
                    max={240}
                    step={15}
                    disabled={!controls.dailyLimitEnabled}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>15 min</span>
                    <span>4 hours</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Break Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Remind to take breaks during longer sessions
                    </p>
                  </div>
                  <Switch
                    checked={controls.breakReminders}
                    onCheckedChange={(checked) =>
                      setControls((prev) => ({ ...prev, breakReminders: checked }))
                    }
                  />
                </div>

                {controls.breakReminders && (
                  <div>
                    <Label>Break every</Label>
                    <Select
                      value={controls.breakInterval.toString()}
                      onValueChange={(value) =>
                        setControls((prev) => ({
                          ...prev,
                          breakInterval: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="w-[150px] mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Filtering */}
        <TabsContent value="content" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Content Filtering
              </CardTitle>
              <CardDescription>
                Control what content {currentChild?.name} can access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Content Filter Level</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "strict", label: "Strict", desc: "Most restrictive, age-appropriate only" },
                    { value: "moderate", label: "Moderate", desc: "Balanced filtering" },
                    { value: "minimal", label: "Minimal", desc: "Basic safety only" },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() =>
                        setControls((prev) => ({
                          ...prev,
                          contentFilterLevel: level.value,
                        }))
                      }
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        controls.contentFilterLevel === level.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {level.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Block External Links</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent opening links outside the platform
                    </p>
                  </div>
                  <Switch
                    checked={controls.blockExternalLinks}
                    onCheckedChange={(checked) =>
                      setControls((prev) => ({
                        ...prev,
                        blockExternalLinks: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Approval for New Content</Label>
                    <p className="text-sm text-muted-foreground">
                      You must approve before accessing new subjects or features
                    </p>
                  </div>
                  <Switch
                    checked={controls.requireApprovalForNew}
                    onCheckedChange={(checked) =>
                      setControls((prev) => ({
                        ...prev,
                        requireApprovalForNew: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  All content on Kaelyn's Academy is designed to be age-appropriate
                  and COPPA-compliant. These settings provide additional control.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Parent Notifications
              </CardTitle>
              <CardDescription>
                Choose what updates you want to receive about {currentChild?.name}'s progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Summary Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of learning activity
                  </p>
                </div>
                <Switch
                  checked={controls.dailySummary}
                  onCheckedChange={(checked) =>
                    setControls((prev) => ({ ...prev, dailySummary: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Progress Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about significant progress milestones
                  </p>
                </div>
                <Switch
                  checked={controls.progressAlerts}
                  onCheckedChange={(checked) =>
                    setControls((prev) => ({ ...prev, progressAlerts: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Achievement Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when badges and achievements are earned
                  </p>
                </div>
                <Switch
                  checked={controls.achievementAlerts}
                  onCheckedChange={(checked) =>
                    setControls((prev) => ({ ...prev, achievementAlerts: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Inactivity Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified if there's no learning activity
                  </p>
                </div>
                <Switch
                  checked={controls.inactivityAlerts}
                  onCheckedChange={(checked) =>
                    setControls((prev) => ({ ...prev, inactivityAlerts: checked }))
                  }
                />
              </div>

              {controls.inactivityAlerts && (
                <div className="ml-4">
                  <Label>Alert after</Label>
                  <Select
                    value={controls.inactivityThreshold.toString()}
                    onValueChange={(value) =>
                      setControls((prev) => ({
                        ...prev,
                        inactivityThreshold: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger className="w-[150px] mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control how {currentChild?.name}'s data is shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Progress with Teacher</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow teachers to view detailed progress reports
                  </p>
                </div>
                <Switch
                  checked={controls.shareProgressWithTeacher}
                  onCheckedChange={(checked) =>
                    setControls((prev) => ({
                      ...prev,
                      shareProgressWithTeacher: checked,
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show on Class Leaderboard</Label>
                  <p className="text-sm text-muted-foreground">
                    Display progress on classroom leaderboards (first name only)
                  </p>
                </div>
                <Switch
                  checked={controls.showOnClassLeaderboard}
                  onCheckedChange={(checked) =>
                    setControls((prev) => ({
                      ...prev,
                      showOnClassLeaderboard: checked,
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Messages from Teacher</Label>
                  <p className="text-sm text-muted-foreground">
                    Teachers can send encouragement and feedback
                  </p>
                </div>
                <Switch
                  checked={controls.allowMessagesFromTeacher}
                  onCheckedChange={(checked) =>
                    setControls((prev) => ({
                      ...prev,
                      allowMessagesFromTeacher: checked,
                    }))
                  }
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  We take privacy seriously. We never sell personal data and comply
                  with COPPA, FERPA, and GDPR. See our{" "}
                  <Link href="/privacy" className="underline">
                    Privacy Policy
                  </Link>{" "}
                  for details.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
