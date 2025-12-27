"use client";

import { useState } from "react";
import { Play, Check, Clock, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useActivityTracker, formatDuration } from "@/hooks/use-activity-tracker";
import { cn } from "@/lib/utils";

interface ActivityListProps {
  lessonId: string;
  activities: string[];
  onProgressUpdate?: (progress: { progressPercent: number; isComplete: boolean }) => void;
}

export function ActivityList({
  lessonId,
  activities,
  onProgressUpdate,
}: ActivityListProps) {
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

        return (
          <Card
            key={index}
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
                      index + 1
                    )}
                  </div>
                  <CardTitle className="text-base">{activity}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {timeSpent > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(timeSpent)}
                    </Badge>
                  )}
                  {!isCompleted && !isActive && (
                    <Badge variant="secondary">~5 min</Badge>
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
                <ActivityContent
                  activity={activity}
                  onComplete={() => completeActivity(index)}
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
                  <ActivityContent
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

/**
 * Activity content component (placeholder for actual activity implementation)
 * This would be replaced with actual activity UI (quiz, interactive, etc.)
 */
function ActivityContent({
  activity,
  onComplete,
  readOnly = false,
}: {
  activity: string;
  onComplete: () => void;
  readOnly?: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    await onComplete();
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          Activity: <strong>{activity}</strong>
        </p>
        <p className="text-sm">
          This is a placeholder for the interactive activity content.
          In the full implementation, this would contain:
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
          <li>• Interactive exercises</li>
          <li>• Practice problems</li>
          <li>• Video content</li>
          <li>• Drag-and-drop activities</li>
        </ul>
      </div>

      {!readOnly && (
        <Button
          className="w-full"
          onClick={handleComplete}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Mark as Complete
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export default ActivityList;
