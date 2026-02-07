# Test Doubles Reference

Detailed patterns and examples for test doubles: dummies, stubs, spies, mocks, and fakes.

## Table of Contents

1. [Overview](#overview)
2. [Dummy Objects](#dummy-objects)
3. [Stubs](#stubs)
4. [Spies](#spies)
5. [Mocks](#mocks)
6. [Fakes](#fakes)
7. [Choosing the Right Double](#choosing-the-right-double)
8. [Best Practices](#best-practices)

---

## Overview

Test doubles are objects that stand in for real dependencies during testing. They allow you to:
- Isolate the code under test
- Control test scenarios
- Verify interactions
- Speed up tests

### The Five Types

| Type | Returns Values | Records Calls | Verifies Behavior | Real Implementation |
|------|---------------|---------------|-------------------|---------------------|
| Dummy | No | No | No | No |
| Stub | Yes | No | No | No |
| Spy | Yes (optional) | Yes | No | No |
| Mock | Yes (optional) | Yes | Yes | No |
| Fake | Yes | No | No | Yes (simplified) |

---

## Dummy Objects

**Purpose**: Fill parameter lists when the value isn't used.

**Characteristics**:
- No behavior or assertions
- Often null, empty objects, or placeholder values
- Used to satisfy type requirements

**Example**:
```javascript
// The logger is required but not used in this test
const dummyLogger = {};

const service = new PaymentService(realPaymentGateway, dummyLogger);
const result = service.processPayment(100);

expect(result.success).toBe(true);
```

**When to use**: When a dependency is required by the constructor/method signature but irrelevant to the specific test case.

---

## Stubs

**Purpose**: Provide predetermined responses to calls made during the test.

**Characteristics**:
- Return canned values
- Don't verify how they're called
- Control the test scenario

**Example**:
```javascript
// Stub that returns a fixed user
const userRepositoryStub = {
  findById: (id) => ({
    id: id,
    name: "Test User",
    email: "test@example.com",
    role: "admin"
  })
};

const service = new UserService(userRepositoryStub);
const user = service.getUser("123");

expect(user.name).toBe("Test User");
```

**Example - Error scenarios**:
```javascript
// Stub that simulates a database error
const failingRepositoryStub = {
  findById: () => { throw new Error("Connection failed"); }
};

const service = new UserService(failingRepositoryStub);

expect(() => service.getUser("123")).toThrow("Connection failed");
```

**When to use**: When you need to control what a dependency returns to test specific scenarios.

---

## Spies

**Purpose**: Record information about how they were called.

**Characteristics**:
- Track call count, arguments, return values
- May or may not have implementation
- Don't fail tests automatically

**Example**:
```javascript
// Spy that tracks calls
const emailServiceSpy = {
  calls: [],
  sendEmail(to, subject, body) {
    this.calls.push({ to, subject, body });
    return true;
  }
};

const service = new NotificationService(emailServiceSpy);
service.notifyUser("user@example.com", "Welcome!");

// Verify the spy was called correctly
expect(emailServiceSpy.calls.length).toBe(1);
expect(emailServiceSpy.calls[0].to).toBe("user@example.com");
expect(emailServiceSpy.calls[0].subject).toContain("Welcome");
```

**Example with testing framework**:
```javascript
// Using Jest spy
const emailService = { sendEmail: jest.fn().mockReturnValue(true) };

const service = new NotificationService(emailService);
service.notifyUser("user@example.com", "Welcome!");

expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
expect(emailService.sendEmail).toHaveBeenCalledWith(
  "user@example.com",
  expect.stringContaining("Welcome"),
  expect.any(String)
);
```

**When to use**: When you need to verify that a method was called with specific arguments, or called a specific number of times.

---

## Mocks

**Purpose**: Pre-programmed with expectations that form a specification of calls they are expected to receive.

**Characteristics**:
- Verify interactions occurred as expected
- Fail the test if expectations aren't met
- More strict than spies

**Example**:
```javascript
// Using a mocking framework
const paymentGateway = mock(PaymentGateway);

// Set expectation
when(paymentGateway.charge(100, "USD")).thenReturn({ success: true });

const service = new CheckoutService(paymentGateway);
service.checkout(cartWith100DollarTotal);

// Verify expectation was met
verify(paymentGateway).charge(100, "USD");
```

**Example - Order verification**:
```javascript
const auditLogger = mock(AuditLogger);

// Expect calls in specific order
inOrder(auditLogger).verify(
  auditLogger.log("Payment started"),
  auditLogger.log("Payment processed"),
  auditLogger.log("Payment completed")
);
```

**When to use**: When the interaction itself is the behavior you're testing (e.g., "when checkout succeeds, it must charge the card").

---

## Fakes

**Purpose**: Working implementations with simplified behavior.

**Characteristics**:
- Actual implementation, but simpler than production
- May use in-memory storage instead of database
- Suitable for integration testing

**Example - In-memory repository**:
```javascript
class FakeUserRepository {
  constructor() {
    this.users = new Map();
  }

  save(user) {
    this.users.set(user.id, { ...user });
    return user;
  }

  findById(id) {
    return this.users.get(id) || null;
  }

  findByEmail(email) {
    return [...this.users.values()].find(u => u.email === email);
  }

  delete(id) {
    return this.users.delete(id);
  }
}

// Usage
const fakeRepo = new FakeUserRepository();
const service = new UserService(fakeRepo);

const user = service.createUser({ name: "Test", email: "test@example.com" });
const found = service.findUser(user.id);

expect(found.name).toBe("Test");
```

**Example - Fake payment gateway**:
```javascript
class FakePaymentGateway {
  constructor() {
    this.transactions = [];
  }

  charge(amount, currency, cardToken) {
    // Simulate card validation
    if (cardToken === "invalid_card") {
      return { success: false, error: "Card declined" };
    }

    const transaction = {
      id: `txn_${Date.now()}`,
      amount,
      currency,
      status: "completed"
    };
    this.transactions.push(transaction);
    return { success: true, transaction };
  }

  refund(transactionId) {
    const txn = this.transactions.find(t => t.id === transactionId);
    if (!txn) return { success: false, error: "Transaction not found" };
    txn.status = "refunded";
    return { success: true };
  }
}
```

**When to use**: When stubs are too simple and you need realistic behavior, but the real implementation is too slow or complex.

---

## Choosing the Right Double

### Decision Guide

```
Do you need to verify the dependency was called?
├── No → Is the dependency actually used?
│   ├── No → Use DUMMY
│   └── Yes → Use STUB or FAKE
│       └── Need realistic behavior?
│           ├── Yes → Use FAKE
│           └── No → Use STUB
└── Yes → How strict?
    ├── Just record → Use SPY
    └── Fail if wrong → Use MOCK
```

### Common Scenarios

| Scenario | Recommended Double |
|----------|-------------------|
| Test error handling | Stub (returns error) |
| Verify email was sent | Spy or Mock |
| Test with database | Fake (in-memory) |
| Satisfy unused parameter | Dummy |
| Test external API integration | Stub with recorded responses |
| Verify audit logging | Mock (order matters) |

---

## Best Practices

### Don't Mock What You Don't Own

**Problem**: Mocking third-party libraries couples tests to implementation details.

**Solution**: Create a wrapper/adapter around external dependencies, then mock the wrapper.

```javascript
// BAD: Mocking the library directly
const axios = mock(axios);

// GOOD: Create an adapter
class HttpClient {
  async get(url) { return axios.get(url); }
}

// Then mock your adapter
const httpClient = mock(HttpClient);
```

### Avoid Over-Mocking

**Problem**: When everything is mocked, you're testing nothing.

```javascript
// BAD: Testing that mocks return what you told them to return
const repo = mock(UserRepo);
when(repo.findById("1")).thenReturn({ id: "1", name: "Test" });
const service = new UserService(repo);
expect(service.getUser("1").name).toBe("Test"); // Tests nothing useful
```

**Solution**: Only mock external boundaries, prefer integration tests for business logic.

### Keep Stubs Simple

**Problem**: Complex stubs with lots of logic become maintenance burdens.

```javascript
// BAD: Stub with too much logic
const complexStub = {
  getData(params) {
    if (params.type === "A" && params.status === "active") {
      return this.filterByDate(this.cache[params.id]);
    }
    // ... more logic
  }
};

// GOOD: Simple, focused stubs
const stubForActiveTypeA = {
  getData: () => [{ id: 1, value: "test" }]
};
```

### Reset State Between Tests

**Problem**: Spies and fakes accumulate state across tests.

```javascript
let spy;

beforeEach(() => {
  spy = createSpy();
  // Or: spy.reset() if reusing
});

afterEach(() => {
  spy.reset();
});
```

### Use Factory Functions

**Problem**: Repetitive test double setup.

```javascript
// Create factory for common test doubles
function createMockUserRepository(overrides = {}) {
  return {
    findById: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation(user => user),
    delete: jest.fn().mockResolvedValue(true),
    ...overrides
  };
}

// Usage in tests
const repo = createMockUserRepository({
  findById: jest.fn().mockResolvedValue({ id: "1", name: "Test" })
});
```

---

## Quick Reference

### When to Use Each Type

| Type | Use When |
|------|----------|
| **Dummy** | Dependency required but not used |
| **Stub** | Need to control what dependency returns |
| **Spy** | Need to verify calls without strict expectations |
| **Mock** | Interaction IS the behavior being tested |
| **Fake** | Need realistic behavior without real implementation |

### Red Flags

- Mocking more than 2-3 dependencies in a single test
- Mocks that mirror real implementation logic
- Tests that only verify mocks were called (no assertions on results)
- Fakes that are as complex as the real implementation
