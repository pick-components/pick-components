import type { ComponentMetadata } from "./component-metadata.js";
import type { IComponentMetadataRegistry } from "./component-metadata-registry.interface.js";
import { isPlainObject } from "../utils/is-plain-object.js";

/**
 * Exports ComponentMetadata for use in test files and components
 */
export type { ComponentMetadata };

/**
 * Implements the responsibility of storing and retrieving component metadata.
 *
 * @description
 * Instantiable registry for component metadata indexed by selector (tag name).
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
  private static readonly ALLOWED_PATCH_FIELDS = new Set<string>([
    "selector",
    "template",
    "skeleton",
    "errorTemplate",
    "styles",
    "initializer",
    "lifecycle",
  ]);

  private validateComponentId(componentId: string): void {
    if (!componentId || componentId.trim().length === 0) {
      throw new Error("ComponentId is required and cannot be empty or whitespace");
    }

    if (componentId !== componentId.trim()) {
      throw new Error("ComponentId cannot contain leading or trailing whitespace");
    }
  }

  private validatePatchFields(
    patch: Partial<ComponentMetadata>,
    componentId: string,
  ): void {
    for (const key of Object.keys(patch)) {
      if (!ComponentMetadataRegistry.ALLOWED_PATCH_FIELDS.has(key)) {
        throw new Error(`Patch contains unsupported field '${key}'`);
      }
    }

    if ("selector" in patch && typeof patch.selector !== "string") {
      throw new Error("Patch selector must be a string when provided");
    }
    if ("selector" in patch && patch.selector !== componentId) {
      throw new Error("Patch selector must match componentId");
    }
    if ("template" in patch && typeof patch.template !== "string") {
      throw new Error("Patch template must be a string when provided");
    }
    if ("skeleton" in patch && typeof patch.skeleton !== "string") {
      throw new Error("Patch skeleton must be a string when provided");
    }
    if (
      "errorTemplate" in patch &&
      typeof patch.errorTemplate !== "string"
    ) {
      throw new Error("Patch errorTemplate must be a string when provided");
    }
    if ("styles" in patch && typeof patch.styles !== "string") {
      throw new Error("Patch styles must be a string when provided");
    }
    if ("initializer" in patch && typeof patch.initializer !== "function") {
      throw new Error("Patch initializer must be a function when provided");
    }
    if ("lifecycle" in patch && typeof patch.lifecycle !== "function") {
      throw new Error("Patch lifecycle must be a function when provided");
    }
  }

  /**
   * Registers component metadata in the registry.
   *
   * @param componentId - Component selector (tag name)
   * @param metadata - Component metadata
   * @throws Error if componentId is null, undefined, or empty whitespace
   * @throws Error if metadata is null or undefined
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
    this.validateComponentId(componentId);
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
   * @throws Error if componentId is null, undefined, or empty whitespace
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
    this.validateComponentId(componentId);
    return this.metadata.get(componentId);
  }

  /**
   * Checks if component metadata exists in the registry.
   *
   * @param componentId - Component selector (tag name)
   * @returns true if metadata exists, false otherwise
   * @throws Error if componentId is null, undefined, or empty whitespace
   *
   * @example
   * ```typescript
   * if (registry.has('my-counter')) {
   *   // Component is registered
   * }
   * ```
   */
  has(componentId: string): boolean {
    this.validateComponentId(componentId);
    return this.metadata.has(componentId);
  }

  /**
   * Applies a shallow patch over existing component metadata.
   * If the component is not registered, this operation is a no-op after input validation.
   *
   * @param componentId - Component selector (tag name)
   * @param patch - Partial metadata to merge with current metadata
   * @returns void
   * @throws Error if componentId is null, undefined, or empty whitespace
   * @throws Error if patch is not a plain object (prototype must be Object.prototype or null)
   * @throws Error if patch fields have invalid runtime types
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
    this.validateComponentId(componentId);
    if (!isPlainObject(patch)) {
      throw new Error("Patch must be a plain object");
    }
    this.validatePatchFields(patch, componentId);

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
