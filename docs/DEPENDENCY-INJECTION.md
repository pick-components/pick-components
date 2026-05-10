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