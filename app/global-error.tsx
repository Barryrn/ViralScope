"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Global error handler for the entire application.
 * This catches errors that occur outside of the normal React tree.
 * Note: This component cannot use regular styling/components as it replaces the entire page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry with additional context
    Sentry.captureException(error, {
      tags: {
        errorType: "global",
        source: "global-error-boundary",
      },
      extra: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <html>
      <head>
        <title>Application Error</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafb;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #111827;
              color: #f9fafb;
            }
          }
          .container {
            max-width: 28rem;
            width: 100%;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            text-align: center;
          }
          @media (prefers-color-scheme: dark) {
            .container {
              background: #1f2937;
            }
          }
          .icon-wrapper {
            width: 3rem;
            height: 3rem;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
          }
          @media (prefers-color-scheme: dark) {
            .icon-wrapper {
              background: #7f1d1d;
            }
          }
          .icon {
            width: 1.5rem;
            height: 1.5rem;
            color: #dc2626;
          }
          @media (prefers-color-scheme: dark) {
            .icon {
              color: #fca5a5;
            }
          }
          h1 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
          }
          @media (prefers-color-scheme: dark) {
            h1 {
              color: #f9fafb;
            }
          }
          p {
            color: #6b7280;
            font-size: 0.875rem;
            line-height: 1.5;
            margin-bottom: 1.5rem;
          }
          @media (prefers-color-scheme: dark) {
            p {
              color: #9ca3af;
            }
          }
          .error-details {
            background: #f3f4f6;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
            text-align: left;
          }
          @media (prefers-color-scheme: dark) {
            .error-details {
              background: #374151;
            }
          }
          .error-message {
            font-family: monospace;
            font-size: 0.75rem;
            color: #4b5563;
            word-break: break-all;
          }
          @media (prefers-color-scheme: dark) {
            .error-message {
              color: #d1d5db;
            }
          }
          .error-id {
            font-size: 0.625rem;
            color: #9ca3af;
            margin-top: 0.5rem;
          }
          .buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }
          button {
            padding: 0.625rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .btn-outline {
            background: transparent;
            border: 1px solid #d1d5db;
            color: #374151;
          }
          .btn-outline:hover {
            background: #f3f4f6;
          }
          @media (prefers-color-scheme: dark) {
            .btn-outline {
              border-color: #4b5563;
              color: #d1d5db;
            }
            .btn-outline:hover {
              background: #374151;
            }
          }
          .btn-primary {
            background: #111827;
            border: 1px solid #111827;
            color: white;
          }
          .btn-primary:hover {
            background: #1f2937;
          }
          @media (prefers-color-scheme: dark) {
            .btn-primary {
              background: #f9fafb;
              border-color: #f9fafb;
              color: #111827;
            }
            .btn-primary:hover {
              background: #e5e7eb;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon-wrapper">
            <svg
              className="icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1>Application Error</h1>
          <p>
            A critical error has occurred. Our team has been notified and is
            working on a fix.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="error-details">
              <div className="error-message">{error.message}</div>
              {error.digest && (
                <div className="error-id">Error ID: {error.digest}</div>
              )}
            </div>
          )}
          <div className="buttons">
            <button
              className="btn-outline"
              onClick={() => (window.location.href = "/")}
            >
              Go Home
            </button>
            <button className="btn-primary" onClick={() => reset()}>
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
