"use client";

import { motion } from "motion/react";
import {
  IconFlame,
  IconChartBar,
  IconBolt,
  IconPlayerPlay,
  IconTrendingUp,
  IconTrophy,
} from "@tabler/icons-react";
import type { VideoWithScores } from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";

interface AnalyticsStatsProps {
  videos: VideoWithScores[];
  avgViralScore: number;
  avgPerformanceScore: number;
  shortsCount: number;
  longFormCount: number;
}

export function AnalyticsStats({
  videos,
  avgViralScore,
  avgPerformanceScore,
  shortsCount,
  longFormCount,
}: AnalyticsStatsProps) {
  const stats = [
    {
      label: "Total Videos",
      value: videos.length,
      icon: IconTrophy,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "Avg Viral",
      value: avgViralScore.toFixed(1),
      icon: IconFlame,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      label: "Avg Performance",
      value: avgPerformanceScore.toFixed(1),
      icon: IconChartBar,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
    },
    {
      label: "Shorts",
      value: shortsCount,
      icon: IconBolt,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-500/10",
    },
    {
      label: "Long Videos",
      value: longFormCount,
      icon: IconPlayerPlay,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.04 }}
          className="rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className={cn("mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg", stat.bg)}>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>

          <div className={cn("text-2xl font-semibold tabular-nums", stat.color)}>
            {stat.value}
          </div>

          <div className="text-xs text-muted-foreground">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface TopPerformersProps {
  topViral: VideoWithScores | null;
  topPerformance: VideoWithScores | null;
}

export function TopPerformers({ topViral, topPerformance }: TopPerformersProps) {
  if (!topViral && !topPerformance) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {topViral && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10">
              <IconFlame className="h-5 w-5 text-rose-500" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  Top Viral
                </span>
                <IconTrendingUp className="h-3 w-3 text-rose-500" />
              </div>
              <h4 className="mt-0.5 line-clamp-1 text-sm font-medium">
                {topViral.title}
              </h4>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {topViral.viralScore.toFixed(1)}
                </span>
                <span>·</span>
                <span className="truncate">{topViral.channelTitle}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {topPerformance && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border/50 bg-card p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-500/10">
              <IconChartBar className="h-5 w-5 text-cyan-500" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                  Top Performer
                </span>
                <IconTrophy className="h-3 w-3 text-cyan-500" />
              </div>
              <h4 className="mt-0.5 line-clamp-1 text-sm font-medium">
                {topPerformance.title}
              </h4>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                  {topPerformance.performanceScore.toFixed(1)}
                </span>
                <span>·</span>
                <span className="truncate">{topPerformance.channelTitle}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
