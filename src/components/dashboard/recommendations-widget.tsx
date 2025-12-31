"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Rocket,
  Target,
  Star,
  Book,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface Recommendation {
  id: string;
  type: "next_lesson" | "review" | "practice" | "challenge" | "explore";
  title: string;
  description: string;
  subjectName: string;
  subjectColor: string | null;
  lessonId?: string;
  conceptId?: string;
  priority: number;
  reason: string;
  icon: "sparkles" | "rocket" | "target" | "star" | "book";
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  generatedAt: string;
}

function getIcon(iconName: string) {
  switch (iconName) {
    case "sparkles":
      return <Sparkles className="h-5 w-5" />;
    case "rocket":
      return <Rocket className="h-5 w-5" />;
    case "target":
      return <Target className="h-5 w-5" />;
    case "star":
      return <Star className="h-5 w-5" />;
    case "book":
      return <Book className="h-5 w-5" />;
    default:
      return <Sparkles className="h-5 w-5" />;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "next_lesson":
      return "Continue";
    case "review":
      return "Review";
    case "practice":
      return "Practice";
    case "challenge":
      return "Challenge";
    case "explore":
      return "Explore";
    default:
      return "Learn";
  }
}

function getTypeBgColor(type: string) {
  switch (type) {
    case "next_lesson":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    case "review":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
    case "practice":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
    case "challenge":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    case "explore":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function RecommendationsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 border rounded-lg"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32 mt-1" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/learner/recommendations");
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data: RecommendationsResponse = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return <RecommendationsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Just For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchRecommendations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Just For You
          </CardTitle>
          <CardDescription>Personalized learning suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Start learning to get personalized recommendations!
            </p>
            <Button asChild className="mt-4">
              <Link href="/subjects">Explore Subjects</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Just For You
          </CardTitle>
          <CardDescription>Personalized learning suggestions</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchRecommendations}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <Link
            key={rec.id}
            href={
              rec.lessonId
                ? `/subjects/${rec.subjectName.toLowerCase()}/lesson/${rec.lessonId}`
                : `/subjects/${rec.subjectName.toLowerCase()}`
            }
            className={`flex items-center gap-4 p-3 border rounded-lg transition-all hover:shadow-md hover:border-primary/50 ${
              index === 0 ? "bg-primary/5 border-primary/20" : ""
            }`}
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white"
              style={{
                backgroundColor: rec.subjectColor || "#10b981",
              }}
            >
              {getIcon(rec.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium truncate">{rec.title}</h4>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getTypeBgColor(rec.type)}`}
                >
                  {getTypeLabel(rec.type)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {rec.reason}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
