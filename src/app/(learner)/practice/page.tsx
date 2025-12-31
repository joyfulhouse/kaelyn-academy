"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PracticeGenerator } from "@/components/practice/practice-generator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Subject {
  id: string;
  name: string;
}

interface Learner {
  id: string;
  name: string;
  gradeLevel: number;
}

export default function PracticePage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [learner, setLearner] = useState<Learner | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch subjects
      const subjectsResponse = await fetch("/api/subjects");
      if (subjectsResponse.ok) {
        const subjectsData = await subjectsResponse.json();
        if (subjectsData.subjects) {
          setSubjects(subjectsData.subjects.map((s: { id: string; name: string }) => ({
            id: s.id,
            name: s.name,
          })));
        }
      }

      // Fetch learner profile
      const learnerResponse = await fetch("/api/learners");
      if (learnerResponse.ok) {
        const learnerData = await learnerResponse.json();
        if (learnerData.learners && learnerData.learners.length > 0) {
          setLearner(learnerData.learners[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  // Fallback subjects if API doesn't return any
  const availableSubjects = subjects.length > 0 ? subjects : [
    { id: "math", name: "Mathematics" },
    { id: "reading", name: "Reading & ELA" },
    { id: "science", name: "Science" },
    { id: "history", name: "History" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Practice Problems</h1>
        <p className="text-muted-foreground mt-1">
          Generate personalized practice problems to strengthen your skills
        </p>
      </div>

      <PracticeGenerator
        subjects={availableSubjects}
        gradeLevel={learner?.gradeLevel ?? 5}
        learnerId={learner?.id}
      />

      {/* Practice Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Practice Tips</CardTitle>
          <CardDescription>Get the most out of your practice sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Start with topics you find challenging to focus your practice time
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Read the explanations carefully, even when you get answers right
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Use hints when stuck - they help guide your thinking
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Aim for at least 5 practice sessions per week for best results
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              Increase difficulty as you improve to keep challenging yourself
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
