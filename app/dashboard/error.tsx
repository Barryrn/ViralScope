"use client";

import { ErrorBoundary } from "@/components/error-boundary";

/**
 * Dashboard-specific error page.
 * Catches errors in the dashboard route segment.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} reset={reset} />;
}
