---
name: backend-dev
description: Guide backend engineering with API design, data modeling, and business logic patterns. Use when designing REST/GraphQL APIs, modeling database schemas, implementing authentication/authorization, handling webhooks, managing background jobs, or addressing concurrency. Triggers: "API design", "database schema", "backend", "REST", "GraphQL", "webhooks", "data modeling", "migrations", "business logic", "authentication flow".
---

# Backend Engineering

Ensure reliability, data integrity, and correct business logic. Prioritize correctness first, then clarity, then performance. Make invalid states unrepresentable.

## API Design

### RESTful Design Principles

**Resource Naming**:
- Use nouns, not verbs: `/users`, not `/getUsers`
- Use plural nouns: `/users`, not `/user`
- Use nesting for relationships: `/users/{id}/orders`
- Keep URLs shallow (max 2-3 levels deep)

**HTTP Methods**:
| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |

**Status Codes**:
- `2xx`: Success (200 OK, 201 Created, 204 No Content)
- `3xx`: Redirection (301 Moved, 304 Not Modified)
- `4xx`: Client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable)
- `5xx`: Server error (500 Internal Error, 503 Service Unavailable)

### RPC-Style APIs

Use for complex operations that don't map cleanly to resources:
- Complex operations: `/users/{id}/actions/deactivate`
- Queries with complex filters: `/search`
- Batch operations: `/bulk-import`

### GraphQL Considerations

**When GraphQL fits**: Clients need flexible data fetching, multiple clients with different data needs, rapid frontend iteration.

**When REST/RPC fits better**: Simple stable data requirements, caching is critical, team unfamiliar with GraphQL complexity.

## Data Modeling

### Schema Design Principles

1. Identify core entities and their relationships
2. Define invariants (rules that must always be true)
3. Design for your primary access patterns
4. Normalize first, denormalize with intent

**Relationship Types**:
- **One-to-one**: Consider embedding vs. separate table
- **One-to-many**: Foreign key on the "many" side
- **Many-to-many**: Junction table or document embedding

### Indexing Strategy

**When to index**: Columns in WHERE clauses, JOIN conditions, ORDER BY, foreign keys.

**When not to index**: Columns rarely queried, columns with low cardinality, write-heavy tables where read performance isn't critical.

**Composite indexes**: Order matters. Index (A, B) supports queries on A and (A, B), but not B alone.

### Safe Migration Pattern

1. Add new column (nullable or with default)
2. Deploy code that writes to both old and new
3. Backfill existing data
4. Deploy code that reads from new
5. Remove old column

## Business Logic

### Service Layer Patterns

- **Transaction Script**: Organize logic by procedure (good for simple domains)
- **Domain Model**: Organize logic around domain objects (good for complex business rules)
- **Use Cases/Application Services**: Orchestrate domain operations (keep them thin)

### Validation Strategy

Validate at boundaries:
- **API layer**: Format, required fields, basic constraints
- **Service layer**: Business rules, relationships, state transitions
- **Domain layer**: Invariants that must always hold

```
Request → Validate Format → Validate Business Rules → Persist
                ↓                    ↓
           400 Bad Request    422 Unprocessable Entity
```

### Error Handling

**Internal vs. External errors**:
- Internal: Log everything, use stack traces
- External: Structured error codes, user-friendly messages, no sensitive details

**Error structure**:
```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Account balance is too low for this transaction",
    "details": { "required": 100.00, "available": 45.50 }
  }
}
```

Include `Retry-After` header for rate limits and temporary failures.

## Authentication & Authorization

### Authentication Patterns

**Token-based (JWT)**: Stateless, scalable, keep tokens short-lived, use refresh tokens.

**Session-based**: Server stores session state, better for complex auth, easier to invalidate.

**Trade-off**: Stateless is simpler to scale but harder to revoke. Session-based is easier to control but requires session storage.

### Authorization Patterns

| Model | Description | Best For |
|-------|-------------|----------|
| **RBAC** | Roles have permissions, users have roles | Most applications |
| **ABAC** | Decisions based on attributes | Complex, dynamic rules |
| **Resource-Based** | Each resource knows its access rules | User-owned resources |

### Principle of Least Privilege

Grant the minimum access needed:
- Scope tokens to specific resources
- Time-limit elevated permissions
- Prefer explicit grants over broad defaults

## External Integrations

### Third-Party API Integration

- Set timeouts on all external calls
- Implement circuit breakers for failing services
- Cache responses where appropriate
- Handle API versioning and deprecation

### Webhook Handling

- Verify signatures before processing
- Implement idempotency (handle duplicate deliveries)
- Process asynchronously; respond quickly
- Log all webhook events for debugging

### Queue-Based Integration

**When to use**: Decouple producers from consumers, handle traffic spikes, ensure message delivery, enable retry logic.

**Message design**: Include all data needed to process, include correlation IDs, design for at-least-once delivery, make consumers idempotent.

## Concurrency & State

### Race Conditions

Common sources: Read-modify-write without locking, TOCTOU, lost updates.

**Mitigation strategies**:
- Optimistic locking: Check version before update
- Pessimistic locking: Lock before read
- Atomic operations: Use database features (`UPDATE ... SET x = x + 1`)

### Distributed State

**CAP Theorem**: You can have at most two of Consistency, Availability, and Partition tolerance.

**Choosing consistency level**:
- Financial transactions: Strong consistency
- Social feeds: Eventual consistency is fine
- Inventory: Depends on tolerance for overselling

## Background Jobs

### Job Design

- Make jobs idempotent (safe to run multiple times)
- Make jobs resumable (can continue after failure)
- Include all necessary data (avoid stale references)
- Set appropriate timeouts and retries

### Scheduling Patterns

| Pattern | Use Case |
|---------|----------|
| Cron | Regular maintenance, reports |
| Delayed | Future actions (reminders, expiration) |
| Event-driven | React to changes |
| Batch | Process large datasets |

### Failure Handling

- Implement exponential backoff for retries
- Set maximum retry limits
- Move to dead-letter queue after exhaustion
- Alert on repeated failures

## Common Pitfalls

### N+1 Queries
Fetching related data in a loop instead of a single query.
**Fix**: Eager loading, batch queries, or data loaders.

### Premature Optimization
Optimizing before measuring.
**Fix**: Profile first. Optimize bottlenecks.

### Leaky Abstractions
Internal details exposed through APIs.
**Fix**: Define clear contracts. Translate internal models to API models.

### Missing Idempotency
Operations that break when retried.
**Fix**: Idempotency keys for mutations. Check-before-act patterns.

## Backend Checklist

Before shipping:

- [ ] Input validation at API boundary
- [ ] Proper error handling with meaningful messages
- [ ] Authentication and authorization checks
- [ ] Database indexes for query patterns
- [ ] Timeouts on external calls
- [ ] Idempotency for critical operations
- [ ] Logging for debugging and auditing
- [ ] Health check endpoints
- [ ] Rate limiting for public APIs
- [ ] Graceful degradation for failures
