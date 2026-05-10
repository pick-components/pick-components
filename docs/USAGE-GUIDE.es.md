# Guía de Uso

Esta guía contiene el contenido técnico ampliado que se movió desde el README raíz para mantener el onboarding rápido sin perder detalles completos de implementación.

## Elige tu Setup

### Opción A - npm + bundler

Usa esta opción con Vite, Rollup, Webpack, esbuild o toolchains similares.

```typescript
import { bootstrapFramework, Services } from "pick-components";
```

Esta ruta no requiere específicamente Vite, pero sí un toolchain que pueda resolver imports del paquete npm para navegador.

### Opción B - HTML plano + ESM listo para navegador

Usa esta opción cuando quieras importar el framework directamente en el navegador, sin bundler.

Para este modo, usa los artefactos browser-ready preparados para GitHub Releases en lugar de intentar importar el paquete npm directamente en el navegador.

Los assets de release se publican aquí:

- `https://github.com/pick-components/pick-components/releases`
- `https://github.com/pick-components/pick-components/releases/tag/v<version>`

Las URLs directas de assets siguen este patrón:

- `https://github.com/pick-components/pick-components/releases/download/v<version>/pick-components.js`
- `https://github.com/pick-components/pick-components/releases/download/v<version>/pick-components-bootstrap.js`

Flujo recomendado:

1. Descarga el bundle para navegador desde los assets de GitHub Release del proyecto.
2. Cópialo en los assets públicos de tu sitio, por ejemplo `/vendor/pick-components.js`.
3. Escribe el código del componente en TypeScript o JavaScript moderno.
4. Transpílalo antes de servirlo al navegador.
5. Importa el JavaScript generado desde tu HTML con `<script type="module">`.

HTML mínimo:

```html
<!doctype html>
<html lang="en">
  <body>
    <hello-card></hello-card>
    <script type="module" src="./hello-card.js"></script>
  </body>
</html>
```

Fuente TypeScript mínima:

```typescript
import {
  bootstrapFramework,
  Services,
  Pick,
} from "/vendor/pick-components.js";

await bootstrapFramework(Services);

@Pick("hello-card", (ctx) => {
  ctx.state({ name: "world" });
  ctx.html(`<p>Hello {{name}}</p>`);
})
class HelloCard {}
```

La distribución browser-ready es autocontenida y no depende de paquetes runtime externos ni de builtins de Node. Está pensada para importarse directamente en el navegador una vez que el archivo se sirve desde tu sitio.

El paquete npm está optimizado para desarrollo y consumo desde toolchains. La distribución para navegador plano está documentada y preparada como un flujo separado de artefactos de release, no como un entrypoint browser-importable del paquete npm.

Para GitHub Releases, el proyecto también prepara una distribución de navegador más completa con:

- bundles sin minificar
- bundles minificados
- source maps para todos los bundles de navegador
- checksums SHA256

Construye los artefactos de release localmente con:

```bash
npm run build:release
```

Esto crea `.release-artifacts/v<version>/`, que replica el contenido esperado en GitHub Release.

Esta ruta de navegador directo asume un entorno moderno con ESM. La sintaxis TypeScript y los decoradores deben transpilarse salvo que tu runtime objetivo soporte explícitamente la sintaxis exacta de decoradores JavaScript que vayas a servir.

## Adopción Incremental en Apps Existentes

Pick Components se puede adoptar de forma incremental dentro de stacks frontend ya existentes.

- En aplicaciones React/Vue, los componentes Pick pueden montarse como custom elements nativos en pantallas concretas.
- No necesitas una reescritura completa para empezar; el enfoque de coexistencia está soportado.
- Mantén el bootstrap de Pick explícito y aislado en el entry donde se usan esos custom elements.

Enfoque típico por fases:

1. Empieza con un widget autocontenido o una sección concreta de página.
2. Registra solo los componentes Pick necesarios en ese entry.
3. Amplía el uso solo si la integración aporta valor real a tu equipo.

## Setup de Copilot AI (Opcional)

Si quieres que Copilot siga las convenciones de Pick Components (componentes, DI, tests y templates), instala el skill del workspace en tu proyecto:

```bash
npx --package=pick-components pick-components-copilot
```

Esto copia `.github/skills/setup-pick-components/` en la raíz de tu proyecto. Haz commit del resultado para habilitar el skill en todo el equipo.

Para instalar en un directorio específico:

```bash
npx --package=pick-components pick-components-copilot --target /path/to/your-project
```

Una vez instalado, escribe `/setup-pick-components` en el chat de Copilot para activar el skill.

## TypeScript y Decoradores

Pick Components funciona con ambos emits de decoradores de TypeScript:

- Decoradores estándar: `experimentalDecorators` omitido o `false`.
- Decoradores legacy: `experimentalDecorators: true`.

No deberías tener que cambiar un proyecto Vite/TypeScript solo para usar Pick Components. El bootstrap por defecto acepta ambos modos.

Sintaxis pública recomendada:

```typescript
class Counter extends PickComponent {
  @Reactive count = 0;
}
```

`@Reactive accessor count = 0` sigue soportado para quien quiera explícitamente auto-accessors TC39, pero no es obligatorio.

El playground y los ejemplos descargados transpilan con esta forma de compilador:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "experimentalDecorators": false
  }
}
```

Si tu proyecto usa el pipeline `experimentalDecorators` de TypeScript, el bootstrap por defecto ya lo soporta:

```typescript
await bootstrapFramework(Services);
```

El modo estricto de decoradores solo está disponible cuando quieres aceptar intencionalmente solo decoradores estándar TC39:

```typescript
await bootstrapFramework(Services, {}, { decorators: "strict" });
```

Para una lista completa de combinaciones probadas de bundler y tsconfig, consulta [DECORATOR-COMPATIBILITY.md](DECORATOR-COMPATIBILITY.md).

## Uso sin decoradores: `defineComponent` y `definePick`

`defineComponent` y `definePick` son los equivalentes sin decoradores de `@PickRender` y `@Pick`. Devuelven descriptores `ComponentDefinition`, y el registro ocurre al pasar esos descriptores a `bootstrapFramework` mediante la opción `components`.

### `defineComponent` - basado en clase, sin decorador de registro

```typescript
import { PickComponent, Reactive, defineComponent } from "pick-components";

class CounterComponent extends PickComponent {
  @Reactive count = 0;

  increment(): void {
    this.count++;
  }
}

export const counterDef = defineComponent(CounterComponent, {
  selector: "my-counter",
  template: `
    <p>{{count}}</p>
    <pick-action action="increment"><button type="button">+1</button></pick-action>
  `,
});
```

### `definePick` - sin clase, sin decoradores

```typescript
import { definePick } from "pick-components";

export const helloDef = definePick<{ name: string }>("hello-card", (ctx) => {
  ctx.state({ name: "world" });
  ctx.html(`<p>Hello {{name}}</p>`);
});
```

### Registro explícito en `bootstrapFramework`

```typescript
import { bootstrapFramework, Services } from "pick-components";
import { counterDef } from "./counter.js";
import { helloDef } from "./hello.js";

await bootstrapFramework(Services, {}, {
  components: [counterDef, helloDef],
});
```

Para la comparación profunda y guía de migración, consulta [PICK-VS-PICKRENDER.md](PICK-VS-PICKRENDER.md#using-without-decorators-definecomponent-and-definepick).

## Bootstrap

Llama a `bootstrapFramework()` una sola vez en tu entry point antes de que se evalúen módulos de componentes que usen `@Pick`, `@PickRender`, `@Reactive` o `@Listen`:

```typescript
import { bootstrapFramework, Services } from "pick-components";

await bootstrapFramework(Services);
await import("./my-component.js");
```

## Uso

Los ejemplos de abajo usan la forma estándar de import del paquete:

```typescript
import { bootstrapFramework, Services } from "pick-components";

await bootstrapFramework(Services);
```

### Componente Presentacional (Proyección de Slots)

Componentes que envuelven contenido hijo en un layout con estilo usando slots nativos de Shadow DOM. Sin estado, sin lógica.

```typescript
import { Pick } from "pick-components";

@Pick("card-container", (ctx) => {
  ctx.html(`
    <div class="card">
      <div class="card-header">
        <slot name="header">Default Header</slot>
      </div>
      <div class="card-body">
        <slot>Default Content</slot>
      </div>
    </div>
  `);
})
export class CardContainer {}
```

```html
<card-container>
  <h2 slot="header">Card Title</h2>
  <p>Card body content goes here.</p>
</card-container>
```

### Componente de Datos (Props Reactivas)

Componentes que reciben datos por atributos y los renderizan de forma reactiva.

```typescript
import { Pick } from "pick-components";

@Pick("user-badge", (ctx) => {
  ctx.props<{ name: string; role: string }>();

  ctx.html(`
    <div class="badge">
      <span class="name">{{name}}</span>
      <span class="role">{{role}}</span>
    </div>
  `);
})
export class UserBadge {}
```

```html
<user-badge name="Alice" role="Engineer"></user-badge>
```

### Componente Interactivo (Estado Local + Eventos)

Componentes con estado local que responde a interacciones de usuario.

```typescript
import { Pick } from "pick-components";

@Pick("simple-counter", (ctx) => {
  ctx.state({ count: 0 });

  ctx.on({
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    reset() {
      this.count = 0;
    },
  });

  ctx.html(`
    <div class="counter">
      <pick-action action="decrement"><button type="button">-</button></pick-action>
      <span>{{count}}</span>
      <pick-action action="increment"><button type="button">+</button></pick-action>
      <pick-action action="reset"><button type="button">Reset</button></pick-action>
    </div>
  `);
})
export class SimpleCounter {}
```

### Componente Basado en Clase (`@PickRender`)

Para componentes que necesitan inicialización asíncrona o un lifecycle manager para conectar servicios externos.

```typescript
import {
  PickRender,
  PickComponent,
  PickInitializer,
  PickLifecycleManager,
  Reactive,
} from "pick-components";

class TodoInitializer extends PickInitializer<TodoList> {
  protected async onInitialize(component: TodoList): Promise<boolean> {
    component.items = await fetch("/api/todos").then((r) => r.json());
    return true;
  }
}

class TodoLifecycle extends PickLifecycleManager<TodoList> {
  protected onComponentReady(component: TodoList): void {
    this.addSubscription(
      todoService.onUpdate$.subscribe((items) => {
        component.items = items;
      }),
    );
  }
}

@PickRender({
  selector: "todo-list",
  template: `
    <ul>
      <pick-for items="{{items}}" key="id">
        <li class="{{$item.done ? 'done' : ''}}">{{$item.text}}</li>
      </pick-for>
    </ul>
  `,
  initializer: () => new TodoInitializer(),
  lifecycle: () => new TodoLifecycle(),
})
export class TodoList extends PickComponent {
  @Reactive items: Todo[] = [];
}
```

## Seguridad de Templates

Pick Components valida templates estáticos en tiempo de compilación. Inline event handlers, elementos ejecutables, `srcdoc`, `style`, `srcset` y protocolos URL inseguros se rechazan con errores explícitos. Las expresiones de template se evalúan mediante un parser restringido y los bindings dinámicos de URL se verifican por la política de attribute binding. Los templates son código escrito por desarrolladores, pero aun así se validan para que sigan siendo declarativos y no se conviertan en entornos ocultos de ejecución JavaScript.

Verificación manual: un template con `<img src="x" onerror="this.insertAdjacentHTML('afterend', '<strong id=xss-ok>ONERROR EJECUTADO</strong>')">` debe fallar al renderizar con un error claro de Pick Components. `ONERROR EJECUTADO` no debe aparecer.

## Intenciones de Componente

Usa `@Reactive` para estado que se renderiza. Usa signals de intención para acciones one-shot de usuario como guardar, refrescar o cambiar de modo, que un lifecycle manager pueda coordinar con servicios.

```typescript
class ModeSelector extends PickComponent {
  @Reactive mode: RaceMode = "mass_start";

  readonly modeRequested$ = this.createIntent<RaceMode>();

  requestMode(mode: RaceMode): void {
    this.modeRequested$.notify(mode);
  }
}

class ModeSelectorLifecycle extends PickLifecycleManager<ModeSelector> {
  protected onComponentReady(component: ModeSelector): void {
    this.addSubscription(
      component.modeRequested$.subscribe((mode) => {
        raceService.setMode(mode);
      }),
    );
  }
}
```

`@Pick` tiene la misma capacidad mediante `ctx.intent<T>("name$")`. Prefiere este patrón para acciones y comandos; deja `getPropertyObservable()` para cambios reales de estado.

## Acciones de Vista

`<pick-action>` es el puente declarativo entre el markup de vista y las acciones del componente. Escucha activación por click y teclado sobre su contenido hijo, y luego despacha un evento `pick-action` que maneja el PickComponent más cercano.

```html
<pick-action action="archive" value="{{selectedId}}">
  <button type="button">Archive</button>
</pick-action>
```

- `action` es el nombre de acción expuesto por `ctx.on(...)` o `getViewActions()`.
- `value` es opcional y se convierte en el primer argumento de la acción.
- El hijo puede ser cualquier trigger visual, no solo un `<button>`.
- `event` también se acepta como alias de `action`, pero el código nuevo debe usar `action`.
- Las acciones manejadas se detienen en el componente más cercano por defecto.
- Añade `bubble` solo cuando un componente padre deba poder manejar la misma acción.

## Sintaxis de Templates

| Sintaxis          | Descripción                                               |
| ----------------- | --------------------------------------------------------- |
| `{{expression}}`  | Binding reactivo - se reevalúa al cambiar la propiedad   |
| `[[RULES.field]]` | Reglas de validación - expande a atributos HTML5         |
| `<slot>`          | Slot de proyección por defecto (Shadow DOM nativo)       |
| `<slot name="X">` | Slot de proyección con nombre (Shadow DOM nativo)      |

## Comandos

| Comando                    | Descripción                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `npm install`              | Instalar dependencias                                             |
| `npm run build:lib`        | Compilar librería a `dist/`                                       |
| `npm run build:browser`    | Empaquetar artefactos ESM browser-ready en `dist/browser/`        |
| `npm run build:prod`       | Compilar librería + artefactos ESM browser-ready                  |
| `npm run build:release`    | Preparar artefactos browser de release en `.release-artifacts/`   |
| `npm run build`            | Compilar librería + ejemplos                                      |
| `npm run serve:dev`        | Iniciar servidor dev en `http://localhost:3000`                   |
| `npm run serve:dist`       | Servir ejemplos compilados con rutas SEO file-first en puerto `8080` |
| `npm test`                 | Ejecutar suite completa (unit + integration)                      |
| `npm run test:unit`        | Solo tests unitarios                                              |
| `npm run test:integration` | Solo tests de integración                                         |
| `npm run test:coverage`    | Ejecutar unit + integration con umbral V8 del 80%                |
| `npm run lint`             | Ejecutar lint en fuentes                                          |
| `npm run format`           | Formatear fuentes                                                 |

## Playground Interactivo

El proyecto incluye 15 ejemplos interactivos que corren en navegador mediante un playground TypeScript con preview en vivo. Cada ejemplo tiene un panel de código editable (CodeMirror) y un sandbox iframe que retranspila y reejecuta en cada cambio.

Pruébalo online: <https://pick-components.github.io/pick-components/>

### Ejecutar el playground

```bash
npm install
npm run build
npm run serve:dev
```

Para previsualizar los ejemplos compilados con el servidor estático orientado a producción:

```bash
npm run build
npm run serve:dist
```

El playground también incluye una plantilla edge worker en `deploy/cloudflare/public-route-worker.mjs`. Sirve primero rutas públicas prerenderizadas y luego hace fallback al shell SPA para rutas solo de app. Crawlers y navegadores reciben el mismo HTML canónico; el bundle cliente solo lo mejora.

### Ejemplos

| #   | Pestaña                  | Categoría     | Descripción                                      |
| --- | ------------------------ | ------------ | ------------------------------------------------ |
| 01  | Hello World              | Basics       | Componente mínimo con `@PickRender`             |
| 02  | Reactive State           | Basics       | Estado `@Reactive` y acciones simples           |
| 03  | Template Bindings        | Basics       | Bindings simples con `{{...}}`                  |
| 04  | Template Expressions     | Basics       | Expresiones dentro de `{{...}}`                 |
| 05  | Computed Bindings        | Basics       | Bindings derivados de getters                   |
| 06  | @Pick Component          | Basics       | Autoría funcional con `@Pick`                   |
| 07  | Pick Actions             | Primitives   | Acciones declarativas de vista con `<pick-action>` |
| 07b | Pick Actions with @Pick  | Primitives   | El mismo modelo de acciones vía `ctx.on(...)`   |
| 08  | Pick Select              | Primitives   | Ramas condicionales con `<pick-select>`         |
| 09  | Pick For                 | Primitives   | Renderizado de listas con `<pick-for>`          |
| 10  | Forms and Rules          | Primitives   | Reglas de validación provistas antes de render  |
| 11  | DI Injection             | Architecture | Puente InjectKit y dependencias por constructor |
| 12  | Real API                 | Architecture | Initializer + lifecycle + `createIntent()`      |
| 13  | Dashboard                | Architecture | Composición multi-servicio y template/CSS separados |
| 14  | @Pick Advanced           | Architecture | Componente `@Pick` completo con servicios y estado |
| 15  | Native Slots             | Basics       | Proyección nativa de slots con nombre y por defecto |

### Despliegue con Docker

```bash
docker build -t pick-components .
docker run -p 8080:8080 pick-components
```

- Playground: `http://localhost:8080`
- Rutas públicas: `http://localhost:8080/es/01-hello`
