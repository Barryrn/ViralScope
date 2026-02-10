"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconBrandYoutube,
  IconSearch,
  IconLoader2,
  IconAlertCircle,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";
import { parseYouTubeInput } from "@/lib/youtube-utils";
import type { VideoData, ChannelData } from "@/convex/youtubeTypes";
import { AnalyticsView } from "./analytics-view";
import { ChannelHeader } from "./channel-header";

type FetchState = "idle" | "loading" | "success" | "error";

export function AnalyticsDashboard() {
  const searchParams = useSearchParams();
  const channelParam = searchParams.get("channel");

  const [input, setInput] = useState("");
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);

  const fetchChannel = useAction(api.youtube.fetchChannelData);
  const fetchChannelVideos = useAction(api.youtube.fetchChannelVideos);

  // Auto-load channel from URL param
  useEffect(() => {
    if (channelParam && !hasAutoLoaded && state === "idle") {
      setHasAutoLoaded(true);
      setInput(channelParam.startsWith("@") ? channelParam : `@${channelParam}`);

      // Trigger the fetch
      const loadChannel = async () => {
        const isChannelId = channelParam.startsWith("UC");
        const handle = channelParam.startsWith("@") ? channelParam.slice(1) : channelParam;

        setState("loading");
        setError(null);

        try {
          const channelData = await fetchChannel(
            isChannelId
              ? { channelId: channelParam }
              : { handle }
          );

          if (!channelData) {
            throw new Error("Channel not found");
          }

          setChannel(channelData);

          const videosResult = await fetchChannelVideos({
            channelId: channelData.id,
            maxResults: 50,
          });

          if (videosResult) {
            setVideos(videosResult.videos);
            setNextPageToken(videosResult.nextPageToken);
          }

          setState("success");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch channel");
          setState("error");
        }
      };

      loadChannel();
    }
  }, [channelParam, hasAutoLoaded, state, fetchChannel, fetchChannelVideos]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      const parsed = parseYouTubeInput(input.trim());

      if (parsed.type !== "channel") {
        setError("Please enter a YouTube channel URL or @handle");
        return;
      }

      setState("loading");
      setError(null);
      setVideos([]);
      setChannel(null);
      setNextPageToken(undefined);

      try {
        // Fetch channel data
        const channelData = await fetchChannel(
          parsed.isHandle
            ? { handle: parsed.id }
            : { channelId: parsed.id }
        );

        if (!channelData) {
          throw new Error("Channel not found");
        }

        setChannel(channelData);

        // Fetch channel videos
        const videosResult = await fetchChannelVideos({
          channelId: channelData.id,
          maxResults: 50,
        });

        if (videosResult) {
          setVideos(videosResult.videos);
          setNextPageToken(videosResult.nextPageToken);
        }

        setState("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch channel");
        setState("error");
      }
    },
    [input, fetchChannel, fetchChannelVideos]
  );

  const loadMoreVideos = useCallback(async () => {
    if (!channel || !nextPageToken || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchChannelVideos({
        channelId: channel.id,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      if (result) {
        setVideos((prev) => [...prev, ...result.videos]);
        setNextPageToken(result.nextPageToken);
      }
    } catch (err) {
      console.error("Failed to load more videos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [channel, nextPageToken, isLoadingMore, fetchChannelVideos]);

  const reset = useCallback(() => {
    setInput("");
    setState("idle");
    setError(null);
    setChannel(null);
    setVideos([]);
    setNextPageToken(undefined);
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 text-white dark:from-card dark:via-card dark:to-card/80">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

          {/* Glow effects */}
          <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-rose-500/20 blur-[100px]" />
          <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-[100px]" />
        </div>

        <div className="relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur-sm"
          >
            <IconSparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-white/80">Advanced Analytics</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Channel Analytics
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 max-w-xl text-white/60"
          >
            Analyze any YouTube channel. Get Viral Scores and Performance metrics for all videos.
            Identify what&apos;s trending and what performs consistently.
          </motion.p>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="mt-6 flex gap-3"
          >
            <div className="relative flex-1 max-w-lg">
              <IconBrandYoutube className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter channel URL or @handle..."
                className="h-12 border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/40 focus:border-white/20 focus:ring-white/10"
              />
            </div>
            <Button
              type="submit"
              disabled={state === "loading" || !input.trim()}
              className="h-12 gap-2 bg-gradient-to-r from-rose-500 to-orange-500 px-6 text-white hover:from-rose-600 hover:to-orange-600"
            >
              {state === "loading" ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <IconSearch className="h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </motion.form>

          {/* Hints */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 flex flex-wrap gap-2 text-xs text-white/40"
          >
            <span>Try:</span>
            <button
              type="button"
              onClick={() => setInput("@MrBeast")}
              className="rounded bg-white/5 px-2 py-0.5 transition-colors hover:bg-white/10 hover:text-white/60"
            >
              @MrBeast
            </button>
            <button
              type="button"
              onClick={() => setInput("@mkbhd")}
              className="rounded bg-white/5 px-2 py-0.5 transition-colors hover:bg-white/10 hover:text-white/60"
            >
              @mkbhd
            </button>
            <button
              type="button"
              onClick={() => setInput("@veritasium")}
              className="rounded bg-white/5 px-2 py-0.5 transition-colors hover:bg-white/10 hover:text-white/60"
            >
              @veritasium
            </button>
          </motion.div>
        </div>
      </div>

      {/* Error State */}
      {state === "error" && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-destructive/50 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <IconAlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-destructive">Analysis Failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Channel Header */}
      {channel && state === "success" && (
        <ChannelHeader channel={channel} videoCount={videos.length} onReset={reset} />
      )}

      {/* Analytics View */}
      {state === "success" && (
        <>
          <AnalyticsView
            videos={videos}
            isLoading={false}
            channelTitle={channel?.title}
          />

          {/* Load More */}
          {nextPageToken && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                onClick={loadMoreVideos}
                disabled={isLoadingMore}
                className="gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More Videos
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Loading State */}
      {state === "loading" && (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <IconLoader2 className="h-10 w-10 text-rose-500" />
          </motion.div>
          <div className="text-center">
            <p className="font-medium">Analyzing channel...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Fetching videos and calculating scores
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {state === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/50 bg-muted/10"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/10 to-cyan-500/10">
            <IconBrandYoutube className="h-8 w-8 text-rose-500" />
          </div>
          <div className="text-center">
            <p className="font-medium">Enter a channel to analyze</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Get detailed analytics with Viral and Performance scores
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
