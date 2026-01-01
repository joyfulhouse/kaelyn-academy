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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  School,
  Save,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SchoolProfile {
  name: string;
  type: "elementary" | "middle" | "high" | "k12";
  district: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  email: string;
  website: string;
  principal: string;
  timezone: string;
  gradeRange: { min: string; max: string };
  studentCount: number;
  teacherCount: number;
  schoolYear: string;
  accreditation: string;
}

export default function SchoolProfilePage() {
  const [profile, setProfile] = useState<SchoolProfile>({
    name: "",
    type: "elementary",
    district: "",
    address: { street: "", city: "", state: "", zip: "" },
    phone: "",
    email: "",
    website: "",
    principal: "",
    timezone: "America/New_York",
    gradeRange: { min: "K", max: "5" },
    studentCount: 0,
    teacherCount: 0,
    schoolYear: "2025-2026",
    accreditation: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/school/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        // Mock data
        setProfile({
          name: "Lincoln Elementary School",
          type: "elementary",
          district: "Unified School District",
          address: {
            street: "123 Education Lane",
            city: "Springfield",
            state: "CA",
            zip: "90210",
          },
          phone: "(555) 123-4567",
          email: "info@lincoln-elementary.edu",
          website: "https://lincoln-elementary.edu",
          principal: "Dr. Sarah Johnson",
          timezone: "America/Los_Angeles",
          gradeRange: { min: "K", max: "5" },
          studentCount: 342,
          teacherCount: 24,
          schoolYear: "2025-2026",
          accreditation: "Western Association of Schools and Colleges",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
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
          <h1 className="text-3xl font-bold">School Profile</h1>
          <p className="text-muted-foreground">
            Manage your school's basic information and settings.
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Core school details and identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Enter school name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>School Type</Label>
                <Select
                  value={profile.type}
                  onValueChange={(value) =>
                    setProfile({ ...profile, type: value as SchoolProfile["type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">Elementary</SelectItem>
                    <SelectItem value="middle">Middle School</SelectItem>
                    <SelectItem value="high">High School</SelectItem>
                    <SelectItem value="k12">K-12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>School Year</Label>
                <Input
                  value={profile.schoolYear}
                  onChange={(e) => setProfile({ ...profile, schoolYear: e.target.value })}
                  placeholder="2025-2026"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>District</Label>
              <Input
                value={profile.district}
                onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                placeholder="School district name"
              />
            </div>
            <div className="space-y-2">
              <Label>Principal</Label>
              <Input
                value={profile.principal}
                onChange={(e) => setProfile({ ...profile, principal: e.target.value })}
                placeholder="Principal name"
              />
            </div>
            <div className="space-y-2">
              <Label>Accreditation</Label>
              <Input
                value={profile.accreditation}
                onChange={(e) => setProfile({ ...profile, accreditation: e.target.value })}
                placeholder="Accrediting body"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              School contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input
                value={profile.address.street}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    address: { ...profile.address, street: e.target.value },
                  })
                }
                placeholder="123 School Street"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={profile.address.city}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      address: { ...profile.address, city: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={profile.address.state}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      address: { ...profile.address, state: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP</Label>
                <Input
                  value={profile.address.zip}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      address: { ...profile.address, zip: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="info@school.edu"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://school.edu"
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Academic Settings
            </CardTitle>
            <CardDescription>
              Grade levels and capacity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lowest Grade</Label>
                <Select
                  value={profile.gradeRange.min}
                  onValueChange={(value) =>
                    setProfile({
                      ...profile,
                      gradeRange: { ...profile.gradeRange, min: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="K">Kindergarten</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={g.toString()}>
                        Grade {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Highest Grade</Label>
                <Select
                  value={profile.gradeRange.max}
                  onValueChange={(value) =>
                    setProfile({
                      ...profile,
                      gradeRange: { ...profile.gradeRange, max: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="K">Kindergarten</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <SelectItem key={g} value={g.toString()}>
                        Grade {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student Count</Label>
                <Input
                  type="number"
                  value={profile.studentCount}
                  onChange={(e) =>
                    setProfile({ ...profile, studentCount: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Teacher Count</Label>
                <Input
                  type="number"
                  value={profile.teacherCount}
                  onChange={(e) =>
                    setProfile({ ...profile, teacherCount: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timezone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timezone Settings
            </CardTitle>
            <CardDescription>
              Configure school timezone for scheduling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={profile.timezone}
                onValueChange={(value) => setProfile({ ...profile, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="America/Anchorage">Alaska Time</SelectItem>
                  <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
