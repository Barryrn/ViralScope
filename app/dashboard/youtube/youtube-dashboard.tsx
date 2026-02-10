"use client";

import { YouTubeInput } from "./youtube-input";
import { YouTubeResults } from "./youtube-results";
import { useYouTubeData } from "@/hooks/use-youtube-data";

export function YouTubeDashboard() {
  const youtubeData = useYouTubeData();

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 lg:px-6">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/40 via-card to-card p-6 md:p-8">
        {/* Decorative grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        {/* Glow effect */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl" />

        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Live Analytics
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            <span className="bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              YouTube Analytics
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Enter a YouTube video URL, channel, or search query to analyze engagement metrics and performance data.
          </p>
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
      />
    </div>
  );
}
