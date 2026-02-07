import * as Sentry from '@sentry/nextjs';

/**
 * Validates required environment variables at startup.
 * Throws an error if critical variables are missing.
 */
function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_CONVEX_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  // These are only required in production
  const requiredInProduction = [
    'ERROR_SYNC_SECRET',
    'NEXT_PUBLIC_SENTRY_DSN',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}. Check your .env.local file.`;
    console.error(`\n${'='.repeat(60)}\nENVIRONMENT ERROR\n${'='.repeat(60)}\n${message}\n${'='.repeat(60)}\n`);

    // In production, fail hard. In development, warn but continue.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }
  }
}

export async function register() {
  // Validate environment on startup
  validateEnvironment();

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;