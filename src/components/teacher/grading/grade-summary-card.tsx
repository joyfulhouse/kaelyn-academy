"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react";
import type { GradingStats } from "@/types/grading";

interface GradeSummaryCardProps {
  stats: GradingStats;
}

export function GradeSummaryCard({ stats }: GradeSummaryCardProps) {
  const gradingProgress = stats.total > 0 ? (stats.graded / stats.total) * 100 : 0;
  const submissionRate = stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Grading Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Graded</span>
            <span className="font-medium">
              {stats.graded} / {stats.total}
            </span>
          </div>
          <Progress value={gradingProgress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Graded</p>
              <p className="font-semibold">{stats.graded}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="font-semibold">{stats.submitted - stats.graded}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Late</p>
              <p className="font-semibold">{stats.late}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="font-semibold">
                {stats.avgScore !== null ? `${Math.round(stats.avgScore)}%` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Score Range */}
        {stats.highScore !== null && stats.lowScore !== null && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-1">Score Range</p>
            <div className="flex justify-between text-sm">
              <span>
                Low: <strong>{Math.round(stats.lowScore)}%</strong>
              </span>
              <span>
                High: <strong>{Math.round(stats.highScore)}%</strong>
              </span>
            </div>
          </div>
        )}

        {/* Submission Rate */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground mb-1">Submission Rate</p>
          <div className="flex items-center gap-2">
            <Progress value={submissionRate} className="h-2 flex-1" />
            <span className="text-sm font-medium">{Math.round(submissionRate)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
