import { test, expect } from "@playwright/test";
import { Services } from "../../../src/providers/service-provider.js";

test.describe("Services facade getNew", () => {
  test.afterEach(() => {
    // Ensure global registry isolation across tests.
    Services.clear();
  });

  test("should preserve get singleton behavior", () => {
    // Arrange
    let created = 0;
    Services.register("CounterService", () => ({ id: ++created }));

    // Act
    const first = Services.get<{ id: number }>("CounterService");
    const second = Services.get<{ id: number }>("CounterService");

    // Assert
    expect(first).toBe(second);
    expect(first.id).toBe(1);
  });

  test("should return fresh instances with getNew", () => {
    // Arrange
    let created = 0;
    Services.register("CounterService", () => ({ id: ++created }));

    // Act
    const cached = Services.get<{ id: number }>("CounterService");
    const freshA = Services.getNew<{ id: number }>("CounterService");
    const freshB = Services.getNew<{ id: number }>("CounterService");

    // Assert
    expect(cached.id).toBe(1);
    expect(freshA.id).toBe(2);
    expect(freshB.id).toBe(3);
    expect(freshA).not.toBe(freshB);
  });

  test("should throw when getNew is used with reserved service token", () => {
    // Act & Assert
    expect(() => Services.getNew("IServiceProvider" as any)).toThrow(
      "cannot be resolved with getNew",
    );
  });
});
