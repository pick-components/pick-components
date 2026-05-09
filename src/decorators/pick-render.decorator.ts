import { Services } from "../providers/service-provider.js";
import type { IServiceProvider } from "../providers/service-provider.interface.js";
import type { IComponentMetadataRegistry } from "../core/component-metadata-registry.interface.js";
import type { IPickElementRegistrar } from "../registration/pick-element-registrar.interface.js";
import type { PickElementOptions } from "../registration/pick-element-factory.js";
import type { ComponentMetadata } from "../core/component-metadata.js";
import type { PickComponent } from "../core/pick-component.js";
import { resolveDecoratorService } from "./resolve-decorator-service.js";

/**
 * Defines the configuration for a PickComponent decorator.
 * Derived from ComponentMetadata — all fields are optional at decoration time.
 */
export type ComponentConfig = Partial<ComponentMetadata>;

/**
 * @PickRender decorator - Marks a class as a PickComponent with declarative configuration.
 *
 * @param config - Component configuration (selector, template, lifecycle, etc.)
 * @param provider - Service provider used to resolve framework dependencies. Defaults to the global
 *   `Services` singleton. Pass a registry only when bootstrapping outside the default service context.
 * @throws Error if config is null or undefined
 *
 * @example
 * ```typescript
 * @PickRender({
 *   selector: 'todo-app',
 *   template: '<div>{{count}}</div>',
 *   initializer: () => new TodoAppInitializer(Services.get(ApiService)),
 *   lifecycle: () => new TodoAppLifecycle(Services.get(EventBus))
 * })
 * class TodoApp extends PickComponent {
 *   @Reactive count = 0;
 * }
 * ```
 */
export function PickRender(config: ComponentConfig, provider: IServiceProvider = Services): ClassDecorator {
  if (!config) throw new Error("Config is required");

  return (target) => {
    if (config.selector) {
      const metadata: ComponentMetadata = {
        ...config,
        selector: config.selector,
        template: config.template || "",
      };

      resolveDecoratorService<IComponentMetadataRegistry>(
        "IComponentMetadataRegistry",
        provider,
        "PickRender",
      ).register(config.selector, metadata);

      const options: PickElementOptions<PickComponent> = {
        initializer: config.initializer,
        lifecycle: config.lifecycle,
      };

      resolveDecoratorService<IPickElementRegistrar>(
        "IPickElementRegistrar",
        provider,
        "PickRender",
      ).register(
        config.selector,
        target as unknown as new (...args: unknown[]) => PickComponent,
        options,
      );
    }

    return target;
  };
}
