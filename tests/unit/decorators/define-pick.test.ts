import { test, expect } from "@playwright/test";
import { definePick } from "../../../src/decorators/define-pick.js";
import type { ComponentDefinition } from "../../../src/providers/framework-bootstrap.js";

/**
 * Tests for definePick responsibility.
 *
 * Covers:
 * - Returns a ComponentDefinition descriptor with kind "pick"
 * - Captures selector and setup without side effects
 * - Guard clause validation (selector required, setup required)
 */
test.describe("definePick", () => {
  test("should return a pick descriptor when selector and setup are provided", () => {
    // Arrange
    const selector = "my-counter";
    const setup = (ctx: any) => { ctx.html("<p>0</p>"); };

    // Act
    const result = definePick(selector, setup);

    // Assert
    expect(result.kind).toBe("pick");
    const pickDef = result as Extract<ComponentDefinition, { kind: "pick" }>;
    expect(pickDef.selector).toBe(selector);
    expect(pickDef.setup).toBe(setup);
  });

  test("should preserve setup function reference without cloning", () => {
    // Arrange
    const selector = "my-form";
    const setup = (ctx: any) => { ctx.html("<form />"); };

    // Act
    const result = definePick(selector, setup);

    // Assert
    const pickDef = result as Extract<ComponentDefinition, { kind: "pick" }>;
    expect(pickDef.setup).toBe(setup);
  });

  test("should not register any service when called without bootstrapFramework", () => {
    // Arrange
    const selector = "isolated-pick";
    const setup = (ctx: any) => { ctx.html("<div />"); };

    // Act — no bootstrap, should not throw
    const result = definePick(selector, setup);

    // Assert — just a descriptor, no side effects
    expect(result).toBeDefined();
    expect(result.kind).toBe("pick");
  });

  test("should throw when selector is empty string", () => {
    // Arrange
    const setup = (_ctx: any) => {};

    // Act & Assert
    expect(() =>
      definePick("", setup),
    ).toThrow("[definePick] selector is required");
  });

  test("should throw when selector is null", () => {
    // Arrange
    const setup = (_ctx: any) => {};

    // Act & Assert
    expect(() =>
      definePick(null as any, setup),
    ).toThrow("[definePick] selector is required");
  });

  test("should throw when selector is undefined", () => {
    // Arrange
    const setup = (_ctx: any) => {};

    // Act & Assert
    expect(() =>
      definePick(undefined as any, setup),
    ).toThrow("[definePick] selector is required");
  });

  test("should throw when setup is null", () => {
    // Act & Assert
    expect(() =>
      definePick("my-comp", null as any),
    ).toThrow("[definePick] setup is required");
  });

  test("should throw when setup is undefined", () => {
    // Act & Assert
    expect(() =>
      definePick("my-comp", undefined as any),
    ).toThrow("[definePick] setup is required");
  });
});
