<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/pick-components/pick-components/main/.github/brand/logo-expanded-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/pick-components/pick-components/main/.github/brand/logo-expanded-light.svg">
    <img src="https://raw.githubusercontent.com/pick-components/pick-components/main/.github/brand/logo-expanded-dark.svg" alt="Pick Components" width="420">
  </picture>
</p>

> Framework ligero y reactivo de Web Components para TypeScript y ESM moderno en navegador.  
> La lógica de negocio vive en servicios. Los componentes son presentacionales.

Versión canónica en inglés: [README.md](README.md)

Prueba el playground en vivo: <https://pick-components.github.io/pick-components/>

[![npm](https://img.shields.io/npm/v/pick-components)](https://www.npmjs.com/package/pick-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

---

## Características

- **Reactividad basada en señales** - Señales por propiedad; solo se re-ejecutan los bindings que dependen del estado cambiado.
- **Signals de intención del componente** - Acciones one-shot tipadas como guardar, refrescar o cambiar de modo, separadas del estado de render.
- **Sin virtual DOM** - Suscripciones directas actualizan nodos de texto y atributos in-place.
- **Dos estilos de autoría** - `@Pick` inline para componentes compactos; `@PickRender` basado en clase para estructura explícita.
- **Primitivas UI incluidas** - `<pick-for>`, `<pick-select>`, `<pick-action>`, `<pick-link>` y `<pick-router>` cubren listas, ramas, acciones y navegación.
- **Proyección nativa de slots** - `<slot>` con nombre y por defecto para layouts componibles vía Shadow DOM.
- **DI factory-first** - Inyección de dependencias explícita mediante factories; sin construcción oculta de servicios.
- **Evaluador de expresiones orientado a seguridad** - Pipeline AST determinista; sin `eval` ni `new Function`.
- **Adopción SEO-friendly de prerender** - Entrega HTML-first con adopción en cliente de markup prerenderizado compatible.
- **Huella mínima** - Cero dependencias runtime.
- **Releases ESM listos para navegador** - Los artefactos de GitHub Release se pueden cargar directamente con `<script type="module">`.

---

## Por qué existe Pick Components

La historia completa del proyecto está en [docs/WHY-PICK-COMPONENTS.es.md](docs/WHY-PICK-COMPONENTS.es.md).

Resumen corto: este framework se creó para mantener los Web Components nativos explícitos, predecibles y mantenibles, con seguridad estricta en templates y una superficie runtime más pequeña.

---

## Instalación

```bash
npm install pick-components
```

## Quickstart (npm + bundler)

```typescript
import { bootstrapFramework, Services, Pick } from "pick-components";

await bootstrapFramework(Services);

@Pick("hello-card", (ctx) => {
  ctx.state({ name: "world" });
  ctx.html(`<p>Hello {{name}}</p>`);
})
class HelloCard {}
```

Es la ruta más rápida para Vite, Rollup, Webpack, esbuild u otros toolchains similares.

## Quickstart (sin decoradores)

```typescript
import {
  bootstrapFramework,
  Services,
  definePick,
} from "pick-components";

const helloDef = definePick<{ name: string }>("hello-card", (ctx) => {
  ctx.state({ name: "world" });
  ctx.html(`<p>Hello {{name}}</p>`);
});

await bootstrapFramework(Services, {}, {
  components: [helloDef],
});
```

Puedes registrar componentes sin `@Pick` ni `@PickRender` usando descriptores `definePick` y `defineComponent` mediante la opción `components`.

## Setup de Copilot AI (Opcional)

¿Quieres que Copilot siga las convenciones de Pick Components para componentes, DI, tests y templates?

Consulta la guía completa en [docs/USAGE-GUIDE.es.md#setup-de-copilot-ai-opcional](docs/USAGE-GUIDE.es.md#setup-de-copilot-ai-opcional).

---

## Rutas de inicio

- **Quiero construir ya (npm + bundler):** quédate en este README y usa el Quickstart de arriba.
- **Quiero una guía paso a paso con Copilot:** ve a [docs/GETTING-STARTED.es.md](docs/GETTING-STARTED.es.md).
- **Quiero trabajar sin decoradores:** ve a [docs/USAGE-GUIDE.es.md#uso-sin-decoradores-definecomponent-y-definepick](docs/USAGE-GUIDE.es.md#uso-sin-decoradores-definecomponent-y-definepick).
- **Quiero setup de Copilot:** ve a [docs/USAGE-GUIDE.es.md#setup-de-copilot-ai-opcional](docs/USAGE-GUIDE.es.md#setup-de-copilot-ai-opcional).
- **Quiero browser ESM plano (sin bundler):** ve a [docs/USAGE-GUIDE.es.md](docs/USAGE-GUIDE.es.md).
- **Quiero detalles de arquitectura y DI:** ve a [docs/DEPENDENCY-INJECTION.es.md](docs/DEPENDENCY-INJECTION.es.md) y [docs/RENDERING-ARCHITECTURE.es.md](docs/RENDERING-ARCHITECTURE.es.md).
- **Quiero comparativas con frameworks (React, Vue, Lit, Angular, Svelte, Glimmer):** ve a [docs/PICK-VS-OTHERS.es.md](docs/PICK-VS-OTHERS.es.md).
- **Quiero la referencia completa de uso, decoradores, acciones, templates y playground:** ve a [docs/USAGE-GUIDE.es.md](docs/USAGE-GUIDE.es.md).
- **Prefiero leer la documentación en inglés:** ve a [README.md](README.md) y [docs/README.md](docs/README.md).

## Ejecutar en local

```bash
npm install
npm run build
npm run serve:dev
```

Playground: `http://localhost:3000`

---

## Documentación

- [docs/README.es.md](https://github.com/pick-components/pick-components/blob/main/docs/README.es.md) - Índice principal de documentación en español.
- [docs/WHY-PICK-COMPONENTS.es.md](https://github.com/pick-components/pick-components/blob/main/docs/WHY-PICK-COMPONENTS.es.md) - Origen y motivación del proyecto en español.
- [docs/USAGE-GUIDE.es.md](https://github.com/pick-components/pick-components/blob/main/docs/USAGE-GUIDE.es.md) - Guía completa en español (setup, uso y playground).
- [docs/GETTING-STARTED.es.md](https://github.com/pick-components/pick-components/blob/main/docs/GETTING-STARTED.es.md) - Guía paso a paso en español.
- [docs/README.md](https://github.com/pick-components/pick-components/blob/main/docs/README.md) - Main documentation index (English).
- [CHANGELOG.md](https://github.com/pick-components/pick-components/blob/main/CHANGELOG.md) - Historial de versiones y cambios relevantes.

---

## Nota de idioma

La fuente de verdad del proyecto se mantiene en inglés. Las traducciones al español se publican como documentación complementaria para facilitar la adopción.

## Licencia

[MIT](LICENSE) © janmbaco
