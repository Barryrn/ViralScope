---
name: security
description: Guide security practices from authentication to vulnerability prevention. Use when implementing auth flows (JWT, sessions, OAuth), handling authorization (RBAC, ABAC), protecting against injection attacks (SQL, XSS, CSRF), managing secrets and encryption, conducting security reviews, or addressing OWASP Top 10 vulnerabilities. Triggers: "security", "authentication", "authorization", "encryption", "vulnerability", "OWASP", "input validation", "secrets management", "XSS", "SQL injection".
---

# Security Principles

Security is a property of the entire system, not a feature. Design for defense in depth with multiple layers of protection. Assume breach and design to limit damage when (not if) something goes wrong.

## Foundational Principles

### Defense in Depth

No single control should be the only barrier. Layer your defenses:
1. **Network**: Firewalls, network segmentation
2. **Infrastructure**: Hardened servers, minimal services
3. **Application**: Input validation, output encoding
4. **Data**: Encryption, access controls
5. **Monitoring**: Detection, alerting, response

### Principle of Least Privilege

Grant only the minimum access needed for the task:
- Default to no access; add permissions explicitly
- Scope credentials narrowly (specific resources, not wildcards)
- Time-limit elevated privileges
- Regularly review and revoke unused access

### Fail Secure

When something goes wrong, fail to a secure state:
- Authentication failure → deny access (not grant)
- Parsing error → reject input (not proceed)
- Unknown state → require re-authentication

### Trust Nothing

Validate all input. Verify all claims. Authenticate all requests.
- Don't trust client-provided data
- Don't trust data from your own database without validation
- Don't trust internal services without authentication

## Authentication

### Password Security

**Storage**: Hash with modern algorithms (Argon2, bcrypt, scrypt), use unique salt per password, never store plaintext or reversible encryption.

**Requirements**: Minimum 12+ characters, no maximum length (except ~128), check against breached password lists, don't require arbitrary complexity rules.

**Handling**: Rate-limit login attempts, lock accounts after repeated failures, log authentication events, don't reveal whether username or password was wrong.

### Multi-Factor Authentication (MFA)

Factors: Something you **know** (password), **have** (phone, token), **are** (biometric).

- Require MFA for sensitive operations
- Support multiple second factors
- Have recovery procedures for lost factors
- Avoid SMS when possible (SIM swap attacks)

### Session Management

**Token principles**: Generate cryptographically random tokens, use sufficient entropy (128+ bits), set appropriate expiration, bind to client characteristics where possible.

**Session handling**: Regenerate session ID on privilege change, invalidate sessions on logout, implement idle timeout, allow users to view and revoke active sessions.

### OAuth and SSO

**Implementing OAuth**: Always validate the state parameter, use PKCE for public clients, verify token signatures, check audience claims.

**Common mistakes**: Accepting tokens without validation, not checking redirect URI, storing tokens insecurely, not handling token refresh properly.

## Authorization

### Access Control Models

| Model | Description | Best For |
|-------|-------------|----------|
| **RBAC** | Roles have permissions, users have roles | Most applications |
| **ABAC** | Decisions based on attributes | Complex, dynamic rules |
| **ReBAC** | Access based on relationships | Social graphs, hierarchies |
| **ACL** | Per-resource permission lists | File systems |

### Authorization Patterns

**Check at the boundary**: Validate permissions before processing, fail fast if unauthorized, don't leak information in denials.

**Check at the data layer**: Filter queries by allowed resources, verify ownership before operations, don't rely only on UI hiding things.

**Consistent enforcement**: Same rules for API and UI, same rules for all entry points, centralize authorization logic.

### Common Authorization Mistakes

- Checking permission once, then trusting forever
- Relying on hidden URLs or obscure IDs
- Not checking permission on every data access
- Allowing mass assignment of roles/permissions

## Input Validation

### General Principles

**Validate everything**: Reject by default, allow explicitly. Validate type, length, format, range. Validate on server (client validation is UX, not security).

**Sanitize with purpose**: Know what output context you're sanitizing for, use well-tested libraries, sanitize as late as possible.

### Injection Prevention

| Attack | Cause | Prevention |
|--------|-------|------------|
| **SQL Injection** | Untrusted data in queries | Parameterized queries |
| **Command Injection** | Untrusted data in shell commands | Avoid shell; use APIs |
| **XSS** | Untrusted data in HTML | Output encoding |
| **LDAP Injection** | Untrusted data in LDAP queries | Parameterized queries |
| **Path Traversal** | Untrusted data in file paths | Whitelist paths |

### SQL Injection Prevention

**Safe**: `SELECT * FROM users WHERE id = ?` (parameterized)
**Unsafe**: `SELECT * FROM users WHERE id = ' + userId + '` (concatenation)

### Cross-Site Scripting (XSS) Prevention

**Output encoding by context**: HTML context (entity encode), JavaScript context (JS escape), URL context (URL encode), CSS context (CSS escape).

**Content Security Policy (CSP)**: Restrict script sources, disable inline scripts, report violations.

**Framework protections**: Use framework's built-in escaping, be extra careful with "raw" or "unsafe" methods, avoid `innerHTML` with user data.

## Data Protection

### Encryption

**At rest**: Encrypt sensitive data in storage, use envelope encryption, manage keys separately from data, rotate keys periodically.

**In transit**: Use TLS 1.2+ for all connections, validate certificates, use strong cipher suites, implement HSTS for web applications.

### Sensitive Data Handling

**Identification**: Classify data by sensitivity, know what data you collect and why, map where sensitive data flows.

**Minimization**: Collect only what you need, delete when no longer needed, anonymize where possible.

**Access control**: Encrypt sensitive fields, mask in logs and displays, audit access to sensitive data.

### Secrets Management

- Never commit secrets to version control
- Rotate secrets regularly
- Use secret management services
- Audit secret access
- Inject secrets at runtime, not build time
- Use short-lived credentials where possible
- Different secrets for different environments

## API Security

### Authentication for APIs

**API keys**: Use for identification, not authentication. Rotate regularly, scope to specific operations, never expose in client-side code.

**OAuth tokens**: Validate on every request, check scopes and audience, handle expiration and refresh.

### Rate Limiting

- Limit by user/IP/API key
- Different limits for different operations
- Return clear limit information in headers
- Graceful degradation under load

### Request Validation

- Validate Content-Type headers
- Reject unexpected fields
- Limit request size
- Timeout long-running requests

## Infrastructure Security

**Server Hardening**: Minimize installed software, keep systems patched, disable unnecessary services, use host-based firewalls.

**Network Security**: Segment networks by trust level, use firewalls between segments, encrypt internal traffic, monitor network traffic.

**Container Security**: Use minimal base images, don't run as root, scan images for vulnerabilities, use read-only file systems where possible.

## Monitoring and Response

### Security Logging

**What to log**: Authentication events (success and failure), authorization failures, input validation failures, administrative actions, data access to sensitive records.

**How to log**: Structured format for parsing, sufficient context for investigation, no sensitive data in logs, immutable tamper-evident storage.

### Incident Response

**Preparation**: Document response procedures, define roles and responsibilities, have communication templates ready, practice with tabletop exercises.

**Response phases**: Detection → Containment → Eradication → Recovery → Lessons learned.

### Vulnerability Management

- Scan dependencies regularly
- Monitor security advisories
- Patch quickly (especially critical vulnerabilities)
- Have a process for emergency patches

## OWASP Top 10

For detailed vulnerability descriptions and prevention guidance, see [references/owasp-checklist.md](references/owasp-checklist.md).

## Security Checklist

Before shipping:

- [ ] All inputs validated on server side
- [ ] Parameterized queries for all database access
- [ ] Output encoded for context (HTML, JS, URL, etc.)
- [ ] Authentication uses secure password hashing
- [ ] Sessions are properly managed and expire
- [ ] Authorization checked on every request
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Secrets not in code or version control
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting in place
- [ ] Security events logged
- [ ] Error messages don't leak sensitive information
- [ ] HTTPS enforced everywhere
