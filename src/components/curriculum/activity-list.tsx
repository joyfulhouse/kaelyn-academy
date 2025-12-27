"use client";

import { useState } from "react";
import {
  Play,
  Check,
  Clock,
  Loader2,
  Trophy,
  FileQuestion,
  Video,
  PenTool,
  BookOpen,
  Gamepad2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useActivityTracker, formatDuration } from "@/hooks/use-activity-tracker";
import { cn } from "@/lib/utils";
import type { Activity } from "@/data/curriculum/activities";
import { activityFromString } from "@/data/curriculum/activities";
import { ActivityRenderer } from "./activity-renderers";

// Type for activities - can be string[] (legacy) or Activity[] (new)
type ActivityInput = string[] | Activity[];

interface ActivityListProps {
  lessonId: string;
  activities: ActivityInput;
  onProgressUpdate?: (progress: { progressPercent: number; isComplete: boolean }) => void;
}

// Helper to normalize activities to Activity[]
function normalizeActivities(activities: ActivityInput): Activity[] {
  if (activities.length === 0) return [];

  // Check if first item is a string
  if (typeof activities[0] === "string") {
    return (activities as string[]).map((title, index) =>
      activityFromString(title, index)
    );
  }

  return activities as Activity[];
}

// Get icon for activity type
function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "quiz":
      return FileQuestion;
    case "video":
      return Video;
    case "practice":
      return PenTool;
    case "reading":
      return BookOpen;
    case "interactive":
      return Gamepad2;
    case "discussion":
      return MessageSquare;
    default:
      return Play;
  }
}

// Get display label for activity type
function getActivityTypeLabel(type: Activity["type"]) {
  switch (type) {
    case "quiz":
      return "Quiz";
    case "video":
      return "Video";
    case "practice":
      return "Practice";
    case "reading":
      return "Reading";
    case "interactive":
      return "Interactive";
    case "discussion":
      return "Discussion";
    default:
      return "Activity";
  }
}

export function ActivityList({
  lessonId,
  activities: rawActivities,
  onProgressUpdate,
}: ActivityListProps) {
  // Normalize activities to Activity[] format
  const activities = normalizeActivities(rawActivities);

  const {
    isLoading,
    currentActivity,
    progress,
    startActivity,
    completeActivity,
    isActivityCompleted,
    getActivityTime,
  } = useActivityTracker({
    lessonId,
    totalActivities: activities.length,
    onProgressUpdate,
  });

  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No activities available for this lesson yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Activity Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress.completedCount} / {progress.totalActivities} completed
            </span>
          </div>
          <Progress value={progress.progressPercent} className="h-2" />
          {progress.isComplete && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <Trophy className="h-4 w-4" />
              <span>All activities completed! Assessment unlocked.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Cards */}
      {activities.map((activity, index) => {
        const isCompleted = isActivityCompleted(index);
        const isActive = currentActivity === index;
        const timeSpent = getActivityTime(index);
        const ActivityIcon = getActivityIcon(activity.type);

        return (
          <Card
            key={activity.id}
            className={cn(
              "transition-all",
              isCompleted && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
              isActive && "border-primary ring-1 ring-primary"
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ActivityIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{activity.title}</CardTitle>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getActivityTypeLabel(activity.type)}
                  </Badge>
                  {timeSpent > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(timeSpent)}
                    </Badge>
                  )}
                  {!isCompleted && !isActive && activity.estimatedMinutes && (
                    <Badge variant="secondary">~{activity.estimatedMinutes} min</Badge>
                  )}
                  {activity.points && (
                    <Badge variant="secondary" className="text-xs">
                      {activity.points} pts
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge variant="default" className="bg-green-500">
                      Completed
                    </Badge>
                  )}
                  {isActive && (
                    <Badge variant="default" className="animate-pulse">
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isActive ? (
                <ActivityRenderer
                  activity={activity}
                  onComplete={(score) => completeActivity(index, score)}
                />
              ) : isCompleted ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Great job completing this activity!
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExpandedActivity(expandedActivity === index ? null : index);
                    }}
                  >
                    {expandedActivity === index ? "Hide" : "Review"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => startActivity(index)}
                  disabled={isActive || (index > 0 && !isActivityCompleted(index - 1))}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Activity
                </Button>
              )}

              {expandedActivity === index && isCompleted && (
                <div className="mt-4 pt-4 border-t">
                  <ActivityRenderer
                    activity={activity}
                    onComplete={() => {}}
                    readOnly
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default ActivityList;
