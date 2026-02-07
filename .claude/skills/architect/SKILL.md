---
name: architect
description: Guide software architecture decisions and system design. Use when planning system structure, defining module boundaries, choosing architectural patterns (layered, modular, event-driven), making build vs buy decisions, evaluating monolith vs distributed approaches, or reviewing architectural tradeoffs. Triggers: "architecture", "system design", "module boundaries", "how should I structure", "design decision", "technical debt", "separation of concerns".
---

# Software Architecture

Manage complexity and enable change. Design systems that are easy to understand, modify, and hard to break. Defer decisions until you have enough information to make them well.

## Fundamental Principles

### Separation of Concerns

Divide systems into distinct sections, each addressing a separate concern:
- **Horizontal separation**: Layers (presentation, business logic, data access)
- **Vertical separation**: Features or domains (user management, billing, notifications)
- **Temporal separation**: Read vs. write paths, sync vs. async operations

Find natural boundaries where change is likely to occur.

### Single Responsibility

Each module, class, or function should have one reason to change.
- If you can't describe what a component does without using "and," it likely does too much
- If multiple unrelated changes require modifying the same code, responsibilities are mixed

### Dependency Management

Dependencies should flow inward, from volatile to stable.
- High-level policy should not depend on low-level details
- Abstractions should not depend on implementations
- Stable components should not depend on volatile components

Ask "If this changes, what else breaks?" If the answer is "everything," the dependency direction is wrong.

## Architectural Patterns

### Layered Architecture

```
┌────────────────────────┐
│    Presentation        │  ← UI, API endpoints
├────────────────────────┤
│    Application         │  ← Use cases, orchestration
├────────────────────────┤
│    Domain              │  ← Business rules, entities
├────────────────────────┤
│    Infrastructure      │  ← Database, external services
└────────────────────────┘
```

**When to use**: General-purpose applications with clear business logic separation.
**Pitfall**: Layers become pass-through. Consider whether you need all layers.

### Modular/Feature-Based Architecture

Organize by feature or domain rather than technical concern:
```
features/
├── authentication/
│   ├── api/
│   ├── components/
│   ├── services/
│   └── types/
├── billing/
└── user-management/
```

**When to use**: Larger teams, microservices preparation, or when features evolve independently.
**Trade-off**: Shared code becomes harder to manage. Establish clear rules for cross-feature dependencies.

### Event-Driven Architecture

Components communicate through events rather than direct calls:
- **Event Sourcing**: Store events as the source of truth; derive state from events
- **CQRS**: Separate read and write models for different optimization strategies
- **Pub/Sub**: Loose coupling between producers and consumers

**When to use**: Complex workflows, audit requirements, or when scaling read/write independently.
**Pitfall**: Debugging distributed events is hard. Ensure robust tracing and eventual consistency handling.

## Decision-Making Framework

### When Facing Architectural Choices

1. **Understand the constraints**: What are the actual requirements? What's the team's experience?
2. **Identify the forces**: Performance, scalability, maintainability, time-to-market
3. **Consider reversibility**: Prefer decisions that are easy to change later
4. **Document the decision**: Record what you chose, why, and what alternatives you rejected

### Build vs. Buy vs. Adopt

| Factor | Build | Buy | Adopt (OSS) |
|--------|-------|-----|-------------|
| Core differentiator | ✓ | | |
| Commodity need | | ✓ | ✓ |
| Team expertise available | ✓ | | ✓ |
| Budget constrained | ✓ | | ✓ |
| Time constrained | | ✓ | ✓ |
| Long-term control needed | ✓ | | ✓ |

### Monolith vs. Distributed

Start with a monolith unless you have a compelling reason not to.

**Reasons to distribute**:
- Independent scaling requirements
- Independent deployment cycles with different teams
- Different technology requirements per service
- Fault isolation requirements

**Reasons to stay monolithic**:
- Single team or small team
- Unclear domain boundaries
- Strong consistency requirements
- Simpler operational model

## Data Architecture

### Data Ownership

- Each service or module should own its data
- Cross-boundary data access should go through APIs, not shared databases
- Define clear contracts for data that crosses boundaries

### Schema Design Principles

- **Normalization**: Reduce redundancy, maintain consistency (good for writes)
- **Denormalization**: Optimize for read performance (good for reads)
- **Document models**: Flexible schema, co-located data (good for evolving requirements)
- **Relational models**: Strong consistency, complex queries (good for reporting)

Design for your most important access patterns first. Add indexes and caches later.

### Caching Strategy

| Layer | Purpose | Invalidation Complexity |
|-------|---------|------------------------|
| Browser | Reduce network requests | Low |
| CDN | Reduce origin load | Medium |
| Application | Reduce computation | Medium-High |
| Database | Reduce disk I/O | High |

Cache at the layer closest to where data is consumed, but only when you have a measurable problem.

## API Design

### Contract-First Thinking

- Define APIs before implementation
- Treat APIs as products with versioning and deprecation policies
- Document behavior, not just syntax

### Consistency Patterns

- **Strong consistency**: Always see the latest write (simpler reasoning, harder to scale)
- **Eventual consistency**: Eventually see the latest write (complex reasoning, easier to scale)
- **Causal consistency**: See writes in causal order (middle ground)

Default to strong consistency. Relax only when you have specific scalability needs and can handle the complexity.

## Evolutionary Architecture

### Design for Change

- Use feature flags to decouple deployment from release
- Design boundaries where you expect change
- Avoid premature abstraction; extract patterns when you see them repeat

### Technical Debt Management

Not all technical debt is bad. It's a tool for trading time now for time later.

**Good debt**: Intentional shortcuts with clear payoff timelines
**Bad debt**: Accidental complexity from lack of understanding

**Paying it down**:
- Include debt reduction in regular work (20% rule)
- Address debt when it blocks feature work
- Avoid debt in areas that change frequently

## Common Pitfalls

### Over-Engineering
Building for scale you don't have, abstracting before understanding the problem, using distributed systems when a monolith suffices.
**Remedy**: Start simple. Measure. Evolve.

### Under-Engineering
No separation of concerns, no clear boundaries, configuration and secrets scattered throughout code.
**Remedy**: Establish basic hygiene early. It's cheaper to maintain than to retrofit.

### Cargo Culting
Adopting patterns because "big companies do it," using microservices because they're trendy, following best practices without understanding the tradeoffs.
**Remedy**: Understand why a pattern exists. Ask if your constraints match.

## Architecture Review Checklist

Before finalizing architectural decisions:

- [ ] Can a new team member understand this in a reasonable time?
- [ ] Can we deploy and test components independently?
- [ ] Are failure modes understood and handled?
- [ ] Can we change the most likely-to-change parts easily?
- [ ] Are dependencies explicit and manageable?
- [ ] Do we have observability into system behavior?
- [ ] Is the complexity justified by the requirements?
