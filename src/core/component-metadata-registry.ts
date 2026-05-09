import { ComponentMetadata } from "./component-metadata.js";
import type { IComponentMetadataRegistry } from "./component-metadata-registry.interface.js";

/**
 * Validates that a value is a plain object (prototype is Object.prototype or null).
 *
 * @private
 * @param value - Value to check
 * @returns true if value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}


/**
 * Exports ComponentMetadata for use in test files and components
 */
export type { ComponentMetadata };

/**
 * Implements the responsibility of storing and retrieving component metadata.
 *
 * @description
 * Instanciable registry for component metadata indexed by selector (tag name).
 * Registered in the service container under `'IComponentMetadataRegistry'` by `bootstrapFramework`.
 *
 * @example
 * ```typescript
 * // Register metadata
 * const registry = new ComponentMetadataRegistry();
 * registry.register('my-counter', {
 *   selector: 'my-counter',
 *   template: '<div>{{count}}</div>'
 * });
 *
 * // Retrieve metadata
 * const metadata = registry.get('my-counter');
 *
 * // Check existence
 * if (registry.has('my-counter')) {
 *   // ...
 * }
 *
 * // Clear for testing
 * registry.clear();
 * ```
 */
export class ComponentMetadataRegistry implements IComponentMetadataRegistry {
  private readonly metadata = new Map<string, ComponentMetadata>();

  /**
   * Registers component metadata in the registry.
   *
   * @param componentId - Component selector (tag name)
   * @param metadata - Component metadata
   * @throws Error if componentId or metadata is null or undefined
   * @throws Error if componentId is already registered
   *
   * @example
   * ```typescript
   * registry.register('my-counter', {
   *   selector: 'my-counter',
   *   template: '<div>Count: {{count}}</div>'
   * });
   * ```
   */
  register(componentId: string, metadata: ComponentMetadata): void {
    if (!componentId) throw new Error("ComponentId is required");
    if (!metadata) throw new Error("Metadata is required");

    if (this.metadata.has(componentId)) {
      throw new Error(`Component ${componentId} is already registered`);
    }

    this.metadata.set(componentId, metadata);
  }

  /**
   * Retrieves component metadata from the registry.
   *
   * @param componentId - Component selector (tag name)
   * @returns Component metadata or undefined if not found
   * @throws Error if componentId is null or undefined
   *
   * @example
   * ```typescript
   * const metadata = registry.get('my-counter');
   * if (metadata) {
   *   console.log(metadata.template);
   * }
   * ```
   */
  get(componentId: string): ComponentMetadata | undefined {
    if (!componentId) throw new Error("ComponentId is required");
    return this.metadata.get(componentId);
  }

  /**
   * Checks if component metadata exists in the registry.
   *
   * @param componentId - Component selector (tag name)
   * @returns true if metadata exists, false otherwise
   * @throws Error if componentId is null or undefined
   *
   * @example
   * ```typescript
   * if (registry.has('my-counter')) {
   *   // Component is registered
   * }
   * ```
   */
  has(componentId: string): boolean {
    if (!componentId) throw new Error("ComponentId is required");
    return this.metadata.has(componentId);
  }

  /**
   * Applies a shallow patch over existing component metadata.
   *
   * @param componentId - Component selector (tag name)
   * @param patch - Partial metadata to merge with current metadata
   * @returns void
   * @throws Error if componentId is null, undefined, or empty whitespace
   * @throws Error if patch is not a plain object (prototype must be Object.prototype or null)
   * @throws Error if patch.selector is defined and does not match componentId
   *
   * @example
   * ```typescript
   * registry.patch('my-counter', {
   *   template: '<div class="custom">{{count}}</div>'
   * });
   * ```
   */
  patch(componentId: string, patch: Partial<ComponentMetadata>): void {
    if (!componentId || componentId.trim().length === 0) {
      throw new Error("ComponentId is required and cannot be empty or whitespace");
    }
    if (!isPlainObject(patch)) {
      throw new Error("Patch must be a plain object");
    }
    if (patch.selector !== undefined && patch.selector !== componentId) {
      throw new Error("Patch selector must match componentId");
    }

    const currentMetadata = this.metadata.get(componentId);
    if (!currentMetadata) {
      return;
    }

    this.metadata.set(componentId, { ...currentMetadata, ...patch });
  }

  /**
   * Clears all registered metadata.
   *
   * @description
   * Used for testing to ensure test isolation.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   registry.clear();
   * });
   * ```
   */
  clear(): void {
    this.metadata.clear();
  }
}
