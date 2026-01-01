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
import {
  CreditCard,
  Save,
  Loader2,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentSettings {
  stripeEnabled: boolean;
  stripeMode: "test" | "live";
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  currency: string;
  taxEnabled: boolean;
  taxRate: number;
  invoicePrefix: string;
  paymentMethods: string[];
  trialDays: number;
  gracePeriodDays: number;
}

const defaultSettings: PaymentSettings = {
  stripeEnabled: true,
  stripeMode: "test",
  stripePublicKey: "pk_test_*****",
  stripeSecretKey: "sk_test_*****",
  stripeWebhookSecret: "whsec_*****",
  currency: "USD",
  taxEnabled: false,
  taxRate: 0,
  invoicePrefix: "KA",
  paymentMethods: ["card"],
  trialDays: 14,
  gracePeriodDays: 7,
};

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<"connected" | "disconnected" | "error">("connected");
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/billing/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/billing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Failed to save payment settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    // Simulate webhook test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTestingWebhook(false);
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
          <h1 className="text-3xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">
            Configure Stripe integration and payment processing options.
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stripe Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Stripe Integration
                  </CardTitle>
                  <CardDescription>
                    Connect your Stripe account to process payments
                  </CardDescription>
                </div>
                {stripeStatus === "connected" && (
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                )}
                {stripeStatus === "disconnected" && (
                  <Badge variant="outline">Not Connected</Badge>
                )}
                {stripeStatus === "error" && (
                  <Badge className="bg-red-100 text-red-800">Error</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Stripe Payments</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept credit card payments via Stripe
                  </p>
                </div>
                <Switch
                  checked={settings.stripeEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, stripeEnabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Environment</Label>
                <Select
                  value={settings.stripeMode}
                  onValueChange={(value) =>
                    setSettings({ ...settings, stripeMode: value as "test" | "live" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test Mode</SelectItem>
                    <SelectItem value="live">Live Mode</SelectItem>
                  </SelectContent>
                </Select>
                {settings.stripeMode === "test" && (
                  <p className="text-xs text-yellow-600">
                    Test mode - no real charges will be made
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Publishable Key</Label>
                <Input
                  value={settings.stripePublicKey}
                  onChange={(e) =>
                    setSettings({ ...settings, stripePublicKey: e.target.value })
                  }
                  placeholder="pk_test_..."
                />
              </div>

              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  value={settings.stripeSecretKey}
                  onChange={(e) =>
                    setSettings({ ...settings, stripeSecretKey: e.target.value })
                  }
                  placeholder="sk_test_..."
                />
                <p className="text-xs text-muted-foreground">
                  Never share your secret key. It's stored securely.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={settings.stripeWebhookSecret}
                    onChange={(e) =>
                      setSettings({ ...settings, stripeWebhookSecret: e.target.value })
                    }
                    placeholder="whsec_..."
                  />
                  <Button
                    variant="outline"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook}
                  >
                    {testingWebhook ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" asChild>
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Stripe Dashboard
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Billing Options
              </CardTitle>
              <CardDescription>
                Configure billing behavior and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) =>
                      setSettings({ ...settings, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="AUD">AUD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input
                    value={settings.invoicePrefix}
                    onChange={(e) =>
                      setSettings({ ...settings, invoicePrefix: e.target.value })
                    }
                    placeholder="KA"
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Free Trial Days</Label>
                  <Input
                    type="number"
                    value={settings.trialDays}
                    onChange={(e) =>
                      setSettings({ ...settings, trialDays: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Days before first charge
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Grace Period Days</Label>
                  <Input
                    type="number"
                    value={settings.gracePeriodDays}
                    onChange={(e) =>
                      setSettings({ ...settings, gracePeriodDays: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Days after failed payment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Tax Configuration
              </CardTitle>
              <CardDescription>
                Configure tax collection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Tax Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically calculate and collect taxes
                  </p>
                </div>
                <Switch
                  checked={settings.taxEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, taxEnabled: checked })
                  }
                />
              </div>

              {settings.taxEnabled && (
                <div className="space-y-2">
                  <Label>Default Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.taxRate}
                    onChange={(e) =>
                      setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    step="0.01"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    For customers without location-based tax rates
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Stripe API</span>
                {stripeStatus === "connected" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Webhooks</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tax Service</span>
                {settings.taxEnabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Badge variant="outline" className="text-xs">Disabled</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">$12,450</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Transactions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Failed Payments</p>
              </div>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <a href="#" className="text-primary hover:underline">
                  Stripe Integration Guide
                </a>
              </p>
              <p>
                <a href="#" className="text-primary hover:underline">
                  Webhook Configuration
                </a>
              </p>
              <p>
                <a href="#" className="text-primary hover:underline">
                  Tax Setup Documentation
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
