"use client";

import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  parseYouTubeInput,
  type ParsedYouTubeInput,
} from "@/lib/youtube-utils";
import { useErrorHandler } from "./use-error-handler";
import type { VideoData, ChannelData, SearchResult } from "@/convex/youtubeTypes";

export type FetchState = "idle" | "loading" | "success" | "error";

export type YouTubeResult =
  | { type: "video"; data: VideoData }
  | { type: "channel"; data: ChannelData }
  | { type: "search"; data: SearchResult };

interface UseYouTubeDataReturn {
  state: FetchState;
  error: string | null;
  result: YouTubeResult | null;
  parsedInput: ParsedYouTubeInput | null;
  fetchData: (input: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for fetching YouTube data (videos, channels, or search results)
 */
export function useYouTubeData(): UseYouTubeDataReturn {
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<YouTubeResult | null>(null);
  const [parsedInput, setParsedInput] = useState<ParsedYouTubeInput | null>(null);

  const fetchVideo = useAction(api.youtube.fetchVideoData);
  const fetchChannel = useAction(api.youtube.fetchChannelData);
  const searchVideos = useAction(api.youtube.searchVideos);
  const { handleError } = useErrorHandler();

  const fetchData = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) {
        setError("Please enter a YouTube URL or search query");
        return;
      }

      const parsed = parseYouTubeInput(trimmed);
      setParsedInput(parsed);
      setState("loading");
      setError(null);
      setResult(null);

      try {
        switch (parsed.type) {
          case "video": {
            const videoData = await fetchVideo({ videoId: parsed.id });
            setResult({ type: "video", data: videoData });
            break;
          }
          case "channel": {
            const channelData = await fetchChannel({
              channelId: parsed.isHandle ? undefined : parsed.id,
              handle: parsed.isHandle ? parsed.id : undefined,
            });
            setResult({ type: "channel", data: channelData });
            break;
          }
          case "search": {
            const searchData = await searchVideos({ query: parsed.query });
            setResult({ type: "search", data: searchData });
            break;
          }
        }
        setState("success");
      } catch (err) {
        setState("error");
        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch YouTube data";
        setError(message);
        handleError(err, {
          showToast: true,
          toastTitle: "YouTube Error",
          context: { input: trimmed, type: parsed.type },
        });
      }
    },
    [fetchVideo, fetchChannel, searchVideos, handleError]
  );

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setResult(null);
    setParsedInput(null);
  }, []);

  return {
    state,
    error,
    result,
    parsedInput,
    fetchData,
    reset,
  };
}
