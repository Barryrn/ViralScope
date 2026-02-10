---
name: claude-md-writer
description: Create, update, and optimize CLAUDE.md files for Claude Code projects. Use when initializing a new project with /init, creating a CLAUDE.md from scratch, reviewing and improving an existing CLAUDE.md, or when the user asks about CLAUDE.md best practices. Triggers: "create CLAUDE.md", "update CLAUDE.md", "improve CLAUDE.md", "/init", "project setup", "claude instructions", "project context file".
---

# CLAUDE.md Writer

Create concise, effective CLAUDE.md files that maximize Claude Code productivity while minimizing context consumption.

## Core Principles

### Less is More
- Keep under 300 lines (ideally under 100)
- Only include what Claude doesn't already know
- Every line must justify its token cost
- Delete instructions Claude follows correctly without prompting

### Three-Part Framework: WHAT, WHY, HOW

1. **WHAT** - Tech stack, project structure, key directories
2. **WHY** - Project purpose, component functions
3. **HOW** - Commands, workflows, verification steps

## Required Sections

### 1. Project Context (1-2 lines)
```markdown
# CLAUDE.md
Brief project description in one sentence.
```

### 2. Development Commands
```markdown
## Development Commands
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
```

### 3. Architecture Overview
```markdown
## Architecture
- Tech stack summary
- Key directories and their purposes
- Database/API patterns
```

### 4. Critical Information Only
Include ONLY:
- Non-obvious project conventions
- Environment variable requirements
- Integration patterns (auth, payments, etc.)
- Things Claude would otherwise get wrong

## What to NEVER Include

- Code style rules (use linters instead)
- Generic best practices Claude already knows
- Duplicate information from README
- Lengthy examples or tutorials
- Database schemas (reference separate files)
- API documentation (reference separate files)

## Structure Pattern

```markdown
# CLAUDE.md

One-line project description.

## Commands
[essential commands only]

## Architecture
[brief tech stack and structure]

## Key Patterns
[project-specific conventions]

## Environment
[required variables, no values]
```

## Progressive Disclosure

For detailed docs, reference separate files:
```markdown
## Resources
- Database schema: See `docs/schema.md`
- API reference: See `docs/api.md`
```

## Optimization Checklist

Before finalizing:
- [ ] Under 300 lines?
- [ ] No code style rules? (use linters)
- [ ] No generic advice Claude already knows?
- [ ] Commands are copy-paste ready?
- [ ] Only project-specific information?
- [ ] References to detailed docs where needed?

## Anti-Patterns to Avoid

| Bad | Good |
|-----|------|
| "Please format code nicely" | Use Prettier/ESLint |
| "Follow best practices" | Delete (Claude knows) |
| Long code examples | Point to actual files |
| "Be careful with X" | Use hooks for enforcement |
| Database schema inline | Reference `schema.md` |
