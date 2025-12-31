"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Target,
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { colors } from "@/lib/colors";

interface SubjectDifficulty {
  subjectId: string;
  subjectName: string;
  currentLevel: number; // 1-5
  recentAccuracy: number; // 0-100
  adjustedAt: string;
  trend: "up" | "down" | "stable";
}

interface DifficultyHistory {
  date: string;
  level: number;
  accuracy: number;
}

interface AdaptiveDifficultyData {
  subjects: SubjectDifficulty[];
  overallLevel: number;
  history: DifficultyHistory[];
  lastAdjusted: string | null;
}

interface DifficultyVisualizationProps {
  data: AdaptiveDifficultyData;
  onRequestAdjustment?: (subjectId: string, direction: "easier" | "harder") => Promise<void>;
}

const DIFFICULTY_LABELS: Record<number, { label: string; color: string; description: string }> = {
  1: {
    label: "Beginner",
    color: colors.success.DEFAULT,
    description: "Building foundational skills with plenty of support",
  },
  2: {
    label: "Developing",
    color: colors.success.light,
    description: "Growing confidence with guided practice",
  },
  3: {
    label: "Proficient",
    color: colors.primary.DEFAULT,
    description: "Solid understanding with independent work",
  },
  4: {
    label: "Advanced",
    color: colors.warning.DEFAULT,
    description: "Tackling challenging concepts and problems",
  },
  5: {
    label: "Expert",
    color: colors.accent.purple,
    description: "Mastering complex topics and extensions",
  },
};

function DifficultyMeter({ level, size = "md" }: { level: number; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { height: 4, gap: 1 },
    md: { height: 8, gap: 2 },
    lg: { height: 12, gap: 3 },
  };
  const { height, gap } = sizes[size];

  return (
    <div className={`flex gap-${gap}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex-1 rounded-full transition-all duration-300"
          style={{
            height: `${height}px`,
            backgroundColor: i <= level ? DIFFICULTY_LABELS[level].color : colors.neutral[200],
          }}
        />
      ))}
    </div>
  );
}

function DifficultyBadge({ level }: { level: number }) {
  const info = DIFFICULTY_LABELS[level];
  return (
    <Badge
      className="gap-1 font-medium"
      style={{
        backgroundColor: `${info.color}20`,
        color: info.color,
        borderColor: info.color,
      }}
    >
      <Target className="h-3 w-3" />
      {info.label}
    </Badge>
  );
}

function SubjectDifficultyCard({
  subject,
  onRequestAdjustment,
}: {
  subject: SubjectDifficulty;
  onRequestAdjustment?: (subjectId: string, direction: "easier" | "harder") => Promise<void>;
}) {
  const [adjusting, setAdjusting] = useState(false);
  const progressToNext = subject.recentAccuracy >= 85 ? Math.min((subject.recentAccuracy - 85) / 15 * 100, 100) : 0;

  const handleAdjust = async (direction: "easier" | "harder") => {
    if (!onRequestAdjustment) return;
    setAdjusting(true);
    try {
      await onRequestAdjustment(subject.subjectId, direction);
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-foreground truncate">{subject.subjectName}</h4>
              {subject.trend === "up" && (
                <TrendingUp className="h-4 w-4 text-success shrink-0" />
              )}
              {subject.trend === "down" && (
                <TrendingDown className="h-4 w-4 text-warning shrink-0" />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <DifficultyBadge level={subject.currentLevel} />
                <span className="text-sm text-muted-foreground">
                  {subject.recentAccuracy}% accuracy
                </span>
              </div>

              <DifficultyMeter level={subject.currentLevel} size="sm" />

              {subject.currentLevel < 5 && progressToNext > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress to next level</span>
                    <span>{Math.round(progressToNext)}%</span>
                  </div>
                  <Progress value={progressToNext} className="h-1" />
                </div>
              )}
            </div>
          </div>

          {onRequestAdjustment && (
            <div className="flex flex-col gap-1">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={adjusting || subject.currentLevel >= 5}
                      onClick={() => handleAdjust("harder")}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Request harder content</TooltipContent>
                </UITooltip>
              </TooltipProvider>
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={adjusting || subject.currentLevel <= 1}
                      onClick={() => handleAdjust("easier")}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Request easier content</TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DifficultyHistoryChart({ data }: { data: DifficultyHistory[] }) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: `1px solid ${colors.chart.grid}`,
            borderRadius: "8px",
          }}
          formatter={(value, name) => [
            name === "level" ? `Level ${value}` : `${value}%`,
            name === "level" ? "Difficulty" : "Accuracy",
          ]}
        />
        <Line
          type="monotone"
          dataKey="level"
          stroke={colors.primary.DEFAULT}
          strokeWidth={2}
          dot={{ r: 4, fill: colors.primary.DEFAULT }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DifficultyVisualization({
  data,
  onRequestAdjustment,
}: DifficultyVisualizationProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const overallInfo = DIFFICULTY_LABELS[Math.round(data.overallLevel)];

  return (
    <div className="space-y-6">
      {/* Overall Difficulty */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Adaptive Difficulty
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowExplanation(true)}
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <DifficultyBadge level={Math.round(data.overallLevel)} />
          </div>
          <CardDescription>
            Content difficulty adjusts based on your performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <DifficultyMeter level={Math.round(data.overallLevel)} size="lg" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Easier</span>
                <span>Harder</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: overallInfo.color }}>
                {data.overallLevel.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Overall Level</div>
            </div>
          </div>

          <div
            className="flex items-start gap-2 p-3 rounded-lg"
            style={{ backgroundColor: `${overallInfo.color}10` }}
          >
            <Info className="h-4 w-4 mt-0.5 shrink-0" style={{ color: overallInfo.color }} />
            <p className="text-sm text-muted-foreground">{overallInfo.description}</p>
          </div>

          {data.lastAdjusted && (
            <p className="text-xs text-muted-foreground">
              Last adjusted: {new Date(data.lastAdjusted).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Subject Difficulties */}
      <div className="space-y-3">
        <h3 className="font-medium text-foreground">By Subject</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.subjects.map((subject) => (
            <SubjectDifficultyCard
              key={subject.subjectId}
              subject={subject}
              onRequestAdjustment={onRequestAdjustment}
            />
          ))}
        </div>
      </div>

      {/* History Chart */}
      {data.history.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Difficulty History</CardTitle>
            <CardDescription>How your difficulty level has changed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <DifficultyHistoryChart data={data.history} />
          </CardContent>
        </Card>
      )}

      {/* Explanation Dialog */}
      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              How Adaptive Difficulty Works
            </DialogTitle>
            <DialogDescription>
              Our system adjusts to help you learn at your best pace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              The difficulty level automatically adjusts based on your performance:
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <TrendingUp className="h-5 w-5 text-success shrink-0" />
                <span>
                  <strong>Moves up</strong> when you consistently score above 85% accuracy
                </span>
              </li>
              <li className="flex gap-3">
                <TrendingDown className="h-5 w-5 text-warning shrink-0" />
                <span>
                  <strong>Moves down</strong> when you score below 60% on multiple attempts
                </span>
              </li>
              <li className="flex gap-3">
                <Target className="h-5 w-5 text-primary shrink-0" />
                <span>
                  <strong>Stays stable</strong> when you are in the optimal learning zone
                </span>
              </li>
            </ul>
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">Difficulty Levels:</p>
              <div className="space-y-2">
                {Object.entries(DIFFICULTY_LABELS).map(([level, info]) => (
                  <div key={level} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="text-sm">
                      <strong>Level {level}:</strong> {info.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              You can also manually request easier or harder content using the arrow buttons
              next to each subject.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowExplanation(false)}>Got it!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export types for external use
export type { AdaptiveDifficultyData, SubjectDifficulty, DifficultyHistory };
