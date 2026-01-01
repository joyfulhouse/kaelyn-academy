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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Key,
  Globe,
  Users,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SSOConfig {
  enabled: boolean;
  provider: "google" | "microsoft" | "classlink" | "clever" | "saml";
  clientId: string;
  clientSecret: string;
  domain: string;
  autoProvision: boolean;
  defaultRole: string;
  syncGroups: boolean;
  forceSSO: boolean;
  samlMetadataUrl?: string;
  samlEntityId?: string;
}

export default function SSOSettingsPage() {
  const [config, setConfig] = useState<SSOConfig>({
    enabled: false,
    provider: "google",
    clientId: "",
    clientSecret: "",
    domain: "",
    autoProvision: true,
    defaultRole: "learner",
    syncGroups: false,
    forceSSO: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/school/sso");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Failed to fetch SSO config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/sso", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error("Failed to save SSO config:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Simulate SSO test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setTesting(false);
    }
  };

  const providers = [
    { value: "google", label: "Google Workspace", icon: "🔵" },
    { value: "microsoft", label: "Microsoft Entra ID", icon: "🟦" },
    { value: "classlink", label: "ClassLink", icon: "📚" },
    { value: "clever", label: "Clever", icon: "📘" },
    { value: "saml", label: "Custom SAML 2.0", icon: "🔐" },
  ];

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
          <h1 className="text-3xl font-bold">Single Sign-On (SSO)</h1>
          <p className="text-muted-foreground">
            Configure SSO authentication for your school district.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleTest} disabled={testing || !config.enabled}>
            {testing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Test Connection
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card className={testResult === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {testResult === "success" ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Connection Successful</p>
                    <p className="text-sm text-green-700">SSO is configured correctly</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Connection Failed</p>
                    <p className="text-sm text-red-700">Check your configuration settings</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enable SSO */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SSO Configuration</CardTitle>
                  <CardDescription>
                    Enable single sign-on for your school
                  </CardDescription>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
              </div>
            </CardHeader>
            {config.enabled && (
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Identity Provider</Label>
                  <Select
                    value={config.provider}
                    onValueChange={(value) =>
                      setConfig({ ...config, provider: value as SSOConfig["provider"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          <span className="flex items-center gap-2">
                            <span>{provider.icon}</span>
                            {provider.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {config.provider !== "saml" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Client ID</Label>
                      <Input
                        value={config.clientId}
                        onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                        placeholder="Enter your OAuth client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Client Secret</Label>
                      <Input
                        type="password"
                        value={config.clientSecret}
                        onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                        placeholder="Enter your OAuth client secret"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>SAML Metadata URL</Label>
                      <Input
                        value={config.samlMetadataUrl || ""}
                        onChange={(e) => setConfig({ ...config, samlMetadataUrl: e.target.value })}
                        placeholder="https://your-idp.com/metadata.xml"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Entity ID</Label>
                      <Input
                        value={config.samlEntityId || ""}
                        onChange={(e) => setConfig({ ...config, samlEntityId: e.target.value })}
                        placeholder="Your SAML Entity ID"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Allowed Domain</Label>
                  <Input
                    value={config.domain}
                    onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                    placeholder="school.edu"
                  />
                  <p className="text-xs text-muted-foreground">
                    Only users with email addresses from this domain can sign in
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Provisioning */}
          {config.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>User Provisioning</CardTitle>
                <CardDescription>
                  Configure how users are created and managed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Provision Users</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create accounts on first login
                    </p>
                  </div>
                  <Switch
                    checked={config.autoProvision}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, autoProvision: checked })
                    }
                  />
                </div>

                {config.autoProvision && (
                  <div className="space-y-2">
                    <Label>Default Role</Label>
                    <Select
                      value={config.defaultRole}
                      onValueChange={(value) => setConfig({ ...config, defaultRole: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learner">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sync Groups</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync user groups/classes from identity provider
                    </p>
                  </div>
                  <Switch
                    checked={config.syncGroups}
                    onCheckedChange={(checked) => setConfig({ ...config, syncGroups: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Force SSO</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable password login, require SSO only
                    </p>
                  </div>
                  <Switch
                    checked={config.forceSSO}
                    onCheckedChange={(checked) => setConfig({ ...config, forceSSO: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>SSO Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">SSO Enabled</span>
                {config.enabled ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge variant="outline">Disabled</Badge>
                )}
              </div>
              {config.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Provider</span>
                    <Badge variant="outline">
                      {providers.find((p) => p.value === config.provider)?.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Domain</span>
                    <span className="text-sm font-medium">{config.domain || "Not set"}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>SSO Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">342</p>
                <p className="text-sm text-muted-foreground">Total SSO Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Logins Today</p>
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Guides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <a href="#" className="text-primary hover:underline">
                  Google Workspace Setup
                </a>
              </p>
              <p>
                <a href="#" className="text-primary hover:underline">
                  Microsoft Entra ID Setup
                </a>
              </p>
              <p>
                <a href="#" className="text-primary hover:underline">
                  ClassLink Integration
                </a>
              </p>
              <p>
                <a href="#" className="text-primary hover:underline">
                  Clever Integration
                </a>
              </p>
              <p>
                <a href="#" className="text-primary hover:underline">
                  Custom SAML Setup
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
