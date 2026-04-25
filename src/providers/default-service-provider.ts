import {
  IServiceRegistry,
  type ServiceToken,
} from "./service-provider.interface.js";

/**
 * Default Service Registry implementation.
 *
 * @description
 * Simple Map-based registry for Composition Root pattern.
 * Supports both direct instances and factory functions for lazy instantiation.
 * Zero-dependency implementation.
 *
 * @remarks
 * Factory functions enable:
 * - Lazy instantiation (created on first access)
 * - Circular dependency resolution
 * - Dynamic dependency resolution
 */
export class DefaultServiceRegistry implements IServiceRegistry {
  private registrations = new Map<ServiceToken<unknown>, unknown>();
  private singletonCache = new Map<ServiceToken<unknown>, unknown>();

  /**
   * Registers a service instance or factory function
   *
   * @param token - Service identifier (class constructor or string)
   * @param instanceOrFactory - Service instance or factory function
   *
   * @example
   * ```typescript
   * // Direct instance
   * registry.register(TodoService, new TodoService());
   *
   * // Factory function (lazy)
   * registry.register(TodoService, () => new TodoService());
   *
   * // With dependencies
   * registry.register(TodoService, () => {
   *   const http = registry.get(HttpService);
   *   return new TodoService(http);
   * });
   * ```
   */
  register<T>(token: ServiceToken<T>, instanceOrFactory: T | (() => T)): void {
    if (this.registrations.has(token)) {
      console.warn(
        `[ServiceRegistry] Service ${this.getTokenName(token)} is already registered. Overwriting.`,
      );
    }
    this.registrations.set(token, instanceOrFactory);
    this.singletonCache.delete(token);
  }

  /**
   * Retrieves a service instance by token
   *
   * @description
   * If the registered value is a factory function, it will be invoked
   * and the result returned. Otherwise, returns the instance directly.
   *
   * @param token - Service identifier
   * @returns Service instance
   * @throws Error if service is not registered
   */
  get<T>(token: ServiceToken<T>): T {
    const value = this.requireRegistration<T>(token);

    if (this.isFactory<T>(value)) {
      if (!this.singletonCache.has(token)) {
        this.singletonCache.set(token, value());
      }
      return this.singletonCache.get(token) as T;
    }

    return value as T;
  }

  /**
   * Creates a fresh service instance by token.
   *
   * @description
   * This method never caches the created instance.
   * The token must be registered with a factory function.
   *
   * @param token - Service identifier
   * @returns Fresh service instance
   * @throws Error if service is not registered
   * @throws Error if service was registered as a direct instance
   */
  getNew<T>(token: ServiceToken<T>): T {
    const value = this.requireRegistration<T>(token);

    if (this.isFactory<T>(value)) {
      return value();
    }

    throw new Error(
      `[ServiceRegistry] Service '${this.getTokenName(token)}' cannot be created as a new instance. ` +
        `Register it with a factory function to use getNew().`,
    );
  }

  has(token: ServiceToken): boolean {
    return this.registrations.has(token);
  }

  clear(): void {
    this.registrations.clear();
    this.singletonCache.clear();
  }

  get size(): number {
    return this.registrations.size;
  }

  private requireRegistration<T>(token: ServiceToken<T>): unknown {
    if (!this.registrations.has(token)) {
      throw new Error(
        `[ServiceRegistry] Service '${this.getTokenName(token)}' is not registered. ` +
          `Make sure to register it in your Composition Root.`,
      );
    }
    return this.registrations.get(token);
  }

  private isFactory<T>(value: unknown): value is () => T {
    return typeof value === "function" && !value.prototype;
  }

  private getTokenName(token: ServiceToken): string {
    if (typeof token === "string") {
      return token;
    }

    if (typeof token === "symbol") {
      return token.toString();
    }

    return token.name || token.toString();
  }
}
