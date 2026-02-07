import * as Sentry from "@sentry/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { rateLimit, getClientIdentifier } from "@/lib/rate-limit";

// Type for error log entries
type ErrorLog = Doc<"errorLogs">;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Rate limit config: 10 requests per minute
const RATE_LIMIT_CONFIG = { limit: 10, windowMs: 60 * 1000 };

// Extract token from authorization header
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/**
 * Error sync endpoint - syncs errors from Convex to Sentry.
 * This should be called by a cron job (e.g., Vercel Cron) every few minutes.
 *
 * Protected by ERROR_SYNC_SECRET bearer token.
 */
export async function POST(request: Request) {
  // Rate limiting check
  const clientId = getClientIdentifier(request);
  const rateLimitResult = rateLimit(`error-sync:${clientId}`, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Extract token from authorization header
  const authHeader = request.headers.get("authorization");
  const token = extractBearerToken(authHeader);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch unsent errors from Convex using secure action (validates token server-side)
    const errors = await convex.action(api.errorLogging.fetchErrorsForSync, {
      token,
      limit: 50,
    });

    if (errors.length === 0) {
      return NextResponse.json({ message: "No errors to sync", count: 0 });
    }

    // Send each error to Sentry
    const sentIds: Id<"errorLogs">[] = [];

    for (const error of errors) {
      try {
        Sentry.withScope((scope) => {
          // Set tags for filtering in Sentry
          scope.setTag("source", "convex");
          scope.setTag("category", error.category);
          scope.setTag("severity", error.severity);
          scope.setTag("functionName", error.functionName);

          // Set context with additional details
          scope.setContext("convex_error", {
            functionName: error.functionName,
            timestamp: error.timestamp,
            category: error.category,
            severity: error.severity,
            metadata: error.metadata,
          });

          // Set user if available
          if (error.userId) {
            scope.setUser({ id: error.userId });
          }

          // Set level based on severity
          const levelMap: Record<string, Sentry.SeverityLevel> = {
            low: "info",
            medium: "warning",
            high: "error",
            critical: "fatal",
          };
          scope.setLevel(levelMap[error.severity] || "error");

          // Create and capture the error
          const sentryError = new Error(error.errorMessage);
          sentryError.name = `ConvexError:${error.functionName}`;

          if (error.errorStack) {
            sentryError.stack = error.errorStack;
          }

          Sentry.captureException(sentryError);
        });

        sentIds.push(error._id);
      } catch (captureError) {
        console.error("Failed to capture error to Sentry:", captureError);
      }
    }

    // Mark errors as sent using secure action (validates token server-side)
    if (sentIds.length > 0) {
      await convex.action(api.errorLogging.markErrorsSynced, {
        token,
        errorIds: sentIds,
      });
    }

    // Flush Sentry events to ensure they're sent
    await Sentry.flush(5000);

    return NextResponse.json({
      message: "Errors synced to Sentry",
      count: sentIds.length,
      total: errors.length,
    });
  } catch (error) {
    console.error("Error sync failed:", error);
    Sentry.captureException(error);

    return NextResponse.json(
      { error: "Failed to sync errors" },
      { status: 500 }
    );
  }
}

// GET for manual testing (requires auth in all environments)
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Use POST in production" }, { status: 405 });
  }

  // Even in development, require authentication
  const authHeader = request.headers.get("authorization");
  const token = extractBearerToken(authHeader);
  const expectedToken = process.env.ERROR_SYNC_SECRET;

  if (!token || token !== expectedToken) {
    return NextResponse.json(
      { error: "Unauthorized. Use: curl -H 'Authorization: Bearer $ERROR_SYNC_SECRET' ..." },
      { status: 401 }
    );
  }

  try {
    const errors = await convex.action(api.errorLogging.fetchErrorsForSync, {
      token,
      limit: 10,
    });

    return NextResponse.json({
      message: "Unsent errors (dev mode)",
      count: errors.length,
      errors: errors.map((e: ErrorLog) => ({
        functionName: e.functionName,
        category: e.category,
        severity: e.severity,
        errorMessage: e.errorMessage,
        timestamp: new Date(e.timestamp).toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch errors:", error);
    return NextResponse.json(
      { error: "Failed to fetch errors" },
      { status: 500 }
    );
  }
}
