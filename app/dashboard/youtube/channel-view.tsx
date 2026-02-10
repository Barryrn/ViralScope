"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAction } from "convex/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  IconAlertCircle,
  IconRefresh,
  IconVideo,
  IconChartBar,
  IconChevronDown,
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
import { cn } from "@/lib/utils";

// Components
import { ChannelHeader } from "./components/channel-header";
import { VideoCardWithScores } from "./components/video-card-with-scores";
import { AnalyticsFilters } from "./analytics/analytics-filters";
import { AnalyticsStats, TopPerformers } from "./analytics/analytics-stats";

interface ChannelViewProps {
  channel: ChannelData;
  onReset?: () => void;
  className?: string;
}

type VideosState = "idle" | "loading" | "success" | "error";

export function ChannelView({ channel, onReset, className }: ChannelViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Tab state from URL
  const currentTab = searchParams.get("tab") || "videos";

  // Video fetching state
  const [videosState, setVideosState] = useState<VideosState>("idle");
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [videosError, setVideosError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Analytics filter state
  const [videoType, setVideoType] = useState<VideoType>("all");
  const [timeframe, setTimeframe] = useState<TimeframeValue>("30");
  const [sortBy, setSortBy] = useState<SortOption>("viral");

  const fetchChannelVideos = useAction(api.youtube.fetchChannelVideos);

  // Handle tab change with URL persistence
  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "videos") {
        params.delete("tab");
      } else {
        params.set("tab", value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

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
        setNextPageToken(result.nextPageToken);
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

  // Load more videos handler
  const handleLoadMore = useCallback(async () => {
    if (!nextPageToken || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const result = await fetchChannelVideos({
        channelId: channel.id,
        pageToken: nextPageToken,
        maxResults: 50,
      });
      setVideos((prev) => [...prev, ...result.videos]);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      console.error("Failed to load more videos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [channel.id, nextPageToken, isLoadingMore, fetchChannelVideos]);

  // Retry handler
  const handleRetry = useCallback(async () => {
    setVideosState("loading");
    setVideosError(null);
    setVideos([]);
    setNextPageToken(undefined);

    try {
      const result = await fetchChannelVideos({
        channelId: channel.id,
        maxResults: 50,
      });
      setVideos(result.videos);
      setNextPageToken(result.nextPageToken);
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
    const filtered = filterAndProcessVideos(videos, videoType, timeframeDays);
    return sortVideos(filtered, sortBy);
  }, [videos, videoType, timeframeDays, sortBy]);

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

      {/* Content */}
      {videosState === "success" && (
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <TabsList className="h-10 w-full justify-start gap-1 bg-muted/50 p-1 sm:w-auto">
            <TabsTrigger
              value="videos"
              className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <IconVideo className="h-4 w-4" />
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="gap-2 px-4 data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              <IconChartBar className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-0 space-y-6">
            {videos.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Video Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {videos.map((video, index) => (
                    <VideoCardWithScores
                      key={video.id}
                      video={video}
                      index={index}
                      variant="grid"
                    />
                  ))}
                </div>

                {/* Load More */}
                {nextPageToken && (
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-0 space-y-6">
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

                {/* Load More for Insights */}
                {nextPageToken && (
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                  />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
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

function LoadMoreButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex justify-center pt-2"
    >
      <Button
        variant="outline"
        onClick={onClick}
        disabled={isLoading}
        className="gap-2 px-6"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent"
            />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <span>Load More Videos</span>
            <IconChevronDown className="h-4 w-4" />
          </>
        )}
      </Button>
    </motion.div>
  );
}
