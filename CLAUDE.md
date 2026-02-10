# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server with Turbopack (fast HMR)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npx convex dev   # Run Convex backend in development mode (required alongside npm run dev)
```

**Note:** For local development, you need both the Next.js dev server and Convex dev running simultaneously in separate terminals.

## Architecture Overview

This is a **SaaS starter kit** built with Next.js 15 (App Router), Convex (real-time database), Clerk (authentication + billing), and Sentry (error tracking).

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS v4, shadcn/ui (Radix UI)
- **Backend:** Convex serverless functions and real-time database
- **Auth & Billing:** Clerk (integrated with Convex via JWT template named "convex")
- **Error Tracking:** Sentry with custom Convex-based error logging
- **i18n:** next-intl (English and German support)

### Route Structure
- `/` - Public landing page (route group: `/(landing)`)
- `/dashboard/*` - Protected routes (Clerk middleware authentication)
- `/dashboard/youtube` - YouTube channel analytics
- `/dashboard/payment-gated` - Subscription-required content
- `/api/error-sync` - Sentry sync endpoint (bearer token auth, not Clerk)

### Next.js Image Configuration
YouTube images require allowed hostnames in `next.config.ts`:
- `yt3.ggpht.com` - YouTube channel avatars
- `i.ytimg.com` - YouTube video thumbnails

### Convex Backend (`/convex/`)
All backend logic lives in Convex. Key patterns:
- **Schema:** Defined in `schema.ts` - tables: `users`, `paymentAttempts`, `errorLogs`
- **User sync:** Clerk webhooks → Convex HTTP router (`http.ts`) → user upsert/delete
- **Internal vs Public functions:** Internal mutations for webhook handlers; public queries/mutations for client access
- **Error handling:** Custom `ConvexAppError` class with categories (authentication, database, webhook, payment, validation) and severity levels

### Clerk-Convex Integration
1. Clerk JWT template named "convex" must exist in Clerk dashboard
2. `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` = JWT issuer URL from that template
3. Webhooks sync user data: `/clerk-users-webhook` endpoint in Convex HTTP router
4. `CLERK_WEBHOOK_SECRET` must be set in **Convex dashboard** environment variables (not .env.local)

### Authentication Flow
- `middleware.ts` protects `/dashboard(.*)` routes via Clerk
- Public API routes (like `/api/error-sync`) bypass Clerk middleware and use their own auth
- Convex functions access user via `ctx.auth.getUserIdentity()` which returns Clerk JWT claims

### Error Logging System
Two-phase error tracking:
1. Errors in Convex functions → logged to `errorLogs` table via `logMutationError()`
2. Cron job calls `/api/error-sync` → fetches unsent errors → sends to Sentry → marks as synced

### UI Components
- Primary components: `/components/ui/` (shadcn/ui style: "new-york")
- Animation libraries in separate directories: `/components/magicui/`, `/components/motion-primitives/`, `/components/react-bits/`, `/components/kokonutui/`
- Utility function: `cn()` from `lib/utils.ts` (clsx + tailwind-merge)

### Key Providers (in root layout)
- `ConvexClientProvider` - Wraps Convex + Clerk providers together
- `ThemeProvider` - Dark/light mode via next-themes
- `NextIntlClientProvider` - i18n support

## Environment Variables

Required variables (see `.env.example`):
- `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` - Convex connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` - Clerk auth
- `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` - JWT issuer (from Clerk JWT template)
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` - Sentry tracking

Convex-specific secrets (set in Convex dashboard, NOT .env.local):
- `CLERK_WEBHOOK_SECRET` - Webhook validation

## AI Resources

- **`/.claude/skills/`** - Claude Code skills (architect, backend-dev, devops, frontend-design, frontend-eng, git-pushing, performance, security, skill-creator, testing, ui-ux). Each skill has a `SKILL.md` with name/description in YAML frontmatter.
- **`/ai/techstack/`** - Technology-specific documentation for the stack (Clerk, Convex, Next.js, Sentry, shadcn, TailwindCSS, Vercel).