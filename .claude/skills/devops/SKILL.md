---
name: devops
description: Guide DevOps practices for CI/CD, deployment, and infrastructure management. Use when setting up CI pipelines, configuring deployment strategies (rolling, blue-green, canary), managing environments, implementing monitoring/alerting/observability, establishing SLOs and error budgets, or handling disaster recovery and backups. Triggers: "CI/CD", "deployment", "infrastructure", "monitoring", "DevOps", "pipeline", "alerting", "SLO", "disaster recovery", "Docker", "Kubernetes".
---

# DevOps & Deployment

Reduce friction between writing code and running it reliably in production. Achieve short feedback loops, reproducible environments, and confidence in every deployment. If it's not automated, it's not reliable. If it's not measured, it's not managed.

## Continuous Integration

### CI Fundamentals

Every commit should be buildable and testable. The main branch should always be deployable.

- Merge frequently (at least daily)
- Run tests on every push
- Keep builds fast (under 10 minutes ideal)
- Fix broken builds immediately

### Pipeline Stages

```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  Lint   │ → │  Build  │ → │  Test   │ → │ Package │ → │ Deploy  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

- **Lint**: Catch style and syntax issues early
- **Build**: Verify compilation and dependencies
- **Test**: Unit tests, integration tests (fast feedback)
- **Package**: Create deployable artifacts
- **Deploy**: Push to environment (staging, production)

### Build Optimization

- Cache dependencies between runs
- Parallelize independent tasks
- Only rebuild what changed
- Use incremental builds where possible

## Continuous Deployment

### Deployment Strategies

| Strategy | Description | Risk | Rollback |
|----------|-------------|------|----------|
| **All-at-once** | Replace everything | High | Redeploy old version |
| **Rolling** | Replace instances gradually | Medium | Stop and reverse |
| **Blue-green** | Run two environments, switch traffic | Low | Switch back |
| **Canary** | Route small % to new version | Low | Route away from canary |
| **Feature flags** | Code deployed, feature toggled | Lowest | Toggle off |

**Choosing a strategy**:
- Small team, simple app: All-at-once is fine
- Need zero downtime: Blue-green or rolling
- Need to test in production: Canary
- Need instant rollback: Feature flags

### Deployment Principles

- Deploy the same artifact to all environments
- Environment differences should be configuration only
- Deployments should be reversible
- Deployments should be observable

### Release vs. Deploy

**Deployment**: Putting code on servers
**Release**: Making features available to users

Decouple these with feature flags:
- Deploy frequently (multiple times per day)
- Release deliberately (when ready)
- Roll out gradually (percentage-based)
- Roll back instantly (no redeployment needed)

## Environment Management

### Environment Parity

Keep development, staging, and production as similar as possible.

**Differences that cause bugs**: Different database versions, OS/runtime versions, missing environment variables, different network configurations.

**Minimize differences with**: Containers for consistent runtime, infrastructure as code, shared configuration templates, regular production data snapshots for testing.

### Configuration Management

- Store configuration separate from code
- Use environment variables for environment-specific values
- Never commit secrets to version control
- Use secret management services for sensitive data

**Configuration hierarchy**:
1. Defaults in code (development-safe)
2. Environment variables override defaults
3. Secrets from secure storage override environment

### Infrastructure as Code

Define infrastructure declaratively. Version control it like application code.

- Review infrastructure changes like code changes
- Test infrastructure changes in staging first
- Use modules/templates for common patterns
- Avoid manual console changes

## Monitoring & Observability

### Three Pillars

**Logs**: Discrete events with context
- Structured format (JSON)
- Include request IDs for tracing
- Appropriate log levels (debug, info, warn, error)
- Centralized aggregation

**Metrics**: Numeric measurements over time
- Request rate, latency, error rate
- Resource utilization (CPU, memory, disk)
- Business metrics (signups, transactions)
- Percentiles over averages (p50, p95, p99)

**Traces**: Request flow across services
- End-to-end latency breakdown
- Service dependency visualization
- Bottleneck identification
- Error propagation tracking

### Alerting Principles

**Alert on symptoms, not causes**:
- Alert: "Error rate > 1%" (symptom)
- Don't alert: "Database CPU > 80%" (cause, unless it affects users)

**Reduce noise**:
- Every alert should be actionable
- If you ignore it, delete it
- Use severity levels appropriately
- Group related alerts

### Health Checks

**Liveness**: Is the service running? Simple endpoint that returns 200. Don't include dependency checks. Used for restart decisions.

**Readiness**: Can the service handle traffic? Check critical dependencies. Return 503 if not ready. Used for load balancer routing.

**Deep health**: Are all dependencies healthy? Used for debugging, not routing.

## Reliability Engineering

### Service Level Objectives (SLOs)

- **SLI (Indicator)**: What you measure (latency, availability, error rate)
- **SLO (Objective)**: Target for the SLI (99.9% availability)
- **SLA (Agreement)**: Contractual commitment (often less than SLO)

**Setting SLOs**: Start with current performance, consider user expectations, balance reliability with velocity, leave error budget for innovation.

### Error Budgets

If your SLO is 99.9%, you have 0.1% error budget per period.

**When budget is healthy**: Ship faster, take more risks
**When budget is depleted**: Focus on reliability, slow releases

### Incident Management

**During incident**:
1. Detect and acknowledge
2. Communicate status
3. Mitigate impact (not root cause)
4. Resolve and verify

**After incident**: Write blameless post-mortem, identify root cause, define action items, share learnings.

## Security in DevOps

### Shift Left Security

Integrate security checks early in the pipeline:
- Dependency vulnerability scanning
- Static code analysis (SAST)
- Secret detection in commits
- Container image scanning
- Infrastructure configuration scanning

### Secrets Management

- Never commit secrets to version control
- Rotate secrets regularly
- Use short-lived credentials where possible
- Audit secret access

### Access Control

- Principle of least privilege for all systems
- Use role-based access control
- Require MFA for production access
- Audit and review access regularly

## Disaster Recovery

### Backup Strategy

**3-2-1 Rule**: 3 copies of data, 2 different storage types, 1 offsite location.

- Automate backup processes
- Test restores regularly
- Document recovery procedures
- Monitor backup success

### Recovery Objectives

**RTO (Recovery Time Objective)**: How long can you be down?
**RPO (Recovery Point Objective)**: How much data can you lose?

These drive your backup frequency and recovery strategy.

### Chaos Engineering

Proactively test failure modes:
- Start small (kill a single instance)
- Run in production (carefully)
- Have clear hypotheses
- Stop if unexpected behavior occurs

## Common Pitfalls

### Snowflake Servers
Manually configured servers that are hard to reproduce.
**Fix**: Infrastructure as code, immutable deployments.

### Alert Fatigue
Too many alerts, all ignored.
**Fix**: Delete noisy alerts, tune thresholds, require runbooks.

### Configuration Drift
Environments diverge over time.
**Fix**: Infrastructure as code, regular environment comparison.

### Manual Deployments
Deployments require human steps.
**Fix**: Automate everything, one-click deploys.

## DevOps Checklist

Before going to production:

- [ ] CI pipeline runs on every commit
- [ ] All tests pass before merge
- [ ] Deployments are automated
- [ ] Configuration is externalized
- [ ] Secrets are securely managed
- [ ] Logs are centralized and searchable
- [ ] Metrics and dashboards exist
- [ ] Alerts are configured for critical issues
- [ ] Health checks are implemented
- [ ] Rollback procedure is documented and tested
- [ ] Backup and restore is tested
- [ ] Runbooks exist for common issues
