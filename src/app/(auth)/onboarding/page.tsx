"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  Users,
  School,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  PartyPopper,
  Calendar,
  Palette,
  BookOpen,
  Sparkles,
  Target,
  Trophy,
  Bot,
  Check,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AVATAR_COLLECTION, getAvatarById } from "@/components/ui/avatar-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Role = "parent" | "teacher" | "learner";

interface LearnerProfile {
  name: string;
  gradeLevel: number;
  birthYear?: number;
  birthMonth?: number;
  avatarId?: string;
}

interface OnboardingState {
  step: number;
  role: Role | null;
  // For parents
  learners: LearnerProfile[];
  // For self-learners
  birthYear?: number;
  birthMonth?: number;
  gradeLevel: number;
  avatarId: string;
  favoriteSubjects: string[];
  learningGoals: string[];
  classCode?: string;
  parentEmail?: string;
  // Track what needs COPPA consent
  needsCoppaConsent: boolean;
}

// Default subjects
const SUBJECTS = [
  { id: "math", name: "Math", emoji: "🔢", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "reading", name: "Reading", emoji: "📚", color: "bg-green-100 dark:bg-green-900/30" },
  { id: "science", name: "Science", emoji: "🔬", color: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "history", name: "History", emoji: "🏛️", color: "bg-amber-100 dark:bg-amber-900/30" },
  { id: "technology", name: "Technology", emoji: "💻", color: "bg-cyan-100 dark:bg-cyan-900/30" },
];

// Default learning goals
const LEARNING_GOALS = [
  { id: "daily", label: "Learn something new every day", emoji: "📅" },
  { id: "math-master", label: "Master math fundamentals", emoji: "➕" },
  { id: "reading-champ", label: "Read more books", emoji: "📖" },
  { id: "science-explorer", label: "Explore science topics", emoji: "🧪" },
  { id: "streak", label: "Build a learning streak", emoji: "🔥" },
  { id: "achievements", label: "Earn all achievements", emoji: "🏆" },
];

// Grade level display
const GRADE_LEVELS = [
  { value: 0, label: "Kindergarten", shortLabel: "K", ageRange: "5-6" },
  { value: 1, label: "1st Grade", shortLabel: "1st", ageRange: "6-7" },
  { value: 2, label: "2nd Grade", shortLabel: "2nd", ageRange: "7-8" },
  { value: 3, label: "3rd Grade", shortLabel: "3rd", ageRange: "8-9" },
  { value: 4, label: "4th Grade", shortLabel: "4th", ageRange: "9-10" },
  { value: 5, label: "5th Grade", shortLabel: "5th", ageRange: "10-11" },
  { value: 6, label: "6th Grade", shortLabel: "6th", ageRange: "11-12" },
  { value: 7, label: "7th Grade", shortLabel: "7th", ageRange: "12-13" },
  { value: 8, label: "8th Grade", shortLabel: "8th", ageRange: "13-14" },
  { value: 9, label: "9th Grade", shortLabel: "9th", ageRange: "14-15" },
  { value: 10, label: "10th Grade", shortLabel: "10th", ageRange: "15-16" },
  { value: 11, label: "11th Grade", shortLabel: "11th", ageRange: "16-17" },
  { value: 12, label: "12th Grade", shortLabel: "12th", ageRange: "17-18" },
];

// Generate years for birthdate selection (last 20 years for learners)
const currentYear = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 20 }, (_, i) => currentYear - 5 - i);
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Calculate age from birth year and month
function calculateAge(birthYear: number, birthMonth: number): number {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  let age = today.getFullYear() - birthYear;
  if (currentMonth < birthMonth) age--;
  return age;
}

// Estimate grade level from age
function estimateGradeLevel(age: number): number {
  if (age <= 5) return 0; // Kindergarten
  if (age >= 18) return 12; // 12th grade
  return Math.min(12, Math.max(0, age - 5));
}

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [state, setState] = useState<OnboardingState>({
    step: 1,
    role: null,
    learners: [{ name: "", gradeLevel: 5 }],
    gradeLevel: 5,
    avatarId: "star",
    favoriteSubjects: [],
    learningGoals: [],
    needsCoppaConsent: false,
  });

  // Calculate total steps based on role
  const getTotalSteps = useCallback(() => {
    if (state.role === "parent") return 3; // Role -> Add children -> Complete
    if (state.role === "teacher") return 2; // Role -> Complete
    if (state.role === "learner") {
      if (state.needsCoppaConsent) return 8; // With COPPA consent
      return 7; // Without COPPA: Role -> Birthdate -> Grade -> Avatar -> Subjects -> Goals -> Complete
    }
    return 7;
  }, [state.role, state.needsCoppaConsent]);

  // Update state helper
  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Handle role selection
  const handleRoleSelect = (role: Role) => {
    updateState({ role, step: 2 });
  };

  // Handle birthdate change and check if COPPA consent is needed
  const handleBirthdateChange = (year: number, month: number) => {
    const age = calculateAge(year, month);
    const estimatedGrade = estimateGradeLevel(age);
    const needsCoppa = age < 13;

    updateState({
      birthYear: year,
      birthMonth: month,
      gradeLevel: estimatedGrade,
      needsCoppaConsent: needsCoppa,
    });
  };

  // Handle subject toggle
  const toggleSubject = (subjectId: string) => {
    setState((prev) => ({
      ...prev,
      favoriteSubjects: prev.favoriteSubjects.includes(subjectId)
        ? prev.favoriteSubjects.filter((s) => s !== subjectId)
        : [...prev.favoriteSubjects, subjectId],
    }));
  };

  // Handle goal toggle
  const toggleGoal = (goalId: string) => {
    setState((prev) => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goalId)
        ? prev.learningGoals.filter((g) => g !== goalId)
        : [...prev.learningGoals, goalId],
    }));
  };

  // Handle learner updates for parent flow
  const addLearner = () => {
    setState((prev) => ({
      ...prev,
      learners: [...prev.learners, { name: "", gradeLevel: 5 }],
    }));
  };

  const updateLearner = (index: number, field: keyof LearnerProfile, value: string | number) => {
    setState((prev) => {
      const updated = [...prev.learners];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, learners: updated };
    });
  };

  const removeLearner = (index: number) => {
    if (state.learners.length > 1) {
      setState((prev) => ({
        ...prev,
        learners: prev.learners.filter((_, i) => i !== index),
      }));
    }
  };

  // Handle completion
  const handleComplete = async () => {
    if (!state.role) return;

    setLoading(true);
    try {
      // Update user role
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: state.role,
          preferences: {
            avatarId: state.avatarId,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
          },
        }),
      });

      // Create learner profiles if parent
      if (state.role === "parent" && state.learners.some((l) => l.name.trim())) {
        for (const learner of state.learners) {
          if (learner.name.trim()) {
            await fetch("/api/learners", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: learner.name,
                gradeLevel: learner.gradeLevel,
                avatarId: learner.avatarId,
              }),
            });
          }
        }
      }

      // If self-learner, create self as learner
      if (state.role === "learner") {
        await fetch("/api/learners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session?.user?.name || "Student",
            gradeLevel: state.gradeLevel,
            avatarId: state.avatarId,
            preferences: {
              favoriteSubjects: state.favoriteSubjects,
              learningGoals: state.learningGoals,
            },
          }),
        });
      }

      // Refresh session and redirect
      await update();

      // Redirect based on role
      if (state.role === "parent") {
        router.push("/parent/children");
      } else if (state.role === "teacher") {
        router.push("/teacher/classes");
      } else {
        router.push("/dashboard?tour=true");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate steps
  const nextStep = () => {
    if (state.step < getTotalSteps()) {
      updateState({ step: state.step + 1 });
    }
  };

  const prevStep = () => {
    if (state.step > 1) {
      updateState({ step: state.step - 1 });
    }
  };

  // Get current avatar
  const currentAvatar = getAvatarById(state.avatarId);

  // Roles configuration
  const roles = [
    {
      id: "parent" as Role,
      title: "Parent/Guardian",
      description: "I'm setting up learning for my child",
      icon: Users,
    },
    {
      id: "teacher" as Role,
      title: "Teacher",
      description: "I'm managing a classroom of students",
      icon: School,
    },
    {
      id: "learner" as Role,
      title: "Learner",
      description: "I'm learning on my own",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
            <PartyPopper className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to Kaelyn&apos;s Academy!
          </CardTitle>
          <CardDescription>
            {state.step === 1
              ? "Let's get your account set up"
              : `Step ${state.step} of ${getTotalSteps()}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center gap-1.5">
            {Array.from({ length: getTotalSteps() }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 rounded-full transition-all",
                  s < state.step ? "w-8 bg-primary" : "",
                  s === state.step ? "w-12 bg-primary" : "",
                  s > state.step ? "w-4 bg-muted" : ""
                )}
              />
            ))}
          </div>

          {/* Step 1: Role Selection */}
          {state.step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">
                How will you be using Kaelyn&apos;s Academy?
              </h3>
              <div className="grid gap-3">
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5",
                        state.role === r.id ? "border-primary bg-primary/5" : "border-border"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{r.title}</div>
                          <div className="text-sm text-muted-foreground">{r.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Learner Flow: Step 2 - Birthdate (Age Verification) */}
          {state.step === 2 && state.role === "learner" && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">When were you born?</h3>
                <p className="text-sm text-muted-foreground">
                  This helps us personalize your learning experience
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select
                    value={state.birthMonth?.toString()}
                    onValueChange={(value) => {
                      if (state.birthYear) {
                        handleBirthdateChange(state.birthYear, parseInt(value));
                      } else {
                        updateState({ birthMonth: parseInt(value) });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={month} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    value={state.birthYear?.toString()}
                    onValueChange={(value) => {
                      if (state.birthMonth) {
                        handleBirthdateChange(parseInt(value), state.birthMonth);
                      } else {
                        updateState({ birthYear: parseInt(value) });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIRTH_YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {state.birthYear && state.birthMonth && (
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-center">
                    Based on your age, we recommend{" "}
                    <span className="font-semibold text-primary">
                      {GRADE_LEVELS[state.gradeLevel]?.label}
                    </span>{" "}
                    content
                  </p>
                </div>
              )}

              {state.needsCoppaConsent && state.birthYear && state.birthMonth && (
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
                  <p className="text-sm text-center">
                    <span className="font-semibold">Parent/Guardian Required:</span> Since you&apos;re under 13,
                    we&apos;ll need a parent to verify your account.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={nextStep}
                  disabled={!state.birthYear || !state.birthMonth}
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Learner Flow: COPPA Consent Step (if needed) */}
          {state.step === 3 && state.role === "learner" && state.needsCoppaConsent && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <h3 className="text-lg font-semibold">Parent Verification Needed</h3>
                <p className="text-sm text-muted-foreground">
                  To protect your privacy, we need a parent or guardian to approve your account.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Parent&apos;s Email Address</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    placeholder="parent@example.com"
                    value={state.parentEmail || ""}
                    onChange={(e) => updateState({ parentEmail: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send them a verification link to approve your account
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                  <h4 className="text-sm font-semibold">What happens next?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      Your parent will receive an email with a verification link
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      They&apos;ll review and approve your account
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      You&apos;ll get full access to start learning!
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={nextStep}
                  disabled={!state.parentEmail}
                >
                  Send Verification
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Learner Flow: Grade Level Selection */}
          {((state.step === 3 && state.role === "learner" && !state.needsCoppaConsent) ||
            (state.step === 4 && state.role === "learner" && state.needsCoppaConsent)) && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">What grade are you in?</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll customize your learning content
                </p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {GRADE_LEVELS.map((grade) => (
                  <button
                    key={grade.value}
                    onClick={() => updateState({ gradeLevel: grade.value })}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-center",
                      "hover:border-primary hover:bg-primary/5",
                      state.gradeLevel === grade.value
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <div className="text-lg font-bold text-primary">{grade.shortLabel}</div>
                    <div className="text-xs text-muted-foreground">{grade.ageRange}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={nextStep}>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Learner Flow: Avatar Selection */}
          {((state.step === 4 && state.role === "learner" && !state.needsCoppaConsent) ||
            (state.step === 5 && state.role === "learner" && state.needsCoppaConsent)) && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Choose Your Avatar</h3>
                <p className="text-sm text-muted-foreground">
                  Pick a fun character to represent you
                </p>
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                <Avatar className="h-20 w-20 border-4 border-primary/20">
                  <AvatarFallback className={cn("text-4xl", currentAvatar?.color)}>
                    {currentAvatar?.emoji || "⭐"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-6 gap-2 py-2">
                {AVATAR_COLLECTION.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => updateState({ avatarId: avatar.id })}
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 rounded-lg transition-all mx-auto",
                      avatar.color,
                      "hover:ring-2 hover:ring-primary hover:ring-offset-2",
                      state.avatarId === avatar.id && "ring-2 ring-primary ring-offset-2"
                    )}
                    title={avatar.label}
                  >
                    <span className="text-2xl">{avatar.emoji}</span>
                    {state.avatarId === avatar.id && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={nextStep}>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Learner Flow: Subject Preferences */}
          {((state.step === 5 && state.role === "learner" && !state.needsCoppaConsent) ||
            (state.step === 6 && state.role === "learner" && state.needsCoppaConsent)) && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">What do you love to learn?</h3>
                <p className="text-sm text-muted-foreground">
                  Select your favorite subjects (pick as many as you like!)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      "hover:border-primary hover:bg-primary/5",
                      state.favoriteSubjects.includes(subject.id)
                        ? "border-primary bg-primary/10"
                        : "border-border",
                      subject.color
                    )}
                  >
                    <div className="text-3xl mb-2">{subject.emoji}</div>
                    <div className="text-sm font-medium">{subject.name}</div>
                    {state.favoriteSubjects.includes(subject.id) && (
                      <Check className="h-4 w-4 mx-auto mt-2 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={nextStep}>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Learner Flow: Learning Goals */}
          {((state.step === 6 && state.role === "learner" && !state.needsCoppaConsent) ||
            (state.step === 7 && state.role === "learner" && state.needsCoppaConsent)) && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Set Your Goals</h3>
                <p className="text-sm text-muted-foreground">
                  What would you like to achieve? (Optional)
                </p>
              </div>

              <div className="space-y-2">
                {LEARNING_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={cn(
                      "w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                      "hover:border-primary hover:bg-primary/5",
                      state.learningGoals.includes(goal.id)
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <span className="text-2xl">{goal.emoji}</span>
                    <span className="flex-1 text-sm font-medium">{goal.label}</span>
                    {state.learningGoals.includes(goal.id) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={nextStep}>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Learner Flow: Completion */}
          {((state.step === 7 && state.role === "learner" && !state.needsCoppaConsent) ||
            (state.step === 8 && state.role === "learner" && state.needsCoppaConsent)) && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={cn("text-2xl", currentAvatar?.color)}>
                      {currentAvatar?.emoji}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-xl font-bold">You&apos;re All Set! 🎉</h3>
                <p className="text-sm text-muted-foreground">
                  Get ready for an amazing learning adventure!
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Grade</span>
                  <span className="text-sm font-medium">{GRADE_LEVELS[state.gradeLevel]?.label}</span>
                </div>
                {state.favoriteSubjects.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Favorite Subjects</span>
                    <span className="text-sm font-medium">
                      {state.favoriteSubjects.map((id) =>
                        SUBJECTS.find((s) => s.id === id)?.emoji
                      ).join(" ")}
                    </span>
                  </div>
                )}
                {state.learningGoals.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Goals</span>
                    <span className="text-sm font-medium">
                      {state.learningGoals.length} selected
                    </span>
                  </div>
                )}
              </div>

              {/* Achievements Preview */}
              <div className="p-4 border rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  <span className="text-sm font-medium">Earn Achievements!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete lessons, build streaks, and collect badges as you learn.
                </p>
              </div>

              {/* AI Tutor Preview */}
              <div className="p-4 border rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Meet Your AI Tutor</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Stuck on a problem? Ask for hints and explanations anytime!
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Getting ready...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Start Learning!
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Parent Flow: Step 2 - Add Children */}
          {state.step === 2 && state.role === "parent" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">
                Add your child&apos;s information
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                You can add more children later from your parent dashboard.
              </p>

              {state.learners.map((learner, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Child {index + 1}</Label>
                    {state.learners.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLearner(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Child's name"
                    value={learner.name}
                    onChange={(e) => updateLearner(index, "name", e.target.value)}
                  />
                  <Select
                    value={learner.gradeLevel.toString()}
                    onValueChange={(value) => updateLearner(index, "gradeLevel", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((g) => (
                        <SelectItem key={g.value} value={g.value.toString()}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Avatar picker for each child */}
                  <div className="flex items-center gap-3">
                    <Label className="text-sm">Avatar:</Label>
                    <div className="flex gap-2">
                      {AVATAR_COLLECTION.slice(0, 6).map((avatar) => (
                        <button
                          key={avatar.id}
                          onClick={() => updateLearner(index, "avatarId", avatar.id)}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            avatar.color,
                            "hover:ring-2 hover:ring-primary",
                            learner.avatarId === avatar.id && "ring-2 ring-primary"
                          )}
                        >
                          <span className="text-lg">{avatar.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full gap-2" onClick={addLearner}>
                <Plus className="h-4 w-4" />
                Add Another Child
              </Button>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading || !state.learners.some((l) => l.name.trim())}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Teacher Flow: Step 2 - Confirmation */}
          {state.step === 2 && state.role === "teacher" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Teacher Setup</h3>
              <p className="text-sm text-muted-foreground text-center">
                You&apos;ll be able to create classes and invite students from your teacher dashboard.
              </p>

              <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  <School className="h-6 w-6" />
                </div>
                <p className="text-sm text-foreground">
                  Your teacher account is ready! You can add students and create classes after setup.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleComplete} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
