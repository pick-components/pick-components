import type { ComponentConfig } from "./pick-render.decorator.js";
import type { InlineContext } from "./pick/types.js";
import type { PickComponent } from "../core/pick-component.js";

/**
 * Convenience values for constructing `ComponentDefinition` descriptors.
 * Each member is typed as its exact string literal value so that
 * `ComponentKind.Render` is directly assignable to the `"render"` literal
 * in `ComponentDefinition` without an explicit cast.
 *
 * @see {@link ComponentDefinition}
 */
export const ComponentKind = {
  /** Class-based component, equivalent to `@PickRender`. */
  Render: "render",
  /** Functional component, equivalent to `@Pick`. */
  Pick: "pick",
} as const;

/**
 * Descriptor for a component registered via `defineComponent` or `definePick`.
 *
 * @description
 * Produced by `defineComponent` and `definePick` when called before
 * `bootstrapFramework`. Pass descriptors through the `components` option to
 * let the framework register them once services are available.
 *
 * @see {@link defineComponent}
 * @see {@link definePick}
 */
export type ComponentDefinition =
  | {
      readonly kind: "render";
      readonly Class: new (...args: unknown[]) => PickComponent;
      readonly config: ComponentConfig;
    }
  | {
      readonly kind: "pick";
      readonly selector: string;
      readonly setup: (ctx: InlineContext) => void;
    };
