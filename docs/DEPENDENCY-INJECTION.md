# Dependency Injection

Pick Components follows a factory-first DI model.

## Principles

- Build concrete services in a composition root.
- Depend on abstractions in feature code.
- Avoid implicit service discovery and hidden constructors.

## Default Registry

Use the built-in `Services` registry when starting quickly:

```typescript
import { Services } from "pick-components";

Services.register(ApiService, () => new ApiService());
Services.register(Logger, () => new Logger());
```

### Service Lifecycle Semantics in `Services`

- `Services.get(token)`:
  for factory registrations (`() => ...`), creates the instance on first access and reuses it after that (Lazy Singleton by default).
- `Services.getNew(token)`:
  for factory registrations, always returns a fresh instance (Transient).
- If you register a direct instance (`Services.register(Token, instance)`), `getNew(token)` throws because there is no factory to create a new object.

```typescript
import { Services } from "pick-components";

let nextId = 1;

class SessionService {
  constructor(public readonly id = nextId++) {}
}

Services.register(SessionService, () => new SessionService());

const singletonA = Services.get(SessionService);
const singletonB = Services.get(SessionService);
// true: get() reuses the cached instance (lazy singleton)
console.log(singletonA === singletonB);

const transientA = Services.getNew(SessionService);
const transientB = Services.getNew(SessionService);
// false: getNew() creates fresh instances (transient)
console.log(transientA === transientB);
```

## DI with @PickRender

Provide dependencies through `initializer` and `lifecycle` factories:

```typescript
@PickRender({
  selector: "user-profile",
  template: "<div>{{user?.name}}</div>",
  initializer: () =>
    new UserProfileInitializer(Services.get(ApiService), Services.get(Logger)),
})
class UserProfile extends PickComponent {}
```

## DI with @Pick

Use dependency factories in `ctx.initializer()` / `ctx.lifecycle()`:

```typescript
@Pick("event-viewer", (ctx) => {
  const eventBus = Services.get(EventBus);

  ctx.lifecycle(
    {
      onInit(component, subs, deps) {
        const { eventBus } = deps as { eventBus: EventBus };
        subs.addSubscription(eventBus.on("event").subscribe(() => {}));
      },
    },
    () => ({ eventBus }),
  );
});
```

## External Containers

External DI containers can be integrated by adapting them to `IServiceRegistry` and routing resolution through explicit factories.

## Related Docs

- [PICK-VS-PICKRENDER.md](PICK-VS-PICKRENDER.md)
- [RENDERING-ARCHITECTURE.md](RENDERING-ARCHITECTURE.md)