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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye,
  FileText,
  Users,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface PrivacySettings {
  ferpaCompliant: boolean;
  coppaCompliant: boolean;
  dataRetentionDays: number;
  anonymizeInactiveAfterDays: number;
  allowDataExport: boolean;
  requireParentalConsent: boolean;
  consentAgeThreshold: number;
  dataCollectionLevel: "minimal" | "standard" | "full";
  thirdPartySharing: boolean;
  analyticsEnabled: boolean;
  lastAudit: string;
  privacyOfficerEmail: string;
  dataProcessingAgreement: boolean;
}

export default function PrivacyCompliancePage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    ferpaCompliant: true,
    coppaCompliant: true,
    dataRetentionDays: 365,
    anonymizeInactiveAfterDays: 730,
    allowDataExport: true,
    requireParentalConsent: true,
    consentAgeThreshold: 13,
    dataCollectionLevel: "standard",
    thirdPartySharing: false,
    analyticsEnabled: true,
    lastAudit: "",
    privacyOfficerEmail: "",
    dataProcessingAgreement: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/school/privacy");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        // Use default mock data
        setSettings({
          ...settings,
          lastAudit: "2025-11-15",
          privacyOfficerEmail: "privacy@school.edu",
        });
      }
    } catch (error) {
      console.error("Failed to fetch privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Failed to save privacy settings:", error);
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-3xl font-bold">Privacy & FERPA Compliance</h1>
          <p className="text-muted-foreground">
            Manage student data privacy settings and regulatory compliance.
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

      {/* Compliance Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={settings.ferpaCompliant ? "border-green-200" : "border-red-200"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FERPA Compliance</CardTitle>
            {settings.ferpaCompliant ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge className={settings.ferpaCompliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {settings.ferpaCompliant ? "Compliant" : "Action Required"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Family Educational Rights and Privacy Act
            </p>
          </CardContent>
        </Card>
        <Card className={settings.coppaCompliant ? "border-green-200" : "border-red-200"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COPPA Compliance</CardTitle>
            {settings.coppaCompliant ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <Badge className={settings.coppaCompliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {settings.coppaCompliant ? "Compliant" : "Action Required"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Children's Online Privacy Protection Act
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {settings.lastAudit
                ? new Date(settings.lastAudit).toLocaleDateString()
                : "Never"}
            </p>
            <Link href="/admin/school/audit" className="text-xs text-primary hover:underline">
              View audit logs →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Data Collection
            </CardTitle>
            <CardDescription>
              Configure what student data is collected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Data Collection Level</Label>
              <Select
                value={settings.dataCollectionLevel}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    dataCollectionLevel: value as PrivacySettings["dataCollectionLevel"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal - Essential data only</SelectItem>
                  <SelectItem value="standard">Standard - Progress and performance</SelectItem>
                  <SelectItem value="full">Full - Detailed analytics</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Controls the granularity of student activity tracking
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Analytics Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Collect usage analytics for insights
                </p>
              </div>
              <Switch
                checked={settings.analyticsEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, analyticsEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Third-Party Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data with research partners
                </p>
              </div>
              <Switch
                checked={settings.thirdPartySharing}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, thirdPartySharing: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Data Retention
            </CardTitle>
            <CardDescription>
              Configure data storage and deletion policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Data Retention Period (days)</Label>
              <Input
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dataRetentionDays: parseInt(e.target.value) || 365,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                How long to keep student data after account closure
              </p>
            </div>

            <div className="space-y-2">
              <Label>Anonymize Inactive After (days)</Label>
              <Input
                type="number"
                value={settings.anonymizeInactiveAfterDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    anonymizeInactiveAfterDays: parseInt(e.target.value) || 730,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Anonymize data for students inactive for this period
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Data Export</Label>
                <p className="text-sm text-muted-foreground">
                  Parents can request data export
                </p>
              </div>
              <Switch
                checked={settings.allowDataExport}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allowDataExport: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Parental Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Parental Consent
            </CardTitle>
            <CardDescription>
              Configure consent requirements for minors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Require Parental Consent</Label>
                <p className="text-sm text-muted-foreground">
                  Require consent for students under age threshold
                </p>
              </div>
              <Switch
                checked={settings.requireParentalConsent}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, requireParentalConsent: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Consent Age Threshold</Label>
              <Input
                type="number"
                value={settings.consentAgeThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    consentAgeThreshold: parseInt(e.target.value) || 13,
                  })
                }
                min={0}
                max={18}
              />
              <p className="text-xs text-muted-foreground">
                Students below this age require parental consent
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link href="/admin/school/consent">
                <FileText className="mr-2 h-4 w-4" />
                Manage Consent Forms
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Officer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Officer
            </CardTitle>
            <CardDescription>
              Contact information for privacy inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Privacy Officer Email</Label>
              <Input
                type="email"
                value={settings.privacyOfficerEmail}
                onChange={(e) =>
                  setSettings({ ...settings, privacyOfficerEmail: e.target.value })
                }
                placeholder="privacy@school.edu"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Data Processing Agreement</Label>
                <p className="text-sm text-muted-foreground">
                  DPA signed with all vendors
                </p>
              </div>
              <Switch
                checked={settings.dataProcessingAgreement}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, dataProcessingAgreement: checked })
                }
              />
            </div>

            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Privacy Policy Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
