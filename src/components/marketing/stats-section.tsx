"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicStats } from "@/app/api/public/stats/route";

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M+`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K+`;
  }
  if (num === 0) {
    return "0";
  }
  return `${num}+`;
}

interface StatItemProps {
  value: string;
  label: string;
  loading?: boolean;
}

function StatItem({ value, label, loading }: StatItemProps) {
  if (loading) {
    return (
      <div className="text-center">
        <Skeleton className="h-10 w-20 mx-auto mb-2 bg-primary-foreground/20" />
        <Skeleton className="h-4 w-24 mx-auto bg-primary-foreground/20" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-primary-foreground/80">{label}</div>
    </div>
  );
}

export function StatsSection() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/public/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
        // On error, just use fallback values (no need to track error state)
      } catch {
        // Silently fail and use fallback values
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fallback values if API fails or data is missing
  const displayStats = {
    activeLearners: stats?.activeLearners ?? 0,
    lessonModules: stats?.lessonModules ?? 0,
    parentSatisfaction: stats?.parentSatisfaction ?? 95,
    appRating: stats?.appRating ?? 4.9,
  };

  // Format values for display
  const formattedStats = {
    activeLearners: formatNumber(displayStats.activeLearners),
    lessonModules: formatNumber(displayStats.lessonModules),
    parentSatisfaction: `${displayStats.parentSatisfaction}%`,
    appRating: displayStats.appRating.toFixed(1),
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <StatItem
                value={formattedStats.activeLearners}
                label="Active Learners"
                loading={loading}
              />
              <StatItem
                value={formattedStats.lessonModules}
                label="Lesson Modules"
                loading={loading}
              />
              <StatItem
                value={formattedStats.parentSatisfaction}
                label="Parent Satisfaction"
                loading={loading}
              />
              <StatItem
                value={formattedStats.appRating}
                label="App Store Rating"
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default StatsSection;
