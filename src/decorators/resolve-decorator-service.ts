import type { IServiceProvider } from "../providers/service-provider.interface.js";

/**
 * Resolves a required service from a provider, throwing a descriptive error if missing.
 *
 * @param token - Service token to resolve
 * @param provider - Service provider to resolve from
 * @param caller - Decorator name used in the error message (e.g. `"PickRender"`)
 * @returns The resolved service instance
 * @throws Error if the service token is not registered in the provider
 */
export function resolveDecoratorService<T>(
  token: string,
  provider: IServiceProvider,
  caller: string,
): T {
  if (!provider.has(token)) {
    throw new Error(
      `[${caller}] Framework services are not available. ` +
        `Call bootstrapFramework() on your service registry ` +
        `(e.g. bootstrapFramework(Services) in the default setup) before importing or defining ` +
        `components that use @${caller}. Missing service: '${token}'.`,
    );
  }

  return provider.get<T>(token);
}
