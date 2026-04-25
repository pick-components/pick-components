# Dependency Injection in Pick Components

Pick Components is **zero-dependency**. It ships a built-in `Services` registry that covers most use cases. External DI containers (like `@janmbaco/injectkit`) can be plugged in as an optional integration.

## Core Concepts

1. **`Services.register(token, instanceOrFactory)`** — Stores a direct instance or a factory function. Dependencies are wired manually by the caller inside the factory closure — there is no automatic dependency graph.
2. **`Services.get(token)`** — Returns the instance. If a factory was registered, calls it on first access and caches the result (lazy singleton).
3. **`Services.getNew(token)`** — Calls the factory again without caching, returning a fresh instance. Required for initializers/lifecycles so each component mount gets its own.
4. **Composition root** — Only `bootstrap.ts` / `main.ts` should call `Services.register()`

## Built-in Services Registry

### Service definition 

```typescript
// race.service.ts
export class RaceService {
  constructor(
    private readonly clock: ClockService,
    private readonly storage: StorageService,
  ) {
    if (!clock) throw new Error("ClockService is required");
    if (!storage) throw new Error("StorageService is required");
  }

  getSnapshot(): RaceState { /* ... */ }

  subscribe(listener: RaceListener): () => void { /* ... */ }
}
```

### Lifecycle binding

```typescript
// race-controls.lifecycle.ts
import { PickLifecycleManager } from "pick-components";

export class RaceControlsLifecycle extends PickLifecycleManager<RaceControlsComponent> {
  constructor(private readonly raceService: RaceService) {
    super();
  }

  protected onComponentReady(component: RaceControlsComponent): void {
    this.addSubscription(
      this.raceService.subscribe((state) => {
        component.control = mapStateToView(state);
      })
    );

    this.addSubscription(
      component.startMassRequested$.subscribe(() => {
        this.raceService.startRace();
      })
    );
  }
}
```

### Composition root

```typescript
// bootstrap.ts
import { Services } from "pick-components";

// Singletons — factory runs once, result is cached
Services.register(ClockService, () => new ClockService());
Services.register(StorageService, () => new StorageService());
Services.register(RaceService, () => new RaceService(
  Services.get(ClockService),
  Services.get(StorageService),
));

// Initializers and lifecycles — must use factory so getNew() creates a fresh instance per mount
Services.register(RaceControlsInitializer, () => new RaceControlsInitializer(
  Services.get(RaceService),
));
Services.register(RaceControlsLifecycle, () => new RaceControlsLifecycle(
  Services.get(RaceService),
));
```

### Component wiring

```typescript
@PickRender({
  selector: "race-controls",
  initializer: () => Services.getNew(RaceControlsInitializer),
  lifecycle: () => Services.getNew(RaceControlsLifecycle),
  template,
  styles,
})
export class RaceControlsComponent extends PickComponent { /* ... */ }
```

---

## Optional: Integration with @janmbaco/injectkit

For larger projects that need a full IoC container, you can replace the default registry with an `InjectKitServicesAdapter`:

```typescript
// src/app/injectkit-services-adapter.ts
import { Container } from "@janmbaco/injectkit";
import { IServiceRegistry, type ServiceToken } from "pick-components";

export class InjectKitServicesAdapter implements IServiceRegistry {
  private readonly container = new Container();

  register<T>(token: ServiceToken<T>, factory: () => T): void {
    this.container.bind(token).toFactory(factory);
  }

  get<T>(token: ServiceToken<T>): T {
    return this.container.get<T>(token);
  }

  getNew<T>(token: ServiceToken<T>): T {
    return this.container.getNew<T>(token);
  }

  has(token: ServiceToken): boolean {
    return this.container.isBound(token);
  }
}
```

```typescript
// main.ts
import { Services } from "pick-components";
import { InjectKitServicesAdapter } from "./app/injectkit-services-adapter";

Services.useImplementation(new InjectKitServicesAdapter());
// ... rest of bootstrap
```

With this adapter in place, you can use `@Singleton` / `@Transient` decorators from injectkit if desired — but it is entirely optional.

---

## Error Handling Pattern

Catch specific errors, re-throw unknown ones:

```typescript
async startRace(): Promise<void> {
  try {
    this.validateRaceReady();
    this.transitionPhase();
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(`Cannot start: ${error.message}`);
    }
    throw error;
  }
}
```

## Anti-Patterns

❌ `new Service()` outside the composition root — hidden coupling  
❌ `Services.get()` inside feature components — only in bootstrap and decorator factories  
❌ Register initializers/lifecycles as direct instances — use factory functions so `getNew()` works  
❌ Mutable shared state on services — services should be stateless or manage state internally  

## Testing with DI

Pass dependencies directly via constructor — no container needed in unit tests:

```typescript
test("should map state to view on subscribe", () => {
  // Arrange
  const mockStorage = { load: () => initialState };
  const mockClock = new ClockService();
  const service = new RaceService(mockClock, mockStorage);

  // Act
  service.setMode("mass_start");

  // Assert
  expect(service.getSnapshot().phase).toBe("register_runners");
});
```

## Further Reading

- [InjectKit documentation](https://www.npmjs.com/package/@janmbaco/injectkit)
