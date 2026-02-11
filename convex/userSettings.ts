import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import {
  logMutationError,
  getUserFriendlyError,
} from "./withErrorHandling";

// Default weight values
export const DEFAULT_WEIGHTS = {
  viral: {
    velocity: 0.6,
    engagement: 0.25,
    comment: 0.15,
  },
  performance: {
    engagement: 0.75,
    comment: 0.25,
  },
};

/**
 * Get current user's score weight settings
 * Returns null if user has no custom settings (use defaults)
 */
export const get = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const settings = await ctx.db
        .query("userSettings")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .unique();

      if (!settings) {
        return null;
      }

      return {
        viral: {
          velocity: settings.viralVelocityWeight,
          engagement: settings.viralEngagementWeight,
          comment: settings.viralCommentWeight,
        },
        performance: {
          engagement: settings.perfEngagementWeight,
          comment: settings.perfCommentWeight,
        },
      };
    } catch (error) {
      console.error("[userSettings.get] Error fetching settings:", error);
      throw new Error("Unable to fetch score settings. Please try again.");
    }
  },
});

/**
 * Create or update user's score weight settings
 */
export const upsert = mutation({
  args: {
    viralVelocityWeight: v.number(),
    viralEngagementWeight: v.number(),
    viralCommentWeight: v.number(),
    perfEngagementWeight: v.number(),
    perfCommentWeight: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      // Validate viral weights sum to 1.0 (with small tolerance for floating point)
      const viralSum =
        args.viralVelocityWeight +
        args.viralEngagementWeight +
        args.viralCommentWeight;
      if (Math.abs(viralSum - 1.0) > 0.001) {
        throw new Error(
          `Viral weights must sum to 1.0, got ${viralSum.toFixed(3)}`
        );
      }

      // Validate performance weights sum to 1.0
      const perfSum = args.perfEngagementWeight + args.perfCommentWeight;
      if (Math.abs(perfSum - 1.0) > 0.001) {
        throw new Error(
          `Performance weights must sum to 1.0, got ${perfSum.toFixed(3)}`
        );
      }

      const existingSettings = await ctx.db
        .query("userSettings")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .unique();

      const settingsData = {
        viralVelocityWeight: args.viralVelocityWeight,
        viralEngagementWeight: args.viralEngagementWeight,
        viralCommentWeight: args.viralCommentWeight,
        perfEngagementWeight: args.perfEngagementWeight,
        perfCommentWeight: args.perfCommentWeight,
        updatedAt: Date.now(),
      };

      if (existingSettings) {
        await ctx.db.patch(existingSettings._id, settingsData);
      } else {
        await ctx.db.insert("userSettings", {
          userId: user._id,
          ...settingsData,
        });
      }

      return { success: true };
    } catch (error) {
      await logMutationError(ctx, error, {
        functionName: "userSettings.upsert",
        category: "database",
        severity: "medium",
        metadata: { weights: args },
      });
      throw getUserFriendlyError(error, "database");
    }
  },
});

/**
 * Reset user's settings to defaults (deletes the record)
 */
export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await getCurrentUserOrThrow(ctx);

      const existingSettings = await ctx.db
        .query("userSettings")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .unique();

      if (existingSettings) {
        await ctx.db.delete(existingSettings._id);
      }

      return { success: true };
    } catch (error) {
      await logMutationError(ctx, error, {
        functionName: "userSettings.reset",
        category: "database",
        severity: "low",
      });
      throw getUserFriendlyError(error, "database");
    }
  },
});
