import { MutationCtx, ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  createErrorContext,
  ConvexAppError,
  ErrorCategory,
  ErrorSeverity,
  sanitizeArgs,
  USER_FRIENDLY_ERRORS,
} from "./errors";

export interface ErrorHandlerOptions {
  functionName: string;
  category: ErrorCategory;
  severity?: ErrorSeverity;
  metadata?: Record<string, unknown>;
}

// Helper to extract user ID from context
async function getUserIdFromContext(
  ctx: MutationCtx | ActionCtx
): Promise<string | undefined> {
  try {
    const identity = await ctx.auth.getUserIdentity();
    return identity?.subject;
  } catch {
    return undefined;
  }
}

/**
 * Logs an error to the errorLogs table for Sentry sync.
 * Use this in catch blocks to log errors.
 *
 * Usage:
 * ```typescript
 * try {
 *   // Your logic
 * } catch (error) {
 *   await logMutationError(ctx, error, {
 *     functionName: "myFunction",
 *     category: "database",
 *     severity: "high",
 *   });
 *   throw getUserFriendlyError(error, "database");
 * }
 * ```
 */
export async function logMutationError(
  ctx: MutationCtx,
  error: unknown,
  options: ErrorHandlerOptions
): Promise<void> {
  const userId = await getUserIdFromContext(ctx);
  const category =
    error instanceof ConvexAppError ? error.category : options.category;
  const severity =
    error instanceof ConvexAppError
      ? error.severity
      : options.severity || "medium";

  const errorContext = createErrorContext(options.functionName, error, {
    category,
    severity,
    userId,
    metadata: options.metadata ? sanitizeArgs(options.metadata) as Record<string, unknown> : undefined,
  });

  try {
    await ctx.runMutation(internal.errorLogging.logError, {
      error: errorContext,
      sentToSentry: false,
    });
  } catch (loggingError) {
    // Silently fail logging - don't break the main flow
    console.error("[Error Logging Failed]", loggingError);
  }
}

/**
 * Logs an error from an action context.
 */
export async function logActionError(
  ctx: ActionCtx,
  error: unknown,
  options: ErrorHandlerOptions
): Promise<void> {
  const userId = await getUserIdFromContext(ctx);
  const category =
    error instanceof ConvexAppError ? error.category : options.category;
  const severity =
    error instanceof ConvexAppError
      ? error.severity
      : options.severity || "medium";

  const errorContext = createErrorContext(options.functionName, error, {
    category,
    severity,
    userId,
    metadata: options.metadata ? sanitizeArgs(options.metadata) as Record<string, unknown> : undefined,
  });

  try {
    await ctx.runMutation(internal.errorLogging.logError, {
      error: errorContext,
      sentToSentry: false,
    });
  } catch (loggingError) {
    console.error("[Error Logging Failed]", loggingError);
  }
}

/**
 * Gets a user-friendly error to throw after logging.
 * If the error is a ConvexAppError, uses its userMessage.
 * Otherwise, uses the default message for the category.
 */
export function getUserFriendlyError(
  error: unknown,
  category: ErrorCategory
): Error {
  if (error instanceof ConvexAppError) {
    return new Error(error.userMessage);
  }
  return new Error(USER_FRIENDLY_ERRORS[category]);
}

/**
 * Inline error logging helper for use in http handlers.
 */
export async function logErrorToDb(
  ctx: { runMutation: MutationCtx["runMutation"] },
  functionName: string,
  error: unknown,
  options: {
    category: ErrorCategory;
    severity: ErrorSeverity;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const errorContext = createErrorContext(functionName, error, options);

  try {
    await ctx.runMutation(internal.errorLogging.logError, {
      error: errorContext,
      sentToSentry: false,
    });
  } catch (loggingError) {
    console.error("[Error Logging Failed]", loggingError);
  }
}
