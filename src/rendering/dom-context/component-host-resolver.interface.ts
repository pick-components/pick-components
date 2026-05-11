import type { PickComponent } from "../../core/pick-component.js";

/**
 * Defines the responsibility of resolving the host element for a component instance.
 *
 * @description
 * Minimal public contract for accessing the host HTMLElement of a registered
 * component. This interface is intended for consumption from component code
 * and user-space services. Internal lifecycle methods (`register`, `unregister`)
 * are intentionally excluded.
 *
 * @example
 * ```typescript
 * const resolver = Services.get<IComponentHostResolver>("IComponentHostResolver");
 * const host = resolver.resolve(this);
 * host.scrollIntoView();
 * ```
 */
export interface IComponentHostResolver {
  /**
   * Resolves the host element for a component instance.
   *
   * @param component - Component instance
   * @returns The host HTMLElement
   * @throws Error if component is not registered
   */
  resolve(component: PickComponent): HTMLElement;
}
