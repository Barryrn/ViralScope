"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChannelView } from "./channel-view";
import { LoadingSkeleton } from "./loading-skeleton";
import { VideoCardWithScores } from "./components/video-card-with-scores";
import { IconAlertCircle, IconSearch } from "@tabler/icons-react";
import type { FetchState, YouTubeResult } from "@/hooks/use-youtube-data";
import type { ParsedYouTubeInput } from "@/lib/youtube-utils";
import { useTranslations } from "next-intl";

interface YouTubeResultsProps {
  state: FetchState;
  result: YouTubeResult | null;
  error: string | null;
  parsedInput: ParsedYouTubeInput | null;
  onReset?: () => void;
}

export function YouTubeResults({
  state,
  result,
  error,
  parsedInput,
  onReset,
}: YouTubeResultsProps) {
  const t = useTranslations("youtube.results");

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
          {t("ready.title")}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground/70">
          {t("ready.description")}
        </p>
      </motion.div>
    );
  }

  // Loading state
  if (state === "loading") {
    return (
      <LoadingSkeleton
        type={parsedInput?.type === "channel" ? "channel" : "video"}
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
          {t("error.title")}
        </h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error || t("error.defaultMessage")}
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
          {result.type === "video" && (
            <VideoCardWithScores video={result.data} variant="list" />
          )}
          {result.type === "channel" && (
            <ChannelView channel={result.data} onReset={onReset} />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
