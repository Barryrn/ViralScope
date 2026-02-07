# Convex Backend - Starter.diy

This directory contains the Convex serverless backend for the Starter.diy SaaS starter kit.

## Directory Structure

```
convex/
├── _generated/          # Auto-generated types and API (do not edit)
├── auth.config.ts       # Clerk JWT authentication configuration
├── errors.ts            # Error handling utilities and ConvexAppError class
├── errorLogging.ts      # Error logging mutations for Sentry sync
├── http.ts              # HTTP router for webhooks
├── paymentAttempts.ts   # Payment tracking queries and mutations
├── paymentAttemptTypes.ts # Payment data types and transformers
├── schema.ts            # Database schema definition
├── users.ts             # User management functions
└── withErrorHandling.ts # Error handling wrappers
```

## Database Schema

The backend uses three tables:

### `users`
Stores synced user data from Clerk.

| Field      | Type   | Description                    |
|------------|--------|--------------------------------|
| name       | string | User's full name               |
| externalId | string | Clerk user ID (indexed)        |

### `paymentAttempts`
Tracks payment attempts from Clerk Billing webhooks.

| Field      | Type   | Description                    |
|------------|--------|--------------------------------|
| payment_id | string | Unique payment identifier      |
| userId     | Id     | Reference to users table       |
| payer      | object | Payer information from Clerk   |
| ...        | ...    | Additional payment metadata    |

### `errorLogs`
Stores errors for asynchronous Sentry synchronization.

| Field        | Type    | Description                     |
|--------------|---------|----------------------------------|
| functionName | string  | Name of function that errored   |
| category     | string  | Error category (see below)      |
| severity     | string  | low, medium, high, critical     |
| userId       | string? | Associated user (if available)  |
| errorMessage | string  | Error message                   |
| errorStack   | string? | Stack trace                     |
| sentToSentry | boolean | Whether synced to Sentry        |
| timestamp    | number  | Unix timestamp                  |

## Core Files

### schema.ts
Defines the database schema using Convex's type-safe validators.

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    externalId: v.string(),
  }).index("byExternalId", ["externalId"]),
  // ... other tables
});
```

### http.ts
HTTP router handling Clerk webhooks at `/clerk-users-webhook`:

- `user.created` - Creates user record in Convex
- `user.updated` - Updates existing user record
- `user.deleted` - Removes user record
- `paymentAttempt.updated` - Tracks payment attempts

Webhooks are validated using Svix signatures with `CLERK_WEBHOOK_SECRET`.

### users.ts
User management functions:

| Function           | Type             | Description                        |
|--------------------|------------------|------------------------------------|
| `current`          | Query            | Get current authenticated user     |
| `upsertFromClerk`  | Internal Mutation | Create/update user from webhook   |
| `deleteFromClerk`  | Internal Mutation | Delete user from webhook          |

Helper functions:
- `getCurrentUser(ctx)` - Returns user or null
- `getCurrentUserOrThrow(ctx)` - Returns user or throws

### errors.ts
Error handling infrastructure:

**Error Categories:**
- `authentication` - Auth-related failures
- `database` - Database operation errors
- `webhook` - Webhook processing errors
- `payment` - Payment processing errors
- `validation` - Input validation errors
- `unknown` - Uncategorized errors

**ConvexAppError Class:**
```typescript
throw new ConvexAppError("Database connection failed", {
  category: "database",
  severity: "high",
  userMessage: "Unable to save data. Please try again.",
  metadata: { table: "users" },
});
```

**Sensitive Data Sanitization:**
The `sanitizeArgs()` function automatically redacts sensitive fields (passwords, tokens, secrets, etc.) before logging.

### withErrorHandling.ts
Error logging utilities:

```typescript
// In mutations
try {
  // Your logic
} catch (error) {
  await logMutationError(ctx, error, {
    functionName: "myFunction",
    category: "database",
    severity: "high",
  });
  throw getUserFriendlyError(error, "database");
}
```

## Authentication

Clerk authentication is configured in `auth.config.ts`. The JWT template must be named "convex" in your Clerk dashboard.

Access the authenticated user in functions:
```typescript
const identity = await ctx.auth.getUserIdentity();
// identity.subject contains the Clerk user ID
```

## Development

### Running Locally

Start the Convex dev server (required alongside Next.js):

```bash
npx convex dev
```

### Pushing to Production

```bash
npx convex deploy
```

### Environment Variables

Set these in the **Convex Dashboard** (not `.env.local`):

| Variable                          | Description                              |
|-----------------------------------|------------------------------------------|
| `CLERK_WEBHOOK_SECRET`            | Svix signing secret from Clerk webhooks  |
| `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` | JWT issuer URL from Clerk JWT template |

### Adding New Tables

1. Define the table in `schema.ts`:
   ```typescript
   myTable: defineTable({
     field: v.string(),
   }).index("byField", ["field"]),
   ```

2. Run `npx convex dev` to generate types

3. Create queries/mutations in a new file

### Adding New Functions

**Query (read-only):**
```typescript
export const myQuery = query({
  args: { id: v.id("myTable") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

**Mutation (read/write):**
```typescript
export const myMutation = mutation({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("myTable", { field: args.data });
  },
});
```

**Internal functions** (not exposed to clients, used by webhooks):
```typescript
export const internalFunc = internalMutation({
  args: { /* ... */ },
  handler: async (ctx, args) => { /* ... */ },
});
```

## Error Handling Best Practices

1. **Wrap risky operations** in try/catch
2. **Log errors** using `logMutationError()` or `logActionError()`
3. **Throw user-friendly errors** using `getUserFriendlyError()`
4. **Use ConvexAppError** for structured error context
5. **Never expose** sensitive data in error messages

## Webhook Security

- Webhooks validate signatures using Svix
- Return 200 even on errors to prevent retry storms
- All errors are logged for debugging
- Internal mutations protect against direct client access

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex + Clerk Guide](https://docs.convex.dev/auth/clerk)
- [Convex Functions](https://docs.convex.dev/functions)
- [Convex Schema](https://docs.convex.dev/database/schemas)
