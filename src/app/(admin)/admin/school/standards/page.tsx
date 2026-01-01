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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Target,
  Save,
  Loader2,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Beaker,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Standard {
  id: string;
  code: string;
  description: string;
  grade: string;
  enabled: boolean;
  coverage: number;
  lessonsAligned: number;
  totalLessons: number;
}

interface StandardGroup {
  name: string;
  icon: LucideIcon;
  framework: string;
  standards: Standard[];
}

export default function StandardsAlignmentPage() {
  const [groups, setGroups] = useState<StandardGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("ccss");

  useEffect(() => {
    fetchStandards();
  }, [selectedFramework]);

  const fetchStandards = async () => {
    try {
      const res = await fetch(`/api/admin/school/standards?framework=${selectedFramework}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      } else {
        // Mock data
        setGroups([
          {
            name: "Mathematics",
            icon: Calculator,
            framework: "Common Core State Standards",
            standards: [
              { id: "1", code: "CCSS.MATH.3.OA.A.1", description: "Interpret products of whole numbers", grade: "3", enabled: true, coverage: 100, lessonsAligned: 8, totalLessons: 8 },
              { id: "2", code: "CCSS.MATH.3.OA.A.2", description: "Interpret quotients of whole numbers", grade: "3", enabled: true, coverage: 85, lessonsAligned: 6, totalLessons: 7 },
              { id: "3", code: "CCSS.MATH.3.NBT.A.1", description: "Use place value to round whole numbers", grade: "3", enabled: true, coverage: 100, lessonsAligned: 5, totalLessons: 5 },
              { id: "4", code: "CCSS.MATH.4.OA.A.1", description: "Interpret multiplication equations", grade: "4", enabled: true, coverage: 70, lessonsAligned: 7, totalLessons: 10 },
              { id: "5", code: "CCSS.MATH.4.NF.A.1", description: "Explain fraction equivalence", grade: "4", enabled: false, coverage: 0, lessonsAligned: 0, totalLessons: 6 },
            ],
          },
          {
            name: "English Language Arts",
            icon: BookOpen,
            framework: "Common Core State Standards",
            standards: [
              { id: "6", code: "CCSS.ELA.RL.3.1", description: "Ask and answer questions about key details", grade: "3", enabled: true, coverage: 100, lessonsAligned: 12, totalLessons: 12 },
              { id: "7", code: "CCSS.ELA.RL.3.2", description: "Recount stories and determine central message", grade: "3", enabled: true, coverage: 90, lessonsAligned: 9, totalLessons: 10 },
              { id: "8", code: "CCSS.ELA.RI.3.1", description: "Ask questions to demonstrate understanding", grade: "3", enabled: true, coverage: 75, lessonsAligned: 6, totalLessons: 8 },
            ],
          },
          {
            name: "Science",
            icon: Beaker,
            framework: "Next Generation Science Standards",
            standards: [
              { id: "9", code: "3-LS1-1", description: "Develop models of life cycles", grade: "3", enabled: true, coverage: 100, lessonsAligned: 6, totalLessons: 6 },
              { id: "10", code: "3-LS3-1", description: "Analyze inheritance of traits", grade: "3", enabled: true, coverage: 80, lessonsAligned: 4, totalLessons: 5 },
              { id: "11", code: "3-ESS2-1", description: "Represent weather conditions", grade: "3", enabled: false, coverage: 0, lessonsAligned: 0, totalLessons: 4 },
            ],
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch standards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/school/standards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groups, framework: selectedFramework }),
      });
    } catch (error) {
      console.error("Failed to save standards:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleStandard = (groupIndex: number, standardIndex: number) => {
    const newGroups = [...groups];
    newGroups[groupIndex].standards[standardIndex].enabled =
      !newGroups[groupIndex].standards[standardIndex].enabled;
    setGroups(newGroups);
  };

  const totalStandards = groups.reduce((sum, g) => sum + g.standards.length, 0);
  const enabledStandards = groups.reduce(
    (sum, g) => sum + g.standards.filter((s) => s.enabled).length,
    0
  );
  const fullCoverage = groups.reduce(
    (sum, g) => sum + g.standards.filter((s) => s.coverage === 100).length,
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Standards Alignment</h1>
          <p className="text-muted-foreground">
            Map curriculum to state and national standards.
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ccss">Common Core (CCSS)</SelectItem>
              <SelectItem value="ngss">Next Gen Science (NGSS)</SelectItem>
              <SelectItem value="texas">Texas TEKS</SelectItem>
              <SelectItem value="california">California Standards</SelectItem>
              <SelectItem value="custom">Custom Standards</SelectItem>
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Standards</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledStandards}/{totalStandards}</div>
            <p className="text-xs text-muted-foreground">Standards enabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Full Coverage</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fullCoverage}</div>
            <p className="text-xs text-muted-foreground">100% aligned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {enabledStandards - fullCoverage}
            </div>
            <p className="text-xs text-muted-foreground">Partial coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Standards Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Standards by Subject</CardTitle>
          <CardDescription>
            Enable or disable standards and view curriculum coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {groups.map((group, groupIndex) => {
              const IconComponent = group.icon;
              return (
              <AccordionItem key={group.name} value={group.name}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    <span>{group.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {group.standards.filter((s) => s.enabled).length}/{group.standards.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Framework: {group.framework}
                    </p>
                    {group.standards.map((standard, standardIndex) => (
                      <div
                        key={standard.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={standard.enabled}
                            onCheckedChange={() => toggleStandard(groupIndex, standardIndex)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{standard.code}</Badge>
                              <Badge variant="secondary">Grade {standard.grade}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {standard.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Progress value={standard.coverage} className="w-24" />
                              <span className="text-sm font-medium">{standard.coverage}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {standard.lessonsAligned}/{standard.totalLessons} lessons
                            </p>
                          </div>
                          {standard.coverage === 100 && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {standard.coverage > 0 && standard.coverage < 100 && (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
