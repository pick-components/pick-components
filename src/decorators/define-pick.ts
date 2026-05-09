import type { InlineContext } from "./pick/types.js";
import { ComponentKind } from "./component-kind.js";
import type { ComponentDefinition } from "./component-kind.js";

/**
 * Creates a component definition descriptor using a functional setup — no class, no decorators.
 *
 * @description
 * Decorator-free alternative to `@Pick`. The component is defined entirely
 * through the `setup` function via `InlineContext` (`ctx.state`, `ctx.html`,
 * `ctx.listen`, `ctx.on`, `ctx.lifecycle`, etc.).
 *
 * Returns a `ComponentDefinition` descriptor that can be passed to
 * `bootstrapFramework` via the `components` option. Registration happens inside
 * the bootstrap phase, once all framework services are available. No class
 * declaration is required at any point.
 *
 * @template TState - Type of component state (from `ctx.state()`)
 * @param selector - Custom element tag name (e.g., `"my-counter"`)
 * @param setup - Setup function receiving `InlineContext`
 * @returns A `ComponentDefinition` descriptor
 * @throws {Error} If `selector` is null, undefined, empty, or whitespace-only
 * @throws {Error} If `selector` has leading or trailing whitespace
 * @throws {Error} If `setup` is not provided
 *
 * @example
 * ```typescript
 * await bootstrapFramework(Services, {}, {
 *   components: [
 *     definePick('my-counter', (ctx) => {
 *       ctx.state({ count: 0 });
 *       ctx.html('<p>{{count}}</p>');
 *     }),
 *   ],
 * });
 * ```
 *
 * @example
 * ```typescript
 * // With actions and lifecycle
 * const counter = definePick<{ count: number }>('my-counter', (ctx) => {
 *   ctx.state({ count: 0 });
 *   ctx.on({
 *     increment() { this.count++; },
 *   });
 *   ctx.lifecycle({
 *     onInit: (component, subs) => {
 *       subs.addSubscription(someSignal.subscribe(() => { ... }));
 *     },
 *   });
 *   ctx.html(`
 *     <p>{{count}}</p>
 *     <button pick-action="increment">+1</button>
 *   `);
 * });
 *
 * await bootstrapFramework(Services, {}, { components: [counter] });
 * ```
 */
export function definePick<TState = unknown>(
  selector: string,
  setup: (ctx: InlineContext<TState>) => void,
): ComponentDefinition {
  if (!selector || selector.trim().length === 0) throw new Error("[definePick] selector is required and must not be empty");
  if (selector !== selector.trim()) throw new Error("[definePick] selector must not have leading or trailing whitespace");
  if (!setup) throw new Error("[definePick] setup is required");

  return { kind: ComponentKind.Pick, selector, setup: setup as (ctx: InlineContext) => void };
}
