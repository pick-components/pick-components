import type { ComponentMetadata } from "./component-metadata.js";

/**
 * Defines the responsibility of storing and retrieving component metadata.
 *
 * @description
 * Single contract for the metadata registry — both decorators (write) and the render
 * engine (read) depend on this interface. One token, one instance, no divergence.
 * Registered in the service container under `'IComponentMetadataRegistry'`.
 *
 * @example
 * ```typescript
 * const registry = Services.get<IComponentMetadataRegistry>('IComponentMetadataRegistry');
 * registry.register('my-counter', { selector: 'my-counter', template: '<div>{{count}}</div>' });
 * const metadata = registry.get('my-counter');
 * ```
 */
export interface IComponentMetadataRegistry {
  /**
   * Registers component metadata in the registry.
   *
   * @param componentId - Component selector (tag name)
   * @param metadata - Component metadata to store
   * @throws Error if componentId or metadata is null or undefined
   * @throws Error if componentId is already registered
   */
  register(componentId: string, metadata: ComponentMetadata): void;

  /**
   * Retrieves component metadata by selector.
   *
   * @param componentId - Component selector (tag name)
   * @returns Component metadata or undefined if not found
   * @throws Error if componentId is null or undefined
   */
  get(componentId: string): ComponentMetadata | undefined;

  /**
   * Checks if component metadata exists.
   *
   * @param componentId - Component selector (tag name)
   * @returns true if metadata exists, false otherwise
   * @throws Error if componentId is null or undefined
   */
  has(componentId: string): boolean;

  /**
   * Applies a shallow patch over existing component metadata.
   *
   * @param componentId - Component selector (tag name)
   * @param patch - Partial metadata to merge with current metadata
   * @returns void
  * @throws Error if componentId is null, undefined, or an empty string
   * @throws Error if patch is null or undefined
   * @throws Error if patch.selector is defined and does not match componentId
   */
  patch(componentId: string, patch: Partial<ComponentMetadata>): void;
}
