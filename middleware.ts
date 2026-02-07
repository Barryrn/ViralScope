import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

// Routes that handle their own authentication (e.g., cron jobs, webhooks, Sentry tunnel)
const isPublicApiRoute = createRouteMatcher(['/api/error-sync(.*)', '/monitoring(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Skip Clerk auth for routes that handle their own authentication
  if (isPublicApiRoute(req)) return

  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}