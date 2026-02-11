import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import {
  logMutationError,
  getUserFriendlyError,
} from "./withErrorHandling";

// Validator for video data
const videoDataValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  thumbnailUrl: v.string(),
  channelId: v.string(),
  channelTitle: v.string(),
  publishedAt: v.string(),
  viewCount: v.number(),
  likeCount: v.number(),
  commentCount: v.number(),
  duration: v.string(),
  tags: v.optional(v.array(v.string())),
});

/**
 * Save a video to user's collection
 */
export const save = mutation({
  args: {
    videoData: videoDataValidator,
  },
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      // Check if already saved
      const existing = await ctx.db
        .query("savedVideos")
        .withIndex("byUserIdAndVideoId", (q) =>
          q.eq("userId", user._id).eq("videoId", args.videoData.id)
        )
        .unique();

      if (existing) {
        return { success: true, alreadySaved: true };
      }

      await ctx.db.insert("savedVideos", {
        userId: user._id,
        videoId: args.videoData.id,
        videoData: args.videoData,
        savedAt: Date.now(),
      });

      return { success: true, alreadySaved: false };
    } catch (error) {
      await logMutationError(ctx, error, {
        functionName: "savedVideos.save",
        category: "database",
        severity: "medium",
        metadata: { videoId: args.videoData.id },
      });
      throw getUserFriendlyError(error, "database");
    }
  },
});

/**
 * Remove a video from user's collection
 */
export const unsave = mutation({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, { videoId }) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const existing = await ctx.db
        .query("savedVideos")
        .withIndex("byUserIdAndVideoId", (q) =>
          q.eq("userId", user._id).eq("videoId", videoId)
        )
        .unique();

      if (existing) {
        await ctx.db.delete(existing._id);
      }

      return { success: true };
    } catch (error) {
      await logMutationError(ctx, error, {
        functionName: "savedVideos.unsave",
        category: "database",
        severity: "low",
        metadata: { videoId },
      });
      throw getUserFriendlyError(error, "database");
    }
  },
});

/**
 * Get all saved videos for current user
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const saved = await ctx.db
        .query("savedVideos")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect();

      return saved.map((s) => ({
        ...s.videoData,
        savedAt: s.savedAt,
      }));
    } catch (error) {
      console.error("[savedVideos.list] Error:", error);
      throw new Error("Unable to fetch saved videos. Please try again.");
    }
  },
});

/**
 * Check if a video is saved
 */
export const isSaved = query({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, { videoId }) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const existing = await ctx.db
        .query("savedVideos")
        .withIndex("byUserIdAndVideoId", (q) =>
          q.eq("userId", user._id).eq("videoId", videoId)
        )
        .unique();

      return existing !== null;
    } catch (error) {
      return false;
    }
  },
});

/**
 * Get saved video IDs for batch checking
 */
export const getSavedVideoIds = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const saved = await ctx.db
        .query("savedVideos")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();

      return new Set(saved.map((s) => s.videoId));
    } catch (error) {
      return new Set<string>();
    }
  },
});
