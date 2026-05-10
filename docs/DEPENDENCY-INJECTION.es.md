# Inyección de Dependencias

Pick Components sigue un modelo de DI orientado a factories.

## Principios

- Construir servicios concretos en el composition root.
- Depender de abstracciones en el código de features.
- Evitar descubrimiento implícito de servicios y constructores ocultos.

## Registro por Defecto

Puedes usar el registro `Services` para una integración rápida:

```typescript
import { Services } from "pick-components";

Services.register(ApiService, () => new ApiService());
Services.register(Logger, () => new Logger());
```

### Semántica de ciclo de vida en `Services`

- `Services.get(token)`:
  para registros con factory (`() => ...`) crea la instancia en el primer acceso y la reutiliza después (Lazy Singleton por defecto).
- `Services.getNew(token)`:
  para registros con factory crea siempre una instancia nueva (Transient).
- Si registras una instancia directa (`Services.register(Token, instancia)`), `getNew(token)` lanza error porque no existe factory para construir un nuevo objeto.

```typescript
import { Services } from "pick-components";

let nextId = 1;

class SessionService {
  constructor(public readonly id = nextId++) {}
}

Services.register(SessionService, () => new SessionService());

const singletonA = Services.get(SessionService);
const singletonB = Services.get(SessionService);
// true: get() reutiliza la instancia cacheada (lazy singleton)
console.log(singletonA === singletonB);

const transientA = Services.getNew(SessionService);
const transientB = Services.getNew(SessionService);
// false: getNew() crea instancias frescas (transient)
console.log(transientA === transientB);
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

Los contenedores externos se pueden integrar adaptándolos a `IServiceRegistry` y resolviendo dependencias de forma explícita mediante factories.

## Documentos Relacionados

- [PICK-VS-PICKRENDER.es.md](PICK-VS-PICKRENDER.es.md)
- [RENDERING-ARCHITECTURE.es.md](RENDERING-ARCHITECTURE.es.md)