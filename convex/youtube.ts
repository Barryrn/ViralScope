import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { logActionError, getUserFriendlyError } from "./withErrorHandling";
import { ConvexAppError } from "./errors";
import type { VideoData, ChannelData, SearchResult } from "./youtubeTypes";

// Cache duration constants
const VIDEO_CACHE_MS = 60 * 60 * 1000; // 1 hour
const CHANNEL_CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours
const SEARCH_CACHE_MS = 30 * 60 * 1000; // 30 minutes

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Fetch video data from YouTube API
export const fetchVideoData = action({
  args: { videoId: v.string() },
  handler: async (ctx, { videoId }): Promise<VideoData> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexAppError("Authentication required", {
        category: "authentication",
        severity: "medium",
        userMessage: "Please sign in to use YouTube analytics.",
      });
    }

    const apiKey = process.env.YouTube_Key;
    if (!apiKey) {
      throw new ConvexAppError("YouTube API key not configured", {
        category: "youtube_api",
        severity: "critical",
        userMessage: "YouTube integration is not configured. Please contact support.",
      });
    }

    try {
      const url = new URL(`${YOUTUBE_API_BASE}/videos`);
      url.searchParams.set("part", "snippet,statistics,contentDetails");
      url.searchParams.set("id", videoId);
      url.searchParams.set("key", apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 403) {
          throw new ConvexAppError("YouTube API quota exceeded", {
            category: "youtube_api",
            severity: "high",
            userMessage: "API rate limit reached. Please try again later.",
            metadata: { status: response.status },
          });
        }

        throw new ConvexAppError(
          errorData.error?.message || `YouTube API error: ${response.status}`,
          {
            category: "youtube_api",
            severity: "medium",
            metadata: { status: response.status, error: errorData },
          }
        );
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new ConvexAppError("Video not found", {
          category: "validation",
          severity: "low",
          userMessage: "The video could not be found. Please check the URL and try again.",
        });
      }

      const video = data.items[0];
      const videoData: VideoData = {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl:
          video.snippet.thumbnails.maxres?.url ||
          video.snippet.thumbnails.high?.url ||
          video.snippet.thumbnails.default.url,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || "0", 10),
        likeCount: parseInt(video.statistics.likeCount || "0", 10),
        commentCount: parseInt(video.statistics.commentCount || "0", 10),
        duration: video.contentDetails.duration,
        tags: video.snippet.tags,
      };

      // Cache the result
      await ctx.runMutation(internal.youtube.cacheResult, {
        resourceId: videoId,
        resourceType: "video",
        data: videoData,
        userId: identity.subject,
        cacheDurationMs: VIDEO_CACHE_MS,
      });

      return videoData;
    } catch (error) {
      if (error instanceof ConvexAppError) {
        throw error;
      }
      await logActionError(ctx, error, {
        functionName: "youtube.fetchVideoData",
        category: "youtube_api",
        severity: "medium",
        metadata: { videoId },
      });
      throw getUserFriendlyError(error, "youtube_api");
    }
  },
});

// Fetch channel data from YouTube API
export const fetchChannelData = action({
  args: {
    channelId: v.optional(v.string()),
    handle: v.optional(v.string()),
  },
  handler: async (ctx, { channelId, handle }): Promise<ChannelData> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexAppError("Authentication required", {
        category: "authentication",
        severity: "medium",
        userMessage: "Please sign in to use YouTube analytics.",
      });
    }

    if (!channelId && !handle) {
      throw new ConvexAppError("Channel ID or handle required", {
        category: "validation",
        severity: "low",
        userMessage: "Please provide a channel ID or handle.",
      });
    }

    const apiKey = process.env.YouTube_Key;
    if (!apiKey) {
      throw new ConvexAppError("YouTube API key not configured", {
        category: "youtube_api",
        severity: "critical",
        userMessage: "YouTube integration is not configured. Please contact support.",
      });
    }

    try {
      const url = new URL(`${YOUTUBE_API_BASE}/channels`);
      url.searchParams.set("part", "snippet,statistics");
      url.searchParams.set("key", apiKey);

      if (channelId) {
        url.searchParams.set("id", channelId);
      } else if (handle) {
        url.searchParams.set("forHandle", handle);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 403) {
          throw new ConvexAppError("YouTube API quota exceeded", {
            category: "youtube_api",
            severity: "high",
            userMessage: "API rate limit reached. Please try again later.",
          });
        }

        throw new ConvexAppError(
          errorData.error?.message || `YouTube API error: ${response.status}`,
          {
            category: "youtube_api",
            severity: "medium",
          }
        );
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new ConvexAppError("Channel not found", {
          category: "validation",
          severity: "low",
          userMessage: "The channel could not be found. Please check the URL and try again.",
        });
      }

      const channel = data.items[0];
      const channelData: ChannelData = {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnailUrl:
          channel.snippet.thumbnails.high?.url ||
          channel.snippet.thumbnails.default.url,
        subscriberCount: parseInt(channel.statistics.subscriberCount || "0", 10),
        videoCount: parseInt(channel.statistics.videoCount || "0", 10),
        viewCount: parseInt(channel.statistics.viewCount || "0", 10),
        customUrl: channel.snippet.customUrl,
        publishedAt: channel.snippet.publishedAt,
      };

      // Cache the result
      await ctx.runMutation(internal.youtube.cacheResult, {
        resourceId: channel.id,
        resourceType: "channel",
        data: channelData,
        userId: identity.subject,
        cacheDurationMs: CHANNEL_CACHE_MS,
      });

      return channelData;
    } catch (error) {
      if (error instanceof ConvexAppError) {
        throw error;
      }
      await logActionError(ctx, error, {
        functionName: "youtube.fetchChannelData",
        category: "youtube_api",
        severity: "medium",
        metadata: { channelId, handle },
      });
      throw getUserFriendlyError(error, "youtube_api");
    }
  },
});

// Search videos on YouTube
export const searchVideos = action({
  args: {
    query: v.string(),
    maxResults: v.optional(v.number()),
    pageToken: v.optional(v.string()),
  },
  handler: async (ctx, { query, maxResults = 12, pageToken }): Promise<SearchResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexAppError("Authentication required", {
        category: "authentication",
        severity: "medium",
        userMessage: "Please sign in to use YouTube analytics.",
      });
    }

    const apiKey = process.env.YouTube_Key;
    if (!apiKey) {
      throw new ConvexAppError("YouTube API key not configured", {
        category: "youtube_api",
        severity: "critical",
        userMessage: "YouTube integration is not configured. Please contact support.",
      });
    }

    try {
      const url = new URL(`${YOUTUBE_API_BASE}/search`);
      url.searchParams.set("part", "snippet");
      url.searchParams.set("type", "video");
      url.searchParams.set("q", query);
      url.searchParams.set("maxResults", maxResults.toString());
      url.searchParams.set("key", apiKey);

      if (pageToken) {
        url.searchParams.set("pageToken", pageToken);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 403) {
          throw new ConvexAppError("YouTube API quota exceeded", {
            category: "youtube_api",
            severity: "high",
            userMessage: "API rate limit reached. Please try again later.",
          });
        }

        throw new ConvexAppError(
          errorData.error?.message || `YouTube API error: ${response.status}`,
          {
            category: "youtube_api",
            severity: "medium",
          }
        );
      }

      const data = await response.json();

      const searchResult: SearchResult = {
        videos: (data.items || []).map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl:
            item.snippet.thumbnails.high?.url ||
            item.snippet.thumbnails.default.url,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
        })),
        totalResults: data.pageInfo?.totalResults || 0,
        nextPageToken: data.nextPageToken,
      };

      // Cache the result with query hash as ID
      const cacheId = `search:${query}:${pageToken || "first"}`;
      await ctx.runMutation(internal.youtube.cacheResult, {
        resourceId: cacheId,
        resourceType: "search",
        data: searchResult,
        userId: identity.subject,
        cacheDurationMs: SEARCH_CACHE_MS,
      });

      return searchResult;
    } catch (error) {
      if (error instanceof ConvexAppError) {
        throw error;
      }
      await logActionError(ctx, error, {
        functionName: "youtube.searchVideos",
        category: "youtube_api",
        severity: "medium",
        metadata: { query, maxResults },
      });
      throw getUserFriendlyError(error, "youtube_api");
    }
  },
});

// Internal mutation to cache results
export const cacheResult = internalMutation({
  args: {
    resourceId: v.string(),
    resourceType: v.union(
      v.literal("video"),
      v.literal("channel"),
      v.literal("search")
    ),
    data: v.any(),
    userId: v.string(),
    cacheDurationMs: v.number(),
  },
  handler: async (ctx, { resourceId, resourceType, data, userId, cacheDurationMs }) => {
    const now = Date.now();

    // Delete existing cache entry if present
    const existing = await ctx.db
      .query("youtubeCache")
      .withIndex("byResourceId", (q) => q.eq("resourceId", resourceId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    await ctx.db.insert("youtubeCache", {
      resourceId,
      resourceType,
      data,
      userId,
      fetchedAt: now,
      expiresAt: now + cacheDurationMs,
    });
  },
});

// Query to check cache
export const getCached = query({
  args: { resourceId: v.string() },
  handler: async (ctx, { resourceId }) => {
    const cached = await ctx.db
      .query("youtubeCache")
      .withIndex("byResourceId", (q) => q.eq("resourceId", resourceId))
      .unique();

    if (!cached || cached.expiresAt < Date.now()) {
      return null;
    }

    return cached.data;
  },
});
