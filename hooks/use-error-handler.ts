"use client";

import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";
import { useCallback } from "react";
import { useUser } from "@clerk/nextjs";

type ErrorSeverity = "info" | "warning" | "error";

interface ErrorHandlerOptions {
  showToast?: boolean;
  toastTitle?: string;
  severity?: ErrorSeverity;
  context?: Record<string, unknown>;
}

/**
 * Hook for handling errors in frontend components.
 * Sends errors to Sentry and shows user-friendly toast notifications.
 *
 * Usage:
 * ```tsx
 * const { handleError, withErrorHandling } = useErrorHandler();
 *
 * // Manual error handling
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, { toastTitle: "Failed to save" });
 * }
 *
 * // Or wrap async operations
 * const result = await withErrorHandling(
 *   () => someAsyncOperation(),
 *   { toastTitle: "Operation failed" }
 * );
 * ```
 */
export function useErrorHandler() {
  const { user } = useUser();

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        toastTitle = "Something went wrong",
        severity = "error",
        context = {},
      } = options;

      // Get user-friendly message
      const userMessage = getUserFriendlyMessage(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Log to Sentry with context
      Sentry.withScope((scope) => {
        scope.setLevel(
          severity === "info" ? "info" : severity === "warning" ? "warning" : "error"
        );
        scope.setContext("errorContext", context);
        scope.setTag("source", "frontend");

        if (user) {
          scope.setUser({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
          });
        }

        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(errorMessage);
        }
      });

      // Show toast notification
      if (showToast) {
        toast.error(toastTitle, {
          description: userMessage,
          duration: 5000,
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.error("[Error Handler]", { error, context });
      }
    },
    [user]
  );

  // Wrapper for async operations
  const withErrorHandling = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: ErrorHandlerOptions & { fallback?: T } = {}
    ): Promise<T | undefined> => {
      try {
        return await operation();
      } catch (error) {
        handleError(error, options);
        return options.fallback;
      }
    },
    [handleError]
  );

  return { handleError, withErrorHandling };
}

// Map technical errors to user-friendly messages
function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes("network") || message.includes("fetch failed")) {
      return "Unable to connect. Please check your internet connection.";
    }

    // Authentication errors
    if (message.includes("auth") || message.includes("unauthorized")) {
      return "Your session has expired. Please sign in again.";
    }

    // Validation errors
    if (message.includes("invalid") || message.includes("validation")) {
      return "Please check your input and try again.";
    }

    // Rate limiting
    if (message.includes("rate") || message.includes("limit")) {
      return "Too many requests. Please wait a moment and try again.";
    }

    // Timeout errors
    if (message.includes("timeout")) {
      return "The request took too long. Please try again.";
    }

    // If the error message seems user-friendly (starts with capital, no technical jargon)
    if (/^[A-Z][^{}<>]+\.$/.test(error.message)) {
      return error.message;
    }
  }

  return "An unexpected error occurred. Please try again.";
}
