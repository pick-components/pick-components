# Writing Tests for Pick Components

Pick Components uses a multi-project Playwright setup:

1. Unit tests for isolated behavior (`tests/unit/**`)
2. Integration tests for workflows (`tests/integration/**`)
3. Browser tests for end-to-end runtime behavior (`tests/browser/**`)

## Test Philosophy

Use AAA in every test:

- Arrange: build state, mocks, and inputs
- Act: execute one behavior
- Assert: verify observable result

## Unit Test Pattern

Use unit tests for services, providers, and rendering primitives.

```typescript
import { describe, expect, test } from "@playwright/test";
import { DefaultServiceRegistry } from "../../../src/providers/default-service-provider.js";

describe("DefaultServiceRegistry", () => {
  test("should return the same instance from get when registered with factory", () => {
    // Arrange
    const registry = new DefaultServiceRegistry();
    registry.register("Token", () => ({ id: Math.random() }));

    // Act
    const first = registry.get<{ id: number }>("Token");
    const second = registry.get<{ id: number }>("Token");

    // Assert
    expect(second).toBe(first);
  });
});
```

## Integration Test Pattern

Use integration tests for app flows and component interaction.

```typescript
import { expect, test } from "@playwright/test";

test.describe("counter flow", () => {
  test("increments value when user clicks increment", async ({ page }) => {
    // Arrange
    await page.goto("/examples/en/02-counter/");

    // Act
    await page.getByRole("button", { name: "Increment" }).click();

    // Assert
    await expect(page.locator("counter-demo")).toContainText("1");
  });
});
```

## Test Organization

```
tests/
├── unit/
├── integration/
├── browser/
└── playground/
```

## Selectors Strategy

Prefer stable user-facing selectors:

```typescript
// Good
await page.getByRole("button", { name: "Save" }).click();
await expect(page.getByRole("status")).toContainText("Saved");

// Acceptable
await page.locator('[data-testid="save-btn"]').click();

// Avoid brittle structural selectors
await page.locator(".layout > div:nth-child(2) > button").click();
```

## Error Testing

Always assert error message and scenario explicitly:

```typescript
test("throws when token is not registered", () => {
  // Arrange
  const registry = new DefaultServiceRegistry();

  // Act + Assert
  expect(() => registry.get("MissingToken")).toThrow("is not registered");
});
```

## Running Tests

```bash
npm run test:unit
npm run test:integration
npm run test:browser
npm test
```
