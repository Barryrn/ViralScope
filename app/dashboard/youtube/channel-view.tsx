"use client";

import { useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "motion/react";
import { ChannelCard } from "./channel-card";
import { ChannelVideosGrid } from "./channel-videos-grid";
import { ChannelVideosSkeleton } from "./loading-skeleton";
import {
  IconAlertCircle,
  IconRefresh,
  IconVideo,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import type { ChannelData, ChannelVideosResult, VideoData } from "@/convex/youtubeTypes";
import { cn } from "@/lib/utils";

interface ChannelViewProps {
  channel: ChannelData;
  className?: string;
}

type VideosState = "idle" | "loading" | "success" | "error";

export function ChannelView({ channel, className }: ChannelViewProps) {
  const [videosState, setVideosState] = useState<VideosState>("idle");
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [videosError, setVideosError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchChannelVideos = useAction(api.youtube.fetchChannelVideos);

  // Initial fetch when channel is available
  useEffect(() => {
    async function loadVideos() {
      setVideosState("loading");
      setVideosError(null);

      try {
        const result = await fetchChannelVideos({ channelId: channel.id });
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
      });
      setVideos((prev) => [...prev, ...result.videos]);
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      // Silently fail for load more - user can retry
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
      const result = await fetchChannelVideos({ channelId: channel.id });
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

  const videosData: ChannelVideosResult = {
    videos,
    nextPageToken,
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Channel Card */}
      <ChannelCard channel={channel} />

      {/* Videos Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {/* Section Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
              <IconVideo className="h-4.5 w-4.5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Recent Videos
              </h3>
              <p className="text-xs text-muted-foreground">
                {channel.videoCount.toLocaleString()} total uploads
              </p>
            </div>
          </div>
        </div>

        {/* Videos Content */}
        {videosState === "loading" && <ChannelVideosSkeleton />}

        {videosState === "error" && (
          <VideosErrorState error={videosError} onRetry={handleRetry} />
        )}

        {videosState === "success" && (
          <ChannelVideosGrid
            data={videosData}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
          />
        )}
      </motion.section>
    </div>
  );
}

interface VideosErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

function VideosErrorState({ error, onRetry }: VideosErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center"
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
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-4 gap-2"
      >
        <IconRefresh className="h-4 w-4" />
        Try Again
      </Button>
    </motion.div>
  );
}
