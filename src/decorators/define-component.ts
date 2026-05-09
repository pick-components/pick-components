import type { ComponentConfig } from "./pick-render.decorator.js";
import type { PickComponent } from "../core/pick-component.js";
import { ComponentKind } from "./component-kind.js";
import type { ComponentDefinition } from "./component-kind.js";

/**
 * Creates a component definition descriptor for a PickComponent class.
 *
 * @description
 * Decorator-free alternative to `@PickRender`. Returns a `ComponentDefinition`
 * descriptor that can be passed to `bootstrapFramework` via the `components`
 * option. Registration happens inside the bootstrap phase, once all framework
 * services are available.
 *
 * This pattern gives a single, explicit composition root instead of relying on
 * decorator side effects triggered by module imports.
 *
 * @param Class - Component class extending `PickComponent`
 * @param config - Component configuration (selector, template, lifecycle, etc.)
 * @returns A `ComponentDefinition` descriptor
 * @throws {Error} If `Class` is not provided
 * @throws {Error} If `config` is not provided
 * @throws {Error} If `config.selector` is empty or whitespace-only
 * @throws {Error} If `config.selector` has leading or trailing whitespace
 *
 * @example
 * ```typescript
 * class MyCounter extends PickComponent {
 *   @Reactive count = 0;
 * }
 *
 * await bootstrapFramework(Services, {}, {
 *   components: [
 *     defineComponent(MyCounter, {
 *       selector: 'my-counter',
 *       template: '<p>{{count}}</p>',
 *     }),
 *   ],
 * });
 * ```
 */
export function defineComponent<T extends new (...args: unknown[]) => PickComponent>(
  Class: T,
  config: ComponentConfig,
): ComponentDefinition {
  if (!Class) throw new Error("[defineComponent] Class is required");
  if (!config) throw new Error("[defineComponent] config is required");
  if (!config.selector || typeof config.selector !== "string" || config.selector.trim().length === 0) {
    throw new Error("[defineComponent] config.selector is required and must not be empty");
  }
  if (config.selector !== config.selector.trim()) {
    throw new Error("[defineComponent] config.selector must not have leading or trailing whitespace");
  }

  return { kind: ComponentKind.Render, Class: Class as new (...args: unknown[]) => PickComponent, config };
}
