"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Mail,
  Phone,
  Save,
  Camera,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "next-auth/react";

interface UserSettings {
  name: string;
  email: string;
  phone: string;
  timezone: string;
  image?: string | null;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    weeklyReport: boolean;
    achievementAlerts: boolean;
    strugglingAlerts: boolean;
  };
  twoFactorEnabled: boolean;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export default function ParentSettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    phone: "",
    timezone: "America/New_York",
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      weeklyReport: true,
      achievementAlerts: true,
      strugglingAlerts: true,
    },
    twoFactorEnabled: false,
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [twoFADialogOpen, setTwoFADialogOpen] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!session?.user) return;

    try {
      // In a real app, we'd fetch from a parent settings API
      // For now, use session data
      setSettings({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
        timezone: "America/New_York",
        image: session.user.image,
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          weeklyReport: true,
          achievementAlerts: true,
          strugglingAlerts: true,
        },
        twoFactorEnabled: false,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [session, fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      // In a real app, this would save to an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      // In a real app, this would call a password change API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError("Failed to update password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setTwoFALoading(true);

    try {
      // In a real app, this would initiate 2FA setup
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSettings((prev) => ({ ...prev, twoFactorEnabled: true }));
      setTwoFADialogOpen(false);
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);

    try {
      // In a real app, this would delete the account
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDeleteDialogOpen(false);
      // Sign out and redirect to home
      signOut({ callbackUrl: "/" });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  const initials = settings.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saveSuccess ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Your profile photo visible to teachers</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                {settings.image ? (
                  <AvatarImage src={settings.image} />
                ) : (
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {initials || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Upload Photo
                </Button>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) =>
                      setSettings({ ...settings, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support for help.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      preferences: {
                        ...settings.preferences,
                        emailNotifications: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text message alerts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.preferences.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      preferences: {
                        ...settings.preferences,
                        smsNotifications: checked,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
              <CardDescription>
                Choose which alerts you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Progress Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Summary of your children&apos;s weekly progress
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.weeklyReport}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      preferences: {
                        ...settings.preferences,
                        weeklyReport: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Achievement Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    When your child earns badges or milestones
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.achievementAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      preferences: {
                        ...settings.preferences,
                        achievementAlerts: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Struggling Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    When your child needs extra help with a topic
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.strugglingAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      preferences: {
                        ...settings.preferences,
                        strugglingAlerts: checked,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & COPPA</CardTitle>
              <CardDescription>
                Manage your children&apos;s privacy and parental consent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Under the Children&apos;s Online Privacy Protection Act (COPPA),
                you have the right to review, delete, and refuse further
                collection of your child&apos;s personal information.
              </p>
              <Button asChild className="gap-2">
                <Link href="/parent/privacy">
                  <Lock className="h-4 w-4" />
                  Manage Privacy & Consent
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Rights</CardTitle>
              <CardDescription>
                Your rights under privacy regulations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Right to Review</h4>
                    <p className="text-sm text-muted-foreground">
                      You can view all data we collect about your children
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Right to Delete</h4>
                    <p className="text-sm text-muted-foreground">
                      You can request deletion of your child&apos;s data at any time
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Right to Refuse</h4>
                    <p className="text-sm text-muted-foreground">
                      You can revoke consent and stop data collection
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">Free Trial</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlimited access during development
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$0</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Billing features will be available when the platform launches.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Password updated successfully!</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {settings.twoFactorEnabled
                      ? "2FA is enabled"
                      : "2FA is not enabled"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {settings.twoFactorEnabled
                      ? "Your account is protected with two-factor authentication"
                      : "Protect your account with two-factor authentication"}
                  </p>
                </div>
                {settings.twoFactorEnabled ? (
                  <Button variant="outline">Disable 2FA</Button>
                ) : (
                  <Button onClick={() => setTwoFADialogOpen(true)}>
                    Enable 2FA
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Deleting your account will permanently remove all your data,
                including your children&apos;s progress and settings. This action
                cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Dialog */}
      <AlertDialog open={twoFADialogOpen} onOpenChange={setTwoFADialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Two-Factor Authentication</AlertDialogTitle>
            <AlertDialogDescription>
              Two-factor authentication adds an extra layer of security to your
              account. You&apos;ll need to enter a code from your authenticator app
              each time you sign in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={twoFALoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnable2FA} disabled={twoFALoading}>
              {twoFALoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Enable 2FA"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure? This action cannot be undone. This will
              permanently delete your account and remove all data associated with
              it, including all children&apos;s progress and achievements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
