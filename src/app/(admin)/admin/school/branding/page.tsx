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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Upload,
  Save,
  Loader2,
  Eye,
  Image,
  Type,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SchoolBranding {
  schoolName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  heroImageUrl: string;
  fontFamily: string;
}

export default function SchoolBrandingPage() {
  const [branding, setBranding] = useState<SchoolBranding>({
    schoolName: "",
    tagline: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#6366f1",
    accentColor: "#10b981",
    logoUrl: "",
    faviconUrl: "",
    heroImageUrl: "",
    fontFamily: "Inter",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await fetch("/api/admin/school/branding");
      if (res.ok) {
        const data = await res.json();
        setBranding(data);
      } else {
        // Mock data
        setBranding({
          schoolName: "Lincoln Elementary School",
          tagline: "Where Learning Comes to Life",
          primaryColor: "#2563eb",
          secondaryColor: "#7c3aed",
          accentColor: "#059669",
          logoUrl: "",
          faviconUrl: "",
          heroImageUrl: "",
          fontFamily: "Inter",
        });
      }
    } catch (error) {
      console.error("Failed to fetch branding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding),
      });
    } catch (error) {
      console.error("Failed to save branding:", error);
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: "Ocean", primary: "#0ea5e9", secondary: "#6366f1", accent: "#10b981" },
    { name: "Forest", primary: "#22c55e", secondary: "#16a34a", accent: "#f59e0b" },
    { name: "Sunset", primary: "#f97316", secondary: "#ef4444", accent: "#8b5cf6" },
    { name: "Royal", primary: "#7c3aed", secondary: "#a855f7", accent: "#06b6d4" },
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
          <h1 className="text-3xl font-bold">School Branding</h1>
          <p className="text-muted-foreground">
            Customize your school's appearance and white-label branding.
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
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="identity">
            <TabsList>
              <TabsTrigger value="identity">
                <Image className="h-4 w-4 mr-2" />
                Identity
              </TabsTrigger>
              <TabsTrigger value="colors">
                <Palette className="h-4 w-4 mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography">
                <Type className="h-4 w-4 mr-2" />
                Typography
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>School Identity</CardTitle>
                  <CardDescription>
                    Basic information displayed throughout the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>School Name</Label>
                    <Input
                      value={branding.schoolName}
                      onChange={(e) =>
                        setBranding({ ...branding, schoolName: e.target.value })
                      }
                      placeholder="Your School Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={branding.tagline}
                      onChange={(e) =>
                        setBranding({ ...branding, tagline: e.target.value })
                      }
                      placeholder="Your school's motto or tagline"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logos & Images</CardTitle>
                  <CardDescription>
                    Upload your school's visual assets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>School Logo</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        {branding.logoUrl ? (
                          <img
                            src={branding.logoUrl}
                            alt="School Logo"
                            className="max-h-16 mx-auto"
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
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        {branding.faviconUrl ? (
                          <img
                            src={branding.faviconUrl}
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
                  <div className="space-y-2">
                    <Label>Hero Image</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      {branding.heroImageUrl ? (
                        <img
                          src={branding.heroImageUrl}
                          alt="Hero"
                          className="max-h-32 mx-auto rounded"
                        />
                      ) : (
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        Recommended: 1920x480 pixels
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Upload Hero Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Color Presets</CardTitle>
                  <CardDescription>
                    Quick-apply a color theme for your school
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        className="p-4 border rounded-lg hover:border-primary transition-colors"
                        onClick={() =>
                          setBranding({
                            ...branding,
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
                  <CardDescription>
                    Set your own school colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding({ ...branding, primaryColor: e.target.value })
                          }
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={branding.primaryColor}
                          onChange={(e) =>
                            setBranding({ ...branding, primaryColor: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={branding.secondaryColor}
                          onChange={(e) =>
                            setBranding({ ...branding, secondaryColor: e.target.value })
                          }
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={branding.secondaryColor}
                          onChange={(e) =>
                            setBranding({ ...branding, secondaryColor: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={branding.accentColor}
                          onChange={(e) =>
                            setBranding({ ...branding, accentColor: e.target.value })
                          }
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={branding.accentColor}
                          onChange={(e) =>
                            setBranding({ ...branding, accentColor: e.target.value })
                          }
                        />
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
                  <CardDescription>
                    Choose typography for your school portal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <select
                      className="w-full h-10 px-3 border rounded-md"
                      value={branding.fontFamily}
                      onChange={(e) =>
                        setBranding({ ...branding, fontFamily: e.target.value })
                      }
                    >
                      <option value="Inter">Inter (Default)</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Lato">Lato</option>
                      <option value="Comic Sans MS">Comic Sans (Fun)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview */}
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
              style={{ fontFamily: branding.fontFamily }}
            >
              <div className="flex items-center gap-2">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo" className="h-8" />
                ) : (
                  <div
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: branding.primaryColor }}
                  />
                )}
                <div>
                  <span className="font-bold text-sm">
                    {branding.schoolName || "School Name"}
                  </span>
                  {branding.tagline && (
                    <p className="text-xs text-muted-foreground">
                      {branding.tagline}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div
                  className="h-8 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Primary Button
                </div>
                <div
                  className="h-8 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: branding.secondaryColor }}
                >
                  Secondary Button
                </div>
                <div
                  className="h-8 rounded flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: branding.accentColor }}
                >
                  Accent Button
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
