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
import {
  Bot,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  RefreshCw,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
  priority: number;
  apiKeySet: boolean;
  status: "active" | "inactive" | "error";
  lastChecked: string;
  usageThisMonth: number;
  usageLimit: number;
  costThisMonth: number;
  models: string[];
  defaultModel: string;
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/admin/ai-providers");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      } else {
        // Mock data for development
        setProviders([
          {
            id: "claude",
            name: "anthropic",
            displayName: "Claude (Anthropic)",
            enabled: true,
            priority: 1,
            apiKeySet: true,
            status: "active",
            lastChecked: new Date().toISOString(),
            usageThisMonth: 125000,
            usageLimit: 500000,
            costThisMonth: 15.50,
            models: ["claude-3-5-sonnet-latest", "claude-3-opus-latest", "claude-3-haiku-latest"],
            defaultModel: "claude-3-5-sonnet-latest",
          },
          {
            id: "openai",
            name: "openai",
            displayName: "OpenAI",
            enabled: true,
            priority: 2,
            apiKeySet: true,
            status: "active",
            lastChecked: new Date().toISOString(),
            usageThisMonth: 85000,
            usageLimit: 300000,
            costThisMonth: 8.25,
            models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
            defaultModel: "gpt-4o-mini",
          },
          {
            id: "gemini",
            name: "google",
            displayName: "Gemini (Google)",
            enabled: false,
            priority: 3,
            apiKeySet: false,
            status: "inactive",
            lastChecked: new Date().toISOString(),
            usageThisMonth: 0,
            usageLimit: 200000,
            costThisMonth: 0,
            models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"],
            defaultModel: "gemini-1.5-flash",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (providerId: string, enabled: boolean) => {
    setProviders(providers.map(p =>
      p.id === providerId ? { ...p, enabled } : p
    ));
    try {
      await fetch(`/api/admin/ai-providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
    } catch (error) {
      console.error("Failed to update provider:", error);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingConnection(providerId);
    try {
      await fetch(`/api/admin/ai-providers/${providerId}/test`, {
        method: "POST",
      });
      fetchProviders();
    } catch (error) {
      console.error("Failed to test connection:", error);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSaveApiKey = async (providerId: string, apiKey: string) => {
    setSaving(providerId);
    try {
      await fetch(`/api/admin/ai-providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      fetchProviders();
    } catch (error) {
      console.error("Failed to save API key:", error);
    } finally {
      setSaving(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Providers</h1>
        <p className="text-muted-foreground">
          Configure AI provider settings for Claude, OpenAI, and Gemini. Manage API keys and usage limits.
        </p>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card key={provider.id} className={!provider.enabled ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.displayName}</CardTitle>
                    <CardDescription>Priority: {provider.priority}</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={provider.enabled}
                  onCheckedChange={(checked) => handleToggle(provider.id, checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {provider.status === "active" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : provider.status === "error" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  {getStatusBadge(provider.status)}
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label className="text-sm">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder={provider.apiKeySet ? "••••••••••••••••" : "Enter API key"}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving === provider.id}
                  >
                    {saving === provider.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {provider.apiKeySet && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    API key configured
                  </p>
                )}
              </div>

              {/* Default Model */}
              <div className="space-y-2">
                <Label className="text-sm">Default Model</Label>
                <Select defaultValue={provider.defaultModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {provider.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Usage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Usage</span>
                  <span>
                    {(provider.usageThisMonth / 1000).toFixed(0)}k / {(provider.usageLimit / 1000).toFixed(0)}k tokens
                  </span>
                </div>
                <Slider
                  value={[(provider.usageThisMonth / provider.usageLimit) * 100]}
                  max={100}
                  disabled
                  className="cursor-default"
                />
                <p className="text-xs text-muted-foreground">
                  Cost this month: ${provider.costThisMonth.toFixed(2)}
                </p>
              </div>

              {/* Test Connection */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleTestConnection(provider.id)}
                disabled={testingConnection === provider.id || !provider.apiKeySet}
              >
                {testingConnection === provider.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Test Connection
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fallback Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Fallback Configuration</CardTitle>
          <CardDescription>
            Configure provider priority for automatic fallback when primary provider is unavailable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Primary Provider</p>
                <p className="text-sm text-muted-foreground">Used for all AI tutoring requests</p>
              </div>
              <Select defaultValue="claude">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.filter(p => p.enabled).map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Fallback Provider</p>
                <p className="text-sm text-muted-foreground">Used when primary is unavailable</p>
              </div>
              <Select defaultValue="openai">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.filter(p => p.enabled).map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
