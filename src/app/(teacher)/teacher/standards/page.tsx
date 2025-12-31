"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  BookOpen,
  Target,
  GraduationCap,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface Standard {
  id: string;
  code: string;
  name: string;
  description: string | null;
  standardBody: string | null;
  gradeLevel: number | null;
  subjectId: string | null;
  subjectName: string | null;
  lessonCount: number;
  createdAt: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Stats {
  total: number;
  byBody: Record<string, number>;
  byGrade: Array<{ gradeLevel: number | null; count: number }>;
  commonCore: number;
  ngss: number;
  custom: number;
}

function getGradeLevelLabel(grade: number | null): string {
  if (grade === null) return "All Grades";
  if (grade === 0) return "Kindergarten";
  if (grade === 1) return "1st Grade";
  if (grade === 2) return "2nd Grade";
  if (grade === 3) return "3rd Grade";
  return `${grade}th Grade`;
}

function StandardBodyBadge({ body }: { body: string | null }) {
  switch (body) {
    case "Common Core":
      return <Badge className="bg-blue-100 text-blue-800">Common Core</Badge>;
    case "NGSS":
      return <Badge className="bg-green-100 text-green-800">NGSS</Badge>;
    case "Custom":
      return <Badge variant="outline">Custom</Badge>;
    default:
      return <Badge variant="secondary">{body || "Unknown"}</Badge>;
  }
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TeacherStandardsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [gradeLevelFilter, setGradeLevelFilter] = useState<string>("");
  const [standardBodyFilter, setStandardBodyFilter] = useState<string>("");

  const [standards, setStandards] = useState<Standard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    byBody: {},
    byGrade: [],
    commonCore: 0,
    ngss: 0,
    custom: 0,
  });

  const fetchStandards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (subjectFilter && subjectFilter !== "all")
        params.set("subjectId", subjectFilter);
      if (gradeLevelFilter && gradeLevelFilter !== "all")
        params.set("gradeLevel", gradeLevelFilter);
      if (standardBodyFilter && standardBodyFilter !== "all")
        params.set("standardBody", standardBodyFilter);

      const response = await fetch(
        `/api/teacher/curriculum/standards?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch standards");
      }
      const data = await response.json();
      setStandards(data.standards);
      setSubjects(data.subjects);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load standards");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, subjectFilter, gradeLevelFilter, standardBodyFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStandards();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStandards]);

  // Group standards by grade level
  const groupedByGrade = standards.reduce(
    (acc, std) => {
      const key = std.gradeLevel !== null ? String(std.gradeLevel) : "all";
      if (!acc[key]) acc[key] = [];
      acc[key].push(std);
      return acc;
    },
    {} as Record<string, Standard[]>
  );

  const sortedGrades = Object.keys(groupedByGrade).sort((a, b) => {
    if (a === "all") return -1;
    if (b === "all") return 1;
    return parseInt(a) - parseInt(b);
  });

  // Calculate coverage percentage
  const coveredStandards = standards.filter((s) => s.lessonCount > 0).length;
  const coveragePercent =
    standards.length > 0
      ? Math.round((coveredStandards / standards.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Standards Alignment
          </h1>
          <p className="text-muted-foreground mt-1">
            View educational standards and their coverage in the curriculum
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/teacher/assignments/new">
            <Target className="h-4 w-4 mr-2" />
            Create Standards-Aligned Assignment
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Standards
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all subjects and grades
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coveragePercent}%</div>
              <Progress value={coveragePercent} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {coveredStandards} of {standards.length} covered by lessons
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Common Core</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.commonCore}</div>
              <p className="text-xs text-muted-foreground">
                Math & ELA standards
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NGSS</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ngss}</div>
              <p className="text-xs text-muted-foreground">Science standards</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Standards</CardTitle>
          <CardDescription>
            Search and filter standards by subject, grade level, or framework
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code, name, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={gradeLevelFilter}
              onValueChange={setGradeLevelFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="0">Kindergarten</SelectItem>
                <SelectItem value="1">1st Grade</SelectItem>
                <SelectItem value="2">2nd Grade</SelectItem>
                <SelectItem value="3">3rd Grade</SelectItem>
                <SelectItem value="4">4th Grade</SelectItem>
                <SelectItem value="5">5th Grade</SelectItem>
                <SelectItem value="6">6th Grade</SelectItem>
                <SelectItem value="7">7th Grade</SelectItem>
                <SelectItem value="8">8th Grade</SelectItem>
                <SelectItem value="9">9th Grade</SelectItem>
                <SelectItem value="10">10th Grade</SelectItem>
                <SelectItem value="11">11th Grade</SelectItem>
                <SelectItem value="12">12th Grade</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={standardBodyFilter}
              onValueChange={setStandardBodyFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Frameworks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                <SelectItem value="Common Core">Common Core</SelectItem>
                <SelectItem value="NGSS">NGSS</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
              ))}
            </div>
          ) : standards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No standards found</p>
              <p className="text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {sortedGrades.map((grade) => (
                <AccordionItem
                  key={grade}
                  value={grade}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        {getGradeLevelLabel(
                          grade === "all" ? null : parseInt(grade)
                        )}
                      </span>
                      <Badge variant="secondary">
                        {groupedByGrade[grade].length} standards
                      </Badge>
                      {groupedByGrade[grade].filter((s) => s.lessonCount > 0)
                        .length > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          {
                            groupedByGrade[grade].filter(
                              (s) => s.lessonCount > 0
                            ).length
                          }{" "}
                          covered
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {groupedByGrade[grade].map((standard) => (
                        <div
                          key={standard.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            standard.lessonCount > 0
                              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                              : "bg-muted/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                                  {standard.code}
                                </code>
                                <StandardBodyBadge body={standard.standardBody} />
                                {standard.subjectName && (
                                  <Badge variant="outline">
                                    {standard.subjectName}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium mt-2">
                                {standard.name}
                              </h4>
                              {standard.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {standard.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              {standard.lessonCount > 0 ? (
                                <div className="flex items-center gap-1 text-green-700 dark:text-green-400">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    {standard.lessonCount} lesson
                                    {standard.lessonCount > 1 ? "s" : ""}
                                  </span>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Not covered
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* External Resources */}
      <Card>
        <CardHeader>
          <CardTitle>External Resources</CardTitle>
          <CardDescription>
            Learn more about educational standards frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="https://www.corestandards.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
            >
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium">Common Core Standards</h4>
                <p className="text-sm text-muted-foreground">
                  Math & ELA standards
                </p>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
            </a>
            <a
              href="https://www.nextgenscience.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
            >
              <GraduationCap className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium">NGSS</h4>
                <p className="text-sm text-muted-foreground">
                  Next Gen Science Standards
                </p>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
            </a>
            <a
              href="https://www.doe.k12.de.us/Page/4097"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
            >
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <h4 className="font-medium">State Standards</h4>
                <p className="text-sm text-muted-foreground">
                  Find your state&apos;s standards
                </p>
              </div>
              <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
