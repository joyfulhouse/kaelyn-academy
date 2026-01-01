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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Upload,
  Save,
  Loader2,
  Eye,
  RefreshCw,
  Image,
  Type,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BrandingSettings {
  organizationId: string;
  organizationName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  fontFamily: string;
  customCss: string;
}

export default function BrandingPage() {
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      fetchBranding(selectedOrg);
    }
  }, [selectedOrg]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/admin/organizations?limit=100");
      if (res.ok) {
        const data = await res.json();
        setOrganizations(data.data || []);
        if (data.data?.length > 0) {
          setSelectedOrg(data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranding = async (orgId: string) => {
    try {
      const res = await fetch(`/api/admin/organizations/${orgId}/branding`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        // Default settings
        setSettings({
          organizationId: orgId,
          organizationName: organizations.find(o => o.id === orgId)?.name || "",
          primaryColor: "#3b82f6",
          secondaryColor: "#6366f1",
          accentColor: "#10b981",
          logoUrl: "",
          faviconUrl: "",
          fontFamily: "Inter",
          customCss: "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch branding:", error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/organizations/${selectedOrg}/branding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Failed to save branding:", error);
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: "Blue", primary: "#3b82f6", secondary: "#6366f1", accent: "#10b981" },
    { name: "Purple", primary: "#8b5cf6", secondary: "#a855f7", accent: "#f59e0b" },
    { name: "Green", primary: "#10b981", secondary: "#14b8a6", accent: "#3b82f6" },
    { name: "Red", primary: "#ef4444", secondary: "#f43f5e", accent: "#6366f1" },
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
          <h1 className="text-3xl font-bold">Brand & Theme</h1>
          <p className="text-muted-foreground">
            Configure organization branding, colors, logos, and custom themes.
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {settings && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="colors">
              <TabsList>
                <TabsTrigger value="colors">
                  <Palette className="h-4 w-4 mr-2" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="logos">
                  <Image className="h-4 w-4 mr-2" />
                  Logos
                </TabsTrigger>
                <TabsTrigger value="typography">
                  <Type className="h-4 w-4 mr-2" />
                  Typography
                </TabsTrigger>
              </TabsList>

              <TabsContent value="colors" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Presets</CardTitle>
                    <CardDescription>Quick-apply a color theme</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          className="p-4 border rounded-lg hover:border-primary transition-colors"
                          onClick={() =>
                            setSettings({
                              ...settings,
                              primaryColor: preset.primary,
                              secondaryColor: preset.secondary,
                              accentColor: preset.accent,
                            })
                          }
                        >
                          <div className="flex gap-1 mb-2">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: preset.secondary }}
                            />
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </div>
                          <p className="text-sm font-medium">{preset.name}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom Colors</CardTitle>
                    <CardDescription>Set your own brand colors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) =>
                              setSettings({ ...settings, primaryColor: e.target.value })
                            }
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={settings.primaryColor}
                            onChange={(e) =>
                              setSettings({ ...settings, primaryColor: e.target.value })
                            }
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) =>
                              setSettings({ ...settings, secondaryColor: e.target.value })
                            }
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={settings.secondaryColor}
                            onChange={(e) =>
                              setSettings({ ...settings, secondaryColor: e.target.value })
                            }
                            placeholder="#6366f1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Accent Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={settings.accentColor}
                            onChange={(e) =>
                              setSettings({ ...settings, accentColor: e.target.value })
                            }
                            className="w-12 h-10 p-1"
                          />
                          <Input
                            value={settings.accentColor}
                            onChange={(e) =>
                              setSettings({ ...settings, accentColor: e.target.value })
                            }
                            placeholder="#10b981"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logos" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo & Favicon</CardTitle>
                    <CardDescription>Upload your organization logos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          {settings.logoUrl ? (
                            <img
                              src={settings.logoUrl}
                              alt="Logo"
                              className="max-h-20 mx-auto"
                            />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <Button variant="outline" size="sm" className="mt-4">
                            Upload Logo
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Favicon</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          {settings.faviconUrl ? (
                            <img
                              src={settings.faviconUrl}
                              alt="Favicon"
                              className="h-8 w-8 mx-auto"
                            />
                          ) : (
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <Button variant="outline" size="sm" className="mt-4">
                            Upload Favicon
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="typography" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Font Settings</CardTitle>
                    <CardDescription>Choose typography for your organization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select
                        value={settings.fontFamily}
                        onValueChange={(value) =>
                          setSettings({ ...settings, fontFamily: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter (Default)</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                          <SelectItem value="Poppins">Poppins</SelectItem>
                          <SelectItem value="Lato">Lato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview</CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Full Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-lg border p-4 space-y-4"
                style={{ fontFamily: settings.fontFamily }}
              >
                <div className="flex items-center gap-2">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-8" />
                  ) : (
                    <div
                      className="h-8 w-8 rounded"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                  )}
                  <span className="font-bold">{settings.organizationName || "Organization"}</span>
                </div>
                <div className="space-y-2">
                  <div
                    className="h-10 rounded flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="h-10 rounded flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: settings.secondaryColor }}
                  >
                    Secondary Button
                  </div>
                  <div
                    className="h-10 rounded flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: settings.accentColor }}
                  >
                    Accent Button
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
