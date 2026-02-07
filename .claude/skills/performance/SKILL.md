---
name: performance
description: Guide performance optimization with measurement-first approach. Use when profiling applications, optimizing database queries and indexes, implementing caching strategies, reducing bundle size, improving perceived performance with skeleton screens and optimistic updates, establishing performance budgets, or diagnosing bottlenecks. Triggers: "performance", "optimization", "slow", "profiling", "caching", "latency", "bundle size", "Core Web Vitals", "page load", "response time".
---

# Performance Optimization

Performance is a feature. Users perceive slow software as broken software. Measure first, optimize the bottlenecks, and know when to stop. Make it work, make it right, make it fast—in that order.

## Performance Fundamentals

### The Performance Mindset

- **Measure, don't guess**: Profile before optimizing. The bottleneck is rarely where you think it is.
- **Optimize for the common case**: 80% of time is spent in 20% of code. Find and fix that 20%.
- **Set budgets**: Define acceptable thresholds. Treat budget violations as bugs.
- **Perceived vs. actual**: Users care about perceived performance. Sometimes making something feel fast is better than making it actually fast.

### Performance Budget Example

| Metric | Budget | Priority |
|--------|--------|----------|
| Time to Interactive | < 3.5s | Critical |
| First Contentful Paint | < 1.5s | High |
| API Response (p95) | < 500ms | High |
| JavaScript Bundle | < 200KB | Medium |
| Largest Contentful Paint | < 2.5s | High |

## Frontend Performance

### Critical Rendering Path

The sequence of steps to render the first pixels:
1. **HTML parsing** → Build DOM
2. **CSS parsing** → Build CSSOM
3. **JavaScript execution** → Potentially blocks both
4. **Render tree** → Combine DOM + CSSOM
5. **Layout** → Calculate positions
6. **Paint** → Draw pixels

**Optimization strategies**:
- Minimize critical resources (inline critical CSS)
- Defer non-critical JavaScript
- Reduce render-blocking resources
- Optimize the order of resource loading

### Loading Performance

**Reduce payload size**:
- Minify and compress (gzip/brotli)
- Tree-shake unused code
- Optimize images (WebP, AVIF, responsive sizes)
- Remove unused CSS and JavaScript

**Reduce requests**:
- Bundle related resources
- Use HTTP/2 multiplexing
- Inline critical resources
- Preconnect to required origins

**Cache aggressively**:
- Immutable assets with long cache headers
- Service workers for offline and cache control
- CDN for static assets
- Browser caching with proper cache headers

### Runtime Performance

**Rendering efficiency**:
- Avoid layout thrashing (batch DOM reads/writes)
- Use CSS transforms over layout-triggering properties
- Virtualize long lists
- Debounce scroll and resize handlers

**JavaScript efficiency**:
- Avoid blocking the main thread
- Use Web Workers for heavy computation
- Break long tasks into smaller chunks
- Profile and optimize hot paths

**Memory management**:
- Clean up event listeners
- Avoid memory leaks in closures
- Use weak references where appropriate
- Monitor heap size over time

## Backend Performance

### Database Optimization

**Query optimization**:
- Use indexes for filtered and sorted columns
- Avoid SELECT *; fetch only needed columns
- Use EXPLAIN to understand query plans
- Batch operations to reduce round trips

**Common query patterns**:
| Pattern | Problem | Solution |
|---------|---------|----------|
| N+1 queries | One query per item in loop | Eager load, batch fetch |
| Full table scan | No index for WHERE clause | Add appropriate index |
| Sorting in app | Large result sets sorted in memory | Sort in database with index |
| Over-fetching | Retrieving unused columns | Select only needed fields |

**Connection management**:
- Use connection pooling
- Size pools appropriately
- Monitor connection usage and wait times
- Handle connection failures gracefully

### Caching Strategies

**Cache layers** (from fastest to slowest):
1. CPU cache: Automatic, algorithm-dependent
2. In-memory (application): Fast, per-instance
3. Distributed cache: Fast, shared across instances
4. CDN: Fast, geographically distributed
5. Database cache: Query result caching

**Cache invalidation strategies**:
| Strategy | Description | Use When |
|----------|-------------|----------|
| TTL (Time-to-Live) | Expire after duration | Acceptable staleness |
| Write-through | Update cache on write | Strong consistency needed |
| Write-behind | Async cache update | Write performance critical |
| Event-based | Invalidate on events | Complex dependencies |

**Cache key design**: Include all parameters that affect the result, use consistent hashing for distributed caches, namespace to allow selective invalidation.

### API Performance

**Reduce latency**:
- Minimize round trips (batch endpoints)
- Use pagination for large results
- Compress responses
- Keep payloads minimal

**Handle load**:
- Rate limiting to prevent overload
- Circuit breakers for failing dependencies
- Graceful degradation under stress
- Queue long-running operations

## Network Performance

### Latency Reduction

**Minimize round trips**:
- Reduce DNS lookups (fewer domains)
- Use persistent connections (keep-alive)
- Batch API requests
- Prefetch predictable resources

**Reduce distance**:
- CDN for static assets
- Edge computing for dynamic content
- Geographic load balancing
- Region-specific deployments

### Protocol Optimization

**HTTP/2 benefits**: Multiplexing (parallel requests on one connection), header compression, server push, stream prioritization.

**When HTTP/3/QUIC helps**: High latency networks, lossy connections (mobile), connection migration.

## Perceived Performance

Make it feel faster when you can't make it actually faster.

### Instant Feedback

**Optimistic updates**: Show success before confirmation
- Update UI immediately on user action
- Roll back if server rejects
- Works for most create/update operations

**Skeleton screens**: Show structure while loading
- Better than spinners for content-heavy pages
- Indicates what's coming
- Reduces perceived wait time

**Progress indicators**: Show something is happening
- Determinate progress when duration is known
- Indeterminate for unknown duration
- Avoid spinners for < 1 second operations

### Preloading and Prefetching

**Preload**: Fetch resources needed for current page (critical fonts, above-fold images).

**Prefetch**: Fetch resources for likely next pages (on hover over links, based on user behavior prediction).

**Preconnect**: Establish connections early to known third-party origins.

## Measurement

### Key Metrics

**User-centric metrics**:
| Metric | Question Answered |
|--------|-------------------|
| First Contentful Paint (FCP) | When does something appear? |
| Largest Contentful Paint (LCP) | When is main content visible? |
| Time to Interactive (TTI) | When can users interact? |
| Total Blocking Time (TBT) | How much does JS block the main thread? |
| Cumulative Layout Shift (CLS) | How much does the page jump around? |
| Interaction to Next Paint (INP) | How responsive is the page? |

**Server-side metrics**:
| Metric | What It Measures |
|--------|------------------|
| Response time (p50, p95, p99) | Typical and worst-case latency |
| Throughput | Requests per second |
| Error rate | Failed requests percentage |
| Time to First Byte (TTFB) | Server processing time |

### Profiling Approach

1. **Establish baseline**: Measure current performance
2. **Identify bottlenecks**: Use profilers to find hot spots
3. **Hypothesize**: Form theory about the cause
4. **Experiment**: Make targeted changes
5. **Measure again**: Verify improvement
6. **Iterate or stop**: Repeat if needed, stop when budget met

### Monitoring

**Real User Monitoring (RUM)**: Captures real-world conditions, shows performance distribution, identifies slow regions/devices.

**Synthetic Monitoring**: Consistent baseline for comparison, catches regressions in CI/CD, doesn't capture real-world variance.

## Common Pitfalls

### Premature Optimization
Optimizing before understanding the problem.
**Fix**: Profile first. Optimize hot paths only.

### Over-Caching
Caching everything without strategy.
**Fix**: Cache deliberately. Start without caching, add when needed.

### Optimizing the Wrong Layer
Fast database, slow application, or vice versa.
**Fix**: Measure end-to-end. Optimize the actual bottleneck.

### Ignoring the Long Tail
Focusing only on averages, missing p99 users.
**Fix**: Monitor percentiles (p95, p99). Optimize worst cases.

### Death by a Thousand Cuts
Many small inefficiencies that add up.
**Fix**: Audit dependencies, remove unnecessary work, simplify architecture.

## Optimization Techniques Summary

| Technique | When to Use | Complexity |
|-----------|-------------|------------|
| Caching | Repeated expensive operations | Medium |
| Lazy loading | Non-critical resources | Low |
| Code splitting | Large bundles | Low-Medium |
| Compression | Large payloads | Low |
| Indexing | Slow database queries | Low |
| Batching | Many small operations | Medium |
| Async processing | Long-running operations | Medium |
| CDN | Static assets, geographic users | Low |
| Connection pooling | Frequent database access | Low |
| Virtualization | Long lists/tables | Medium |

## Performance Checklist

Before shipping:

- [ ] Performance budgets are defined
- [ ] Critical path is optimized
- [ ] Images are optimized and responsive
- [ ] JavaScript is minified and split
- [ ] Caching is configured properly
- [ ] Database queries are indexed
- [ ] API responses are paginated where appropriate
- [ ] Loading states give instant feedback
- [ ] Real user monitoring is in place
- [ ] Synthetic tests catch regressions
- [ ] p95/p99 latencies are acceptable
