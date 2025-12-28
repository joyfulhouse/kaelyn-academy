import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  BookOpen,
  Microscope,
  Globe,
  Monitor,
  Languages,
  Hand,
  PlayCircle,
  CheckCircle,
  Lock,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSubject, getUnitsForGrade } from "@/data/curriculum";
import type { GradeLevel, Lesson } from "@/data/curriculum";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { lessonProgress } from "@/lib/db/schema/progress";
import { eq, and, isNull, inArray } from "drizzle-orm";

interface SubjectPageProps {
  params: Promise<{ subjectId: string }>;
}

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

// Grade level display names
const gradeNames: Record<GradeLevel, string> = {
  0: "Kindergarten",
  1: "1st Grade",
  2: "2nd Grade",
  3: "3rd Grade",
  4: "4th Grade",
  5: "5th Grade",
  6: "6th Grade",
  7: "7th Grade",
  8: "8th Grade",
  9: "9th Grade",
  10: "10th Grade",
  11: "11th Grade",
  12: "12th Grade",
};

export async function generateMetadata({
  params,
}: SubjectPageProps): Promise<Metadata> {
  const { subjectId } = await params;
  const subject = getSubject(subjectId);

  if (!subject) {
    return {
      title: "Subject Not Found | Kaelyn's Academy",
    };
  }

  return {
    title: `${subject.name} | Kaelyn's Academy`,
    description: subject.description,
  };
}

function LessonStatusIcon({
  lesson,
  isCompleted,
  isLocked
}: {
  lesson: Lesson;
  isCompleted: boolean;
  isLocked: boolean;
}) {
  if (isCompleted) {
    return <CheckCircle className="h-4 w-4 text-success" />;
  }
  if (isLocked) {
    return <Lock className="h-4 w-4 text-muted-foreground" />;
  }
  return <PlayCircle className="h-4 w-4 text-primary" />;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subjectId } = await params;
  const subject = getSubject(subjectId);

  if (!subject) {
    notFound();
  }

  // Get session and grade level from database
  const session = await auth();
  let gradeLevel: GradeLevel = 5; // Default
  let learnerId: string | null = null;
  let completedLessonIds: Set<string> = new Set();

  if (session?.user?.id) {
    // Fetch learner profile for grade level
    const learner = await db.query.learners.findFirst({
      where: and(
        eq(learners.userId, session.user.id),
        isNull(learners.deletedAt)
      ),
      columns: {
        id: true,
        gradeLevel: true,
      },
    });

    if (learner) {
      gradeLevel = (learner.gradeLevel ?? 5) as GradeLevel;
      learnerId = learner.id;
    }
  }

  const units = getUnitsForGrade(subjectId, gradeLevel);
  const totalLessons = units.reduce((acc, unit) => acc + unit.lessons.length, 0);

  // Fetch lesson progress for this learner
  if (learnerId) {
    const allLessonIds = units.flatMap(unit => unit.lessons.map(l => l.id));
    if (allLessonIds.length > 0) {
      const progressData = await db
        .select({
          lessonId: lessonProgress.lessonId,
          status: lessonProgress.status,
        })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.learnerId, learnerId),
            inArray(lessonProgress.lessonId, allLessonIds)
          )
        );

      completedLessonIds = new Set(
        progressData
          .filter(p => p.status === "completed")
          .map(p => p.lessonId)
      );
    }
  }

  const completedLessons = completedLessonIds.size;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const IconComponent = subjectIcons[subject.icon] || BookOpen;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/subjects"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Subjects
      </Link>

      {/* Subject Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div
          className="p-4 rounded-xl shrink-0"
          style={{ backgroundColor: `${subject.color}20` }}
        >
          <div style={{ color: subject.color }}>
            <IconComponent className="h-12 w-12" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{subject.name}</h1>
            <Badge variant="outline">{gradeNames[gradeLevel]}</Badge>
          </div>
          <p className="text-muted-foreground mb-4">{subject.description}</p>

          {/* Progress Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedLessons} of {totalLessons} lessons
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{units.length} units</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>~{Math.ceil(totalLessons * 15 / 60)} hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Units and Lessons */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Course Content
        </h2>

        {units.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No curriculum available for this grade level yet. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {units.map((unit, unitIndex) => {
              // Calculate unit progress from completed lessons
              const unitCompleted = unit.lessons.filter(l => completedLessonIds.has(l.id)).length;
              const unitProgress = unit.lessons.length > 0
                ? (unitCompleted / unit.lessons.length) * 100
                : 0;

              return (
                <AccordionItem
                  key={unit.id}
                  value={unit.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: subject.color }}
                      >
                        {unitIndex + 1}
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold">{unit.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {unit.lessons.length} lessons • {unitCompleted} completed
                        </div>
                      </div>
                      <div className="hidden sm:block w-32">
                        <Progress value={unitProgress} className="h-1.5" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pb-4 space-y-2">
                      {/* Unit Description */}
                      {unit.description && (
                        <p className="text-sm text-muted-foreground mb-4 pl-14">
                          {unit.description}
                        </p>
                      )}

                      {/* Lessons */}
                      {unit.lessons.map((lesson, lessonIndex) => (
                        <Link
                          key={lesson.id}
                          href={`/subjects/${subjectId}/lessons/${lesson.id}`}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group ml-14"
                        >
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium shrink-0">
                            {lessonIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium group-hover:text-primary transition-colors truncate">
                              {lesson.title}
                            </div>
                            {lesson.description && (
                              <div className="text-sm text-muted-foreground truncate">
                                {lesson.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              ~{lesson.duration} min
                            </span>
                            <LessonStatusIcon
                              lesson={lesson}
                              isCompleted={completedLessonIds.has(lesson.id)}
                              isLocked={false}
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </section>

      {/* Start Learning CTA */}
      {units.length > 0 && units[0].lessons.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  Ready to start learning?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Begin with the first lesson or continue where you left off.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href={`/subjects/${subjectId}/lessons/${units[0].lessons[0].id}`}>
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Learning
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
