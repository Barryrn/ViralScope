import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
  }).index("byExternalId", ["externalId"]),

  paymentAttempts: defineTable(paymentAttemptSchemaValidator)
    .index("byPaymentId", ["payment_id"])
    .index("byUserId", ["userId"])
    .index("byPayerUserId", ["payer.user_id"]),

  // Error logging table for Sentry sync
  errorLogs: defineTable({
    functionName: v.string(),
    category: v.string(),
    severity: v.string(),
    userId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
    errorMessage: v.string(),
    errorStack: v.optional(v.string()),
    sentToSentry: v.boolean(),
  })
    .index("byTimestamp", ["timestamp"])
    .index("bySeverity", ["severity"])
    .index("byCategory", ["category"])
    .index("bySentToSentry", ["sentToSentry"]),

  // YouTube data cache for API responses
  youtubeCache: defineTable({
    resourceId: v.string(),
    resourceType: v.union(
      v.literal("video"),
      v.literal("channel"),
      v.literal("search"),
      v.literal("channelVideos")
    ),
    data: v.any(),
    userId: v.string(),
    fetchedAt: v.number(),
    expiresAt: v.number(),
  })
    .index("byResourceId", ["resourceId"])
    .index("byUserId", ["userId"])
    .index("byExpiresAt", ["expiresAt"]),

  // User settings for score weight customization
  userSettings: defineTable({
    userId: v.id("users"),

    // Viral Score Weights (must sum to 1.0)
    viralVelocityWeight: v.number(), // Default: 0.6
    viralEngagementWeight: v.number(), // Default: 0.25
    viralCommentWeight: v.number(), // Default: 0.15

    // Performance Score Weights (must sum to 1.0)
    perfEngagementWeight: v.number(), // Default: 0.75
    perfCommentWeight: v.number(), // Default: 0.25

    updatedAt: v.number(),
  }).index("byUserId", ["userId"]),
});