# Starter.diy - Elite Next.js SaaS Starter Kit

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Convex](https://img.shields.io/badge/Convex-Real--time-FF6B6B?style=flat-square)](https://convex.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

A modern, production-ready SaaS starter template for building full-stack applications using Next.js 15, Convex, Clerk, and Clerk Billing. The easiest way to start accepting payments with beautiful UI and seamless integrations.

[Live Demo](https://elite-next-clerk-convex-starter.vercel.app/) | [Documentation](#getting-started) | [Security](SECURITY.md) | [Notion AI Coding Handbook](https://www.notion.so/AI-Coding-Handbook-2f10952f1b368009aa9efa1daa118715)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Theme Customization](#theme-customization)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **Next.js 15 with App Router** - Latest React framework with server components
- **Turbopack** - Ultra-fast development with hot module replacement
- **TailwindCSS v4** - Modern utility-first CSS with custom design system
- **Clerk Authentication** - Complete user management with social logins
- **Clerk Billing** - Integrated subscription management and payments
- **Convex Real-time Database** - Serverless backend with real-time sync
- **Protected Routes** - Authentication-based route protection
- **Payment Gating** - Subscription-based content access
- **Beautiful 404 Page** - Custom animated error page
- **Dark/Light Theme** - System-aware theme switching
- **Responsive Design** - Mobile-first approach with modern layouts
- **Custom Animations** - React Bits and Framer Motion effects
- **shadcn/ui Components** - Modern component library with Radix UI
- **Interactive Dashboard** - Complete admin interface with charts
- **Webhook Integration** - Automated user and payment sync
- **Error Tracking** - Sentry integration with Convex error logging
- **Vercel Ready** - One-click deployment

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TailwindCSS v4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Motion Primitives** - Advanced animation components
- **Lucide React & Tabler Icons** - Beautiful icon libraries
- **Recharts** - Data visualization components
- **React Bits** - Custom animation components

### Backend & Services
- **Convex** - Real-time database and serverless functions
- **Clerk** - Authentication and user management
- **Clerk Billing** - Subscription billing and payments
- **Sentry** - Error tracking and monitoring
- **Svix** - Webhook handling and validation

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
git clone https://github.com/Barryrn/saas-setup.git
cd saas-setup
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

9. **Configure Clerk Billing:**
   - Set up your pricing plans in Clerk dashboard
   - Configure payment methods and billing settings

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
- `/` - Beautiful landing page with pricing
- `/dashboard` - Protected user dashboard
- `/dashboard/payment-gated` - Subscription-protected content
- `/clerk-users-webhook` - Clerk webhook handler (Convex HTTP endpoint)

### Authentication Flow
- Seamless sign-up/sign-in with Clerk
- Automatic user sync to Convex database
- Protected routes with middleware
- Social login support
- Automatic redirects to dashboard after auth

### Payment Flow
- Custom Clerk pricing table component
- Subscription-based access control
- Real-time payment status updates
- Webhook-driven payment tracking

### Database Schema
```typescript
// Users table
users: {
  name: string,
  externalId: string // Clerk user ID
}

// Payment attempts tracking
paymentAttempts: {
  payment_id: string,
  userId: Id<"users">,
  payer: { user_id: string },
  // ... additional payment data
}

// Error logging for Sentry sync
errorLogs: {
  functionName: string,
  category: string,
  severity: string,
  errorMessage: string,
  sentToSentry: boolean,
  // ... additional metadata
}
```

## Project Structure

```
├── app/
│   ├── (landing)/          # Landing page components
│   │   ├── hero-section.tsx
│   │   ├── features-one.tsx
│   │   ├── pricing.tsx
│   │   └── ...
│   ├── dashboard/          # Protected dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── payment-gated/
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── not-found.tsx       # Custom 404 page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── magicui/            # Magic UI animations
│   ├── motion-primitives/  # Motion components
│   ├── react-bits/         # React Bits animations
│   ├── kokonutui/          # KokonutUI components
│   ├── custom-clerk-pricing.tsx
│   ├── theme-provider.tsx
│   └── ...
├── convex/                 # Backend functions
│   ├── schema.ts           # Database schema
│   ├── users.ts            # User management
│   ├── paymentAttempts.ts  # Payment tracking
│   ├── errors.ts           # Error handling
│   └── http.ts             # Webhook handlers
├── lib/
│   └── utils.ts            # Utility functions
└── middleware.ts           # Route protection
```

## Key Components

### Landing Page
- **Hero Section** - Animated hero with CTAs
- **Features Section** - Interactive feature showcase
- **Pricing Table** - Custom Clerk billing integration
- **Testimonials** - Social proof section
- **FAQ Section** - Common questions
- **Footer** - Links and information

### Dashboard
- **Sidebar Navigation** - Collapsible sidebar with user menu
- **Interactive Charts** - Data visualization with Recharts
- **Data Tables** - Sortable and filterable tables
- **Payment Gating** - Subscription-based access control

### Animations & Effects
- **Splash Cursor** - Interactive cursor effects
- **Animated Lists** - Smooth list animations
- **Progressive Blur** - Modern blur effects
- **Infinite Slider** - Continuous scrolling elements

## Theme Customization

The starter kit includes a fully customizable theme system. You can customize colors, typography, and components using:

- **Theme Tools**: [tweakcn.com](https://tweakcn.com/editor/theme?tab=typography), [themux.vercel.app](https://themux.vercel.app/shadcn-themes), or [ui.jln.dev](https://ui.jln.dev/)
- **Global CSS**: Modify `app/globals.css` for custom styling
- **Component Themes**: Update individual component styles in `components/ui/`

## Environment Variables

### Required for `.env.local`

| Variable | Description |
|----------|-------------|
| `CONVEX_DEPLOYMENT` | Your Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex client URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` | Clerk frontend API URL (from JWT template) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL` | Redirect after sign in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL` | Redirect after sign up |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Fallback redirect for sign in |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Fallback redirect for sign up |

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

The project is optimized for Vercel with:
- Automatic builds with Turbopack
- Environment variable management
- Edge function support

### Manual Deployment

Build for production:

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

#### "Clerk JWT template not found" or Authentication Errors

**Problem:** Users can't authenticate or see "Invalid JWT" errors.

**Solution:**
1. Ensure you created a JWT template named exactly **"convex"** in Clerk dashboard
2. Copy the Issuer URL to `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`
3. Set this URL in both `.env.local` AND Convex dashboard environment variables
4. Restart both dev servers

#### Webhooks Not Working

**Problem:** User data not syncing from Clerk to Convex.

**Solution:**
1. Verify webhook URL is correct: `{your_convex_url}/clerk-users-webhook`
2. Ensure `CLERK_WEBHOOK_SECRET` is set in **Convex dashboard** (not `.env.local`)
3. Check Clerk webhook logs for delivery failures
4. Verify you enabled the correct events: `user.created`, `user.updated`, `user.deleted`

#### "Cannot find module" or Build Errors

**Problem:** Missing dependencies or TypeScript errors.

**Solution:**
```bash
rm -rf node_modules .next
npm install
npm run build
```

#### Convex Connection Issues

**Problem:** "Failed to connect to Convex" or real-time updates not working.

**Solution:**
1. Ensure Convex dev server is running: `npx convex dev`
2. Check `NEXT_PUBLIC_CONVEX_URL` matches your deployment
3. Run `npx convex dev` to resync schema if needed

#### Styling Not Applying

**Problem:** TailwindCSS classes not working.

**Solution:**
1. Ensure `app/globals.css` is imported in `app/layout.tsx`
2. Check that the path in `tailwind.config.ts` includes your component directories
3. Restart the dev server

#### Payment Gating Not Working

**Problem:** Subscription-protected content accessible without payment.

**Solution:**
1. Verify Clerk Billing is configured in your Clerk dashboard
2. Check that `paymentAttempt.updated` webhook event is enabled
3. Ensure the pricing component is using correct plan IDs

### Getting Help

- Check the [Notion AI Coding Handbook](https://www.notion.so/AI-Coding-Handbook-2f10952f1b368009aa9efa1daa118715) for tips and guides
- Check the [Convex Docs](https://docs.convex.dev) for backend issues
- See [Clerk Docs](https://clerk.com/docs) for authentication problems
- Review [Next.js Docs](https://nextjs.org/docs) for framework questions
- Open an [issue](https://github.com/YOUR_USERNAME/saas-setup/issues) for bugs

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx convex dev` | Run Convex backend in development mode |
| `npx convex deploy` | Deploy Convex to production |

## Why Starter.diy?

**THE EASIEST TO SET UP. EASIEST IN TERMS OF CODE.**

- **Clerk + Convex + Clerk Billing** make it incredibly simple
- **No complex payment integrations** - Clerk handles everything
- **Real-time user sync** - Webhooks work out of the box
- **Beautiful UI** - Tailark.com inspired landing page blocks
- **Production ready** - Authentication, payments, and database included
- **Type safe** - Full TypeScript support throughout
- **Error tracking** - Sentry integration with structured error handling


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Stop rebuilding the same foundation over and over.** Starter.diy eliminates weeks of integration work by providing a complete, production-ready SaaS template with authentication, payments, and real-time data working seamlessly out of the box.

Built with Next.js 15, Convex, Clerk, and modern web technologies.
