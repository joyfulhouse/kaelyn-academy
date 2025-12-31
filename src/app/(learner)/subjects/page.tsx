"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calculator,
  BookOpen,
  Microscope,
  Globe,
  Monitor,
  Languages,
  Hand,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllSubjects, getTotalLessonCount, getUnitsForGrade } from "@/data/curriculum";
import type { GradeLevel } from "@/data/curriculum";

// Icon mapping for subjects
const subjectIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator: Calculator,
  BookOpen: BookOpen,
  Microscope: Microscope,
  Globe: Globe,
  Monitor: Monitor,
  Languages: Languages,
  Hand: Hand,
};

// Subject categories for grouping
const subjectCategories = {
  core: ["math", "reading", "science", "history", "technology"],
  languages: ["spanish", "french", "german", "mandarin", "japanese", "asl"],
};

interface Learner {
  id: string;
  name: string;
  gradeLevel: number;
}

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  masteryLevel: number;
  completedLessons: number;
  totalLessons: number;
}

function SubjectsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-72 mt-2" />
      </div>
      <section>
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function SubjectsPage() {
  const [loading, setLoading] = useState(true);
  const [learner, setLearner] = useState<Learner | null>(null);
  const [progress, setProgress] = useState<SubjectProgress[]>([]);

  const fetchData = useCallback(async () => {
    try {
      // Fetch learner data
      const learnersRes = await fetch("/api/learners");
      if (learnersRes.ok) {
        const data = await learnersRes.json();
        if (data.learners?.length > 0) {
          const firstLearner = data.learners[0];
          setLearner(firstLearner);

          // Fetch progress for this learner
          const progressRes = await fetch(`/api/progress?learnerId=${firstLearner.id}&type=subject`);
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            setProgress(progressData.progress || []);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gradeLevel: GradeLevel = (learner?.gradeLevel as GradeLevel) ?? 5;
  const subjects = getAllSubjects();

  const coreSubjects = subjects.filter((s) => subjectCategories.core.includes(s.id));
  const languageSubjects = subjects.filter((s) => subjectCategories.languages.includes(s.id));

  // Get progress for a subject
  const getSubjectProgress = (subjectId: string) => {
    const found = progress.find(
      (p) => p.subjectId === subjectId || p.subjectName?.toLowerCase() === subjectId
    );
    if (found && found.totalLessons > 0) {
      return Math.round((found.completedLessons / found.totalLessons) * 100);
    }
    return 0;
  };

  if (loading) {
    return <SubjectsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
        <p className="text-muted-foreground mt-2">
          Choose a subject to start learning. Your progress is saved automatically.
        </p>
        {learner && (
          <p className="text-sm text-muted-foreground mt-1">
            Showing content for Grade {gradeLevel === 0 ? "K" : gradeLevel}
          </p>
        )}
      </div>

      {/* Core Subjects */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Core Subjects
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {coreSubjects.map((subject) => {
            const IconComponent = subjectIcons[subject.icon] || BookOpen;
            const totalLessons = getTotalLessonCount(subject.id);
            const unitsForGrade = getUnitsForGrade(subject.id, gradeLevel);
            const lessonsInGrade = unitsForGrade.reduce(
              (acc, unit) => acc + unit.lessons.length,
              0
            );
            const progressPercent = getSubjectProgress(subject.id);

            return (
              <Link key={subject.id} href={`/subjects/${subject.id}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        <div style={{ color: subject.color }}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {unitsForGrade.length} units
                      </Badge>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {subject.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {subject.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{lessonsInGrade} lessons for your grade</span>
                      <span className="text-xs">{totalLessons} total</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: subject.color,
                          width: `${progressPercent}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {progressPercent}% complete
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Languages */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          World Languages
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Learn a new language with interactive lessons aligned to ACTFL World-Readiness Standards.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {languageSubjects.map((subject) => {
            const IconComponent = subjectIcons[subject.icon] || Languages;
            const totalLessons = getTotalLessonCount(subject.id);
            const unitsForGrade = getUnitsForGrade(subject.id, gradeLevel);
            const lessonsInGrade = unitsForGrade.reduce(
              (acc, unit) => acc + unit.lessons.length,
              0
            );
            const progressPercent = getSubjectProgress(subject.id);

            return (
              <Link key={subject.id} href={`/subjects/${subject.id}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        <div style={{ color: subject.color }}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {unitsForGrade.length} units
                      </Badge>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {subject.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {subject.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{lessonsInGrade} lessons for your grade</span>
                      <span className="text-xs">{totalLessons} total</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: subject.color,
                          width: `${progressPercent}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {progressPercent}% complete
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
