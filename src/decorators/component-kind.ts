import type { ComponentConfig } from "./pick-render.decorator.js";
import type { InlineContext } from "./pick/types.js";
import type { PickComponent } from "../core/pick-component.js";

/**
 * Discriminates between the two component definition variants.
 *
 * @see {@link ComponentDefinition}
 */
export enum ComponentKind {
  /** Class-based component, equivalent to `@PickRender`. */
  Render = "render",
  /** Functional component, equivalent to `@Pick`. */
  Pick = "pick",
}

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
