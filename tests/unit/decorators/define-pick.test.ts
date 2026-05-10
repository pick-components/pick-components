import { test, expect } from "@playwright/test";
import { definePick } from "../../../src/decorators/define-pick.js";
import { DefaultPickComponentFactory } from "../../../src/decorators/pick/pick-component-factory.js";
import type { ComponentDefinition } from "../../../src/providers/framework-bootstrap.js";
import type { IListenerMetadataRegistry } from "../../../src/decorators/listen/listener-metadata-registry.interface.js";

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
    ).toThrow("[definePick] selector is required and must not be empty");
  });

  test("should throw when selector is null", () => {
    // Arrange
    const setup = (_ctx: any) => {};

    // Act & Assert
    expect(() =>
      definePick(null as any, setup),
    ).toThrow("[definePick] selector is required and must not be empty");
  });

  test("should throw when selector is undefined", () => {
    // Arrange
    const setup = (_ctx: any) => {};

    // Act & Assert
    expect(() =>
      definePick(undefined as any, setup),
    ).toThrow("[definePick] selector is required and must not be empty");
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

  test("should throw when selector is whitespace-only", () => {
    // Arrange
    const setup = (_ctx: any) => {};

    // Act & Assert
    expect(() =>
      definePick("   ", setup),
    ).toThrow("[definePick] selector is required and must not be empty");
  });

  test("should throw when selector has leading whitespace", () => {
    // Arrange
    const setup = (_ctx: any) => {};

    // Act & Assert
    expect(() =>
      definePick(" my-comp", setup),
    ).toThrow("[definePick] selector must not have leading or trailing whitespace");
  });

  test("should throw when selector has trailing whitespace", () => {
    // Arrange
    const setup = (_ctx: any) => {};

    // Act & Assert
    expect(() =>
      definePick("my-comp ", setup),
    ).toThrow("[definePick] selector must not have leading or trailing whitespace");
  });
});

test.describe("definePick — ctx.on view actions", () => {
  // Minimal mock: IListenerMetadataRegistry is only needed by factory internals for @Listen,
  // not used when calling captureConfig with a plain ctx.on setup.
  const mockListenerRegistry: IListenerMetadataRegistry = {
    register: () => {},
    get: () => [],
  };

  test("should capture ctx.on handlers as methods in the config", () => {
    // Arrange
    const counterDef = definePick<{ count: number }>("def-pick-counter", (ctx) => {
      ctx.state({ count: 0 });
      ctx.on({
        increment() { this.count++; },
        decrement() { this.count--; },
        reset() { this.count = 0; },
      });
      ctx.html(`
        <div>
          <p>{{count}}</p>
          <pick-action action="increment"><button type="button">+</button></pick-action>
          <pick-action action="decrement"><button type="button">-</button></pick-action>
          <pick-action action="reset"><button type="button">Reset</button></pick-action>
        </div>
      `);
    });
    const factory = new DefaultPickComponentFactory(mockListenerRegistry);

    // Act
    const config = factory.captureConfig<{ count: number }>(counterDef.setup as any);

    // Assert — all three action names must be present in config.methods
    expect(typeof config.methods?.["increment"]).toBe("function");
    expect(typeof config.methods?.["decrement"]).toBe("function");
    expect(typeof config.methods?.["reset"]).toBe("function");
  });

  test("should invoke ctx.on handler mutating state when called with bound context", () => {
    // Arrange
    const counterDef = definePick<{ count: number }>("def-pick-state-counter", (ctx) => {
      ctx.state({ count: 0 });
      ctx.on({
        increment() { this.count++; },
        reset() { this.count = 0; },
      });
      ctx.html(`
        <pick-action action="increment"><button type="button">+</button></pick-action>
        <pick-action action="reset"><button type="button">Reset</button></pick-action>
      `);
    });
    const factory = new DefaultPickComponentFactory(mockListenerRegistry);
    const config = factory.captureConfig<{ count: number }>(counterDef.setup as any);

    const state = { count: 0 } as any;

    // Act & Assert — verify each step independently
    config.methods!["increment"].call(state);
    expect(state.count).toBe(1);

    config.methods!["increment"].call(state);
    expect(state.count).toBe(2);

    config.methods!["reset"].call(state);
    expect(state.count).toBe(0);
  });
});
