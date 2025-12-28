"use client";

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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

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
  const chartData = data.map((item) => ({
    name: item.subjectName,
    mastery: item.masteryLevel,
    progress: Math.round((item.completedLessons / item.totalLessons) * 100) || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          formatter={(value, name) => [
            `${value ?? 0}%`,
            name === "mastery" ? "Mastery" : "Progress",
          ]}
        />
        <Bar dataKey="progress" fill="#93c5fd" radius={[0, 4, 4, 0]} name="Progress" />
        <Bar dataKey="mastery" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Mastery" />
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
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
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
          stroke="#8b5cf6"
          fillOpacity={1}
          fill="url(#colorMinutes)"
        />
        <Line
          type="monotone"
          dataKey="lessons"
          stroke="#10b981"
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
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          formatter={(value) => [`${value ?? 0} concepts`, "Count"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StreakChart({ currentStreak, longestStreak }: { currentStreak: number; longestStreak: number }) {
  // Generate last 30 days with some activity pattern
  const days = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    active: i < currentStreak || (i >= 10 && i < 10 + longestStreak - currentStreak),
  }));

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
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="100" height="100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#e5e7eb"
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
