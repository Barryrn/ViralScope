# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send details to [INSERT_SECURITY_EMAIL]
2. **GitHub Security Advisories**: Use [GitHub's private vulnerability reporting](https://github.com/YOUR_ORG/saas-setup/security/advisories/new)

### What to Include

Please include the following information in your report:

- **Description**: A clear description of the vulnerability
- **Impact**: Potential impact and severity assessment
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Components**: Which parts of the codebase are affected
- **Suggested Fix**: If you have one, a suggested remediation

### Response Timeline

- **Initial Response**: Within 48 hours of receiving your report
- **Status Update**: Within 7 days with our assessment
- **Resolution Timeline**: Depends on severity, typically:
  - Critical: 24-72 hours
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

### What to Expect

1. **Acknowledgment**: We'll confirm receipt of your report
2. **Assessment**: We'll investigate and assess the vulnerability
3. **Communication**: We'll keep you informed of our progress
4. **Credit**: With your permission, we'll credit you in our security advisories

## Security Best Practices for Users

When deploying this starter kit, follow these security guidelines:

### Environment Variables

- **Never commit** `.env.local` or any file containing secrets
- Store sensitive keys only in:
  - `.env.local` (local development - gitignored)
  - Vercel Environment Variables (production)
  - Convex Dashboard (backend secrets like `CLERK_WEBHOOK_SECRET`)
- Rotate secrets periodically, especially after team member offboarding

### Clerk Authentication

- Enable **multi-factor authentication** for your Clerk application
- Configure appropriate **session lifetimes**
- Review and restrict **allowed OAuth providers**
- Set up **bot protection** if available
- Regularly audit your Clerk user list

### Convex Backend

- Use **internal mutations** for webhook handlers (not exposed to clients)
- Validate all user input using Convex validators
- Implement proper **authorization checks** in queries and mutations
- Never expose sensitive data in query responses
- Use the `ConvexAppError` class for structured error handling

### Webhook Security

- Always validate webhook signatures using Svix
- Set `CLERK_WEBHOOK_SECRET` in Convex Dashboard (not client-accessible)
- Return 200 for processed webhooks to prevent retry storms
- Log webhook errors for monitoring without exposing sensitive data

### API Routes

- Protect all API routes with appropriate authentication
- Use bearer tokens for machine-to-machine communication
- Implement rate limiting for public endpoints
- Validate and sanitize all inputs

### Production Deployment

- Enable HTTPS only (Vercel does this by default)
- Configure appropriate CORS policies
- Set up error monitoring (Sentry integration included)
- Implement logging and alerting for security events
- Keep all dependencies updated

## Known Security Considerations

### Sensitive Data Handling

The `sanitizeArgs` function in [convex/errors.ts](convex/errors.ts) automatically redacts sensitive fields before logging:

- Passwords
- Tokens
- Secrets
- API keys
- Credit card information
- CVV
- SSN
- Authorization headers

### Error Logging

The error logging system stores errors in Convex before syncing to Sentry. Be aware that:

- Error metadata may contain request context
- User IDs are logged for debugging (not PII)
- Stack traces are stored for debugging purposes

## Dependencies

We regularly update dependencies to address security vulnerabilities. Check for updates using:

```bash
npm audit
npm outdated
```

## Security Headers

When deploying, ensure these security headers are configured (Vercel's defaults handle most):

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (customize based on your needs)

## Acknowledgments

We thank the security researchers who have helped improve this project by responsibly disclosing vulnerabilities.

---

Thank you for helping keep Starter.diy and its users safe!
