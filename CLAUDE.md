# CLAUDE.md

ViralScope - Analytics platform for YouTube and TikTok creators measuring virality and content quality.

## Commands

```bash
npm run dev       # Next.js dev server (Turbopack)
npx convex dev    # Convex backend (run in separate terminal)
npm run build     # Production build
npm run lint      # ESLint
```

## Architecture

**Stack:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, shadcn/ui, Convex, Clerk, Sentry

**Routes:**
- `/` - Landing page (`/(landing)` route group)
- `/dashboard/*` - Protected (Clerk middleware)
- `/dashboard/youtube` - YouTube analytics
- `/dashboard/tiktok` - TikTok analytics (planned)
- `/dashboard/payment-gated` - Subscription-gated

**Core Metrics:**
- **Viral Score** - How fast and strongly a video spreads
- **Reception Score** - How well the audience responds

**Backend:** All in `/convex/` - schema in `schema.ts`, webhooks in `http.ts`

**Components:** `/components/ui/` (shadcn), animation libs in `/components/magicui|motion-primitives|react-bits|kokonutui/`

## Key Patterns

**Clerk-Convex Integration:**
- JWT template named "convex" required in Clerk dashboard
- `CLERK_WEBHOOK_SECRET` set in Convex dashboard (not .env.local)
- Webhook endpoint: `/clerk-users-webhook`

**Error Logging:** Convex `errorLogs` table → cron syncs to Sentry via `/api/error-sync`

**Images:** YouTube/TikTok hostnames configured in `next.config.ts` (`yt3.ggpht.com`, `i.ytimg.com`)

## Environment

See `.env.example` for required variables. Convex secrets go in Convex dashboard.

## Resources

- Tech docs: `/ai/techstack/`
- Skills: `/.claude/skills/`
