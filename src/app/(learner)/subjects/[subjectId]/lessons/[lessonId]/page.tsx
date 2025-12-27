import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Target,
  Clock,
  BookOpen,
  Lightbulb,
  Play,
} from "lucide-react";
import { LessonVisualization } from "@/components/3d/lesson-visualization";
import { ActivityList } from "@/components/curriculum/activity-list";
import { AssessmentTab } from "@/components/curriculum/assessment-tab";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSubject, getUnitsForGrade, getLesson } from "@/data/curriculum";
import type { GradeLevel, Lesson, Unit } from "@/data/curriculum";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { learners } from "@/lib/db/schema/users";
import { lessonProgress as lessonProgressTable } from "@/lib/db/schema/progress";
import { eq, and, isNull } from "drizzle-orm";

interface LessonPageProps {
  params: Promise<{ subjectId: string; lessonId: string }>;
}

// Bloom's level descriptions
const bloomsDescriptions: Record<string, string> = {
  remember: "Recall facts and basic concepts",
  understand: "Explain ideas or concepts",
  apply: "Use information in new situations",
  analyze: "Draw connections among ideas",
  evaluate: "Justify a stand or decision",
  create: "Produce new or original work",
};

function findLessonAndContext(
  subjectId: string,
  lessonId: string,
  grade: GradeLevel
): {
  lesson: Lesson | undefined;
  unit: Unit | undefined;
  prevLesson: Lesson | undefined;
  nextLesson: Lesson | undefined;
  unitIndex: number;
  lessonIndex: number;
} {
  const units = getUnitsForGrade(subjectId, grade);

  for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
    const unit = units[unitIndex];
    const lessonIndex = unit.lessons.findIndex((l) => l.id === lessonId);

    if (lessonIndex !== -1) {
      const lesson = unit.lessons[lessonIndex];

      // Find previous lesson
      let prevLesson: Lesson | undefined;
      if (lessonIndex > 0) {
        prevLesson = unit.lessons[lessonIndex - 1];
      } else if (unitIndex > 0) {
        const prevUnit = units[unitIndex - 1];
        prevLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
      }

      // Find next lesson
      let nextLesson: Lesson | undefined;
      if (lessonIndex < unit.lessons.length - 1) {
        nextLesson = unit.lessons[lessonIndex + 1];
      } else if (unitIndex < units.length - 1) {
        const nextUnit = units[unitIndex + 1];
        nextLesson = nextUnit.lessons[0];
      }

      return { lesson, unit, prevLesson, nextLesson, unitIndex, lessonIndex };
    }
  }

  return {
    lesson: undefined,
    unit: undefined,
    prevLesson: undefined,
    nextLesson: undefined,
    unitIndex: -1,
    lessonIndex: -1,
  };
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { subjectId, lessonId } = await params;
  // Note: Metadata generation uses default grade level since session isn't available
  // The actual page component fetches the correct grade level from the user's profile
  const gradeLevel: GradeLevel = 5;
  const { lesson } = findLessonAndContext(subjectId, lessonId, gradeLevel);
  const subject = getSubject(subjectId);

  if (!lesson || !subject) {
    return {
      title: "Lesson Not Found | Kaelyn's Academy",
    };
  }

  return {
    title: `${lesson.title} | ${subject.name} | Kaelyn's Academy`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { subjectId, lessonId } = await params;

  const subject = getSubject(subjectId);
  if (!subject) {
    notFound();
  }

  // Get session and grade level from database
  const session = await auth();
  let gradeLevel: GradeLevel = 5; // Default
  let learnerId: string | null = null;

  if (session?.user?.id) {
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

  const { lesson, unit, prevLesson, nextLesson, lessonIndex } = findLessonAndContext(
    subjectId,
    lessonId,
    gradeLevel
  );

  if (!lesson || !unit) {
    notFound();
  }

  // Fetch lesson progress from database
  let currentLessonProgress = 0;
  let completedObjectives = new Set<string>();

  if (learnerId) {
    // Note: lessonId in curriculum data is a string like "math-5-1-1"
    // We need to find the database lesson by matching the slug or use the progress directly
    const progressData = await db
      .select({
        progressPercent: lessonProgressTable.progressPercent,
        status: lessonProgressTable.status,
      })
      .from(lessonProgressTable)
      .where(
        and(
          eq(lessonProgressTable.learnerId, learnerId),
          eq(lessonProgressTable.lessonId, lessonId)
        )
      )
      .limit(1);

    if (progressData.length > 0) {
      currentLessonProgress = Math.round(progressData[0].progressPercent ?? 0);

      // If lesson is completed, mark all objectives as complete
      if (progressData[0].status === "completed") {
        completedObjectives = new Set(lesson.objectives.map(o => o.id));
      } else if (currentLessonProgress > 0) {
        // Estimate which objectives are complete based on progress percentage
        const estimatedComplete = Math.floor(
          (currentLessonProgress / 100) * lesson.objectives.length
        );
        lesson.objectives.slice(0, estimatedComplete).forEach(o => {
          completedObjectives.add(o.id);
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/subjects"
          className="hover:text-foreground transition-colors"
        >
          Subjects
        </Link>
        <span>/</span>
        <Link
          href={`/subjects/${subjectId}`}
          className="hover:text-foreground transition-colors"
        >
          {subject.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      {/* Lesson Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="secondary">{unit.title}</Badge>
            <Badge variant="outline">Lesson {lessonIndex + 1}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {lesson.title}
          </h1>
          <p className="text-muted-foreground">{lesson.description}</p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{lesson.objectives.length} objectives</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{lesson.activities.length} activities</span>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="lg:w-72">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-primary">
                {currentLessonProgress}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <Progress value={currentLessonProgress} className="h-2 mb-4" />
            <Button className="w-full" size="lg">
              <Play className="h-4 w-4 mr-2" />
              {currentLessonProgress === 0 ? "Start Lesson" : "Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Lesson</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-6 space-y-6">
              {/* 3D Visualization */}
              <Card className="overflow-hidden">
                <LessonVisualization
                  subjectId={subjectId}
                  lessonId={lessonId}
                  lessonTitle={lesson.title}
                  gradeLevel={gradeLevel}
                />
              </Card>

              {/* Lesson Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lesson Content</CardTitle>
                  <CardDescription>
                    Learn the key concepts for this lesson
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                  <p>
                    Welcome to <strong>{lesson.title}</strong>! In this lesson,
                    you'll explore fundamental concepts and develop practical
                    skills.
                  </p>
                  <p>
                    This lesson is designed to take approximately{" "}
                    {lesson.duration} minutes to complete. Take your time to
                    understand each concept before moving on.
                  </p>
                  <h3>What You'll Learn</h3>
                  <ul>
                    {lesson.objectives.map((obj) => (
                      <li key={obj.id}>{obj.description}</li>
                    ))}
                  </ul>
                  <p className="text-muted-foreground italic">
                    Full lesson content will be generated dynamically based on
                    curriculum data and AI assistance.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="mt-6 space-y-4">
              <ActivityList
                lessonId={lessonId}
                activities={lesson.activities}
              />
            </TabsContent>

            <TabsContent value="assessment" className="mt-6">
              <AssessmentTab
                lessonId={lessonId}
                assessmentType={lesson.assessmentType}
                activities={lesson.activities}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Learning Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lesson.objectives.map((objective) => (
                <div
                  key={objective.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      completedObjectives.has(objective.id)
                        ? "bg-green-500 text-white"
                        : "bg-muted"
                    }`}
                  >
                    {completedObjectives.has(objective.id) && (
                      <CheckCircle className="h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{objective.description}</p>
                    <Badge variant="outline" className="text-xs mt-1 capitalize">
                      {objective.bloomsLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prerequisites */}
          {lesson.prerequisites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {lesson.prerequisites.map((prereqId) => {
                    const prereq = getLesson(subjectId, gradeLevel, prereqId);
                    if (!prereq) return null;
                    return (
                      <li key={prereqId}>
                        <Link
                          href={`/subjects/${subjectId}/lessons/${prereqId}`}
                          className="text-primary hover:underline"
                        >
                          {prereq.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask our AI tutor for personalized explanations
                  </p>
                  <Button variant="link" className="h-auto p-0 mt-2" asChild>
                    <Link href="/tutor">Open AI Tutor →</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t">
        {prevLesson ? (
          <Button variant="outline" asChild>
            <Link href={`/subjects/${subjectId}/lessons/${prevLesson.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {prevLesson.title}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={`/subjects/${subjectId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {subject.name}
            </Link>
          </Button>
        )}

        {nextLesson ? (
          <Button asChild>
            <Link href={`/subjects/${subjectId}/lessons/${nextLesson.id}`}>
              {nextLesson.title}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href={`/subjects/${subjectId}`}>
              Complete Unit
              <CheckCircle className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
