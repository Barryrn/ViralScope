import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ErrorLog = Doc<"errorLogs">;

/**
 * Test endpoint to manually insert a test error for verification.
 * Only available in development mode.
 */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    // Use the test mutation to create a simulated error
    await convex.mutation(api.errorLogging.simulateErrorForTesting, {
      functionName: "test.manualError",
      errorMessage: "This is a manually triggered test error",
    });

    return NextResponse.json({
      message: "Test error logged successfully",
      tip: "Use GET /api/test-error with Authorization header to view errors, or check the Convex dashboard",
    });
  } catch (error) {
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  // Require auth even in dev to be consistent with the secure pattern
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const expectedToken = process.env.ERROR_SYNC_SECRET;

  if (!token || token !== expectedToken) {
    return NextResponse.json({
      error: "Unauthorized",
      tip: "Use: curl -H 'Authorization: Bearer $ERROR_SYNC_SECRET' http://localhost:3000/api/test-error",
    }, { status: 401 });
  }

  // Check current error count using secure action
  try {
    const errors = await convex.action(api.errorLogging.fetchErrorsForSync, {
      token,
      limit: 100,
    });

    return NextResponse.json({
      message: "Current error log status",
      unsentErrorCount: errors.length,
      errors: errors.map((e: ErrorLog) => ({
        functionName: e.functionName,
        category: e.category,
        severity: e.severity,
        errorMessage: e.errorMessage,
        timestamp: new Date(e.timestamp).toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch errors" }, { status: 500 });
  }
}
