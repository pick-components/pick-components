# Inyeccion de Dependencias

Pick Components sigue un modelo de DI orientado a factories.

## Principios

- Construir servicios concretos en el composition root.
- Depender de abstracciones en el codigo de features.
- Evitar descubrimiento implicito de servicios y constructores ocultos.

## Registro por Defecto

Puedes usar el registro `Services` para una integracion rapida:

```typescript
import { Services } from "pick-components";

Services.register(ApiService, () => new ApiService());
Services.register(Logger, () => new Logger());
```

## DI con @PickRender

Provee dependencias via factories de `initializer` y `lifecycle`:

```typescript
@PickRender({
  selector: "user-profile",
  template: "<div>{{user?.name}}</div>",
  initializer: () =>
    new UserProfileInitializer(Services.get(ApiService), Services.get(Logger)),
})
class UserProfile extends PickComponent {}
```

## DI con @Pick

Usa factories de dependencias en `ctx.initializer()` y `ctx.lifecycle()`:

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

## Contenedores Externos

Los contenedores externos se pueden integrar adaptandolos a `IServiceRegistry` y resolviendo dependencias de forma explicita mediante factories.

## Documentos Relacionados

- [PICK-VS-PICKRENDER.es.md](PICK-VS-PICKRENDER.es.md)
- [RENDERING-ARCHITECTURE.es.md](RENDERING-ARCHITECTURE.es.md)