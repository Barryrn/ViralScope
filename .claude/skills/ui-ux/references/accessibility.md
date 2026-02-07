# Accessibility Reference

Comprehensive accessibility (a11y) guidance for building inclusive interfaces.

## Table of Contents

1. [WCAG Overview](#wcag-overview)
2. [Keyboard Navigation](#keyboard-navigation)
3. [Screen Readers](#screen-readers)
4. [ARIA Guide](#aria-guide)
5. [Color and Contrast](#color-and-contrast)
6. [Forms Accessibility](#forms-accessibility)
7. [Images and Media](#images-and-media)
8. [Testing Accessibility](#testing-accessibility)

---

## WCAG Overview

Web Content Accessibility Guidelines (WCAG) define how to make content accessible.

### Four Principles (POUR)

**Perceivable**: Information must be presentable in ways users can perceive.
- Text alternatives for non-text content
- Captions for multimedia
- Content adaptable to different presentations
- Distinguishable (color, contrast, spacing)

**Operable**: Interface components must be operable.
- Keyboard accessible
- Enough time to read and use content
- No content that causes seizures
- Navigable

**Understandable**: Information and operation must be understandable.
- Readable text
- Predictable functionality
- Input assistance

**Robust**: Content must be robust enough for various technologies.
- Compatible with assistive technologies
- Valid markup

### Conformance Levels

| Level | Description | Target |
|-------|-------------|--------|
| A | Minimum | Basic barriers removed |
| AA | Acceptable | **Standard target** |
| AAA | Optimal | Enhanced accessibility |

For most projects, target **WCAG 2.1 Level AA**.

---

## Keyboard Navigation

### Basic Requirements

All interactive elements must be:
- **Reachable** via Tab key
- **Activatable** via Enter/Space
- **Escapable** (no keyboard traps)

### Focus Order

Focus should follow logical reading order:
1. Top to bottom
2. Left to right (in LTR languages)
3. Into opened dialogs
4. Back to trigger after dialog closes

### Focus Indicators

**Requirements**:
- Visible focus state for all interactive elements
- Sufficient contrast (3:1 against adjacent colors)
- Not relying on color alone

**Example CSS**:
```css
:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
```

### Common Keyboard Patterns

| Element | Key | Action |
|---------|-----|--------|
| Links/Buttons | Enter | Activate |
| Buttons | Space | Activate |
| Checkboxes | Space | Toggle |
| Radio buttons | Arrow keys | Move selection |
| Select dropdown | Arrow keys | Navigate options |
| Tabs | Arrow keys | Switch tabs |
| Modal | Escape | Close |
| Menu | Escape | Close |
| Menu items | Arrow keys | Navigate |

### Focus Trapping (Modals)

When a modal opens:
1. Move focus to first focusable element in modal
2. Trap Tab within modal boundaries
3. Return focus to trigger element when closed

```javascript
// Focus trap example
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```

---

## Screen Readers

### Semantic HTML First

Use the right element for the job:

| Purpose | Correct | Incorrect |
|---------|---------|-----------|
| Button | `<button>` | `<div onclick>` |
| Link | `<a href>` | `<span onclick>` |
| Navigation | `<nav>` | `<div class="nav">` |
| Main content | `<main>` | `<div class="main">` |
| Heading | `<h1>`-`<h6>` | `<div class="heading">` |
| List | `<ul>`, `<ol>` | `<div>` with bullets |

### Heading Structure

Headings create document outline for screen reader navigation:

```html
<h1>Page Title</h1>
  <h2>Main Section</h2>
    <h3>Subsection</h3>
    <h3>Subsection</h3>
  <h2>Another Section</h2>
    <h3>Subsection</h3>
```

**Rules**:
- One `<h1>` per page
- Don't skip levels (h1 → h3)
- Use for structure, not styling

### Landmarks

Landmarks help screen reader users navigate:

```html
<header role="banner">
  <nav role="navigation">...</nav>
</header>
<main role="main">
  <article>...</article>
  <aside role="complementary">...</aside>
</main>
<footer role="contentinfo">...</footer>
```

### Skip Links

Allow users to skip repetitive content:

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- Usually hidden, visible on focus -->
<style>
.skip-link {
  position: absolute;
  left: -10000px;
}
.skip-link:focus {
  left: 10px;
  top: 10px;
}
</style>
```

### Live Regions

Announce dynamic content changes:

```html
<!-- Polite: Wait for user to finish current task -->
<div aria-live="polite">
  Your changes have been saved.
</div>

<!-- Assertive: Interrupt immediately (use sparingly) -->
<div aria-live="assertive" role="alert">
  Error: Please correct the form.
</div>
```

---

## ARIA Guide

ARIA (Accessible Rich Internet Applications) enhances accessibility when semantic HTML isn't enough.

### Core Rule

**First rule of ARIA**: Don't use ARIA if native HTML works.

```html
<!-- DON'T -->
<div role="button" tabindex="0" onclick="...">Click me</div>

<!-- DO -->
<button onclick="...">Click me</button>
```

### Common ARIA Attributes

#### Roles

Define what an element is:

```html
<div role="dialog" aria-modal="true">
  Modal content
</div>

<ul role="tablist">
  <li role="tab" aria-selected="true">Tab 1</li>
  <li role="tab">Tab 2</li>
</ul>

<div role="alert">
  Error message
</div>
```

#### States

Communicate current state:

```html
<!-- Expanded/Collapsed -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden>...</ul>

<!-- Selected -->
<li role="option" aria-selected="true">Option 1</li>

<!-- Checked -->
<div role="checkbox" aria-checked="true">...</div>

<!-- Disabled -->
<button aria-disabled="true">Can't click</button>

<!-- Current page -->
<a href="/" aria-current="page">Home</a>
```

#### Properties

Provide additional information:

```html
<!-- Label -->
<button aria-label="Close dialog">×</button>

<!-- Described by -->
<input aria-describedby="password-hint" type="password">
<p id="password-hint">Must be at least 8 characters</p>

<!-- Required -->
<input aria-required="true">

<!-- Invalid -->
<input aria-invalid="true" aria-errormessage="email-error">
<p id="email-error">Please enter a valid email</p>
```

### Common ARIA Patterns

#### Accordion

```html
<h3>
  <button aria-expanded="false" aria-controls="panel1">
    Section 1
  </button>
</h3>
<div id="panel1" hidden>
  Panel content
</div>
```

#### Tab Panel

```html
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">
    Tab 1
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel2">
    Tab 2
  </button>
</div>
<div id="panel1" role="tabpanel">Content 1</div>
<div id="panel2" role="tabpanel" hidden>Content 2</div>
```

#### Modal Dialog

```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Dialog Title</h2>
  <p>Dialog content</p>
  <button>Close</button>
</div>
```

---

## Color and Contrast

### Contrast Requirements

| Element | Minimum Ratio (AA) | Enhanced (AAA) |
|---------|-------------------|----------------|
| Normal text | 4.5:1 | 7:1 |
| Large text (18px+) | 3:1 | 4.5:1 |
| Bold text (14px+) | 3:1 | 4.5:1 |
| UI components | 3:1 | - |
| Graphics | 3:1 | - |

### Don't Rely on Color Alone

**Bad**: Red text for errors, green for success.
**Good**: Red text + error icon + "Error:" prefix.

```html
<!-- DON'T -->
<span style="color: red">Username is taken</span>

<!-- DO -->
<span style="color: red">
  <svg aria-hidden="true"><!-- error icon --></svg>
  Error: Username is taken
</span>
```

### Focus Visibility

Focus indicator must have:
- 3:1 contrast against adjacent colors
- 2px minimum thickness (recommended)
- Visible change from unfocused state

---

## Forms Accessibility

### Labels

Every input needs an associated label:

```html
<!-- Explicit association -->
<label for="email">Email address</label>
<input id="email" type="email">

<!-- Implicit association -->
<label>
  Email address
  <input type="email">
</label>
```

### Required Fields

```html
<label for="name">
  Name <span aria-hidden="true">*</span>
  <span class="visually-hidden">(required)</span>
</label>
<input id="name" required aria-required="true">
```

### Error Messages

```html
<label for="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
>
<p id="email-error" role="alert">
  Please enter a valid email address
</p>
```

### Help Text

```html
<label for="password">Password</label>
<input
  id="password"
  type="password"
  aria-describedby="password-requirements"
>
<p id="password-requirements">
  Must be at least 8 characters with one number
</p>
```

### Form Groups

```html
<fieldset>
  <legend>Shipping address</legend>
  <label for="street">Street</label>
  <input id="street">
  <!-- more fields -->
</fieldset>
```

---

## Images and Media

### Image Alt Text

| Image Type | Alt Text |
|------------|----------|
| Informative | Describe content/function |
| Decorative | `alt=""` (empty) |
| Functional (button) | Describe action |
| Complex (chart) | Summary + detailed description |
| Text in image | Full text content |

```html
<!-- Informative -->
<img src="photo.jpg" alt="Team members at company retreat">

<!-- Decorative -->
<img src="decorative-border.png" alt="">

<!-- Functional -->
<button>
  <img src="search.svg" alt="Search">
</button>

<!-- Complex -->
<figure>
  <img src="chart.png" alt="Sales increased 25% in Q4">
  <figcaption>
    Detailed breakdown: Q1: $1M, Q2: $1.2M, Q3: $1.5M, Q4: $1.875M
  </figcaption>
</figure>
```

### Video Accessibility

- Captions for dialogue
- Audio descriptions for visual content
- Transcript available
- Pause/stop controls

```html
<video controls>
  <source src="video.mp4" type="video/mp4">
  <track kind="captions" src="captions.vtt" srclang="en" label="English">
  <track kind="descriptions" src="descriptions.vtt" srclang="en">
</video>
<a href="transcript.txt">Download transcript</a>
```

---

## Testing Accessibility

### Automated Testing

Tools catch ~30% of issues:
- axe DevTools (browser extension)
- Lighthouse (built into Chrome)
- WAVE (web accessibility evaluation tool)
- eslint-plugin-jsx-a11y (React)

### Manual Testing

**Keyboard Testing**:
1. Put mouse away
2. Tab through entire page
3. Verify all actions work
4. Check focus visibility
5. Test modals and dropdowns

**Screen Reader Testing**:
- NVDA (Windows, free)
- VoiceOver (Mac, built-in)
- JAWS (Windows, paid)

**Visual Testing**:
- Zoom to 200%
- Check with color blindness simulators
- Test with high contrast mode

### Quick Checklist

- [ ] All images have alt text (or alt="")
- [ ] All form inputs have labels
- [ ] All pages have unique titles
- [ ] Headings are in logical order
- [ ] Links have descriptive text
- [ ] Color contrast meets 4.5:1
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Dynamic content is announced
- [ ] Works at 200% zoom
