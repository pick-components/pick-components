# Primeros Pasos con Pick Components

Esta guía te lleva desde una carpeta vacía hasta tu primer componente en funcionamiento. Asume que tienes Node.js 18+ instalado.

---

## Paso 1 — Crea tu proyecto

```bash
mkdir mi-app && cd mi-app
npm init -y
npm install typescript --save-dev
```

Añade un `tsconfig.json` mínimo:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "moduleResolution": "bundler",
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
```

> Si tu bundler requiere un `moduleResolution` diferente, ajústalo según corresponda. Pick Components distribuye ESM estándar y funciona con Vite, Rollup, Webpack y esbuild.

---

## Paso 2 — Instala Pick Components

```bash
npm install pick-components
```

---

## Paso 3 — Instala el skill de Copilot

El skill de Copilot le enseña a GitHub Copilot las convenciones de Pick Components para que genere componentes, tests, configuración de DI y templates correctos, sin tener que adivinar.

Instálalo en tu proyecto con:

```bash
npx --package=pick-components pick-components-copilot
```

Esto copia `.github/skills/setup-pick-components/` en la raíz de tu proyecto. Haz commit del resultado para que todo el equipo se beneficie.

Si prefieres instalarlo manualmente, copia la carpeta `setup-pick-components/` desde el [repositorio](https://github.com/pick-components/pick-components/tree/main/.github/skills/setup-pick-components) en `.github/skills/` de tu proyecto.

---

## Paso 4 — Actívalo en el chat de Copilot

Abre el chat de GitHub Copilot (VS Code o web) y escribe:

```
/setup-pick-components
```

Copilot carga el skill y a partir de ese momento genera código Pick Components siguiendo las convenciones del framework.

---

## Paso 5 — Genera tu proyecto con Copilot

### 5a. Genera los archivos de entrada

Pega este prompt en el chat de Copilot:

> Crea un `index.html` y un `src/bootstrap.ts` mínimos para un proyecto Pick Components con npm y un bundler.

Copilot producirá:

**`index.html`**
```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mi App</title>
    <script type="module" src="./src/bootstrap.js"></script>
  </head>
  <body>
    <!-- tus componentes van aquí -->
  </body>
</html>
```

**`src/bootstrap.ts`**
```typescript
import { bootstrapFramework, Services } from "pick-components/bootstrap";

await bootstrapFramework(Services);
```

> `bootstrapFramework` debe completarse antes de que se importe cualquier módulo de componentes. Usa `await` de nivel superior (ESM) para garantizar el orden.

### 5b. Crea tu primer componente

Elige el estilo que prefieras y pega el prompt correspondiente en el chat de Copilot.

> **Consejo:** dile a Copilot dónde debe ir el componente en la página para que también actualice el `index.html` por ti. Si es el único componente de la página, di «como contenido principal de la página». Si va dentro de una sección concreta, descríbela — p. ej. «dentro de un `<main>` debajo de un `<header>`».

#### Contexto inline — `@Pick` (con decorador)

> Crea un componente contador con Pick Components usando `@Pick` con incremento, decremento y reinicio. Añádelo al `index.html` como contenido principal de la página.

#### Contexto inline — `definePick` (sin decoradores)

> Crea un componente contador con Pick Components usando `definePick` con incremento, decremento y reinicio. Añádelo al `index.html` como contenido principal de la página.

#### Basado en clase — `@PickRender` (con decorador)

> Crea un componente contador con Pick Components usando `@PickRender` con incremento, decremento y reinicio. Añádelo al `index.html` como contenido principal de la página.

#### Basado en clase — `defineComponent` (sin decoradores)

> Crea un componente contador con Pick Components usando `defineComponent` con incremento, decremento y reinicio. Añádelo al `index.html` como contenido principal de la página.

---

## Qué genera Copilot

A continuación se muestran las salidas mínimas para cada estilo.

### `@Pick`

**`src/counter-app.ts`**
```typescript
import { Pick } from "pick-components";

@Pick("counter-app", (ctx) => {
  ctx.state({ count: 0 });

  ctx.on({
    increment() { this.count++; },
    decrement() { this.count--; },
    reset()      { this.count = 0; },
  });

  ctx.html(`
    <p>Contador: {{count}}</p>
    <pick-action action="increment"><button type="button">+</button></pick-action>
    <pick-action action="decrement"><button type="button">−</button></pick-action>
    <pick-action action="reset"><button type="button">Reiniciar</button></pick-action>
  `);
})
class CounterApp {}
```

**`src/bootstrap.ts`**
```typescript
import { bootstrapFramework, Services } from "pick-components/bootstrap";
import "./counter-app.js";

await bootstrapFramework(Services);
```

**`index.html`**
```html
<body>
  <counter-app></counter-app>
</body>
```

---

### `definePick`

```typescript
import { definePick, bootstrapFramework, Services } from "pick-components";

const counterDef = definePick<{ count: number }>("counter-app", (ctx) => {
  ctx.state({ count: 0 });

  ctx.on({
    increment() { this.count++; },
    decrement() { this.count--; },
    reset()      { this.count = 0; },
  });

  ctx.html(`
    <p>Contador: {{count}}</p>
    <pick-action action="increment"><button type="button">+</button></pick-action>
    <pick-action action="decrement"><button type="button">−</button></pick-action>
    <pick-action action="reset"><button type="button">Reiniciar</button></pick-action>
  `);
});

await bootstrapFramework(Services, {}, { components: [counterDef] });
```

---

### `@PickRender`

```typescript
import { PickComponent, PickRender, Reactive, PickViewActions } from "pick-components";

@PickRender({
  selector: "counter-app",
  template: `
    <p>Contador: {{count}}</p>
    <pick-action action="increment"><button type="button">+</button></pick-action>
    <pick-action action="decrement"><button type="button">−</button></pick-action>
    <pick-action action="reset"><button type="button">Reiniciar</button></pick-action>
  `,
})
export class CounterApp extends PickComponent {
  @Reactive count = 0;

  getViewActions(): PickViewActions {
    return {
      increment: () => { this.count++; },
      decrement: () => { this.count--; },
      reset:     () => { this.count = 0; },
    };
  }
}
```

---

### `defineComponent`

```typescript
import { PickComponent, Reactive, defineComponent, PickViewActions } from "pick-components";

class CounterApp extends PickComponent {
  @Reactive count = 0;

  getViewActions(): PickViewActions {
    return {
      increment: () => { this.count++; },
      decrement: () => { this.count--; },
      reset:     () => { this.count = 0; },
    };
  }
}

export const counterDef = defineComponent(CounterApp, {
  selector: "counter-app",
  template: `
    <p>Contador: {{count}}</p>
    <pick-action action="increment"><button type="button">+</button></pick-action>
    <pick-action action="decrement"><button type="button">−</button></pick-action>
    <pick-action action="reset"><button type="button">Reiniciar</button></pick-action>
  `,
});
```

**`src/bootstrap.ts`**
```typescript
import { bootstrapFramework, Services } from "pick-components/bootstrap";
import { counterDef } from "./counter-app.js";

await bootstrapFramework(Services, {}, { components: [counterDef] });
```

---

## ¿Qué estilo debo elegir?

| | `@Pick` | `definePick` | `@PickRender` | `defineComponent` |
|---|---|---|---|---|
| **Decoradores** | sí | no | sí | no |
| **Clase** | no | no | sí | sí |
| **Estado mediante** | `ctx.state()` | `ctx.state()` | `@Reactive` | `@Reactive` |
| **Acciones mediante** | `ctx.on()` | `ctx.on()` | `getViewActions()` | `getViewActions()` |
| **Ideal para** | componentes inline compactos | inline sin decoradores | ciclo de vida completo | ciclo de vida completo, sin decoradores |

Los cuatro estilos soportan `initializer`, `lifecycle`, `skeleton` y `errorTemplate` para hidratación asíncrona y estados de carga.

---

## Siguientes pasos

Una vez que tu primer componente funcione:

- Usa más prompts de Copilot para generar servicios, tests y configuración de DI
- Lee [docs/USAGE-GUIDE.md](USAGE-GUIDE.md) para cobertura completa de funcionalidades
- Lee [docs/DEPENDENCY-INJECTION.md](DEPENDENCY-INJECTION.md) para patrones de DI factory-first
- Lee [docs/PICK-VS-PICKRENDER.es.md](PICK-VS-PICKRENDER.es.md) para una comparación detallada entre `@Pick` y `@PickRender`
- Prueba el [playground interactivo](https://pick-components.github.io/pick-components/)

### Prompts de seguimiento útiles para Copilot

> Escribe un test unitario para mi componente `CounterApp` siguiendo el patrón AAA.

> Añade un `PickInitializer` a `CounterApp` que cargue el contador inicial desde un `CounterService`.

> Muéstrame cómo registrar `CounterService` en el composition root usando `Services`.

> Añade un `PickLifecycleManager` a `CounterApp` que se suscriba a un observable de `CounterService`.
