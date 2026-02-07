---
name: testing
description: Guide testing strategy across unit, integration, and E2E test layers. Use when writing tests, choosing test approaches (TDD vs test-after), implementing test doubles (mocks, stubs, spies, fakes), designing test data with builders/factories, managing flaky tests, or setting up CI test pipelines. Triggers: "testing", "unit test", "integration test", "E2E", "end-to-end", "mocking", "test coverage", "test pyramid", "flaky tests", "TDD".
---

# Testing Strategy

Tests are documentation and a safety net for change. Write tests that provide value proportional to their maintenance burden. Test behavior, not implementation—tests should fail when the system breaks, not when you refactor it.

## The Testing Pyramid

```
              ┌───────────┐
              │    E2E    │    Few, slow, high confidence
              ├───────────┤
              │Integration│    Some, medium speed
              ├───────────┤
              │   Unit    │    Many, fast, focused
              └───────────┘
```

### Layer Characteristics

| Layer | Speed | Scope | Confidence | Maintenance |
|-------|-------|-------|------------|-------------|
| **Unit** | Fast (ms) | Single function/component | Low | Low |
| **Integration** | Medium (seconds) | Multiple components | Medium | Medium |
| **E2E** | Slow (minutes) | Full system | High | High |

### Recommended Distribution

- **70% Unit**: Fast feedback, easy to write
- **20% Integration**: Verify component interactions
- **10% E2E**: Critical user journeys

Adjust based on your system's characteristics.

## Unit Testing

### What to Test

**Good candidates**: Pure functions (same input → same output), business logic and calculations, data transformations, input validation, edge cases and error handling.

**Poor candidates**: Glue code with no logic, direct database queries, framework code.

### Principles

**Test behavior, not implementation**: Test what the function does, not how. Tests should survive refactoring. Avoid testing private methods.

**One assertion per concept**: Each test verifies one behavior. Multiple assertions are fine if testing one concept. Test name describes the behavior.

**Arrange-Act-Assert (AAA)**:
```
// Arrange: Set up preconditions
const calculator = new Calculator();

// Act: Execute the behavior
const result = calculator.add(2, 3);

// Assert: Verify the outcome
expect(result).toBe(5);
```

### Test Naming

Name tests to describe the behavior:
- `calculatesTotalWithTax`
- `returnsNullForInvalidInput`
- `throwsErrorWhenUnauthorized`

### Avoiding Brittle Tests

**Don't test**: Internal method calls, specific data structures (unless part of contract), execution order (unless it matters).

**Do test**: Return values, side effects (what changed), error conditions.

## Integration Testing

### What to Test

Integration tests verify that components work together:
- API endpoints (request → response)
- Database operations (write, then read)
- External service integrations
- Authentication flows

### Boundaries

Test at natural integration points:
- HTTP layer (test controllers with real routes)
- Database layer (test repositories with real database)
- Service layer (test services with real dependencies)

### Test Database Strategies

| Strategy | Speed | Isolation | Reality |
|----------|-------|-----------|---------|
| In-memory DB | Fast | High | Lower |
| Test containers | Medium | High | High |
| Shared test DB | Fast | Lower | High |
| Mocked DB | Fast | High | Lowest |

Use test containers for CI, in-memory for rapid local iteration, seed known data for deterministic tests.

### External Service Testing

**Options**:
- **Mocks**: Fast, controllable, may drift from reality
- **Stubs/Fakes**: Local implementations, more realistic
- **Contract tests**: Verify against service contracts
- **Real services**: Most realistic, slowest, flakiest

**Hybrid approach**: Use mocks for most integration tests, run contract tests periodically.

## End-to-End Testing

### What to Test

E2E tests verify complete user journeys:
- Critical paths (signup, purchase, core feature)
- Happy paths through key workflows
- Integration with third-party services

**Don't test everything E2E**: Edge cases (unit tests are better), error handling variations, visual styling.

### Principles

**Keep E2E tests stable**: Use stable selectors (data-testid, ARIA labels), wait for actual conditions not arbitrary timeouts, reset state between tests.

**Keep E2E tests fast**: Parallelize where possible, use API shortcuts for setup, test only what needs full stack.

### Flaky Test Prevention

**Common causes**: Race conditions (not waiting for state), shared state between tests, external service instability, animation timing issues.

**Solutions**: Explicit waits for conditions, isolated test data, retry logic for external services, disable animations in tests.

## Test Doubles

For detailed patterns on mocks, stubs, spies, and fakes, see [references/test-doubles.md](references/test-doubles.md).

### Quick Reference

| Type | Purpose | Behavior |
|------|---------|----------|
| **Dummy** | Fill parameter lists | No behavior |
| **Stub** | Provide canned responses | Returns preset values |
| **Spy** | Record calls | Tracks invocations |
| **Mock** | Verify interactions | Fails if not called correctly |
| **Fake** | Working implementation | Simpler version of real thing |

### Mocking Guidelines

**Don't mock what you don't own**: Wrap external libraries, mock the wrapper.

**Don't over-mock**: Mocking everything tests nothing. Prefer integration tests for interactions. Mock at boundaries, not everywhere.

## Test Design Patterns

### Test Data

**Builders/Factories**: Create test data with defaults
```
const user = UserBuilder.create()
  .withEmail("test@example.com")
  .withRole("admin")
  .build();
```

Only specify what's relevant to the test; defaults handle the rest.

### Page Objects (E2E)

Encapsulate page interactions:
```
class LoginPage {
  enterUsername(username) { ... }
  enterPassword(password) { ... }
  submit() { ... }
  getErrorMessage() { ... }
}
```

One place to update if UI changes, tests read like user actions, reusable across tests.

### Shared Setup

**Use sparingly**: Setup that's truly common, state that doesn't affect test behavior.

**Avoid**: Setup that makes tests interdependent, setup that obscures what's being tested, global state mutations.

## Testing Strategies

### When to Write Tests

**Test-Driven Development (TDD)**: Write failing test → Write minimal code to pass → Refactor.
- Benefits: Forces design thinking, high coverage
- Costs: Slower for exploratory code, learning curve

**Test-After**: Write code → Write tests.
- Benefits: Faster iteration, works for uncertain requirements
- Risk: Tests may not drive design, coverage gaps

**Hybrid approach**: TDD for well-understood problems, test-after for exploration then refactor with tests.

### Test Coverage

Coverage is a compass, not a target:
- 100% coverage doesn't mean bug-free
- 0% coverage is definitely a problem
- Prioritize: Business-critical code, complex logic, error handling, integration points

### Testing Legacy Code

1. Add characterization tests (capture current behavior)
2. Refactor with safety net
3. Add proper unit tests

Start at the highest level possible, work down as you refactor.

## Continuous Testing

### CI Integration

**On every commit**: All unit tests, fast integration tests, linting and type checking.

**On PR/merge**: Full integration tests, E2E tests for critical paths, security and vulnerability scans.

### Test Performance

Keep tests fast:
- Parallelize test execution
- Use test containers for databases
- Mock slow external services
- Profile and optimize slow tests

**Set time budgets**: Unit tests < 10 seconds, integration tests < 2 minutes, E2E tests < 10 minutes.

### Flaky Test Management

- Track flaky tests separately
- Quarantine until fixed
- Fix root cause, don't just retry
- Consider reliability as a test quality metric

## Common Pitfalls

### Testing Implementation Details
Testing how instead of what.
**Fix**: Test inputs and outputs, not internal steps.

### Too Many Mocks
Everything is mocked, nothing is tested.
**Fix**: More integration tests, fewer mocks.

### Slow Tests
Tests take too long to run.
**Fix**: Optimize slow tests, use test pyramid.

### Test Interdependence
Tests depend on each other's side effects.
**Fix**: Isolate tests, reset state.

### Over-Testing Trivial Code
Testing getters, setters, and glue code.
**Fix**: Focus on logic and behavior.

## Testing Checklist

Before shipping:

- [ ] Critical paths have E2E tests
- [ ] Business logic has unit tests
- [ ] Integration points have integration tests
- [ ] Edge cases and error conditions are tested
- [ ] Tests are independent and isolated
- [ ] Tests are fast enough to run frequently
- [ ] Test data is deterministic
- [ ] Flaky tests are tracked and managed
- [ ] Coverage is meaningful (not just high)
- [ ] Tests serve as documentation
