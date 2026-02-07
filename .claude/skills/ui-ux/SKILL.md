---
name: ui-ux
description: Guide UI/UX design principles for usability and accessibility. Use when designing interfaces, establishing visual hierarchy, implementing forms, handling UI states (loading, empty, error, success), ensuring accessibility compliance, or evaluating usability. Note: For creative visual aesthetics and bold design choices, use the frontend-design skill instead. Triggers: "UX", "usability", "accessibility", "user interface", "design principles", "a11y", "WCAG", "visual hierarchy", "responsive design", "user experience".
---

# UI/UX Design Principles

Good design is invisible. Users should accomplish their goals without thinking about the interface. Every element should have a purpose. Design for the user's mental model, not the system's architecture.

## Fundamental Principles

### Clarity

**Make it obvious**: Users shouldn't have to guess.
- Clear labels that describe actions
- Visual hierarchy that guides attention
- Consistent patterns across the interface

**Reduce cognitive load**:
- One primary action per screen
- Progressive disclosure of complexity
- Recognition over recall (show options, don't require memory)

### Consistency

**Internal consistency**: Same patterns within your product.
- Same action, same appearance everywhere
- Same terminology throughout
- Predictable locations for common elements

**External consistency**: Match user expectations from other products.
- Standard icons and gestures
- Platform conventions
- Common interaction patterns

### Feedback

Users need to know:
- What just happened (confirmation)
- What's happening now (progress)
- What they can do (affordance)
- What went wrong (error states)

**Response times**:
- < 100ms: Feels instant
- 100ms - 1s: Noticeable delay, keep user informed
- > 1s: Show progress indicator
- > 10s: Allow users to do something else

### Forgiveness

**Prevent errors**: Disable impossible actions, confirm destructive actions, validate input early.

**Enable recovery**: Undo for reversible actions, clear error messages with solutions, never lose user work.

## Visual Hierarchy

### Establishing Hierarchy

Guide users through content by importance:

1. **Size**: Larger elements draw attention first
2. **Color**: High contrast and saturated colors stand out
3. **Position**: Top-left (in LTR languages) gets attention first
4. **Space**: Isolation draws attention
5. **Typography**: Weight and style differentiate importance

### Layout Principles

**Proximity**: Related items close together, unrelated items apart. Group by function, use whitespace to separate sections.

**Alignment**: Create visual connections. Align elements to a grid, consistent margins and padding.

**Contrast**: Differentiate elements with purpose. Primary vs. secondary actions, active vs. inactive states.

## Typography

### Readability

**Line length**: 45-75 characters per line for body text.
**Line height**: 1.4-1.6 for body text, tighter for headings (1.2-1.4).
**Font size**: Minimum 16px for body text on web. Test on actual devices.

### Typographic Hierarchy

| Level | Purpose | Treatment |
|-------|---------|-----------|
| H1 | Page title | Largest, boldest |
| H2 | Section heading | Large, bold |
| H3 | Subsection | Medium, semibold |
| Body | Main content | Regular weight |
| Caption | Supporting info | Smaller, lighter |

### Font Selection

- High x-height improves legibility
- Clear distinction between similar letters (l, 1, I)
- Match the tone: Sans-serif (modern), Serif (traditional), Monospace (technical)
- Limit variety: 1-2 font families maximum

## Color

### Color Usage

**Semantic meaning**:
- Red: Error, danger, destructive
- Yellow/Orange: Warning, caution
- Green: Success, positive
- Blue: Information, links, primary actions
- Gray: Disabled, secondary, neutral

**Functional palette**: Primary (brand, main actions), Secondary (supporting), Accent (highlights, focus), Neutral (backgrounds, text), Semantic (success, warning, error).

### Accessibility

**Contrast ratios** (WCAG AA):
- Normal text: 4.5:1 minimum
- Large text (18px+ or 14px bold): 3:1 minimum
- UI components and graphics: 3:1 minimum

**Don't rely on color alone**: Use icons + color for status, text labels for important distinctions.

## Interactive Elements

### Buttons

**Visual hierarchy**:
| Type | Use | Appearance |
|------|-----|------------|
| Primary | Main action | Filled, prominent |
| Secondary | Alternative action | Outlined or subdued |
| Tertiary | Minor action | Text-only |
| Destructive | Dangerous action | Red, requires confirmation |

**States**: Default, Hover, Active/Pressed, Focus, Disabled, Loading.

### Forms

**Labels**: Above or beside inputs (not inside as placeholder only). Clear and concise. Required field indicator.

**Input states**: Empty (placeholder hint), Focused (visible border/ring), Filled (shows value), Error (red border + message), Disabled (grayed).

**Validation**: Validate on blur, show errors near the problematic field, keep valid inputs intact on error.

**Help text**: Below inputs for format hints, before submission for important notes.

### Navigation

**Primary navigation**: Always visible or easily accessible, shows current location, consistent across pages.

**Breadcrumbs**: For deep hierarchies, shows path from home, each level clickable.

**Search**: Prominent for content-heavy sites, autocomplete for efficiency, handle empty states gracefully.

## Responsive Design

### Breakpoint Strategy

| Breakpoint | Target |
|------------|--------|
| 320-480px | Mobile phones |
| 481-768px | Tablets portrait |
| 769-1024px | Tablets landscape, small laptops |
| 1025-1200px | Desktops |
| 1201px+ | Large screens |

### Mobile-First Approach

Start with mobile constraints, enhance for larger screens.

**Considerations**:
- Touch targets: minimum 44x44px
- Thumb zones: primary actions within reach
- Reduced content: show what matters
- Simplified navigation: hamburger menu, bottom nav

### Adaptive Layouts

**Fluid grids**: Percentages over fixed widths.
**Flexible images**: Max-width: 100%.
**Reflow content**: Stack elements on narrow screens.
**Hide/show**: Progressive disclosure by screen size.

## Common UI Patterns

### Modals/Dialogs

**When to use**: Focused tasks requiring immediate attention, confirmation before destructive actions, quick forms without leaving context.

**Guidelines**: Clear title and purpose, easy to dismiss (X, click outside, Escape), prevent body scroll, focus trap for keyboard users, don't nest modals.

### Notifications/Toasts

**Types**: Success (confirm completed action), Error (explain what went wrong), Warning (alert to potential issues), Info (provide helpful information).

**Guidelines**: Auto-dismiss for success (3-5 seconds), persist for errors until dismissed, don't block important content.

### Loading States

**Skeleton screens**: Show structure while loading content. Better than spinners for known layouts.

**Spinners**: Show activity for unknown duration. Keep them small and unobtrusive.

**Progress bars**: Show completion percentage when duration is predictable.

### Empty States

Turn zero-content into opportunity:
- Explain what will appear here
- Provide action to add content
- Don't leave completely blank
- Make it helpful, not just decorative

## Accessibility (a11y)

For detailed accessibility guidance, see [references/accessibility.md](references/accessibility.md).

### Core Requirements

**Keyboard navigation**: All interactive elements reachable via Tab, logical tab order, visible focus indicators, no keyboard traps.

**Screen readers**: Semantic HTML structure, alt text for images, ARIA labels where needed, meaningful link text.

**Motor impairments**: Large click targets, adequate spacing, no time-limited interactions.

### ARIA Basics

**Roles**: What an element is (`role="button"`, `role="dialog"`).
**States**: Current condition (`aria-expanded`, `aria-selected`, `aria-disabled`).
**Properties**: Relationships (`aria-label`, `aria-describedby`, `aria-live`).

## Animation

### Purpose

Animation should serve a purpose:
- **Feedback**: Confirm user action
- **Orientation**: Show where things came from/went to
- **Attention**: Draw focus to important changes
- **Delight**: Add personality (sparingly)

### Timing

| Duration | Use |
|----------|-----|
| 100-200ms | Micro-interactions (hover, focus) |
| 200-300ms | Simple transitions (fade, slide) |
| 300-500ms | Complex transitions (page, modal) |

**Easing**: Ease-out for entering objects, ease-in for leaving, ease-in-out for moving.

### Motion Reduction

Respect user preferences:
- Check `prefers-reduced-motion` media query
- Reduce or remove animations for these users
- Keep essential transitions, remove decorative ones

## Common Pitfalls

### Visual Clutter
Too many elements competing for attention.
**Fix**: Remove unnecessary elements, increase whitespace, establish clear hierarchy.

### Inconsistency
Same actions look or behave differently.
**Fix**: Create and follow a design system.

### Hidden Functionality
Features users can't discover.
**Fix**: Make important features visible, use progressive disclosure thoughtfully.

### Ignoring Edge Cases
Designing only for the happy path.
**Fix**: Design all states: loading, empty, error, partial, overflow.

### Inaccessibility
Excluding users with disabilities.
**Fix**: Follow WCAG guidelines, test with keyboard, screen readers, and real users.

## UX Checklist

Before shipping:

- [ ] Clear visual hierarchy guides user attention
- [ ] Primary actions are obvious and prominent
- [ ] Consistent patterns across the interface
- [ ] All states designed (loading, empty, error, success)
- [ ] Feedback provided for all user actions
- [ ] Errors are clear and helpful
- [ ] Undo available for reversible actions
- [ ] Accessible via keyboard
- [ ] Color contrast meets WCAG AA
- [ ] Works on mobile and desktop
- [ ] Tested with real users
