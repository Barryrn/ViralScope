"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  IconAlertCircle,
  IconRefresh,
  IconVideo,
  IconMoodEmpty,
  IconLoader2,
} from "@tabler/icons-react";
import type { ChannelData, VideoData } from "@/convex/youtubeTypes";
import {
  filterAndProcessVideos,
  sortVideos,
  getVideoStats,
  TIMEFRAME_OPTIONS,
  SORT_OPTIONS,
  type VideoType,
  type TimeframeValue,
  type SortOption,
} from "@/lib/analytics-utils";
import { useScoreWeights } from "@/lib/contexts/score-weights-context";
import { cn } from "@/lib/utils";

// Components
import { ChannelHeader } from "./components/channel-header";
import { VideoCardWithScores } from "./components/video-card-with-scores";
import { AnalyticsFilters } from "./analytics/analytics-filters";
import { AnalyticsStats, TopPerformers } from "./analytics/analytics-stats";
import { WeightConfig } from "./analytics/weight-config";

interface ChannelViewProps {
  channel: ChannelData;
  onReset?: () => void;
  className?: string;
}

type VideosState = "idle" | "loading" | "success" | "error";

export function ChannelView({ channel, onReset, className }: ChannelViewProps) {
  // Video fetching state
  const [videosState, setVideosState] = useState<VideosState>("idle");
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [videosError, setVideosError] = useState<string | null>(null);

  // Analytics filter state
  const [videoType, setVideoType] = useState<VideoType>("all");
  const [timeframe, setTimeframe] = useState<TimeframeValue>("all");
  const [sortBy, setSortBy] = useState<SortOption>("viral");

  // Get user's score weights
  const { weights } = useScoreWeights();

  const fetchChannelVideos = useAction(api.youtube.fetchChannelVideos);

  // Initial fetch when channel is available
  useEffect(() => {
    async function loadVideos() {
      setVideosState("loading");
      setVideosError(null);

      try {
        const result = await fetchChannelVideos({
          channelId: channel.id,
          maxResults: 50,
        });
        setVideos(result.videos);
        setVideosState("success");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load videos";
        setVideosError(message);
        setVideosState("error");
      }
    }

    loadVideos();
  }, [channel.id, fetchChannelVideos]);

  // Retry handler
  const handleRetry = useCallback(async () => {
    setVideosState("loading");
    setVideosError(null);
    setVideos([]);

    try {
      const result = await fetchChannelVideos({
        channelId: channel.id,
        maxResults: 50,
      });
      setVideos(result.videos);
      setVideosState("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load videos";
      setVideosError(message);
      setVideosState("error");
    }
  }, [channel.id, fetchChannelVideos]);

  // Process videos for analytics
  const timeframeDays = useMemo(() => {
    const option = TIMEFRAME_OPTIONS.find((o) => o.value === timeframe);
    return option?.days ?? null;
  }, [timeframe]);

  const processedVideos = useMemo(() => {
    const filtered = filterAndProcessVideos(videos, videoType, timeframeDays, weights);
    return sortVideos(filtered, sortBy);
  }, [videos, videoType, timeframeDays, sortBy, weights]);

  const stats = useMemo(
    () => getVideoStats(processedVideos),
    [processedVideos]
  );

  // Get the current sort label for display
  const currentSortLabel = useMemo(() => {
    const option = SORT_OPTIONS.find((o) => o.value === sortBy);
    return option?.label ?? "Viral Score";
  }, [sortBy]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Channel Header */}
      <ChannelHeader
        channel={channel}
        videoCount={videos.length}
        onReset={onReset}
      />

      {/* Loading State */}
      {videosState === "loading" && <LoadingState />}

      {/* Error State */}
      {videosState === "error" && (
        <ErrorState error={videosError} onRetry={handleRetry} />
      )}

      {/* Content - Insights Only */}
      {videosState === "success" && (
        <div className="space-y-6">
          {videos.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Statistics */}
              <AnalyticsStats
                videos={processedVideos}
                avgViralScore={stats.avgViralScore}
                avgPerformanceScore={stats.avgPerformanceScore}
                shortsCount={stats.shortsCount}
                longFormCount={stats.longFormCount}
              />

              {/* Weight Configuration */}
              <WeightConfig />

              {/* Top Performers */}
              <TopPerformers
                topViral={stats.topViralVideo}
                topPerformance={stats.topPerformanceVideo}
              />

              {/* Filters */}
              <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
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
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {processedVideos.length}
                  </span>{" "}
                  {processedVideos.length === 1 ? "video" : "videos"}
                  {videoType !== "all" && (
                    <span className="ml-1">
                      (
                      {videoType === "short"
                        ? "Shorts only"
                        : "Long videos only"}
                      )
                    </span>
                  )}
                </span>
                <span className="text-xs">
                  Sorted by {currentSortLabel}
                </span>
              </div>

              {/* Video List */}
              <AnimatePresence mode="wait">
                {processedVideos.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 bg-muted/10"
                  >
                    <IconMoodEmpty className="h-10 w-10 text-muted-foreground/50" />
                    <div className="text-center">
                      <p className="font-medium text-muted-foreground">
                        No videos match filters
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground/70">
                        Try adjusting your filters or timeframe
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-4"
                  >
                    {processedVideos.map((video, index) => (
                      <VideoCardWithScores
                        key={video.id}
                        video={video}
                        index={index}
                        variant="list"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <IconLoader2 className="h-8 w-8 text-muted-foreground" />
      </motion.div>
      <div className="text-center">
        <p className="font-medium">Loading videos...</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Fetching channel content
        </p>
      </div>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-12 text-center"
    >
      <div className="mb-4 rounded-full bg-destructive/10 p-3">
        <IconAlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-destructive">
        Unable to load videos
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {error || "Something went wrong while fetching channel videos"}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 gap-2">
        <IconRefresh className="h-4 w-4" />
        Try Again
      </Button>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/10 py-16 text-center"
    >
      <div className="mb-4 rounded-full bg-muted/50 p-4">
        <IconVideo className="h-8 w-8 text-muted-foreground/70" />
      </div>
      <h3 className="text-lg font-medium text-muted-foreground">
        No videos found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">
        This channel hasn&apos;t uploaded any public videos yet
      </p>
    </motion.div>
  );
}
