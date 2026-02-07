import {
  internalMutation,
  internalQuery,
  mutation,
  action,
  ActionCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { errorContextValidator } from "./errors";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// Internal mutation to log errors to Convex DB
export const logError = internalMutation({
  args: {
    error: errorContextValidator,
    sentToSentry: v.boolean(),
  },
  handler: async (ctx, { error, sentToSentry }) => {
    await ctx.db.insert("errorLogs", {
      ...error,
      sentToSentry,
    });
  },
});

// Internal query to get unsent errors
export const getUnsentErrors = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("errorLogs")
      .withIndex("bySentToSentry", (q) => q.eq("sentToSentry", false))
      .order("desc")
      .take(limit);
  },
});

// Internal mutation to mark errors as sent
export const markErrorsSent = internalMutation({
  args: { errorIds: v.array(v.id("errorLogs")) },
  handler: async (ctx, { errorIds }) => {
    for (const id of errorIds) {
      await ctx.db.patch(id, { sentToSentry: true });
    }
  },
});

// ============================================================================
// Internal endpoints for Sentry sync (called via secure action)
// ============================================================================

// Internal query for error sync - fetches unsent errors
export const fetchUnsentErrorsInternal = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("errorLogs")
      .withIndex("bySentToSentry", (q) => q.eq("sentToSentry", false))
      .order("desc")
      .take(limit);
  },
});

// Internal mutation to mark errors as synced
export const markErrorsAsSyncedInternal = internalMutation({
  args: { errorIds: v.array(v.id("errorLogs")) },
  handler: async (ctx, { errorIds }) => {
    for (const id of errorIds) {
      await ctx.db.patch(id, { sentToSentry: true });
    }
  },
});

// ============================================================================
// Public action for Sentry sync - validates bearer token before fetching
// ============================================================================

export const fetchErrorsForSync = action({
  args: { token: v.string(), limit: v.number() },
  handler: async (
    ctx: ActionCtx,
    { token, limit }: { token: string; limit: number }
  ): Promise<Doc<"errorLogs">[]> => {
    const expectedToken = process.env.ERROR_SYNC_SECRET;

    if (!expectedToken) {
      throw new Error("ERROR_SYNC_SECRET not configured on server");
    }

    if (token !== expectedToken) {
      throw new Error("Unauthorized: Invalid sync token");
    }

    return await ctx.runQuery(internal.errorLogging.fetchUnsentErrorsInternal, {
      limit,
    });
  },
});

export const markErrorsSynced = action({
  args: { token: v.string(), errorIds: v.array(v.id("errorLogs")) },
  handler: async (
    ctx: ActionCtx,
    { token, errorIds }: { token: string; errorIds: Id<"errorLogs">[] }
  ): Promise<void> => {
    const expectedToken = process.env.ERROR_SYNC_SECRET;

    if (!expectedToken) {
      throw new Error("ERROR_SYNC_SECRET not configured on server");
    }

    if (token !== expectedToken) {
      throw new Error("Unauthorized: Invalid sync token");
    }

    await ctx.runMutation(internal.errorLogging.markErrorsAsSyncedInternal, {
      errorIds,
    });
  },
});

// Test mutation to simulate an error for verification (DEV ONLY)
export const simulateErrorForTesting = mutation({
  args: {
    functionName: v.string(),
    errorMessage: v.string(),
  },
  handler: async (ctx, { functionName, errorMessage }) => {
    await ctx.db.insert("errorLogs", {
      functionName,
      category: "unknown",
      severity: "medium",
      userId: undefined,
      metadata: { test: true, simulatedAt: new Date().toISOString() },
      timestamp: Date.now(),
      errorMessage,
      errorStack: new Error(errorMessage).stack,
      sentToSentry: false,
    });
    return { success: true, message: "Test error logged" };
  },
});

// Optional: Clean up old errors (can be called via scheduled job)
export const cleanupOldErrors = internalMutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, { olderThanDays }) => {
    const cutoffTimestamp = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const oldErrors = await ctx.db
      .query("errorLogs")
      .withIndex("byTimestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoffTimestamp))
      .take(100);

    for (const error of oldErrors) {
      await ctx.db.delete(error._id);
    }

    return { deleted: oldErrors.length };
  },
});
