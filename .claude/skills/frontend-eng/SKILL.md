---
name: frontend-eng
description: Guide frontend engineering patterns for components, state management, and data fetching. Use when designing component architecture, choosing state management approaches (local, shared, server state), implementing routing, building forms with validation, or optimizing frontend rendering performance. Note: For creative visual design and aesthetics, use the frontend-design skill instead. Triggers: "component architecture", "state management", "frontend patterns", "data fetching", "routing", "forms", "props drilling", "React hooks".
---

# Frontend Engineering

Create user experiences that balance user satisfaction, developer efficiency, and maintainability. Complexity should serve the user, not the architecture. Optimize for the user first, then the developer, then the machine.

## Component Architecture

### Component Design Principles

**Single Responsibility**: Each component should do one thing well.
- If a component needs many props, it may be doing too much
- If a component name contains "and," split it

**Composition over Inheritance**: Build complex UIs by combining simple components.
- Prefer passing children over configuration props
- Use slots/portals for flexible layouts
- Avoid deep component hierarchies

**Explicit over Implicit**: Make data flow and side effects visible.
- Props down, events up
- Avoid hidden dependencies
- Document expected prop shapes

### Component Categories

| Type | Purpose | State | Side Effects |
|------|---------|-------|--------------|
| **Presentational** | Render UI | Minimal/none | None |
| **Container** | Manage data | Yes | Data fetching |
| **Layout** | Structure pages | None | None |
| **Utility** | Reusable logic | Varies | Varies |

Start with presentational components. Extract containers when data fetching logic becomes complex or shared.

### File Organization

**By feature** (preferred for larger apps):
```
features/
├── authentication/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── types/
├── dashboard/
└── settings/
```

**By type** (simpler for smaller apps):
```
components/
hooks/
services/
types/
```

Feature-based requires more up-front thinking but scales better. Type-based is simpler but creates cross-cutting dependencies.

## State Management

For detailed state management patterns, see [references/state-patterns.md](references/state-patterns.md).

### State Categories

**Local State**: UI state specific to a component (form inputs, toggles, modals). Keep close to where it's used.

**Shared State**: State needed by multiple components (shopping cart, user preferences). Lift to common ancestor or use context/store.

**Server State**: Data from external sources (API responses, database records). Needs caching, invalidation, synchronization.

**URL State**: State reflected in the URL (current page, filters, search queries). Treat as source of truth for navigation.

### Choosing State Location

1. Does only this component need it? → Local state
2. Do sibling components need it? → Lift to parent
3. Do distant components need it? → Context or store
4. Should it survive page refresh? → URL or persistence
5. Does it come from the server? → Server state management

## Data Fetching

### Fetching Patterns

**On Mount**: Fetch when component appears. Simple and predictable, but can cause waterfalls.

**On Interaction**: Fetch when user acts. Good for search, pagination, filters. Provide loading indicators.

**Prefetch**: Fetch before user needs it. On hover, on route enter. Improves perceived performance.

### Caching Strategies

**Cache-first**: Return cached data, refresh in background. Best for data that doesn't change often.

**Network-first**: Always fetch, fall back to cache. Best for critical, frequently updated data.

**Stale-while-revalidate**: Show stale, fetch fresh, update. Good balance of speed and freshness.

### Error Handling

- Show meaningful error messages (not technical details)
- Provide retry actions for transient failures
- Gracefully degrade—show partial data if possible
- Log errors for debugging without exposing to users

## Rendering Strategies

### Client-Side Rendering (CSR)

Render entirely in the browser. Simple deployment, rich interactivity. Slow initial load, poor SEO.
**Best for**: Dashboards, internal tools, highly interactive apps.

### Server-Side Rendering (SSR)

Generate HTML on each request. Fast first paint, good SEO. Server load, complex caching.
**Best for**: Content sites, SEO-critical pages, slow networks.

### Static Site Generation (SSG)

Generate HTML at build time. Fastest delivery, simple hosting. Stale content, rebuild for updates.
**Best for**: Documentation, blogs, marketing pages.

### Hybrid Approaches

Mix strategies based on page needs: static shell with dynamic content, server-render critical path then hydrate, stream HTML as available.

## Forms

### Form Design Principles

**Progressive disclosure**: Show fields as needed. Don't overwhelm with all fields at once. Consider multi-step forms.

**Immediate feedback**: Validate as user types. Show errors after field loses focus (onBlur). Clear errors as user corrects.

**Forgiveness**: Make errors easy to fix. Keep form data on submission error. Explain what went wrong and how to fix.

### Validation Strategy

**Client-side validation**: Better UX, immediate feedback, reduced server load. Can be bypassed—never trust alone.

**Server-side validation**: Source of truth. Enforce business rules. Required for security.

**Validation timing**:
- `onBlur`: After leaving field (most common)
- `onChange`: As user types (use sparingly)
- `onSubmit`: All at once (for simple forms)

## Routing

### URL Design Principles

**Predictable**: Users can guess URLs (`/users/123` not `/u?id=123`).
**Bookmarkable**: Sharing URLs shares state. Include necessary query params.
**Meaningful**: URLs describe content (`/products/shoes` not `/page/42`).

### Navigation Patterns

**Declarative**: Links with URLs. Preferred for most navigation. Works with browser history. Accessible by default.

**Programmatic**: Navigate via code. After form submission, authentication, or when state changes require redirect.

### Route Protection

- Check authentication before rendering protected routes
- Redirect to login, not error page
- Preserve intended destination for post-login redirect
- Handle race conditions between auth check and render

## Performance Basics

### Bundle Size

**Code splitting**: Load code on demand. Split by route, by feature, or by large dependencies.

**Tree shaking**: Remove unused code. Use ES modules for automatic tree shaking. Import specific functions, not entire libraries.

### Rendering Performance

**Minimize re-renders**: Only update what changed. Memoize expensive computations. Use stable references for callbacks and objects.

**Virtualization**: Render only visible items. For long lists (100+ items). Trade-off: added complexity, potential scroll issues.

**Debounce and throttle**: Limit expensive operations. Debounce for pauses in events (search input). Throttle for frequency limits (scroll handlers).

## Accessibility

### Core Principles

**Perceivable**: Text alternatives for images, captions for video, sufficient color contrast.

**Operable**: Keyboard navigation for all interactions, no keyboard traps, sufficient time.

**Understandable**: Clear consistent navigation, predictable interactions, helpful error messages.

**Robust**: Valid semantic HTML, compatible with assistive technologies.

### Practical Guidelines

**Semantic HTML**: Use the right elements. `<button>` for actions, `<nav>` for navigation. Headings in order.

**Focus management**: Visible focus indicators, logical tab order, focus to new content (modals, dynamic regions).

**ARIA when needed**: Use native elements first. Add roles for custom widgets. Live regions for dynamic content.

## Common Pitfalls

### Prop Drilling Hell
Passing props through many layers.
**Fix**: Context, composition (children), or state management.

### Giant Components
Components with hundreds of lines.
**Fix**: Extract sub-components, custom hooks, utilities.

### Premature Abstraction
Creating components/hooks before understanding the pattern.
**Fix**: Wait for three instances before abstracting.

### Ignoring Loading/Error States
Only handling the happy path.
**Fix**: Design for loading, empty, error, and success states.

### State Synchronization
Duplicating state across multiple locations.
**Fix**: Single source of truth, derive state when possible.

## Frontend Checklist

Before shipping:

- [ ] Components have clear, single responsibilities
- [ ] State lives at the appropriate level
- [ ] Loading and error states are handled
- [ ] Forms validate and give feedback
- [ ] Navigation is accessible via keyboard
- [ ] Interactive elements have focus indicators
- [ ] Images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] Bundle size is reasonable
- [ ] Performance is acceptable on slow devices
- [ ] URLs are shareable and bookmarkable
