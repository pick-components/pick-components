import { PickRender as PickComponentDecorator } from "./pick-render.decorator.js";
import type { InlineContext } from "./pick/types.js";
import type { IPickComponentFactory } from "./pick/pick-component-factory.interface.js";
import { Services } from "../providers/service-provider.js";
import type { IServiceProvider } from "../providers/service-provider.interface.js";
import { resolveDecoratorService } from "./resolve-decorator-service.js";

/**
 * Implements the responsibility of providing a functional decorator for Pick Components.
 *
 * @template TState - Type of component state (from `ctx.state()`)
 * @param selector - Custom element tag name (e.g., "my-counter")
 * @param setup - Setup function receiving `InlineContext`
 * @param provider - Service provider used to resolve framework dependencies. Defaults to the global
 *   `Services` singleton. Pass a registry only when bootstrapping outside the default service context.
 * @returns Class decorator that transforms the target into a PickComponent
 *
 * @example
 * ```typescript
 * @Pick('hello-world', (ctx) => {
 *   ctx.state({ name: 'World' });
 *   ctx.html('<p>Hello {{name}}!</p>');
 * })
 * class HelloWorld {}
 * ```
 */
export function Pick<TState = unknown>(
  selector: string,
  setup: (ctx: InlineContext<TState>) => void,
  provider: IServiceProvider = Services,
): ClassDecorator {
  if (!selector) throw new Error("selector is required");
  if (!setup) throw new Error("setup is required");

  const decorator = ((target: unknown) => {
    const factory = resolveDecoratorService<IPickComponentFactory>(
      "IPickComponentFactory",
      provider,
      "Pick",
    );
    const config = factory.captureConfig(setup);
    const EnhancedClass = factory.createEnhancedClass(target, config);
    const InitializerClass = factory.createInitializerClass(config);
    const LifecycleClass = factory.createLifecycleClass(config);

    const ComponentDecorator = PickComponentDecorator({
      selector,
      template: config.template || "",
      skeleton: config.skeleton,
      errorTemplate: config.errorTemplate,
      styles: config.styles,
      initializer: InitializerClass ? () => new InitializerClass() : undefined,
      lifecycle: LifecycleClass ? () => new LifecycleClass() : undefined,
    }, provider);

    return ComponentDecorator(EnhancedClass);
  }) as ClassDecorator;

  return decorator;
}
