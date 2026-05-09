import { test, expect } from "@playwright/test";
import { bootstrapFramework } from "../../../src/providers/framework-bootstrap.js";
import { ComponentMetadataRegistry } from "../../../src/core/component-metadata-registry.js";

/**
 * Tests for bootstrapFramework responsibility.
 *
 * Covers:
 * - Guard clause validation
 * - All framework services are registered
 * - Idempotent behavior (multiple calls do not re-register)
 * - Override support (developer overrides replace framework defaults)
 */
test.describe("bootstrapFramework", () => {
  /**
   * Creates a mock service registry that tracks registrations.
   */
  function createMockServiceRegistry(): {
    registry: Record<string, unknown>;
    has: (token: string | symbol | Function) => boolean;
    get: <T>(token: string | symbol | Function) => T;
    register: (token: string | symbol | Function, factory: unknown) => void;
    clear: () => void;
  } {
    const registry: Record<string, unknown> = {};

    return {
      registry,
      has(token: string | symbol | Function): boolean {
        const key = String(token);
        return key in registry;
      },
      get<T>(token: string | symbol | Function): T {
        const key = String(token);
        const factory = registry[key];
        if (!factory) throw new Error(`Service not found: ${key}`);
        if (typeof factory === "function") return (factory as () => T)();
        return factory as T;
      },
      register(
        token: string | symbol | Function,
        instanceOrFactory: unknown,
      ): void {
        const key = String(token);
        registry[key] = instanceOrFactory;
      },
      clear(): void {
        for (const key of Object.keys(registry)) {
          delete registry[key];
        }
      },
    };
  }

  test("should throw error when registry is null", async () => {
    // Act & Assert
    await expect(bootstrapFramework(null as any)).rejects.toThrow(
      "Service registry is required",
    );
  });

  test("should throw error when registry is undefined", async () => {
    // Act & Assert
    await expect(bootstrapFramework(undefined as any)).rejects.toThrow(
      "Service registry is required",
    );
  });

  test("should register core framework services", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act
    await bootstrapFramework(mock as any);

    // Assert
    const expectedTokens = [
      "IDecoratorMode",
      "IDomAdapter",
      "INavigationService",
      "ISharedStylesRegistry",
      "IPrerenderAdoptionDecider",
      "ISkeletonValidator",
      "ISkeletonRenderer",
      "IComponentMetadataRegistry",
      "IComponentInstanceRegistry",
      "IHostResolver",
      "IExpressionParser",
      "IEvaluator",
      "IExpressionResolver",
      "IPropertyExtractor",
      "IManagedElementRegistry",
      "IManagedElementResolver",
      "IOutletResolver",
      "IHostStyleMigrator",
      "ITransparentHostFactory",
      "IBindingResolver",
      "IErrorRenderer",
      "ITemplateCompiler",
      "ITemplateAnalyzer",
      "ITemplateCompilationCache",
      "IRenderPipeline",
      "IDomContextFactory",
      "ITemplateProvider",
      "IRenderEngine",
      "IPickComponentFactory",
      "IListenerMetadataRegistry",
      "IListenerInitializer",
      "IPickElementFactory",
      "IPickElementRegistrar",
    ];

    for (const token of expectedTokens) {
      expect(mock.has(token)).toBe(true);
    }
  });

  test("should default decorator compatibility mode to auto", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act
    await bootstrapFramework(mock as any);

    // Assert
    expect(mock.get("IDecoratorMode")).toBe("auto");
  });

  test("should allow strict decorator compatibility opt-in", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act
    await bootstrapFramework(mock as any, {}, { decorators: "strict" });

    // Assert
    expect(mock.get("IDecoratorMode")).toBe("strict");
  });

  test("should not re-register services on subsequent calls", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    await bootstrapFramework(mock as any);
    const firstRegistrations = { ...mock.registry };

    // Act
    await bootstrapFramework(mock as any);

    // Assert
    expect(mock.registry).toEqual(firstRegistrations);
  });

  test("should not overwrite pre-existing registrations", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const customAdapter = { custom: true };
    mock.register("IDomAdapter", () => customAdapter);

    // Act
    await bootstrapFramework(mock as any);

    // Assert
    expect(mock.get("IDomAdapter")).toBe(customAdapter);
  });

  test("should apply overrides instead of defaults", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const customAdapter = { overridden: true };

    // Act
    await bootstrapFramework(mock as any, {
      IDomAdapter: () => customAdapter,
    });

    // Assert
    expect(mock.get("IDomAdapter")).toBe(customAdapter);
  });

  test("should allow instance overrides", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const singletonAdapter = { singleton: true };

    // Act
    await bootstrapFramework(mock as any, {
      IDomAdapter: singletonAdapter,
    });

    // Assert
    expect(mock.get("IDomAdapter")).toBe(singletonAdapter);
  });

  test("should apply componentOverrides for registered selectors", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const metadataRegistry = new ComponentMetadataRegistry();
    metadataRegistry.register("pick-dialog", {
      selector: "pick-dialog",
      template: "<div>Default dialog</div>",
      styles: ".default { color: red; }",
    });

    // Act
    await bootstrapFramework(
      mock as any,
      {
        IComponentMetadataRegistry: metadataRegistry,
      },
      {
        componentOverrides: {
          "pick-dialog": {
            template: "<div>Custom dialog</div>",
          },
        },
      },
    );

    // Assert
    const result = metadataRegistry.get("pick-dialog");
    expect(result?.template).toBe("<div>Custom dialog</div>");
    expect(result?.styles).toBe(".default { color: red; }");
  });

  test("should fail fast for unknown componentOverrides selectors", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const metadataRegistry = new ComponentMetadataRegistry();
    metadataRegistry.register("pick-dialog", {
      selector: "pick-dialog",
      template: "<div>Default dialog</div>",
    });

    // Act & Assert
    await expect(
      bootstrapFramework(
        mock as any,
        {
          IComponentMetadataRegistry: metadataRegistry,
        },
        {
          componentOverrides: {
            "pick-toast": {
              template: "<div>Custom toast</div>",
            },
          },
        },
      ),
    ).rejects.toThrow(
      "[bootstrapFramework] componentOverrides references unregistered selector 'pick-toast'.",
    );

    expect(metadataRegistry.get("pick-dialog")?.template).toBe(
      "<div>Default dialog</div>",
    );
  });

  test("should validate all componentOverrides before applying any patch", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const metadataRegistry = new ComponentMetadataRegistry();
    metadataRegistry.register("pick-dialog", {
      selector: "pick-dialog",
      template: "<div>Default dialog</div>",
      styles: ".default { color: red; }",
    });
    metadataRegistry.register("pick-alert", {
      selector: "pick-alert",
      template: "<div>Default alert</div>",
    });

    // Act & Assert
    await expect(
      bootstrapFramework(
        mock as any,
        {
          IComponentMetadataRegistry: metadataRegistry,
        },
        {
          componentOverrides: {
            "pick-dialog": {
              template: "<div>Custom dialog</div>",
            },
            "pick-toast": {
              template: "<div>Custom toast</div>",
            },
          },
        },
      ),
    ).rejects.toThrow(
      "[bootstrapFramework] componentOverrides references unregistered selector 'pick-toast'.",
    );

    expect(metadataRegistry.get("pick-dialog")?.template).toBe(
      "<div>Default dialog</div>",
    );
    expect(metadataRegistry.get("pick-alert")?.template).toBe(
      "<div>Default alert</div>",
    );
  });

  test("should fail when componentOverrides patch selector mismatches key", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const metadataRegistry = new ComponentMetadataRegistry();
    metadataRegistry.register("pick-dialog", {
      selector: "pick-dialog",
      template: "<div>Default dialog</div>",
    });

    // Act & Assert
    await expect(
      bootstrapFramework(
        mock as any,
        {
          IComponentMetadataRegistry: metadataRegistry,
        },
        {
          componentOverrides: {
            "pick-dialog": {
              selector: "pick-toast",
              template: "<div>Custom dialog</div>",
            },
          },
        },
      ),
    ).rejects.toThrow(
      "[bootstrapFramework] componentOverrides selector mismatch for 'pick-dialog'. Received selector 'pick-toast'.",
    );

    expect(metadataRegistry.get("pick-dialog")?.template).toBe(
      "<div>Default dialog</div>",
    );
  });

  test("should fail when componentOverrides patch selector is empty string", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const metadataRegistry = new ComponentMetadataRegistry();
    metadataRegistry.register("pick-dialog", {
      selector: "pick-dialog",
      template: "<div>Default dialog</div>",
    });

    // Act & Assert
    await expect(
      bootstrapFramework(
        mock as any,
        {
          IComponentMetadataRegistry: metadataRegistry,
        },
        {
          componentOverrides: {
            "pick-dialog": {
              selector: "",
              template: "<div>Custom dialog</div>",
            },
          },
        },
      ),
    ).rejects.toThrow(
      "[bootstrapFramework] componentOverrides selector mismatch for 'pick-dialog'. Received selector ''.",
    );
  });

  test("should fail when componentOverrides patch value is not an object", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const metadataRegistry = new ComponentMetadataRegistry();
    metadataRegistry.register("pick-dialog", {
      selector: "pick-dialog",
      template: "<div>Default dialog</div>",
    });

    // Act & Assert
    await expect(
      bootstrapFramework(
        mock as any,
        {
          IComponentMetadataRegistry: metadataRegistry,
        },
        {
          componentOverrides: {
            "pick-dialog": null as any,
          },
        },
      ),
    ).rejects.toThrow(
      "[bootstrapFramework] componentOverrides for 'pick-dialog' must be a non-null object.",
    );
  });

  test("should fail when componentOverrides option is not a plain object", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act & Assert
    await expect(
      bootstrapFramework(
        mock as any,
        {},
        {
          componentOverrides: "invalid" as any,
        },
      ),
    ).rejects.toThrow(
      "[bootstrapFramework] componentOverrides must be a plain object when provided.",
    );
  });

  test("should fail when componentOverrides contains an empty selector key", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const metadataRegistry = new ComponentMetadataRegistry();

    // Act & Assert
    await expect(
      bootstrapFramework(
        mock as any,
        {
          IComponentMetadataRegistry: metadataRegistry,
        },
        {
          componentOverrides: {
            "": {
              template: "<div>Invalid</div>",
            },
          },
        },
      ),
    ).rejects.toThrow(
      "[bootstrapFramework] componentOverrides contains an empty selector key.",
    );
  });
});
