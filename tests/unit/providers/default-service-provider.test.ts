import { test, expect } from "@playwright/test";
import { DefaultServiceRegistry } from "../../../src/providers/default-service-provider.js";

test.describe("DefaultServiceRegistry.getNew", () => {
  test("should keep get as lazy singleton for factory tokens", () => {
    // Arrange
    const registry = new DefaultServiceRegistry();
    let created = 0;
    registry.register("CounterService", () => ({ id: ++created }));

    // Act
    const first = registry.get<{ id: number }>("CounterService");
    const second = registry.get<{ id: number }>("CounterService");

    // Assert
    expect(first).toBe(second);
    expect(first.id).toBe(1);
  });

  test("should return fresh instances with getNew for factory tokens", () => {
    // Arrange
    const registry = new DefaultServiceRegistry();
    let created = 0;
    registry.register("CounterService", () => ({ id: ++created }));

    // Act
    const cached = registry.get<{ id: number }>("CounterService");
    const freshA = registry.getNew<{ id: number }>("CounterService");
    const freshB = registry.getNew<{ id: number }>("CounterService");
    const cachedAgain = registry.get<{ id: number }>("CounterService");

    // Assert
    expect(cached.id).toBe(1);
    expect(freshA.id).toBe(2);
    expect(freshB.id).toBe(3);
    expect(cachedAgain).toBe(cached);
    expect(cachedAgain.id).toBe(1);
  });

  test("should throw when getNew is used for a direct instance token", () => {
    // Arrange
    const registry = new DefaultServiceRegistry();
    registry.register("DirectInstance", { ready: true });

    // Act & Assert
    expect(() => registry.getNew("DirectInstance")).toThrow(
      "Register it with a factory function to use getNew().",
    );
  });

  test("should throw when getNew token is not registered", () => {
    // Arrange
    const registry = new DefaultServiceRegistry();

    // Act & Assert
    expect(() => registry.getNew("MissingToken")).toThrow("is not registered");
  });
});
