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
      "Patch selector must match componentId",
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
      "Patch selector must match componentId",
    );
  });

  test("should fail when componentOverrides patch value is not a plain object", async () => {
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
      "Patch must be a plain object",
    );
  });

  test("should fail when componentOverrides patch value is a non-plain object", async () => {
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
            "pick-dialog": new Date() as any,
          },
        },
      ),
    ).rejects.toThrow(
      "Patch must be a plain object",
    );
  });

  test("should fail when componentOverrides template is not a string", async () => {
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
              template: 123 as any,
            },
          },
        },
      ),
    ).rejects.toThrow(
      "Patch template must be a string when provided",
    );
  });

  test("should fail when componentOverrides template is undefined", async () => {
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
              template: undefined as any,
            },
          },
        },
      ),
    ).rejects.toThrow(
      "Patch template must be a string when provided",
    );
  });

  test("should fail when componentOverrides initializer is not a function", async () => {
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
              initializer: "invalid" as any,
            },
          },
        },
      ),
    ).rejects.toThrow(
      "Patch initializer must be a function when provided",
    );
  });

  test("should fail when componentOverrides patch contains unsupported field", async () => {
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
              foo: "bar",
            } as any,
          },
        },
      ),
    ).rejects.toThrow(
      "Patch contains unsupported field 'foo'",
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

  test("should fail when componentOverrides contains whitespace-padded selector key", async () => {
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
            " pick-dialog ": {
              template: "<div>Invalid</div>",
            },
          },
        },
      ),
    ).rejects.toThrow(
      "[bootstrapFramework] componentOverrides selector keys cannot contain leading or trailing whitespace.",
    );
  });

  test("should not apply any patch when a later override has an invalid field type", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const metadataRegistry = new ComponentMetadataRegistry();
    metadataRegistry.register("pick-dialog", {
      selector: "pick-dialog",
      template: "<div>Default dialog</div>",
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
            "pick-alert": {
              template: 123 as any,
            },
          },
        },
      ),
    ).rejects.toThrow("Patch template must be a string when provided");

    // Assert: first override must not have been applied (atomicity)
    expect(metadataRegistry.get("pick-dialog")?.template).toBe(
      "<div>Default dialog</div>",
    );
  });

  test("should succeed when components option is an empty array", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act & Assert — no error when components is empty
    await expect(
      bootstrapFramework(mock as any, {}, { components: [] }),
    ).resolves.toBeUndefined();
  });

  test("should succeed when components option is undefined", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act & Assert — no error when components is absent
    await expect(
      bootstrapFramework(mock as any, {}, {}),
    ).resolves.toBeUndefined();
  });

  test("should throw when options.components is not an array", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act & Assert
    await expect(
      bootstrapFramework(mock as any, {}, { components: {} as any }),
    ).rejects.toThrow("[bootstrapFramework] options.components must be an array.");
  });

  test("should throw when a components entry is null", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act & Assert
    await expect(
      bootstrapFramework(mock as any, {}, { components: [null as any] }),
    ).rejects.toThrow("[bootstrapFramework] components[0]: each entry must be a non-null object produced by defineComponent() or definePick().");
  });

  test("should throw when a components entry is undefined", async () => {
    // Arrange
    const mock = createMockServiceRegistry();

    // Act & Assert
    await expect(
      bootstrapFramework(mock as any, {}, { components: [undefined as any] }),
    ).rejects.toThrow("[bootstrapFramework] components[0]: each entry must be a non-null object produced by defineComponent() or definePick().");
  });

  test("should throw when components array contains duplicate selectors", async () => {
    // Arrange
    const mock = createMockServiceRegistry();
    const def1 = { kind: "pick" as const, selector: "dupe-selector", setup: (_ctx: any) => {} };
    const def2 = { kind: "pick" as const, selector: "dupe-selector", setup: (_ctx: any) => {} };

    // Act & Assert
    await expect(
      bootstrapFramework(mock as any, {}, { components: [def1, def2] as any }),
    ).rejects.toThrow("[bootstrapFramework] components[1]: duplicate selector 'dupe-selector' — already present earlier in this components array.");
  });
});
