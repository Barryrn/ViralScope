"use client";

import { YouTubeInput } from "./youtube-input";
import { YouTubeResults } from "./youtube-results";
import { useYouTubeData } from "@/hooks/use-youtube-data";
import { useTranslations } from "next-intl";

export function YouTubeDashboard() {
  const youtubeData = useYouTubeData();
  const t = useTranslations("youtube.dashboard");

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6">
      {/* Header - Clean & Minimal */}
      <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              {t("liveAnalytics")}
            </div>

            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <YouTubeInput
        onSubmit={youtubeData.fetchData}
        isLoading={youtubeData.state === "loading"}
        onReset={youtubeData.reset}
      />

      {/* Results Section */}
      <YouTubeResults
        state={youtubeData.state}
        result={youtubeData.result}
        error={youtubeData.error}
        parsedInput={youtubeData.parsedInput}
        onReset={youtubeData.reset}
      />
    </div>
  );
}
