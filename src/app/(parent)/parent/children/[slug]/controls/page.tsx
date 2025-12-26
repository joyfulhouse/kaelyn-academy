"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  Clock,
  Filter,
  Bell,
  Lock,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Mock data - in production, this would come from the database
const childrenData: Record<string, {
  name: string;
  controls: {
    dailyLimit: number;
    weekendLimit: number;
    contentFiltering: string;
    breakReminders: boolean;
    breakInterval: number;
    allowedSubjects: string[];
    notifyOnAchievement: boolean;
    notifyOnStruggling: boolean;
    notifyWeeklyReport: boolean;
    shareProgressWithTeacher: boolean;
    allowAnonymousComparison: boolean;
  };
}> = {
  emma: {
    name: "Emma Johnson",
    controls: {
      dailyLimit: 60,
      weekendLimit: 90,
      contentFiltering: "strict",
      breakReminders: true,
      breakInterval: 30,
      allowedSubjects: ["math", "reading", "science", "history"],
      notifyOnAchievement: true,
      notifyOnStruggling: true,
      notifyWeeklyReport: true,
      shareProgressWithTeacher: true,
      allowAnonymousComparison: false,
    },
  },
  liam: {
    name: "Liam Johnson",
    controls: {
      dailyLimit: 90,
      weekendLimit: 120,
      contentFiltering: "moderate",
      breakReminders: true,
      breakInterval: 45,
      allowedSubjects: ["math", "reading", "science", "history"],
      notifyOnAchievement: true,
      notifyOnStruggling: false,
      notifyWeeklyReport: true,
      shareProgressWithTeacher: true,
      allowAnonymousComparison: true,
    },
  },
};

export default function ChildControlsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const childData = childrenData[slug];

  if (!childData) {
    notFound();
  }

  const [dailyLimit, setDailyLimit] = useState(childData.controls.dailyLimit);
  const [weekendLimit, setWeekendLimit] = useState(childData.controls.weekendLimit);
  const [contentFiltering, setContentFiltering] = useState(childData.controls.contentFiltering);
  const [breakReminders, setBreakReminders] = useState(childData.controls.breakReminders);
  const [breakInterval, setBreakInterval] = useState(childData.controls.breakInterval);
  const [notifyOnAchievement, setNotifyOnAchievement] = useState(childData.controls.notifyOnAchievement);
  const [notifyOnStruggling, setNotifyOnStruggling] = useState(childData.controls.notifyOnStruggling);
  const [notifyWeeklyReport, setNotifyWeeklyReport] = useState(childData.controls.notifyWeeklyReport);
  const [shareProgressWithTeacher, setShareProgressWithTeacher] = useState(childData.controls.shareProgressWithTeacher);
  const [allowAnonymousComparison, setAllowAnonymousComparison] = useState(childData.controls.allowAnonymousComparison);

  const handleSave = () => {
    // In production, this would save to the database
    console.log("Saving controls...", {
      dailyLimit,
      weekendLimit,
      contentFiltering,
      breakReminders,
      breakInterval,
      notifyOnAchievement,
      notifyOnStruggling,
      notifyWeeklyReport,
      shareProgressWithTeacher,
      allowAnonymousComparison,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/parent/children/${slug}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Parental Controls</h1>
            <p className="text-muted-foreground">
              Manage settings for {childData.name}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="time" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time" className="gap-2">
            <Clock className="h-4 w-4" />
            Time Limits
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <Filter className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Lock className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Time Limits */}
        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Learning Time
              </CardTitle>
              <CardDescription>
                Set maximum learning time per day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Weekday Limit</Label>
                  <span className="font-medium">{dailyLimit} minutes</span>
                </div>
                <Slider
                  value={[dailyLimit]}
                  onValueChange={(v) => setDailyLimit(v[0])}
                  max={180}
                  min={15}
                  step={15}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum time allowed on school days (Monday-Friday)
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Weekend Limit</Label>
                  <span className="font-medium">{weekendLimit} minutes</span>
                </div>
                <Slider
                  value={[weekendLimit]}
                  onValueChange={(v) => setWeekendLimit(v[0])}
                  max={240}
                  min={15}
                  step={15}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum time allowed on weekends (Saturday-Sunday)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Break Reminders</CardTitle>
              <CardDescription>
                Encourage healthy learning habits with regular breaks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Break Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Remind to take breaks during learning sessions
                  </p>
                </div>
                <Switch
                  checked={breakReminders}
                  onCheckedChange={setBreakReminders}
                />
              </div>

              {breakReminders && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label>Break Interval</Label>
                    <span className="font-medium">{breakInterval} minutes</span>
                  </div>
                  <Slider
                    value={[breakInterval]}
                    onValueChange={(v) => setBreakInterval(v[0])}
                    max={60}
                    min={15}
                    step={5}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Filtering */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Content Filtering Level
              </CardTitle>
              <CardDescription>
                Control the type of content your child can access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Filtering Level</Label>
                <Select value={contentFiltering} onValueChange={setContentFiltering}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">Strict</Badge>
                        <span>Most restrictive - K-5 appropriate only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="moderate">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500">Moderate</Badge>
                        <span>Balanced - Age-appropriate content</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="minimal">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500">Minimal</Badge>
                        <span>Least restrictive - All educational content</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Setting: {contentFiltering}</h4>
                <p className="text-sm text-muted-foreground">
                  {contentFiltering === "strict" &&
                    "Only content appropriate for elementary school students. Advanced topics are hidden."}
                  {contentFiltering === "moderate" &&
                    "Content filtered based on your child's grade level. Some advanced topics may be visible."}
                  {contentFiltering === "minimal" &&
                    "All educational content is accessible. Recommended for older students."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Parent Notifications
              </CardTitle>
              <CardDescription>
                Choose what updates you want to receive about your child&apos;s progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Achievement Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your child earns badges or achievements
                  </p>
                </div>
                <Switch
                  checked={notifyOnAchievement}
                  onCheckedChange={setNotifyOnAchievement}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Struggling Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your child is having difficulty with a topic
                  </p>
                </div>
                <Switch
                  checked={notifyOnStruggling}
                  onCheckedChange={setNotifyOnStruggling}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Progress Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your child&apos;s learning
                  </p>
                </div>
                <Switch
                  checked={notifyWeeklyReport}
                  onCheckedChange={setNotifyWeeklyReport}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control how your child&apos;s data is shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Progress with Teacher</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow teachers to view your child&apos;s learning progress
                  </p>
                </div>
                <Switch
                  checked={shareProgressWithTeacher}
                  onCheckedChange={setShareProgressWithTeacher}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Anonymous Comparisons</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous comparison with other students in the same grade
                  </p>
                </div>
                <Switch
                  checked={allowAnonymousComparison}
                  onCheckedChange={setAllowAnonymousComparison}
                />
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-300">COPPA Compliant</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      All data handling complies with the Children&apos;s Online Privacy Protection Act.
                      Your child&apos;s personal information is never sold or shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
