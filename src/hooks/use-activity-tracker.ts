"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ActivityState {
  completedActivities: number[];
  activityTimes: Record<number, number>;
  lastActivityIndex?: number;
}

interface ActivityProgress {
  completedCount: number;
  totalActivities: number;
  progressPercent: number;
  isComplete: boolean;
  totalTimeSpent: number;
}

interface UseActivityTrackerOptions {
  lessonId: string;
  totalActivities: number;
  onProgressUpdate?: (progress: ActivityProgress) => void;
}

export function useActivityTracker({
  lessonId,
  totalActivities,
  onProgressUpdate,
}: UseActivityTrackerOptions) {
  const [activityState, setActivityState] = useState<ActivityState>({
    completedActivities: [],
    activityTimes: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentActivity, setCurrentActivity] = useState<number | null>(null);
  const activityStartTime = useRef<number | null>(null);

  // Fetch initial activity state
  useEffect(() => {
    async function fetchState() {
      try {
        const response = await fetch(
          `/api/learner/activity?lessonId=${encodeURIComponent(lessonId)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.activityState) {
            setActivityState(data.activityState);
          }
        }
      } catch (error) {
        console.error("Failed to fetch activity state:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchState();
  }, [lessonId]);

  // Start an activity
  const startActivity = useCallback(
    async (activityIndex: number) => {
      setCurrentActivity(activityIndex);
      activityStartTime.current = Date.now();

      try {
        const response = await fetch("/api/learner/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            action: "start",
            activityIndex,
            totalActivities,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setActivityState(data.activityState);
        }
      } catch (error) {
        console.error("Failed to start activity:", error);
      }
    },
    [lessonId, totalActivities]
  );

  // Complete an activity
  const completeActivity = useCallback(
    async (activityIndex: number) => {
      // Calculate time spent
      let timeSpent = 0;
      if (activityStartTime.current) {
        timeSpent = Math.round((Date.now() - activityStartTime.current) / 1000);
        activityStartTime.current = null;
      }

      try {
        const response = await fetch("/api/learner/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            action: "complete",
            activityIndex,
            totalActivities,
            timeSpent,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setActivityState(data.activityState);
          setCurrentActivity(null);

          // Notify parent of progress update
          if (onProgressUpdate) {
            onProgressUpdate({
              completedCount: data.completedCount,
              totalActivities: data.totalActivities,
              progressPercent: data.progressPercent,
              isComplete: data.isComplete,
              totalTimeSpent: data.totalTimeSpent,
            });
          }

          return data;
        }
      } catch (error) {
        console.error("Failed to complete activity:", error);
      }

      return null;
    },
    [lessonId, totalActivities, onProgressUpdate]
  );

  // Check if an activity is completed
  const isActivityCompleted = useCallback(
    (activityIndex: number) => {
      return activityState.completedActivities.includes(activityIndex);
    },
    [activityState.completedActivities]
  );

  // Get time spent on an activity
  const getActivityTime = useCallback(
    (activityIndex: number) => {
      return activityState.activityTimes[activityIndex] ?? 0;
    },
    [activityState.activityTimes]
  );

  // Calculate progress
  const progress: ActivityProgress = {
    completedCount: activityState.completedActivities.length,
    totalActivities,
    progressPercent: Math.round(
      (activityState.completedActivities.length / totalActivities) * 100
    ),
    isComplete: activityState.completedActivities.length >= totalActivities,
    totalTimeSpent: Object.values(activityState.activityTimes).reduce(
      (sum, t) => sum + t,
      0
    ),
  };

  return {
    isLoading,
    activityState,
    currentActivity,
    progress,
    startActivity,
    completeActivity,
    isActivityCompleted,
    getActivityTime,
  };
}

/**
 * Format seconds as readable duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}
