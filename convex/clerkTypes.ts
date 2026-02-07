/**
 * TypeScript types and helpers for Clerk webhook events.
 * These provide type safety when handling Clerk webhooks.
 *
 * Note: Clerk's WebhookEvent type is a discriminated union.
 * After webhook signature verification, we trust the data structure.
 */

import type { WebhookEvent, UserJSON, UserDeletedJSON } from "@clerk/backend";

// Event type constants for type-safe comparisons
export const USER_CREATED = "user.created" as const;
export const USER_UPDATED = "user.updated" as const;
export const USER_DELETED = "user.deleted" as const;
export const PAYMENT_ATTEMPT_UPDATED = "paymentAttempt.updated" as const;

// Type helpers
export type UserCreatedOrUpdatedEvent = Extract<
  WebhookEvent,
  { type: "user.created" | "user.updated" }
>;

export type UserDeletedEvent = Extract<WebhookEvent, { type: "user.deleted" }>;

export type PaymentAttemptEvent = Extract<
  WebhookEvent,
  { type: "paymentAttempt.updated" }
>;

// Type guards
export function isUserCreatedOrUpdated(
  event: WebhookEvent
): event is UserCreatedOrUpdatedEvent {
  return event.type === USER_CREATED || event.type === USER_UPDATED;
}

export function isUserDeleted(event: WebhookEvent): event is UserDeletedEvent {
  return event.type === USER_DELETED;
}

export function isPaymentAttemptEvent(
  event: WebhookEvent
): event is PaymentAttemptEvent {
  return event.type === PAYMENT_ATTEMPT_UPDATED;
}

// Get event type safely
export function getEventType(event: WebhookEvent): string {
  return event.type;
}

// Get user ID from delete event (delete events have simpler data structure)
export function getDeletedUserId(event: UserDeletedEvent): string {
  return (event.data as UserDeletedJSON).id!;
}
