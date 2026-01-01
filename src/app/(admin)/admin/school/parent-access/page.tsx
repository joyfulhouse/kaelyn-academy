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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Save,
  Loader2,
  Eye,
  MessageSquare,
  Bell,
  Calendar,
  FileText,
  Shield,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ParentAccessSettings {
  viewProgress: boolean;
  viewGrades: boolean;
  viewAttendance: boolean;
  viewAssessments: boolean;
  messageTeachers: boolean;
  scheduleConferences: boolean;
  downloadReports: boolean;
  receiveAlerts: boolean;
  alertFrequency: string;
  progressFrequency: string;
  requireConsentForAI: boolean;
  allowDataExport: boolean;
}

export default function ParentAccessPage() {
  const [settings, setSettings] = useState<ParentAccessSettings>({
    viewProgress: true,
    viewGrades: true,
    viewAttendance: true,
    viewAssessments: false,
    messageTeachers: true,
    scheduleConferences: true,
    downloadReports: true,
    receiveAlerts: true,
    alertFrequency: "daily",
    progressFrequency: "weekly",
    requireConsentForAI: true,
    allowDataExport: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/school/parent-access");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch parent access settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/parent-access", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
    } catch (error) {
      console.error("Failed to save parent access settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof ParentAccessSettings, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parent Access Configuration</h1>
          <p className="text-muted-foreground">
            Configure what parents can view and do in the parent portal.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Viewing Permissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <CardTitle>Viewing Permissions</CardTitle>
            </div>
            <CardDescription>
              What information parents can access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Learning Progress</Label>
                <p className="text-sm text-muted-foreground">
                  Lesson completion and mastery levels
                </p>
              </div>
              <Switch
                checked={settings.viewProgress}
                onCheckedChange={(v) => updateSetting("viewProgress", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Grades & Scores</Label>
                <p className="text-sm text-muted-foreground">
                  Quiz and test results
                </p>
              </div>
              <Switch
                checked={settings.viewGrades}
                onCheckedChange={(v) => updateSetting("viewGrades", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Attendance Data</Label>
                <p className="text-sm text-muted-foreground">
                  Login history and session times
                </p>
              </div>
              <Switch
                checked={settings.viewAttendance}
                onCheckedChange={(v) => updateSetting("viewAttendance", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Assessment Details</Label>
                <p className="text-sm text-muted-foreground">
                  Detailed test analysis and answers
                </p>
              </div>
              <Switch
                checked={settings.viewAssessments}
                onCheckedChange={(v) => updateSetting("viewAssessments", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <CardTitle>Communication</CardTitle>
            </div>
            <CardDescription>
              Parent-teacher interaction options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Message Teachers</Label>
                <p className="text-sm text-muted-foreground">
                  Send messages to child's teachers
                </p>
              </div>
              <Switch
                checked={settings.messageTeachers}
                onCheckedChange={(v) => updateSetting("messageTeachers", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Schedule Conferences</Label>
                <p className="text-sm text-muted-foreground">
                  Book parent-teacher meetings
                </p>
              </div>
              <Switch
                checked={settings.scheduleConferences}
                onCheckedChange={(v) => updateSetting("scheduleConferences", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Download Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Export progress reports as PDF
                </p>
              </div>
              <Switch
                checked={settings.downloadReports}
                onCheckedChange={(v) => updateSetting("downloadReports", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Alert and update preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Receive Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about child's activity
                </p>
              </div>
              <Switch
                checked={settings.receiveAlerts}
                onCheckedChange={(v) => updateSetting("receiveAlerts", v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Alert Frequency</Label>
              <Select
                value={settings.alertFrequency}
                onValueChange={(v) => updateSetting("alertFrequency", v)}
                disabled={!settings.receiveAlerts}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Progress Report Frequency</Label>
              <Select
                value={settings.progressFrequency}
                onValueChange={(v) => updateSetting("progressFrequency", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Consent */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <CardTitle>Privacy & Consent</CardTitle>
            </div>
            <CardDescription>
              Data access and consent requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require AI Consent</Label>
                <p className="text-sm text-muted-foreground">
                  Parents must approve AI tutor usage
                </p>
              </div>
              <Switch
                checked={settings.requireConsentForAI}
                onCheckedChange={(v) => updateSetting("requireConsentForAI", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Data Export</Label>
                <p className="text-sm text-muted-foreground">
                  Parents can download all child data
                </p>
              </div>
              <Switch
                checked={settings.allowDataExport}
                onCheckedChange={(v) => updateSetting("allowDataExport", v)}
              />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Under FERPA, parents have the right to
                access their child's educational records. These settings
                control portal access but do not override legal requirements.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Parent Portal Statistics</CardTitle>
          <CardDescription>
            Current parent engagement metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">89</p>
              <p className="text-sm text-muted-foreground">Active Parents</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Messages This Month</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">234</p>
              <p className="text-sm text-muted-foreground">Reports Downloaded</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Calendar className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Conferences Scheduled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
