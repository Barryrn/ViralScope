"use client";

import { useState, useMemo } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconBookmark,
  IconLoader2,
  IconMoodEmpty,
  IconLink,
} from "@tabler/icons-react";

import { VideoCardWithScores } from "../youtube/components/video-card-with-scores";
import { AnalyticsFilters } from "../youtube/analytics/analytics-filters";
import {
  filterAndProcessVideos,
  sortVideos,
  TIMEFRAME_OPTIONS,
  DEFAULT_TIMEFRAME,
  type VideoType,
  type TimeframeValue,
  type SortOption,
} from "@/lib/analytics-utils";
import { useScoreWeights } from "@/lib/contexts/score-weights-context";
import { parseYouTubeInput } from "@/lib/youtube-utils";
import type { VideoData } from "@/convex/youtubeTypes";

export function SavedVideosDashboard() {
  // Saved videos from Convex
  const savedVideos = useQuery(api.savedVideos.list);
  const fetchVideoData = useAction(api.youtube.fetchVideoData);
  const saveVideo = useMutation(api.savedVideos.save);

  // URL paste state
  const [pasteUrl, setPasteUrl] = useState("");
  const [isPasting, setIsPasting] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Filter state
  const [videoType, setVideoType] = useState<VideoType>("all");
  const [timeframe, setTimeframe] = useState<TimeframeValue>(DEFAULT_TIMEFRAME);
  const [sortBy, setSortBy] = useState<SortOption>("date");

  const { weights } = useScoreWeights();

  // Handle URL paste submission
  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteUrl.trim() || isPasting) return;

    setIsPasting(true);
    setPasteError(null);

    try {
      const parsed = parseYouTubeInput(pasteUrl);

      if (parsed.type !== "video") {
        throw new Error("Please paste a YouTube video URL");
      }

      // Fetch video data from YouTube API
      const videoData = await fetchVideoData({ videoId: parsed.id });

      // Save to collection
      await saveVideo({
        videoData: {
          id: videoData.id,
          title: videoData.title,
          description: videoData.description,
          thumbnailUrl: videoData.thumbnailUrl,
          channelId: videoData.channelId,
          channelTitle: videoData.channelTitle,
          publishedAt: videoData.publishedAt,
          viewCount: videoData.viewCount,
          likeCount: videoData.likeCount,
          commentCount: videoData.commentCount,
          duration: videoData.duration,
          tags: videoData.tags,
        },
      });

      setPasteUrl("");
    } catch (error) {
      setPasteError(
        error instanceof Error ? error.message : "Failed to add video"
      );
    } finally {
      setIsPasting(false);
    }
  };

  // Process videos with filters
  const timeframeDays = useMemo(() => {
    const option = TIMEFRAME_OPTIONS.find((o) => o.value === timeframe);
    return option?.days ?? null;
  }, [timeframe]);

  const processedVideos = useMemo(() => {
    if (!savedVideos) return [];

    // Convert saved videos back to VideoData format
    const videoDataList: VideoData[] = savedVideos.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      thumbnailUrl: v.thumbnailUrl,
      channelId: v.channelId,
      channelTitle: v.channelTitle,
      publishedAt: v.publishedAt,
      viewCount: v.viewCount,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      duration: v.duration,
      tags: v.tags,
    }));

    return filterAndProcessVideos(videoDataList, videoType, timeframeDays, weights);
  }, [savedVideos, videoType, timeframeDays, weights]);

  const displayedVideos = useMemo(() => {
    return sortVideos(processedVideos, sortBy);
  }, [processedVideos, sortBy]);

  const isLoading = savedVideos === undefined;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6">
      {/* Header */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <IconBookmark className="h-3.5 w-3.5" />
              Your Collection
            </div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Saved Videos
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Videos you&apos;ve saved for later analysis. Add more by pasting a
              YouTube URL below.
            </p>
          </div>
        </div>
      </div>

      {/* URL Paste Input */}
      <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
        <form onSubmit={handlePasteSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <IconLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={pasteUrl}
              onChange={(e) => setPasteUrl(e.target.value)}
              placeholder="Paste YouTube video URL to add to collection..."
              className="pl-10"
              disabled={isPasting}
            />
          </div>
          <Button type="submit" disabled={isPasting || !pasteUrl.trim()}>
            {isPasting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Video"
            )}
          </Button>
        </form>
        {pasteError && (
          <p className="mt-2 text-sm text-destructive">{pasteError}</p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading saved videos...</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {savedVideos.length === 0 ? (
            <EmptyState />
          ) : (
            <>
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
                    {displayedVideos.length}
                  </span>{" "}
                  of {savedVideos.length} saved videos
                </span>
              </div>

              {/* Video List */}
              <AnimatePresence mode="wait">
                {displayedVideos.length === 0 ? (
                  <NoMatchState />
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-4"
                  >
                    {displayedVideos.map((video, index) => (
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
        </>
      )}
    </div>
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
        <IconBookmark className="h-8 w-8 text-muted-foreground/70" />
      </div>
      <h3 className="text-lg font-medium text-muted-foreground">
        No saved videos yet
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">
        Save videos while browsing to build your collection, or paste a YouTube
        URL above.
      </p>
    </motion.div>
  );
}

function NoMatchState() {
  return (
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
  );
}
