import { test, expect } from "@playwright/test";
import { Services } from "../../src/providers/service-provider.js";
import { bootstrapFramework, ComponentKind } from "../../src/providers/framework-bootstrap.js";
import type { ComponentDefinition } from "../../src/providers/framework-bootstrap.js";
import type { IComponentMetadataRegistry } from "../../src/core/component-metadata-registry.interface.js";
import { PickComponent } from "../../src/core/pick-component.js";
import { defineComponent } from "../../src/decorators/define-component.js";
import { definePick } from "../../src/decorators/define-pick.js";

/**
 * Integration tests for the bootstrapFramework `components` option.
 *
 * Covers:
 * - defineComponent descriptor registers metadata via PickRender after bootstrap
 * - definePick descriptor registers metadata via Pick after bootstrap
 * - Mixed arrays with both kinds are all registered
 *
 * These tests require the global Services singleton and a full bootstrap pass,
 * which is why they live in integration/ rather than unit/.
 *
 * Note: customElements is cleared in beforeEach to prevent cross-test contamination
 * when running in parallel. The test classes are not valid HTMLElement subclasses,
 * so registering them in a live customElements registry would corrupt other tests.
 */
test.describe("bootstrapFramework — components option", () => {
  test.describe.configure({ mode: "serial" });

  let savedCustomElements: unknown;

  test.beforeEach(() => {
    savedCustomElements = (global as any).customElements;
    delete (global as any).customElements;
  });

  test.afterEach(() => {
    Services.clear();
    if (savedCustomElements !== undefined) {
      (global as any).customElements = savedCustomElements;
    }
  });

  test("should register a defineComponent descriptor as a component", async () => {
    // Arrange
    await bootstrapFramework(Services);

    class MyButton {}
    const def: ComponentDefinition = {
      kind: ComponentKind.Render,
      Class: MyButton as unknown as new (...args: unknown[]) => PickComponent,
      config: { selector: "my-define-button", template: "<button>Click</button>" },
    };

    // Act
    await bootstrapFramework(Services, {}, { components: [def] });

    // Assert
    const metadataRegistry = Services.get<IComponentMetadataRegistry>("IComponentMetadataRegistry");
    expect(metadataRegistry.has("my-define-button")).toBe(true);
    expect(metadataRegistry.get("my-define-button")?.template).toBe("<button>Click</button>");
  });

  test("should register a definePick descriptor as a component", async () => {
    // Arrange
    await bootstrapFramework(Services);

    const def: ComponentDefinition = {
      kind: ComponentKind.Pick,
      selector: "my-define-counter",
      setup: (ctx: any) => {
        ctx.state({ count: 0 });
        ctx.html("<p>{{count}}</p>");
      },
    };

    // Act
    await bootstrapFramework(Services, {}, { components: [def] });

    // Assert
    const metadataRegistry = Services.get<IComponentMetadataRegistry>("IComponentMetadataRegistry");
    expect(metadataRegistry.has("my-define-counter")).toBe(true);
    expect(metadataRegistry.get("my-define-counter")?.template).toBe("<p>{{count}}</p>");
  });

  test("should register all descriptors in a mixed components array", async () => {
    // Arrange
    await bootstrapFramework(Services);

    class MyCard {}
    const defs: ComponentDefinition[] = [
      {
        kind: ComponentKind.Render,
        Class: MyCard as unknown as new (...args: unknown[]) => PickComponent,
        config: { selector: "my-define-card", template: "<div>card</div>" },
      },
      {
        kind: ComponentKind.Pick,
        selector: "my-define-badge",
        setup: (ctx: any) => { ctx.html("<span>badge</span>"); },
      },
    ];

    // Act
    await bootstrapFramework(Services, {}, { components: defs });

    // Assert
    const metadataRegistry = Services.get<IComponentMetadataRegistry>("IComponentMetadataRegistry");
    expect(metadataRegistry.has("my-define-card")).toBe(true);
    expect(metadataRegistry.has("my-define-badge")).toBe(true);
  });

  test("defineComponent descriptor should register via bootstrapFramework end-to-end", async () => {
    // Arrange
    await bootstrapFramework(Services);

    class MyToggle extends PickComponent {}
    const def = defineComponent(MyToggle, {
      selector: "my-toggle-e2e",
      template: "<button>toggle</button>",
    });

    // Act
    await bootstrapFramework(Services, {}, { components: [def] });

    // Assert
    const metadataRegistry = Services.get<IComponentMetadataRegistry>("IComponentMetadataRegistry");
    expect(metadataRegistry.has("my-toggle-e2e")).toBe(true);
    expect(metadataRegistry.get("my-toggle-e2e")?.template).toBe("<button>toggle</button>");
  });

  test("definePick descriptor should register via bootstrapFramework end-to-end", async () => {
    // Arrange
    await bootstrapFramework(Services);

    const def = definePick<{ label: string }>("my-label-e2e", (ctx) => {
      ctx.state({ label: "hello" });
      ctx.html("<span>{{label}}</span>");
    });

    // Act
    await bootstrapFramework(Services, {}, { components: [def] });

    // Assert
    const metadataRegistry = Services.get<IComponentMetadataRegistry>("IComponentMetadataRegistry");
    expect(metadataRegistry.has("my-label-e2e")).toBe(true);
    expect(metadataRegistry.get("my-label-e2e")?.template).toBe("<span>{{label}}</span>");
  });

  test("should apply componentOverrides to a component registered in the same call via components", async () => {
    // Arrange
    await bootstrapFramework(Services);

    const def = defineComponent(PickComponent, {
      selector: "my-overridable",
      template: "<p>original</p>",
    });

    // Act — components and componentOverrides in a single bootstrapFramework call
    await bootstrapFramework(Services, {}, {
      components: [def],
      componentOverrides: {
        "my-overridable": { selector: "my-overridable", template: "<p>overridden</p>" },
      },
    });

    // Assert
    const metadataRegistry = Services.get<IComponentMetadataRegistry>("IComponentMetadataRegistry");
    expect(metadataRegistry.get("my-overridable")?.template).toBe("<p>overridden</p>");
  });
});
