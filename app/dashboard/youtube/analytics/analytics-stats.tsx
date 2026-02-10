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
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/10",
    },
    {
      label: "Avg Viral Score",
      value: avgViralScore.toFixed(1),
      icon: IconFlame,
      gradient: "from-rose-500 to-orange-400",
      bgGradient: "from-rose-500/10 to-orange-400/10",
    },
    {
      label: "Avg Performance",
      value: avgPerformanceScore.toFixed(1),
      icon: IconChartBar,
      gradient: "from-cyan-500 to-violet-500",
      bgGradient: "from-cyan-500/10 to-violet-500/10",
    },
    {
      label: "Shorts",
      value: shortsCount,
      icon: IconBolt,
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-500/10 to-pink-500/10",
    },
    {
      label: "Long Videos",
      value: longFormCount,
      icon: IconPlayerPlay,
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "from-blue-500/10 to-indigo-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={cn(
            "group relative overflow-hidden rounded-xl border border-border/40 p-4 transition-all hover:border-border/60 hover:shadow-lg",
            `bg-gradient-to-br ${stat.bgGradient}`
          )}
        >
          {/* Ambient glow */}
          <div
            className={cn(
              "pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50",
              `bg-gradient-to-br ${stat.gradient}`
            )}
          />

          <div className="relative">
            <div
              className={cn(
                "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg",
                `bg-gradient-to-br ${stat.gradient}`
              )}
            >
              <stat.icon className="h-4 w-4 text-white" />
            </div>

            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                "bg-clip-text text-transparent",
                `bg-gradient-to-r ${stat.gradient}`
              )}
            >
              {stat.value}
            </div>

            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </div>
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-transparent to-orange-500/5 p-4"
        >
          {/* Fire decorative element */}
          <div className="pointer-events-none absolute -right-8 -top-8 text-8xl opacity-10">
            🔥
          </div>

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 shadow-lg shadow-rose-500/20">
              <IconFlame className="h-6 w-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-rose-400">
                  Top Viral
                </span>
                <IconTrendingUp className="h-3 w-3 text-rose-400" />
              </div>
              <h4 className="mt-1 line-clamp-1 font-semibold">{topViral.title}</h4>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{topViral.channelTitle}</span>
                <span className="opacity-40">·</span>
                <span className="font-bold text-rose-400">
                  Score: {topViral.viralScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {topPerformance && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 p-4"
        >
          {/* Trophy decorative element */}
          <div className="pointer-events-none absolute -right-8 -top-8 text-8xl opacity-10">
            🏆
          </div>

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/20">
              <IconChartBar className="h-6 w-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                  Top Performer
                </span>
                <IconTrophy className="h-3 w-3 text-cyan-400" />
              </div>
              <h4 className="mt-1 line-clamp-1 font-semibold">{topPerformance.title}</h4>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{topPerformance.channelTitle}</span>
                <span className="opacity-40">·</span>
                <span className="font-bold text-cyan-400">
                  Score: {topPerformance.performanceScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
