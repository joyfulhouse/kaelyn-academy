"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Flame,
  Snowflake,
  Wrench,
  Gift,
  Shield,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================
// TYPES
// ============================================

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezeTokens: number;
  totalFreezeTokensEarned: number;
  totalFreezeTokensUsed: number;
  totalRepairs: number;
}

interface StreakStatus {
  streakStatus: "active" | "at_risk" | "broken";
  daysMissed: number;
  canRepair: boolean;
  repairCost: number;
  canFreeze: boolean;
}

interface Milestone {
  days: number;
  name: string;
  freezeTokenReward: number | null;
  points: number | null;
  reached: boolean;
  unclaimed: boolean;
}

interface HistoryEntry {
  id: string;
  action: string;
  tokensChange: number;
  reason: string | null;
  createdAt: string;
}

interface StreakResponse {
  streak: StreakData;
  status: StreakStatus;
  milestones: Milestone[];
  nextMilestone: Milestone | null;
  recentHistory: HistoryEntry[];
}

// ============================================
// LOADING SKELETON
// ============================================

function StreakWidgetSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// STREAK STATUS BADGE
// ============================================

function StreakStatusBadge({ status }: { status: StreakStatus }) {
  if (status.streakStatus === "active") {
    return (
      <Badge className="bg-success/10 text-success border-success/20">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Active Today
      </Badge>
    );
  }

  if (status.streakStatus === "at_risk") {
    return (
      <Badge className="bg-warning/10 text-warning border-warning/20">
        <AlertTriangle className="h-3 w-3 mr-1" />
        At Risk
      </Badge>
    );
  }

  return (
    <Badge className="bg-destructive/10 text-destructive border-destructive/20">
      <AlertTriangle className="h-3 w-3 mr-1" />
      Broken
    </Badge>
  );
}

// ============================================
// FLAME ANIMATION
// ============================================

function StreakFlame({
  streak,
  status,
}: {
  streak: number;
  status: "active" | "at_risk" | "broken";
}) {
  const getFlameClasses = () => {
    switch (status) {
      case "active":
        return "text-warning animate-pulse";
      case "at_risk":
        return "text-warning/60";
      case "broken":
        return "text-muted-foreground";
    }
  };

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <div
        className={`absolute inset-0 rounded-full ${
          status === "active"
            ? "bg-gradient-to-br from-warning/20 to-warning/5"
            : status === "at_risk"
            ? "bg-warning/10"
            : "bg-muted/50"
        }`}
      />
      <Flame className={`h-10 w-10 ${getFlameClasses()}`} />
      <div className="absolute bottom-0 text-xs font-bold text-center w-full">
        {streak > 0 && (
          <span
            className={
              status === "broken" ? "text-muted-foreground" : "text-warning"
            }
          >
            {streak}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// MILESTONE PROGRESS
// ============================================

function MilestoneProgress({
  currentStreak,
  nextMilestone,
  onClaimMilestone,
  milestones,
}: {
  currentStreak: number;
  nextMilestone: Milestone | null;
  onClaimMilestone: (days: number) => void;
  milestones: Milestone[];
}) {
  // Find unclaimed milestones
  const unclaimedMilestones = milestones.filter((m) => m.unclaimed);

  if (unclaimedMilestones.length > 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-success">
          Milestone rewards available!
        </p>
        <div className="flex flex-wrap gap-2">
          {unclaimedMilestones.map((milestone) => (
            <Button
              key={milestone.days}
              size="sm"
              variant="outline"
              className="border-success text-success hover:bg-success/10"
              onClick={() => onClaimMilestone(milestone.days)}
            >
              <Gift className="h-3 w-3 mr-1" />
              Claim {milestone.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (!nextMilestone) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Trophy className="h-4 w-4 text-warning" />
        <span className="text-sm">All milestones achieved!</span>
      </div>
    );
  }

  const progress = Math.min(
    (currentStreak / nextMilestone.days) * 100,
    100
  );
  const daysRemaining = Math.max(nextMilestone.days - currentStreak, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Next: {nextMilestone.name}
        </span>
        <span className="font-medium">
          {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} to go
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Gift className="h-3 w-3" />
        <span>+{nextMilestone.freezeTokenReward} freeze tokens</span>
        <span className="mx-1">|</span>
        <Trophy className="h-3 w-3" />
        <span>+{nextMilestone.points} points</span>
      </div>
    </div>
  );
}

// ============================================
// MAIN WIDGET
// ============================================

export function StreakWidget() {
  const [data, setData] = useState<StreakResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [showRepairDialog, setShowRepairDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const fetchStreak = useCallback(async () => {
    try {
      const response = await fetch("/api/learner/streak");
      if (!response.ok) {
        throw new Error("Failed to fetch streak data");
      }
      const result: StreakResponse = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const handleAction = async (
    action: "freeze" | "repair" | "claim_milestone",
    milestoneDays?: number
  ) => {
    setActionLoading(true);
    try {
      const body =
        action === "claim_milestone"
          ? { action, milestoneDays }
          : { action };

      const response = await fetch("/api/learner/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Action failed");
      }

      // Refresh data
      await fetchStreak();

      // Close dialogs
      setShowFreezeDialog(false);
      setShowRepairDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <StreakWidgetSkeleton />;
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-warning" />
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{error || "Failed to load"}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchStreak}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { streak, status, milestones, nextMilestone, recentHistory } = data;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-warning" />
                Learning Streak
              </CardTitle>
              <CardDescription>Keep learning every day!</CardDescription>
            </div>
            <StreakStatusBadge status={status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Streak Display */}
          <div className="flex items-center gap-6">
            <StreakFlame
              streak={streak.currentStreak}
              status={status.streakStatus}
            />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{streak.currentStreak}</span>
                <span className="text-muted-foreground">day streak</span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>Best: {streak.longestStreak} days</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-help">
                        <Snowflake className="h-4 w-4 text-info" />
                        <span>{streak.freezeTokens} freezes</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Freeze tokens protect your streak when you miss a day</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Alert Messages */}
          {status.streakStatus === "at_risk" && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Your streak is at risk!</p>
                <p className="text-muted-foreground">
                  Complete a lesson today or use a freeze to protect your {streak.currentStreak}-day streak.
                </p>
              </div>
            </div>
          )}

          {status.streakStatus === "broken" && status.canRepair && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Your streak was broken!</p>
                <p className="text-muted-foreground">
                  You missed {status.daysMissed} day(s). Repair for {status.repairCost} tokens to restore your streak.
                </p>
              </div>
            </div>
          )}

          {/* Milestone Progress */}
          <MilestoneProgress
            currentStreak={streak.currentStreak}
            nextMilestone={nextMilestone}
            onClaimMilestone={(days) => handleAction("claim_milestone", days)}
            milestones={milestones}
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status.canFreeze && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowFreezeDialog(true)}
                disabled={actionLoading}
              >
                <Snowflake className="h-4 w-4 mr-1 text-info" />
                Use Freeze
              </Button>
            )}

            {status.canRepair && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowRepairDialog(true)}
                disabled={actionLoading}
              >
                <Wrench className="h-4 w-4 mr-1" />
                Repair ({status.repairCost} tokens)
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistoryDialog(true)}
            >
              <Clock className="h-4 w-4 mr-1" />
              History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Freeze Confirmation Dialog */}
      <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-info" />
              Use Streak Freeze?
            </DialogTitle>
            <DialogDescription>
              This will protect your {streak.currentStreak}-day streak for today.
              You have {streak.freezeTokens} freeze token(s) remaining.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Shield className="h-8 w-8 text-info" />
            <div>
              <p className="font-medium">Streak Protected</p>
              <p className="text-sm text-muted-foreground">
                Your streak will continue as if you studied today.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFreezeDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("freeze")}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Use Freeze Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Repair Confirmation Dialog */}
      <Dialog open={showRepairDialog} onOpenChange={setShowRepairDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Repair Your Streak?
            </DialogTitle>
            <DialogDescription>
              You missed {status.daysMissed} day(s). Repairing costs {status.repairCost} freeze tokens.
              You have {streak.freezeTokens} token(s) available.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Flame className="h-8 w-8 text-warning" />
            <div>
              <p className="font-medium">Restore to {streak.currentStreak} days</p>
              <p className="text-sm text-muted-foreground">
                Your streak will be restored as if you never missed a day.
              </p>
            </div>
          </div>
          {streak.freezeTokens < status.repairCost && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="h-4 w-4" />
              Not enough tokens! You need {status.repairCost - streak.freezeTokens} more.
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRepairDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("repair")}
              disabled={actionLoading || streak.freezeTokens < status.repairCost}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Repair Streak (-{status.repairCost} tokens)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Streak History
            </DialogTitle>
            <DialogDescription>
              Your recent streak freeze activity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No history yet
              </p>
            ) : (
              recentHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {entry.action === "earned" && (
                      <Gift className="h-4 w-4 text-success" />
                    )}
                    {entry.action === "used" && (
                      <Snowflake className="h-4 w-4 text-info" />
                    )}
                    {entry.action === "purchased" && (
                      <Gift className="h-4 w-4 text-primary" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{entry.reason || entry.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={entry.tokensChange > 0 ? "default" : "secondary"}
                    className={
                      entry.tokensChange > 0
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {entry.tokensChange > 0 ? "+" : ""}
                    {entry.tokensChange}
                  </Badge>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowHistoryDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
