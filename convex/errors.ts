import { v } from "convex/values";

// Error severity levels
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error categories for classification
export type ErrorCategory =
  | "authentication"
  | "database"
  | "webhook"
  | "payment"
  | "validation"
  | "unknown";

// Validator for error context (used in errorLogs table)
export const errorContextValidator = v.object({
  functionName: v.string(),
  category: v.string(),
  severity: v.string(),
  userId: v.optional(v.string()),
  metadata: v.optional(v.any()),
  timestamp: v.number(),
  errorMessage: v.string(),
  errorStack: v.optional(v.string()),
});

export type ErrorContext = {
  functionName: string;
  category: string;
  severity: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
  errorMessage: string;
  errorStack?: string;
};

// User-friendly error messages (no sensitive info exposed)
export const USER_FRIENDLY_ERRORS: Record<ErrorCategory, string> = {
  authentication: "Authentication failed. Please try signing in again.",
  database: "We encountered an issue saving your data. Please try again.",
  webhook: "An external service failed to respond. Our team has been notified.",
  payment:
    "Payment processing encountered an issue. Please try again or contact support.",
  validation: "The provided information is invalid. Please check and try again.",
  unknown: "An unexpected error occurred. Our team has been notified.",
};

// Custom error class for Convex operations
export class ConvexAppError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      category: ErrorCategory;
      severity: ErrorSeverity;
      userMessage?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.name = "ConvexAppError";
    this.category = options.category;
    this.severity = options.severity;
    this.userMessage =
      options.userMessage || USER_FRIENDLY_ERRORS[options.category];
    this.metadata = options.metadata;
  }
}

// Helper to create structured error context for logging
export function createErrorContext(
  functionName: string,
  error: unknown,
  options: {
    category: ErrorCategory;
    severity: ErrorSeverity;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
): ErrorContext {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  return {
    functionName,
    category: options.category,
    severity: options.severity,
    userId: options.userId,
    metadata: options.metadata,
    timestamp: Date.now(),
    errorMessage,
    errorStack,
  };
}

// Sanitize arguments to remove sensitive data before logging
export function sanitizeArgs(args: unknown): unknown {
  if (typeof args !== "object" || args === null) {
    return args;
  }

  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "key",
    "credit",
    "card",
    "cvv",
    "ssn",
    "authorization",
  ];
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args as Record<string, unknown>)) {
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeArgs(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
