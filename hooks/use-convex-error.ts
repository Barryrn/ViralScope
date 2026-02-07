"use client";

import { useMutation } from "convex/react";
import { useErrorHandler } from "./use-error-handler";
import { useCallback } from "react";
import type { FunctionReference } from "convex/server";

type MutationArgs<T extends FunctionReference<"mutation">> =
  T extends FunctionReference<"mutation", "public" | "internal", infer Args>
    ? Args
    : never;

type MutationReturn<T extends FunctionReference<"mutation">> =
  T extends FunctionReference<"mutation", "public" | "internal", any, infer Return>
    ? Return
    : never;

interface SafeMutationOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  errorContext?: Record<string, unknown>;
  showToast?: boolean;
  toastTitle?: string;
  successToast?: string;
}

/**
 * Hook for Convex mutations with automatic error handling.
 * Wraps useMutation to provide error handling, toast notifications, and Sentry logging.
 *
 * Usage:
 * ```tsx
 * import { api } from "@/convex/_generated/api";
 *
 * const updateUser = useSafeMutation(api.users.update);
 *
 * // Basic usage
 * await updateUser({ name: "John" });
 *
 * // With options
 * await updateUser({ name: "John" }, {
 *   onSuccess: () => console.log("Updated!"),
 *   successToast: "User updated successfully",
 *   toastTitle: "Failed to update user",
 * });
 * ```
 */
export function useSafeMutation<T extends FunctionReference<"mutation">>(
  mutation: T
) {
  const baseMutation = useMutation(mutation);
  const { handleError } = useErrorHandler();

  const safeMutate = useCallback(
    async (
      args: MutationArgs<T>,
      options: SafeMutationOptions<MutationReturn<T>> = {}
    ): Promise<MutationReturn<T> | undefined> => {
      const {
        onSuccess,
        onError,
        errorContext,
        showToast = true,
        toastTitle = "Operation failed",
        successToast,
      } = options;

      try {
        const result = await baseMutation(args);

        if (successToast) {
          const { toast } = await import("sonner");
          toast.success(successToast);
        }

        onSuccess?.(result);
        return result;
      } catch (error) {
        handleError(error, {
          showToast,
          toastTitle,
          context: {
            mutation: mutation.toString(),
            ...errorContext,
          },
        });
        onError?.(error as Error);
        return undefined;
      }
    },
    [baseMutation, handleError, mutation]
  );

  return safeMutate;
}

/**
 * Hook for wrapping any async operation with error handling.
 * Useful for non-Convex async operations that need consistent error handling.
 *
 * Usage:
 * ```tsx
 * const executeWithErrorHandling = useSafeAsync();
 *
 * const result = await executeWithErrorHandling(
 *   () => fetch('/api/something'),
 *   { toastTitle: "Request failed" }
 * );
 * ```
 */
export function useSafeAsync() {
  const { withErrorHandling } = useErrorHandler();
  return withErrorHandling;
}
