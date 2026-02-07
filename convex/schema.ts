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
});