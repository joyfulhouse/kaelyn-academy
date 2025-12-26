"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  GraduationCap,
  Users,
  School,
  User,
  ChevronLeft,
  Plus,
  X,
  Loader2,
  PartyPopper,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "parent" | "teacher" | "learner";

interface LearnerProfile {
  name: string;
  gradeLevel: number;
}

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [learners, setLearners] = useState<LearnerProfile[]>([{ name: "", gradeLevel: 5 }]);
  const [loading, setLoading] = useState(false);

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
      title: "Learner (13+)",
      description: "I'm learning on my own",
      icon: User,
    },
  ];

  const gradeLevels = [
    { value: 0, label: "Kindergarten" },
    { value: 1, label: "1st Grade" },
    { value: 2, label: "2nd Grade" },
    { value: 3, label: "3rd Grade" },
    { value: 4, label: "4th Grade" },
    { value: 5, label: "5th Grade" },
    { value: 6, label: "6th Grade" },
    { value: 7, label: "7th Grade" },
    { value: 8, label: "8th Grade" },
    { value: 9, label: "9th Grade" },
    { value: 10, label: "10th Grade" },
    { value: 11, label: "11th Grade" },
    { value: 12, label: "12th Grade" },
  ];

  const addLearner = () => {
    setLearners([...learners, { name: "", gradeLevel: 5 }]);
  };

  const updateLearner = (index: number, field: keyof LearnerProfile, value: string | number) => {
    const updated = [...learners];
    updated[index] = { ...updated[index], [field]: value };
    setLearners(updated);
  };

  const removeLearner = (index: number) => {
    if (learners.length > 1) {
      setLearners(learners.filter((_, i) => i !== index));
    }
  };

  const handleComplete = async () => {
    if (!role) return;

    setLoading(true);
    try {
      // Update user role
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      // Create learner profiles if parent
      if (role === "parent" && learners.some((l) => l.name.trim())) {
        for (const learner of learners) {
          if (learner.name.trim()) {
            await fetch("/api/learners", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: learner.name,
                gradeLevel: learner.gradeLevel,
              }),
            });
          }
        }
      }

      // If self-learner, create self as learner
      if (role === "learner") {
        await fetch("/api/learners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: session?.user?.name || "Student",
            gradeLevel: learners[0]?.gradeLevel || 5,
          }),
        });
      }

      // Refresh session and redirect
      await update();
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

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
            Let&apos;s get your account set up in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? "w-12 bg-primary" : "w-8 bg-muted"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
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
                      onClick={() => {
                        setRole(r.id);
                        setStep(2);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                        role === r.id ? "border-primary bg-primary/5" : "border-border"
                      }`}
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

          {step === 2 && role === "parent" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">
                Add your child&apos;s information
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                You can add more children later from your parent dashboard.
              </p>

              {learners.map((learner, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Child {index + 1}</Label>
                    {learners.length > 1 && (
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
                      {gradeLevels.map((g) => (
                        <SelectItem key={g.value} value={g.value.toString()}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

              <Button variant="outline" className="w-full gap-2" onClick={addLearner}>
                <Plus className="h-4 w-4" />
                Add Another Child
              </Button>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading || !learners.some((l) => l.name.trim())}
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

          {step === 2 && role === "teacher" && (
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
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading}
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

          {step === 2 && role === "learner" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">What grade are you in?</h3>

              <Select
                value={(learners[0]?.gradeLevel || 5).toString()}
                onValueChange={(value) => updateLearner(0, "gradeLevel", parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your grade level" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((g) => (
                    <SelectItem key={g.value} value={g.value.toString()}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Start Learning
                    </>
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
