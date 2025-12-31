"use client";

import { useState, useEffect, useCallback } from "react";
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
  Activity,
  Clock,
  BookOpen,
  Target,
  Play,
  Pause,
  RefreshCw,
  MonitorSmartphone,
  Laptop,
  Tablet,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Timer,
} from "lucide-react";

interface SessionEvent {
  id: string;
  eventType: string;
  occurredAt: string;
  eventData: {
    score?: number;
    duration?: number;
    reason?: string;
    activityName?: string;
    lessonName?: string;
    subjectName?: string;
  } | null;
  lessonTitle: string | null;
  activityTitle: string | null;
  subjectName: string | null;
}

interface ActiveSession {
  id: string;
  status: string;
  startedAt: string;
  lastHeartbeatAt: string | null;
  currentActivityType: string | null;
  totalActiveTime: number | null;
  activitiesCompleted: number | null;
  lessonsViewed: number | null;
  deviceType: string | null;
  duration: number;
  currentLesson: {
    id: string;
    title: string | null;
  } | null;
  currentActivity: {
    id: string;
    title: string | null;
  } | null;
  currentSubject: {
    id: string;
    name: string | null;
    color: string | null;
  } | null;
  recentEvents: SessionEvent[];
}

interface Session {
  id: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  totalActiveTime: number | null;
  activitiesCompleted: number | null;
  lessonsViewed: number | null;
  deviceType: string | null;
  duration: number;
  currentSubject: {
    id: string;
    name: string | null;
    color: string | null;
  } | null;
}

interface TodayStats {
  totalSessions: number;
  totalActiveTime: number;
  totalActivitiesCompleted: number;
  totalLessonsViewed: number;
}

interface SessionsResponse {
  childName: string;
  childId: string;
  sessions: Session[];
  activeSession: ActiveSession | null;
  todayStats: TodayStats;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface SessionMonitorWidgetProps {
  childId: string; // Used for future direct API calls by ID
  childSlug: string;
  childName: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDeviceIcon(deviceType: string | null) {
  switch (deviceType) {
    case "mobile":
      return <MonitorSmartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    default:
      return <Laptop className="h-4 w-4" />;
  }
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "lesson_complete":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "activity_complete":
      return <Target className="h-4 w-4 text-info" />;
    case "session_pause":
      return <Pause className="h-4 w-4 text-warning" />;
    case "session_resume":
      return <Play className="h-4 w-4 text-success" />;
    case "break_taken":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case "idle_detected":
      return <AlertCircle className="h-4 w-4 text-warning" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

function getEventLabel(eventType: string): string {
  switch (eventType) {
    case "session_start":
      return "Session started";
    case "session_pause":
      return "Session paused";
    case "session_resume":
      return "Session resumed";
    case "session_end":
      return "Session ended";
    case "lesson_start":
      return "Started lesson";
    case "lesson_complete":
      return "Completed lesson";
    case "activity_start":
      return "Started activity";
    case "activity_complete":
      return "Completed activity";
    case "tutor_request":
      return "Asked tutor";
    case "break_taken":
      return "Took a break";
    case "idle_detected":
      return "Idle detected";
    default:
      return eventType.replace(/_/g, " ");
  }
}

function SessionMonitorSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SessionMonitorWidget({
  childId,
  childSlug,
  childName,
}: SessionMonitorWidgetProps) {
  // childId is available for future direct API calls by ID
  void childId;
  const [data, setData] = useState<SessionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/parent/children/${childSlug}/sessions?status=all&limit=5`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const result: SessionsResponse = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [childSlug]);

  useEffect(() => {
    fetchSessions();
    // Poll every 30 seconds for updates
    const pollInterval = setInterval(fetchSessions, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchSessions]);

  // Update elapsed time for active sessions
  useEffect(() => {
    if (!data?.activeSession) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const start = new Date(data.activeSession!.startedAt).getTime();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [data?.activeSession]);

  if (loading) {
    return <SessionMonitorSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-role-parent" />
            Live Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchSessions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeSession = data?.activeSession;
  const todayStats = data?.todayStats;

  return (
    <Card className={activeSession ? "border-success/50 shadow-success/10 shadow-lg" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${activeSession ? "text-success animate-pulse" : "text-role-parent"}`} />
            {activeSession ? "Learning Now" : "Session Monitor"}
          </CardTitle>
          <CardDescription>
            {activeSession
              ? `${childName} is currently learning`
              : `${childName}'s learning activity today`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {activeSession && (
            <Badge className="bg-success gap-1">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              Active
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={fetchSessions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Session Display */}
        {activeSession ? (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 space-y-4">
            {/* Current Activity */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {activeSession.currentSubject?.color && (
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: activeSession.currentSubject.color }}
                  >
                    {activeSession.currentActivityType === "lesson" ? (
                      <BookOpen className="h-5 w-5" />
                    ) : activeSession.currentActivityType === "quiz" ? (
                      <Target className="h-5 w-5" />
                    ) : (
                      <Activity className="h-5 w-5" />
                    )}
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {activeSession.currentLesson?.title ||
                      activeSession.currentActivity?.title ||
                      "Browsing"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeSession.currentSubject?.name || "General"} &middot;{" "}
                    {activeSession.currentActivityType || "Exploring"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {getDeviceIcon(activeSession.deviceType)}
              </div>
            </div>

            {/* Session Timer */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-success" />
                <span className="text-lg font-mono font-bold text-success">
                  {formatDuration(elapsed)}
                </span>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                Started at {formatTime(activeSession.startedAt)}
              </div>
            </div>

            {/* Session Progress */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-info" />
                <span>{activeSession.lessonsViewed || 0} lessons viewed</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-success" />
                <span>{activeSession.activitiesCompleted || 0} activities done</span>
              </div>
            </div>

            {/* Recent Events */}
            {activeSession.recentEvents && activeSession.recentEvents.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Recent Activity
                </p>
                <div className="space-y-1">
                  {activeSession.recentEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2 text-sm py-1"
                    >
                      {getEventIcon(event.eventType)}
                      <span className="flex-1 truncate">
                        {getEventLabel(event.eventType)}
                        {event.lessonTitle && `: ${event.lessonTitle}`}
                        {event.activityTitle && `: ${event.activityTitle}`}
                        {event.eventData?.score !== undefined &&
                          ` (${event.eventData.score}%)`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(event.occurredAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>Not currently learning</p>
            <p className="text-sm">Session activity will appear here when {childName} starts learning</p>
          </div>
        )}

        {/* Today's Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-role-parent">
              {todayStats?.totalSessions || 0}
            </div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-info">
              {todayStats ? formatDuration(todayStats.totalActiveTime) : "0m"}
            </div>
            <div className="text-xs text-muted-foreground">Study Time</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-success">
              {todayStats?.totalActivitiesCompleted || 0}
            </div>
            <div className="text-xs text-muted-foreground">Activities</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-primary">
              {todayStats?.totalLessonsViewed || 0}
            </div>
            <div className="text-xs text-muted-foreground">Lessons</div>
          </div>
        </div>

        {/* View Full History Link */}
        <Link
          href={`/parent/children/${childSlug}/sessions`}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-medium">View session history</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </CardContent>
    </Card>
  );
}
