import type { IComponentHostResolver } from "./component-host-resolver.interface.js";
import type { IDomContext } from "./dom-context.interface.js";
import type { PickComponent } from "../../core/pick-component.js";

/**
 * Defines the responsibility of resolving host elements for components.
 *
 * @description
 * Internal framework contract for managing component-to-DomContext associations.
 * Extends {@link IComponentHostResolver} with lifecycle methods used by the
 * render pipeline. Consumer code should depend on `IComponentHostResolver` instead.
 *
 * @example
 * ```typescript
 * const resolver: IHostResolver = new DomContextHostResolver();
 * resolver.register(component, domContext);
 *
 * const host = resolver.resolve(component);
 * host.appendChild(element);
 * ```
 */
export interface IHostResolver extends IComponentHostResolver {
  /**
   * Registers a component with its associated DOM context.
   *
   * @param component - Component instance
   * @param domContext - Associated DOM context
   */
  register(component: PickComponent, domContext: IDomContext): void;

  /**
   * Unregisters a component from the resolver.
   *
   * @param component - Component instance to unregister
   */
  unregister(component: PickComponent): void;
}
