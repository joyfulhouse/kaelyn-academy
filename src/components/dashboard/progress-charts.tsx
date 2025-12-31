"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { colors } from "@/lib/colors";

interface SubjectProgress {
  subjectName: string;
  masteryLevel: number;
  completedLessons: number;
  totalLessons: number;
}

interface ActivityData {
  day: string;
  minutes: number;
  lessons: number;
}

export interface MasteryBreakdown {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export function SubjectProgressChart({ data }: { data: SubjectProgress[] }) {
  // Memoize data transformation to prevent recalculation on every render
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name: item.subjectName,
        mastery: item.masteryLevel,
        progress: Math.round((item.completedLessons / item.totalLessons) * 100) || 0,
      })),
    [data]
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
        <YAxis
          dataKey="name"
          type="category"
          width={80}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: `1px solid ${colors.chart.grid}`,
            borderRadius: "8px",
          }}
          formatter={(value, name) => [
            `${value ?? 0}%`,
            name === "mastery" ? "Mastery" : "Progress",
          ]}
        />
        <Bar dataKey="progress" fill={colors.primary.muted} radius={[0, 4, 4, 0]} name="Progress" />
        <Bar dataKey="mastery" fill={colors.chart.blue} radius={[0, 4, 4, 0]} name="Mastery" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WeeklyActivityChart({ data }: { data: ActivityData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.chart.purple} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colors.chart.purple} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.chart.grid} />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: `1px solid ${colors.chart.grid}`,
            borderRadius: "8px",
          }}
          formatter={(value, name) => [
            name === "minutes" ? `${value ?? 0} min` : (value ?? 0),
            name === "minutes" ? "Study Time" : "Lessons",
          ]}
        />
        <Area
          type="monotone"
          dataKey="minutes"
          stroke={colors.chart.purple}
          fillOpacity={1}
          fill="url(#colorMinutes)"
        />
        <Line
          type="monotone"
          dataKey="lessons"
          stroke={colors.chart.green}
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MasteryPieChart({ data }: { data: MasteryBreakdown[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: `1px solid ${colors.chart.grid}`,
            borderRadius: "8px",
          }}
          formatter={(value) => [`${value ?? 0} concepts`, "Count"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StreakChart({ currentStreak, longestStreak }: { currentStreak: number; longestStreak: number }) {
  // Memoize day generation to prevent recalculation on every render
  const days = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        active: i < currentStreak || (i >= 10 && i < 10 + longestStreak - currentStreak),
      })),
    [currentStreak, longestStreak]
  );

  return (
    <div className="flex flex-wrap gap-1">
      {days.map((day, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-sm ${
            day.active
              ? "bg-gradient-to-br from-success/70 to-success"
              : "bg-muted"
          }`}
          title={`Day ${day.day}`}
        />
      ))}
    </div>
  );
}

export function CircularProgress({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 40;

  // Memoize SVG calculations
  const { circumference, strokeDashoffset } = useMemo(() => {
    const c = 2 * Math.PI * radius;
    return {
      circumference: c,
      strokeDashoffset: c - (value / 100) * c,
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="100" height="100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colors.chart.grid}
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
