# ViralScope

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Convex](https://img.shields.io/badge/Convex-Real--time-FF6B6B?style=flat-square)](https://convex.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**ViralScope** is an analytics platform for **YouTube and TikTok creators** that shows **which videos go viral and how well they resonate with the audience**.

[Documentation](#getting-started) | [Security](SECURITY.md)

---

## What is ViralScope?

ViralScope analyzes videos from the last **30–60 days** and calculates two core metrics:

- **Viral Score** – How fast and strongly a video spreads
- **Reception Score** – How well the audience responds to the video

With rankings, charts, and comparisons, creators can identify:

- Content that performs above average
- Videos that get reach but poor audience response
- Formats that work consistently over time

**In short:** ViralScope measures not just views, but **virality and content quality** on YouTube and TikTok.

---

## Features

- **Viral Score Analytics** - Measure how quickly content spreads
- **Reception Score** - Gauge audience engagement quality
- **Multi-Platform Support** - YouTube and TikTok analytics
- **30-60 Day Analysis** - Recent performance insights
- **Content Rankings** - Compare videos against each other
- **Performance Charts** - Visualize trends over time
- **Next.js 15 with App Router** - Latest React framework with server components
- **Clerk Authentication** - Complete user management with social logins
- **Clerk Billing** - Integrated subscription management and payments
- **Convex Real-time Database** - Serverless backend with real-time sync
- **Dark/Light Theme** - System-aware theme switching
- **Responsive Design** - Mobile-first approach

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization components

### Backend & Services
- **Convex** - Real-time database and serverless functions
- **Clerk** - Authentication and user management
- **Clerk Billing** - Subscription billing and payments
- **Sentry** - Error tracking and monitoring

### Development & Deployment
- **TypeScript** - Type safety throughout
- **Vercel** - Deployment platform
- **Turbopack** - Fast build tool

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Clerk account for authentication and billing
- Convex account for database

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Barryrn/ViralScope.git
cd ViralScope
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up your environment variables:**

```bash
cp .env.example .env.local
```

4. **Configure your environment variables in `.env.local`:**

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=your_convex_deployment_here
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# Clerk Authentication & Billing
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk Frontend API URL (from JWT template - see step 6)
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api-url.clerk.accounts.dev

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Sentry (optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
```

5. **Initialize Convex:**

```bash
npx convex dev
```

6. **Set up Clerk JWT Template:**
   - Go to your Clerk dashboard
   - Navigate to JWT Templates
   - Create a new template with name **"convex"**
   - Copy the Issuer URL - this becomes your `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`
   - Add this URL to both your `.env.local` and Convex environment variables

7. **Set up Convex environment variables** in your Convex dashboard:

```bash
# In Convex Dashboard > Settings > Environment Variables
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api-url.clerk.accounts.dev
```

8. **Set up Clerk webhooks:**
   - In your Clerk dashboard, configure webhook endpoint: `{your_convex_url}/clerk-users-webhook`
   - Enable events: `user.created`, `user.updated`, `user.deleted`, `paymentAttempt.updated`
   - Copy the webhook signing secret to your Convex environment variables

### Development

You need to run both servers simultaneously in separate terminals:

**Terminal 1 - Next.js:**
```bash
npm run dev
```

**Terminal 2 - Convex:**
```bash
npx convex dev
```

Your application will be available at `http://localhost:3000`.

## Architecture

### Key Routes
- `/` - Landing page with product overview
- `/dashboard` - Protected user dashboard
- `/dashboard/youtube` - YouTube channel analytics
- `/dashboard/tiktok` - TikTok analytics (planned)
- `/dashboard/payment-gated` - Subscription-protected features
- `/clerk-users-webhook` - Clerk webhook handler (Convex HTTP endpoint)

### Core Metrics

| Metric | Description |
|--------|-------------|
| **Viral Score** | Measures spread velocity and reach amplification |
| **Reception Score** | Measures audience engagement quality and sentiment |

### Authentication Flow
- Seamless sign-up/sign-in with Clerk
- Automatic user sync to Convex database
- Protected routes with middleware
- Social login support

### Payment Flow
- Custom Clerk pricing table component
- Subscription-based access control
- Real-time payment status updates

## Project Structure

```
├── app/
│   ├── (landing)/          # Landing page components
│   ├── dashboard/          # Protected dashboard
│   │   ├── youtube/        # YouTube analytics
│   │   └── payment-gated/  # Premium features
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Feature components
├── convex/                 # Backend functions
│   ├── schema.ts           # Database schema
│   ├── youtube.ts          # YouTube data functions
│   └── http.ts             # Webhook handlers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
└── middleware.ts           # Route protection
```

## Environment Variables

### Required for `.env.local`

| Variable | Description |
|----------|-------------|
| `CONVEX_DEPLOYMENT` | Your Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex client URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` | Clerk frontend API URL (from JWT template) |

### Required for Convex Dashboard

| Variable | Description |
|----------|-------------|
| `CLERK_WEBHOOK_SECRET` | Clerk webhook secret (Svix signing secret) |
| `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` | Clerk frontend API URL |

### Optional

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps |

## Deployment

### Vercel Deployment (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx convex dev` | Run Convex backend in development mode |
| `npx convex deploy` | Deploy Convex to production |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**ViralScope** - Know which content goes viral, and why.
