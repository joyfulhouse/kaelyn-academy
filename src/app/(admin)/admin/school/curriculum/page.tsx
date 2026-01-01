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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Save,
  Loader2,
  CheckCircle,
  Search,
  GraduationCap,
  Calculator,
  BookText,
  Microscope,
  Globe,
  Laptop,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Subject {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  units: {
    id: string;
    name: string;
    lessons: number;
    enabled: boolean;
  }[];
}

interface CurriculumSettings {
  subjects: Subject[];
  gradeRange: { min: string; max: string };
}

export default function CurriculumSelectionPage() {
  const [settings, setSettings] = useState<CurriculumSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      const res = await fetch("/api/admin/school/curriculum");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        // Mock data
        setSettings({
          gradeRange: { min: "K", max: "5" },
          subjects: [
            {
              id: "math",
              name: "Mathematics",
              icon: "calculator",
              enabled: true,
              units: [
                { id: "m1", name: "Numbers & Operations", lessons: 24, enabled: true },
                { id: "m2", name: "Algebra & Patterns", lessons: 18, enabled: true },
                { id: "m3", name: "Geometry", lessons: 20, enabled: true },
                { id: "m4", name: "Measurement", lessons: 16, enabled: true },
                { id: "m5", name: "Data & Statistics", lessons: 14, enabled: false },
              ],
            },
            {
              id: "reading",
              name: "Reading & Language Arts",
              icon: "book",
              enabled: true,
              units: [
                { id: "r1", name: "Phonics & Word Study", lessons: 30, enabled: true },
                { id: "r2", name: "Comprehension", lessons: 26, enabled: true },
                { id: "r3", name: "Vocabulary", lessons: 22, enabled: true },
                { id: "r4", name: "Writing", lessons: 28, enabled: true },
                { id: "r5", name: "Grammar", lessons: 20, enabled: true },
              ],
            },
            {
              id: "science",
              name: "Science",
              icon: "microscope",
              enabled: true,
              units: [
                { id: "s1", name: "Life Science", lessons: 22, enabled: true },
                { id: "s2", name: "Physical Science", lessons: 20, enabled: true },
                { id: "s3", name: "Earth Science", lessons: 18, enabled: true },
                { id: "s4", name: "Engineering & Design", lessons: 12, enabled: false },
              ],
            },
            {
              id: "history",
              name: "Social Studies & History",
              icon: "globe",
              enabled: true,
              units: [
                { id: "h1", name: "US History", lessons: 24, enabled: true },
                { id: "h2", name: "World History", lessons: 20, enabled: false },
                { id: "h3", name: "Geography", lessons: 16, enabled: true },
                { id: "h4", name: "Civics", lessons: 14, enabled: true },
              ],
            },
            {
              id: "technology",
              name: "Technology & Computer Science",
              icon: "laptop",
              enabled: false,
              units: [
                { id: "t1", name: "Digital Citizenship", lessons: 10, enabled: false },
                { id: "t2", name: "Coding Basics", lessons: 16, enabled: false },
                { id: "t3", name: "Computational Thinking", lessons: 12, enabled: false },
              ],
            },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to fetch curriculum:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/curriculum", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Failed to save curriculum:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      subjects: settings.subjects.map((s) =>
        s.id === subjectId ? { ...s, enabled: !s.enabled } : s
      ),
    });
  };

  const toggleUnit = (subjectId: string, unitId: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      subjects: settings.subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              units: s.units.map((u) =>
                u.id === unitId ? { ...u, enabled: !u.enabled } : u
              ),
            }
          : s
      ),
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "calculator":
        return <Calculator className="h-5 w-5" />;
      case "book":
        return <BookText className="h-5 w-5" />;
      case "microscope":
        return <Microscope className="h-5 w-5" />;
      case "globe":
        return <Globe className="h-5 w-5" />;
      case "laptop":
        return <Laptop className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totalLessons = settings.subjects
    .filter((s) => s.enabled)
    .reduce(
      (sum, s) =>
        sum + s.units.filter((u) => u.enabled).reduce((uSum, u) => uSum + u.lessons, 0),
      0
    );

  const enabledSubjects = settings.subjects.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Selection</h1>
          <p className="text-muted-foreground">
            Choose which subjects and units are available for your school.
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enabledSubjects} / {settings.subjects.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade Range</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.gradeRange.min} - {settings.gradeRange.max}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search subjects and units..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects & Units</CardTitle>
          <CardDescription>
            Enable or disable subjects and individual units for your school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {settings.subjects
              .filter(
                (s) =>
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.units.some((u) =>
                    u.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
              )
              .map((subject) => (
                <AccordionItem key={subject.id} value={subject.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            subject.enabled ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          {getIcon(subject.icon)}
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{subject.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subject.units.filter((u) => u.enabled).length} of{" "}
                            {subject.units.length} units enabled
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={subject.enabled}
                          onCheckedChange={() => toggleSubject(subject.id)}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Unit</TableHead>
                          <TableHead>Lessons</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Enabled</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subject.units.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.name}</TableCell>
                            <TableCell>{unit.lessons} lessons</TableCell>
                            <TableCell>
                              {unit.enabled ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline">Disabled</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Switch
                                checked={unit.enabled}
                                onCheckedChange={() => toggleUnit(subject.id, unit.id)}
                                disabled={!subject.enabled}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
