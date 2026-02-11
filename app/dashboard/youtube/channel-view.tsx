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
  isWithinTimeframe,
  TIMEFRAME_OPTIONS,
  SORT_OPTIONS,
  DEFAULT_TIMEFRAME,
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
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Analytics filter state
  const [videoType, setVideoType] = useState<VideoType>("all");
  const [timeframe, setTimeframe] = useState<TimeframeValue>(DEFAULT_TIMEFRAME);
  const [sortBy, setSortBy] = useState<SortOption>("date");

  // Get user's score weights
  const { weights } = useScoreWeights();

  const fetchChannelVideos = useAction(api.youtube.fetchChannelVideos);

  // Initial fetch - get all videos within 60-day timeframe
  useEffect(() => {
    async function loadVideos() {
      setVideosState("loading");
      setVideosError(null);
      setVideos([]);
      setNextPageToken(undefined);

      try {
        let allVideos: VideoData[] = [];
        let pageToken: string | undefined = undefined;

        // Fetch batches until we hit videos older than 60 days
        do {
          const result = await fetchChannelVideos({
            channelId: channel.id,
            maxResults: 50,
            pageToken,
          });

          allVideos = [...allVideos, ...result.videos];
          pageToken = result.nextPageToken;

          // Check if oldest video in batch is older than 60 days
          const lastVideo = result.videos[result.videos.length - 1];
          if (lastVideo && !isWithinTimeframe(lastVideo.publishedAt, 60)) {
            break; // We've gone past the default timeframe
          }
        } while (pageToken);

        setVideos(allVideos);
        setNextPageToken(pageToken);
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
    setNextPageToken(undefined);

    try {
      let allVideos: VideoData[] = [];
      let pageToken: string | undefined = undefined;

      do {
        const result = await fetchChannelVideos({
          channelId: channel.id,
          maxResults: 50,
          pageToken,
        });

        allVideos = [...allVideos, ...result.videos];
        pageToken = result.nextPageToken;

        const lastVideo = result.videos[result.videos.length - 1];
        if (lastVideo && !isWithinTimeframe(lastVideo.publishedAt, 60)) {
          break;
        }
      } while (pageToken);

      setVideos(allVideos);
      setNextPageToken(pageToken);
      setVideosState("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load videos";
      setVideosError(message);
      setVideosState("error");
    }
  }, [channel.id, fetchChannelVideos]);

  // Show More handler - fetches +10 more videos from API
  const handleShowMore = useCallback(async () => {
    if (isLoadingMore || !nextPageToken) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchChannelVideos({
        channelId: channel.id,
        maxResults: 10,
        pageToken: nextPageToken,
      });
      setVideos((prev) => [...prev, ...result.videos]);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      console.error("Failed to load more videos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, nextPageToken, channel.id, fetchChannelVideos]);

  // Can show more videos from API?
  const canShowMore = !!nextPageToken;

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
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {videos.length}
                  </span>{" "}
                  fetched {videos.length === 1 ? "video" : "videos"}
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

              {/* Show More Button */}
              {canShowMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleShowMore}
                    disabled={isLoadingMore}
                    className="gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Show More</>
                    )}
                  </Button>
                </div>
              )}
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
