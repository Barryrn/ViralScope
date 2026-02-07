import { internalMutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { paymentAttemptDataValidator } from "./paymentAttemptTypes";
import {
  logMutationError,
  getUserFriendlyError,
} from "./withErrorHandling";
import { ConvexAppError } from "./errors";

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

export const savePaymentAttempt = internalMutation({
  args: {
    paymentAttemptData: paymentAttemptDataValidator,
  },
  returns: v.null(),
  async handler(ctx, { paymentAttemptData }) {
    try {
      // Validate payment data exists
      if (!paymentAttemptData.payment_id) {
        throw new ConvexAppError("Payment ID is required", {
          category: "validation",
          severity: "medium",
          userMessage: "Invalid payment data received.",
        });
      }

      // Validate payer information
      if (!paymentAttemptData.payer?.user_id) {
        throw new ConvexAppError("Payer user ID is required", {
          category: "validation",
          severity: "medium",
          userMessage: "Invalid payer information received.",
        });
      }

      // Find the user by the payer.user_id (which maps to externalId in our users table)
      const user = await userByExternalId(ctx, paymentAttemptData.payer.user_id);

      // Check if payment attempt already exists to avoid duplicates
      const existingPaymentAttempt = await ctx.db
        .query("paymentAttempts")
        .withIndex("byPaymentId", (q) =>
          q.eq("payment_id", paymentAttemptData.payment_id)
        )
        .unique();

      const paymentAttemptRecord = {
        ...paymentAttemptData,
        userId: user?._id, // Link to our users table if user exists
      };

      if (existingPaymentAttempt) {
        // Update existing payment attempt
        await ctx.db.patch(existingPaymentAttempt._id, paymentAttemptRecord);
      } else {
        // Create new payment attempt
        await ctx.db.insert("paymentAttempts", paymentAttemptRecord);
      }

      return null;
    } catch (error) {
      await logMutationError(ctx, error, {
        functionName: "paymentAttempts.savePaymentAttempt",
        category: "payment",
        severity: "critical",
        metadata: { paymentId: paymentAttemptData.payment_id },
      });
      throw getUserFriendlyError(error, "payment");
    }
  },
});
