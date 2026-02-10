"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconMoodEmpty, IconLoader2 } from "@tabler/icons-react";
import type { VideoData } from "@/convex/youtubeTypes";
import {
  filterAndProcessVideos,
  sortByScore,
  getVideoStats,
  TIMEFRAME_OPTIONS,
  type VideoType,
  type TimeframeValue,
} from "@/lib/analytics-utils";
import { AnalyticsFilters } from "./analytics-filters";
import { AnalyticsStats, TopPerformers } from "./analytics-stats";
import { VideoAnalyticsCard } from "./video-analytics-card";

interface AnalyticsViewProps {
  videos: VideoData[];
  isLoading?: boolean;
  channelTitle?: string;
}

export function AnalyticsView({
  videos,
  isLoading = false,
  channelTitle,
}: AnalyticsViewProps) {
  // Filter states
  const [videoType, setVideoType] = useState<VideoType>("all");
  const [timeframe, setTimeframe] = useState<TimeframeValue>("30");
  const [sortBy, setSortBy] = useState<"viral" | "performance">("viral");

  // Get timeframe in days
  const timeframeDays = useMemo(() => {
    const option = TIMEFRAME_OPTIONS.find((o) => o.value === timeframe);
    return option?.days ?? null;
  }, [timeframe]);

  // Process and filter videos
  const processedVideos = useMemo(() => {
    const filtered = filterAndProcessVideos(videos, videoType, timeframeDays);
    return sortByScore(filtered, sortBy);
  }, [videos, videoType, timeframeDays, sortBy]);

  // Get statistics
  const stats = useMemo(() => getVideoStats(processedVideos), [processedVideos]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <IconLoader2 className="h-8 w-8 text-muted-foreground" />
        </motion.div>
        <p className="text-sm text-muted-foreground">Analyzing videos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-card/90 p-6">
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-rose-500/10 to-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Video Analytics
          </div>

          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {channelTitle ? (
              <>
                <span className="text-muted-foreground">Analytics for </span>
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  {channelTitle}
                </span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Video Performance
              </span>
            )}
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Discover which content is trending and performing well. Compare Viral Score
            (momentum) vs Performance Score (overall quality) to optimize your strategy.
          </p>
        </div>
      </div>

      {/* Statistics */}
      {processedVideos.length > 0 && (
        <AnalyticsStats
          videos={processedVideos}
          avgViralScore={stats.avgViralScore}
          avgPerformanceScore={stats.avgPerformanceScore}
          shortsCount={stats.shortsCount}
          longFormCount={stats.longFormCount}
        />
      )}

      {/* Top Performers */}
      {processedVideos.length > 0 && (
        <TopPerformers
          topViral={stats.topViralVideo}
          topPerformance={stats.topPerformanceVideo}
        />
      )}

      {/* Filters */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-4">
        <AnalyticsFilters
          videoType={videoType}
          onVideoTypeChange={setVideoType}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing <span className="font-semibold text-foreground">{processedVideos.length}</span>{" "}
          {processedVideos.length === 1 ? "video" : "videos"}
          {videoType !== "all" && (
            <span className="ml-1">
              ({videoType === "short" ? "Shorts only" : "Long videos only"})
            </span>
          )}
        </span>
        <span className="text-xs">
          Sorted by {sortBy === "viral" ? "Viral Score" : "Performance Score"}
        </span>
      </div>

      {/* Video Grid */}
      <AnimatePresence mode="wait">
        {processedVideos.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/50 bg-muted/20"
          >
            <IconMoodEmpty className="h-12 w-12 text-muted-foreground/50" />
            <div className="text-center">
              <p className="font-medium text-muted-foreground">No videos found</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Try adjusting your filters or timeframe
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {processedVideos.map((video, index) => (
              <VideoAnalyticsCard key={video.id} video={video} index={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
