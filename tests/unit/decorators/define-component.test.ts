import { test, expect } from "@playwright/test";
import { defineComponent } from "../../../src/decorators/define-component.js";
import type { ComponentDefinition } from "../../../src/providers/framework-bootstrap.js";
import type { PickComponent } from "../../../src/core/pick-component.js";

/**
 * Tests for defineComponent responsibility.
 *
 * Covers:
 * - Returns a ComponentDefinition descriptor with kind "render"
 * - Captures Class and config without side effects
 * - Guard clause validation (Class required, config required)
 */
test.describe("defineComponent", () => {
  test("should return a render descriptor when Class and config are provided", () => {
    // Arrange
    class MyComponent {}
    const config = { selector: "my-comp", template: "<p>Hello</p>" };

    // Act
    const result = defineComponent(
      MyComponent as unknown as new (...args: unknown[]) => PickComponent,
      config,
    );

    // Assert
    expect(result.kind).toBe("render");
    const renderDef = result as Extract<ComponentDefinition, { kind: "render" }>;
    expect(renderDef.Class).toBe(MyComponent);
    expect(renderDef.config).toBe(config);
  });

  test("should preserve config reference without cloning", () => {
    // Arrange
    class AnotherComponent {}
    const config = { selector: "another-comp", template: "<span>Hi</span>" };

    // Act
    const result = defineComponent(
      AnotherComponent as unknown as new (...args: unknown[]) => PickComponent,
      config,
    );

    // Assert
    const renderDef = result as Extract<ComponentDefinition, { kind: "render" }>;
    expect(renderDef.config).toBe(config);
  });

  test("should not register any service when called without bootstrapFramework", () => {
    // Arrange
    class IsolatedComponent {}
    const config = { selector: "isolated-comp", template: "<div />" };

    // Act — no bootstrap, should not throw
    const result = defineComponent(
      IsolatedComponent as unknown as new (...args: unknown[]) => PickComponent,
      config,
    );

    // Assert — just a descriptor, no side effects
    expect(result).toBeDefined();
    expect(result.kind).toBe("render");
  });

  test("should throw when Class is null", () => {
    // Arrange
    const config = { selector: "my-comp", template: "<p />" };

    // Act & Assert
    expect(() =>
      defineComponent(null as any, config),
    ).toThrow("[defineComponent] Class is required");
  });

  test("should throw when Class is undefined", () => {
    // Arrange
    const config = { selector: "my-comp", template: "<p />" };

    // Act & Assert
    expect(() =>
      defineComponent(undefined as any, config),
    ).toThrow("[defineComponent] Class is required");
  });

  test("should throw when config is null", () => {
    // Arrange
    class MyComponent {}

    // Act & Assert
    expect(() =>
      defineComponent(
        MyComponent as unknown as new (...args: unknown[]) => PickComponent,
        null as any,
      ),
    ).toThrow("[defineComponent] config is required");
  });

  test("should throw when config is undefined", () => {
    // Arrange
    class MyComponent {}

    // Act & Assert
    expect(() =>
      defineComponent(
        MyComponent as unknown as new (...args: unknown[]) => PickComponent,
        undefined as any,
      ),
    ).toThrow("[defineComponent] config is required");
  });

  test("should throw when config.selector is an empty string", () => {
    // Arrange
    class MyComponent {}

    // Act & Assert
    expect(() =>
      defineComponent(
        MyComponent as unknown as new (...args: unknown[]) => PickComponent,
        { selector: "", template: "<p />" },
      ),
    ).toThrow("[defineComponent] config.selector is required and must not be empty");
  });

  test("should throw when config.selector is whitespace-only", () => {
    // Arrange
    class MyComponent {}

    // Act & Assert
    expect(() =>
      defineComponent(
        MyComponent as unknown as new (...args: unknown[]) => PickComponent,
        { selector: "   ", template: "<p />" },
      ),
    ).toThrow("[defineComponent] config.selector is required and must not be empty");
  });

  test("should throw when config.selector has leading whitespace", () => {
    // Arrange
    class MyComponent {}

    // Act & Assert
    expect(() =>
      defineComponent(
        MyComponent as unknown as new (...args: unknown[]) => PickComponent,
        { selector: " my-comp", template: "<p />" },
      ),
    ).toThrow("[defineComponent] config.selector must not have leading or trailing whitespace");
  });

  test("should throw when config.selector has trailing whitespace", () => {
    // Arrange
    class MyComponent {}

    // Act & Assert
    expect(() =>
      defineComponent(
        MyComponent as unknown as new (...args: unknown[]) => PickComponent,
        { selector: "my-comp ", template: "<p />" },
      ),
    ).toThrow("[defineComponent] config.selector must not have leading or trailing whitespace");
  });
});
