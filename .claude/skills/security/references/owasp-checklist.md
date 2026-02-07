# OWASP Top 10 Reference

Detailed vulnerability descriptions and prevention guidance for the OWASP Top 10 web application security risks.

## Table of Contents

1. [Broken Access Control](#broken-access-control)
2. [Cryptographic Failures](#cryptographic-failures)
3. [Injection](#injection)
4. [Insecure Design](#insecure-design)
5. [Security Misconfiguration](#security-misconfiguration)
6. [Vulnerable Components](#vulnerable-components)
7. [Authentication Failures](#authentication-failures)
8. [Integrity Failures](#integrity-failures)
9. [Logging Failures](#logging-failures)
10. [Server-Side Request Forgery](#server-side-request-forgery)

---

## Broken Access Control

**Description**: Users act outside their intended permissions. This includes accessing unauthorized functions, viewing other users' data, or modifying access rights.

**Common Vulnerabilities**:
- Bypassing access control by modifying URLs or parameters
- Viewing or editing another user's data by changing the identifier
- Privilege escalation (acting as admin without being logged in as admin)
- Missing access control for POST, PUT, DELETE operations
- CORS misconfiguration allowing unauthorized API access

**Prevention**:
- Deny by default (except public resources)
- Implement access control mechanisms once and reuse throughout the application
- Enforce record ownership
- Disable directory listing and remove metadata from web roots
- Log access control failures and alert on repeated failures
- Rate limit API access to minimize automated attack damage
- Invalidate session tokens on logout
- Use short-lived JWT tokens

---

## Cryptographic Failures

**Description**: Failures related to cryptography (or lack thereof) which often leads to sensitive data exposure.

**Common Vulnerabilities**:
- Transmitting data in clear text (HTTP, FTP, SMTP)
- Using old or weak cryptographic algorithms
- Using default or weak encryption keys
- Not enforcing encryption (missing security directives)
- Not properly validating certificates
- Using deprecated hash functions (MD5, SHA1) for passwords

**Prevention**:
- Classify data and identify sensitive data according to privacy laws and business needs
- Don't store sensitive data unnecessarily
- Encrypt all sensitive data at rest
- Use up-to-date strong algorithms, protocols, and keys
- Encrypt all data in transit with TLS; enforce with HSTS
- Use authenticated encryption instead of just encryption
- Store passwords using strong adaptive hashing functions (Argon2, bcrypt, scrypt)
- Use proper key management

---

## Injection

**Description**: User-supplied data is not validated, filtered, or sanitized by the application and is sent to an interpreter as part of a command or query.

**Common Types**:
- SQL injection
- NoSQL injection
- OS command injection
- LDAP injection
- Expression Language (EL) injection
- Object Graph Navigation Library (OGNL) injection

**Prevention**:
- Use safe APIs that avoid using the interpreter entirely (parameterized queries)
- Use positive server-side input validation
- Escape special characters for any remaining dynamic queries
- Use LIMIT and other SQL controls to prevent mass disclosure
- Use code review and automated testing to detect injection flaws

**Example - SQL Injection Prevention**:
```
UNSAFE: query = "SELECT * FROM users WHERE id = '" + userId + "'"

SAFE: query = "SELECT * FROM users WHERE id = ?"
      preparedStatement.setString(1, userId)
```

---

## Insecure Design

**Description**: Missing or ineffective security controls at the design level, before code is written.

**Common Vulnerabilities**:
- Missing business logic controls
- No threat modeling during design
- Absence of secure design patterns
- No security requirements gathered

**Prevention**:
- Establish and use a secure development lifecycle with security professionals
- Use threat modeling for critical authentication, access control, business logic
- Integrate security language and controls into user stories
- Use reference architectures that apply security design patterns
- Write unit and integration tests to validate all critical flows

---

## Security Misconfiguration

**Description**: Missing security hardening, improper permissions, unnecessary features enabled, default accounts unchanged.

**Common Vulnerabilities**:
- Missing security hardening across the application stack
- Unnecessary features enabled (ports, services, pages, accounts, privileges)
- Default accounts and passwords still enabled
- Error handling reveals stack traces or sensitive information
- Security settings not set to secure values
- Missing or old software

**Prevention**:
- Repeatable hardening process to deploy a secure environment
- Minimal platform without unnecessary features, components, documentation
- Review and update configurations for all security notes, updates, and patches
- Segmented application architecture for separation between components
- Send security directives to clients (CSP, etc.)
- Automated process to verify the effectiveness of configurations

---

## Vulnerable Components

**Description**: Using components (libraries, frameworks, software modules) with known vulnerabilities.

**Common Vulnerabilities**:
- Using components with known CVEs
- Not knowing versions of all components (including nested dependencies)
- Not scanning for vulnerabilities regularly
- Not fixing or upgrading the underlying platform in a timely fashion
- Software developers not testing compatibility of updated libraries

**Prevention**:
- Remove unused dependencies, features, components, files, and documentation
- Continuously inventory versions of both client-side and server-side components
- Monitor sources like CVE and NVD for vulnerabilities
- Use software composition analysis tools to automate the process
- Subscribe to email alerts for security vulnerabilities related to your components
- Only obtain components from official sources over secure links
- Prefer signed packages

---

## Authentication Failures

**Description**: Weaknesses in authentication and session management allow attackers to compromise passwords, keys, or session tokens.

**Common Vulnerabilities**:
- Permitting brute force or other automated attacks
- Permitting default, weak, or well-known passwords
- Using weak credential recovery processes
- Using plain text or weakly hashed password stores
- Missing or ineffective multi-factor authentication
- Exposing session identifier in the URL
- Reusing session identifier after successful login
- Not properly invalidating session IDs

**Prevention**:
- Implement multi-factor authentication
- Do not ship or deploy with default credentials
- Check for weak passwords against top 10000 worst passwords
- Use NIST 800-63b guidelines for length, complexity, and rotation policies
- Ensure registration, credential recovery use the same messages for all outcomes
- Limit or delay failed login attempts; log all failures
- Use a server-side session manager that generates random session IDs

---

## Integrity Failures

**Description**: Code and infrastructure that does not protect against integrity violations, including insecure CI/CD pipelines and auto-update functionality.

**Common Vulnerabilities**:
- Relying on plugins, libraries, or modules from untrusted sources
- Insecure CI/CD pipeline allowing for unauthorized access or malicious code
- Auto-update functionality that downloads updates without integrity verification
- Objects or data encoded/serialized to a format an attacker can modify

**Prevention**:
- Use digital signatures to verify software/data is from expected source
- Ensure libraries and dependencies are from trusted repositories
- Use a software supply chain security tool to verify components
- Review code and config changes to minimize malicious code introduction
- Ensure CI/CD pipeline has proper segregation, configuration, and access control
- Ensure unsigned or unencrypted serialized data is not sent to untrusted clients

---

## Logging Failures

**Description**: Insufficient logging, detection, monitoring, and active response that allows attackers to maintain presence.

**Common Vulnerabilities**:
- Auditable events like logins and failures are not logged
- Warnings and errors generate no, inadequate, or unclear log messages
- Logs are only stored locally
- Appropriate alerting thresholds are not in place
- Penetration testing and DAST tools don't trigger alerts
- Application cannot detect, escalate, or alert for active attacks in real-time

**Prevention**:
- Log all login, access control, and server-side input validation failures
- Ensure logs are generated in a format that can be consumed by log management solutions
- Ensure high-value transactions have an audit trail with integrity controls
- Establish effective monitoring and alerting for suspicious activities
- Establish or adopt an incident response and recovery plan

---

## Server-Side Request Forgery

**Description**: SSRF occurs when a web application fetches a remote resource without validating the user-supplied URL.

**Common Vulnerabilities**:
- Fetching URLs from user input without validation
- Making requests to internal services using user-provided URLs
- Accessing cloud service metadata endpoints

**Prevention**:

**Network Layer**:
- Segment remote resource access functionality in separate networks
- Enforce "deny by default" firewall policies

**Application Layer**:
- Sanitize and validate all client-supplied input data
- Enforce URL schema, port, and destination with positive allow list
- Disable HTTP redirections
- Do not send raw responses to clients
- Be aware of URL consistency to avoid attacks like DNS rebinding

---

## Quick Reference Checklist

| # | Vulnerability | Key Prevention |
|---|---------------|----------------|
| 1 | Broken Access Control | Deny by default, enforce record ownership |
| 2 | Cryptographic Failures | Encrypt sensitive data, use strong algorithms |
| 3 | Injection | Parameterized queries, input validation |
| 4 | Insecure Design | Threat modeling, secure design patterns |
| 5 | Security Misconfiguration | Hardening process, minimal platform |
| 6 | Vulnerable Components | Inventory dependencies, continuous scanning |
| 7 | Authentication Failures | MFA, strong password policies, secure sessions |
| 8 | Integrity Failures | Digital signatures, secure CI/CD |
| 9 | Logging Failures | Log security events, monitoring, alerting |
| 10 | SSRF | Validate URLs, network segmentation |
