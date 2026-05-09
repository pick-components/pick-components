import { test, expect } from "@playwright/test";
import { ComponentMetadataRegistry } from "../../../src/core/component-metadata-registry.js";
import { ComponentMetadata } from "../../../src/core/component-metadata.js";

test.describe("ComponentMetadataRegistry", () => {
  let registry: ComponentMetadataRegistry;

  test.beforeEach(() => {
    registry = new ComponentMetadataRegistry();
  });

  test.describe("register()", () => {
    test("should register component metadata", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Test</div>",
      };

      // Act
      registry.register("test-component", metadata);

      // Assert
      expect(registry.has("test-component")).toBe(true);
    });

    test("should throw if componentId is null", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test",
        template: "<div></div>",
      };

      // Act & Assert
      expect(() => registry.register(null as any, metadata)).toThrow(
        "ComponentId is required and cannot be empty or whitespace",
      );
    });

    test("should throw if componentId is empty whitespace", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test",
        template: "<div></div>",
      };

      // Act & Assert
      expect(() => registry.register("   ", metadata)).toThrow(
        "ComponentId is required and cannot be empty or whitespace",
      );
    });

    test("should throw if componentId has leading or trailing whitespace", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test",
        template: "<div></div>",
      };

      // Act & Assert
      expect(() => registry.register(" test ", metadata)).toThrow(
        "ComponentId cannot contain leading or trailing whitespace",
      );
    });

    test("should throw if metadata is null", () => {
      // Act & Assert
      expect(() => registry.register("test", null as any)).toThrow(
        "Metadata is required",
      );
    });

    test("should throw if metadata.selector does not match componentId", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "other-component",
        template: "<div></div>",
      };

      // Act & Assert
      expect(() => registry.register("test", metadata)).toThrow(
        "Metadata selector 'other-component' must match componentId 'test'",
      );
    });

    test("should throw if componentId is already registered", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test",
        template: "<div></div>",
      };
      registry.register("test", metadata);

      // Act & Assert
      expect(() => registry.register("test", metadata)).toThrow(
        "Component test is already registered",
      );
    });
  });

  test.describe("get()", () => {
    test("should retrieve registered metadata", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Test</div>",
        styles: ".container { color: red; }",
      };
      registry.register("test-component", metadata);

      // Act
      const result = registry.get("test-component");

      // Assert
      expect(result).toBe(metadata);
      expect(result?.template).toBe("<div>Test</div>");
      expect(result?.styles).toBe(".container { color: red; }");
    });

    test("should return undefined for non-existent component", () => {
      // Act
      const result = registry.get("non-existent");

      // Assert
      expect(result).toBeUndefined();
    });

    test("should throw if componentId is null", () => {
      // Act & Assert
      expect(() => registry.get(null as any)).toThrow(
        "ComponentId is required and cannot be empty or whitespace",
      );
    });

    test("should throw if componentId is empty whitespace", () => {
      // Act & Assert
      expect(() => registry.get("   ")).toThrow(
        "ComponentId is required and cannot be empty or whitespace",
      );
    });

    test("should throw if componentId has leading or trailing whitespace", () => {
      // Act & Assert
      expect(() => registry.get(" test ")).toThrow(
        "ComponentId cannot contain leading or trailing whitespace",
      );
    });
  });

  test.describe("has()", () => {
    test("should return true for registered component", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test",
        template: "<div></div>",
      };
      registry.register("test", metadata);

      // Act & Assert
      expect(registry.has("test")).toBe(true);
    });

    test("should return false for non-registered component", () => {
      // Act & Assert
      expect(registry.has("non-existent")).toBe(false);
    });

    test("should throw if componentId is null", () => {
      // Act & Assert
      expect(() => registry.has(null as any)).toThrow(
        "ComponentId is required and cannot be empty or whitespace",
      );
    });

    test("should throw if componentId is empty whitespace", () => {
      // Act & Assert
      expect(() => registry.has("   ")).toThrow(
        "ComponentId is required and cannot be empty or whitespace",
      );
    });

    test("should throw if componentId has leading or trailing whitespace", () => {
      // Act & Assert
      expect(() => registry.has(" test ")).toThrow(
        "ComponentId cannot contain leading or trailing whitespace",
      );
    });
  });

  test.describe("clear()", () => {
    test("should clear all registered metadata", () => {
      // Arrange
      const metadata1: ComponentMetadata = {
        selector: "test1",
        template: "<div></div>",
      };
      const metadata2: ComponentMetadata = {
        selector: "test2",
        template: "<div></div>",
      };
      registry.register("test1", metadata1);
      registry.register("test2", metadata2);

      // Act
      registry.clear();

      // Assert
      expect(registry.has("test1")).toBe(false);
      expect(registry.has("test2")).toBe(false);
    });

    test("should allow re-registration after clear", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test",
        template: "<div></div>",
      };
      registry.register("test", metadata);
      registry.clear();

      // Act & Assert
      expect(() => registry.register("test", metadata)).not.toThrow();
    });
  });

  test.describe("patch()", () => {
    test("should patch existing metadata with shallow merge", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
        styles: ".original { color: red; }",
      };
      registry.register("test-component", metadata);

      // Act
      registry.patch("test-component", {
        template: "<div>Overridden</div>",
      });

      // Assert
      const result = registry.get("test-component");
      expect(result?.template).toBe("<div>Overridden</div>");
      expect(result?.styles).toBe(".original { color: red; }");
    });

    test("should ignore patch for non-registered component", () => {
      // Act & Assert
      expect(() =>
        registry.patch("non-existent", { template: "<div>Ignored</div>" }),
      ).not.toThrow();
      expect(registry.get("non-existent")).toBeUndefined();
    });

    test("should throw if componentId is null", () => {
      // Act & Assert
      expect(() => registry.patch(null as any, { template: "<div></div>" })).toThrow(
        "ComponentId is required and cannot be empty or whitespace",
      );
    });

    test("should throw if componentId is empty whitespace", () => {
      // Act & Assert
      expect(() => registry.patch("   ", { template: "<div></div>" })).toThrow(
        "ComponentId is required and cannot be empty or whitespace",
      );
    });

    test("should throw if componentId has leading or trailing whitespace", () => {
      // Act & Assert
      expect(() =>
        registry.patch(" test ", { template: "<div></div>" }),
      ).toThrow("ComponentId cannot contain leading or trailing whitespace");
    });

    test("should throw if patch is null", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() => registry.patch("test-component", null as any)).toThrow(
        "Patch must be a plain object",
      );
    });

    test("should throw if patch is a primitive value", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() => registry.patch("test-component", "invalid" as any)).toThrow(
        "Patch must be a plain object",
      );
    });

    test("should throw if patch is an array", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() => registry.patch("test-component", [] as any)).toThrow(
        "Patch must be a plain object",
      );
    });

    test("should throw if patch is a non-plain object", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() => registry.patch("test-component", new Date() as any)).toThrow(
        "Patch must be a plain object",
      );
    });

    test("should throw if patch selector does not match componentId", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() =>
        registry.patch("test-component", {
          selector: "other-component",
          template: "<div>Overridden</div>",
        }),
      ).toThrow("Patch selector must match componentId");
    });

    test("should throw if patch template is not a string", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() =>
        registry.patch("test-component", {
          template: 123 as any,
        }),
      ).toThrow("Patch template must be a string when provided");
    });

    test("should throw if patch template is undefined", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() =>
        registry.patch("test-component", {
          template: undefined as any,
        }),
      ).toThrow("Patch template must be a string when provided");
    });

    test("should throw if patch initializer is not a function", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() =>
        registry.patch("test-component", {
          initializer: "invalid" as any,
        }),
      ).toThrow("Patch initializer must be a function when provided");
    });

    test("should throw if patch contains unsupported field", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() =>
        registry.patch("test-component", {
          foo: "bar",
        } as any),
      ).toThrow("Patch contains unsupported field 'foo'");
    });

    test("should throw if patch selector is empty string", () => {
      // Arrange
      const metadata: ComponentMetadata = {
        selector: "test-component",
        template: "<div>Original</div>",
      };
      registry.register("test-component", metadata);

      // Act & Assert
      expect(() =>
        registry.patch("test-component", {
          selector: "",
          template: "<div>Overridden</div>",
        }),
      ).toThrow("Patch selector must match componentId");
    });
  });
});
