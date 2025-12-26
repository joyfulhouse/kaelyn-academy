import { Metadata } from "next";
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
import { getAllSubjects, getTotalLessonCount, getUnitsForGrade } from "@/data/curriculum";
import type { GradeLevel } from "@/data/curriculum";

export const metadata: Metadata = {
  title: "Subjects | Kaelyn's Academy",
  description: "Explore all subjects and start learning",
};

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

export default function SubjectsPage() {
  // TODO: Get grade level from user profile/session
  const gradeLevel: GradeLevel = 5;

  const subjects = getAllSubjects();

  const coreSubjects = subjects.filter((s) => subjectCategories.core.includes(s.id));
  const languageSubjects = subjects.filter((s) => subjectCategories.languages.includes(s.id));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
        <p className="text-muted-foreground mt-2">
          Choose a subject to start learning. Your progress is saved automatically.
        </p>
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
                    {/* Progress bar placeholder */}
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: subject.color,
                          width: "0%", // TODO: Calculate from user progress
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      0% complete
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
                    {/* Progress bar placeholder */}
                    <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: subject.color,
                          width: "0%", // TODO: Calculate from user progress
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      0% complete
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
