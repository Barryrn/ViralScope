"use client";

import { motion, AnimatePresence } from "motion/react";
import { VideoCard } from "./video-card";
import { ChannelCard } from "./channel-card";
import { SearchResults } from "./search-results";
import { LoadingSkeleton } from "./loading-skeleton";
import { IconAlertCircle, IconSearch } from "@tabler/icons-react";
import type { FetchState, YouTubeResult } from "@/hooks/use-youtube-data";
import type { ParsedYouTubeInput } from "@/lib/youtube-utils";

interface YouTubeResultsProps {
  state: FetchState;
  result: YouTubeResult | null;
  error: string | null;
  parsedInput: ParsedYouTubeInput | null;
}

export function YouTubeResults({
  state,
  result,
  error,
  parsedInput,
}: YouTubeResultsProps) {
  // Idle state - show placeholder
  if (state === "idle") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 py-16 text-center"
      >
        <div className="mb-4 rounded-full bg-muted p-4">
          <IconSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">
          Ready to analyze
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">
          Paste a YouTube link above to fetch video metrics, channel stats, or search results
        </p>
      </motion.div>
    );
  }

  // Loading state
  if (state === "loading") {
    return (
      <LoadingSkeleton
        type={parsedInput?.type === "channel" ? "channel" : parsedInput?.type === "search" ? "search" : "video"}
      />
    );
  }

  // Error state
  if (state === "error" || error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 py-12 text-center"
      >
        <div className="mb-4 rounded-full bg-destructive/10 p-3">
          <IconAlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-destructive">
          Unable to fetch data
        </h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error || "An unexpected error occurred. Please try again."}
        </p>
      </motion.div>
    );
  }

  // Success state with results
  if (state === "success" && result) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={result.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {result.type === "video" && <VideoCard video={result.data} />}
          {result.type === "channel" && <ChannelCard channel={result.data} />}
          {result.type === "search" && <SearchResults data={result.data} />}
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
