import { internalMutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import {
  logMutationError,
  getUserFriendlyError,
} from "./withErrorHandling";
import { ConvexAppError } from "./errors";

export const current = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await getCurrentUser(ctx);
    } catch (error) {
      // Queries can't use runMutation for logging, so we log to console
      // The error will be captured by global error handling on the frontend
      console.error("[users.current] Error fetching current user:", error);
      throw new Error("Unable to fetch user information. Please try again.");
    }
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    try {
      const userAttributes = {
        name: `${data.first_name} ${data.last_name}`,
        externalId: data.id,
      };

      const user = await userByExternalId(ctx, data.id);
      if (user === null) {
        await ctx.db.insert("users", userAttributes);
      } else {
        await ctx.db.patch(user._id, userAttributes);
      }
    } catch (error) {
      await logMutationError(ctx, error, {
        functionName: "users.upsertFromClerk",
        category: "authentication",
        severity: "high",
        metadata: { clerkUserId: data.id },
      });
      throw getUserFriendlyError(error, "authentication");
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    try {
      const user = await userByExternalId(ctx, clerkUserId);

      if (user !== null) {
        await ctx.db.delete(user._id);
      } else {
        throw new ConvexAppError(
          `User not found for Clerk ID: ${clerkUserId}`,
          {
            category: "authentication",
            severity: "low",
            userMessage: "User record not found.",
          }
        );
      }
    } catch (error) {
      await logMutationError(ctx, error, {
        functionName: "users.deleteFromClerk",
        category: "authentication",
        severity: "medium",
        metadata: { clerkUserId },
      });
      throw getUserFriendlyError(error, "authentication");
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) {
    throw new ConvexAppError("Current user not found in database", {
      category: "authentication",
      severity: "medium",
    });
  }
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}
