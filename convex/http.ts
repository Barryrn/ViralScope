import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { transformWebhookData } from "./paymentAttemptTypes";
import { logErrorToDb } from "./withErrorHandling";
import {
  isUserCreatedOrUpdated,
  isUserDeleted,
  getEventType,
  getDeletedUserId,
} from "./clerkTypes";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let event: WebhookEvent | null = null;

    try {
      event = await validateRequest(request);

      if (!event) {
        await logWebhookError(ctx, "Webhook validation failed", request);
        return new Response("Error occurred", { status: 400 });
      }

      const eventType = getEventType(event);

      // Handle user creation and updates
      if (isUserCreatedOrUpdated(event)) {
        try {
          await ctx.runMutation(internal.users.upsertFromClerk, {
            data: event.data,
          });
        } catch (error) {
          await logWebhookError(
            ctx,
            "Failed to upsert user",
            request,
            error,
            event
          );
          // Return 200 to prevent webhook retry storms - error is logged
          return new Response(null, { status: 200 });
        }
      }
      // Handle user deletion
      else if (isUserDeleted(event)) {
        try {
          const clerkUserId = getDeletedUserId(event);
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkUserId,
          });
        } catch (error) {
          await logWebhookError(
            ctx,
            "Failed to delete user",
            request,
            error,
            event
          );
          return new Response(null, { status: 200 });
        }
      }
      // Handle payment attempt updates (custom Clerk Billing event, not in standard WebhookEvent type)
      else if (eventType === "paymentAttempt.updated") {
        try {
          // Payment events have different data structure - use explicit type assertion
          const paymentData = (event as unknown as { data: unknown }).data;
          const paymentAttemptData = transformWebhookData(paymentData);
          await ctx.runMutation(internal.paymentAttempts.savePaymentAttempt, {
            paymentAttemptData,
          });
        } catch (error) {
          await logWebhookError(
            ctx,
            "Failed to save payment attempt",
            request,
            error,
            event
          );
          return new Response(null, { status: 200 });
        }
      }
      // Unknown event type
      else {
        console.log("Ignored webhook event", eventType);
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      // Catch any unhandled errors in the main handler
      await logWebhookError(
        ctx,
        "Unhandled webhook error",
        request,
        error,
        event
      );
      return new Response("Internal error", { status: 500 });
    }
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

// Helper to log webhook errors with context
async function logWebhookError(
  ctx: Parameters<Parameters<typeof httpAction>[0]>[0],
  message: string,
  request: Request,
  error?: unknown,
  event?: WebhookEvent | null
) {
  await logErrorToDb(ctx, "http.clerk-users-webhook", error || new Error(message), {
    category: "webhook",
    severity: "high",
    metadata: {
      eventType: event ? getEventType(event) : "unknown",
      url: request.url,
      errorMessage: message,
      headers: {
        "svix-id": request.headers.get("svix-id"),
        "svix-timestamp": request.headers.get("svix-timestamp"),
      },
    },
  });
}

export default http;
