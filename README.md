<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/brand/logo-expanded-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset=".github/brand/logo-expanded-light.svg">
    <img src=".github/brand/logo-expanded-dark.svg" alt="Pick Components" width="420">
  </picture>
</p>

> A lightweight, reactive web components framework for TypeScript and modern browser ESM.  
> Business logic stays in services. Components are pure presentation.

Try the live playground: <https://pick-components.github.io/pick-components/>

[![npm](https://img.shields.io/npm/v/pick-components)](https://www.npmjs.com/package/pick-components)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue)](https://www.typescriptlang.org/)

---

## Features

- **Signal-based reactivity** — Per-property signals; only bindings that depend on changed state re-run.
- **Component intent signals** — Typed one-shot actions like save, refresh, or mode change, kept separate from render state.
- **No virtual DOM** — Direct subscriptions update text nodes and attributes in place.
- **Two authoring styles** — Inline `@Pick` for compact components; class-based `@PickRender` for explicit structure.
- **Built-in UI primitives** — `<pick-for>`, `<pick-select>`, `<pick-action>`, `<pick-link>`, and `<pick-router>` cover lists, branching, actions, and navigation.
- **Native slot projection** — Named and default `<slot>` elements for composable layouts via Shadow DOM.
- **Factory-first DI** — Explicit dependency injection through factory functions; no hidden service construction.
- **Security-first expression evaluator** — Deterministic AST pipeline; no `eval` or `new Function`. Whitelisted read-only method calls only.
- **SEO-friendly prerender adoption** — HTML-first delivery with compatible prerendered markup adopted on the client.
- **Tiny footprint** — Zero runtime dependencies.
- **Browser-ready ESM releases** — GitHub release artifacts can be loaded directly with `<script type="module">`.

---

## Why Pick Components Exists

The full origin story is now documented in [docs/WHY-PICK-COMPONENTS.md](docs/WHY-PICK-COMPONENTS.md).

Short version: this framework was created to keep native Web Components explicit, predictable, and maintainable, with strict template safety and a smaller runtime surface.

---

## Installation

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

This is the fastest path when using Vite, Rollup, Webpack, esbuild, or similar toolchains.

## Quickstart (no decorators)

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

You can register components without `@Pick`/`@PickRender` by using `definePick` and `defineComponent` descriptors through the `components` option.

## Copilot AI Setup (Optional)

Want Copilot to follow Pick Components conventions for components, DI, tests, and templates?

See the full setup guide in [docs/USAGE-GUIDE.md#copilot-ai-setup-optional](docs/USAGE-GUIDE.md#copilot-ai-setup-optional).

---

## Start Paths

- **I want to build now (npm + bundler):** stay in this README and use the Quickstart above.
- **I want no decorators:** see [docs/USAGE-GUIDE.md#using-without-decorators-definecomponent-and-definepick](docs/USAGE-GUIDE.md#using-without-decorators-definecomponent-and-definepick).
- **I want Copilot setup:** see [docs/USAGE-GUIDE.md#copilot-ai-setup-optional](docs/USAGE-GUIDE.md#copilot-ai-setup-optional).
- **I want plain browser ESM (no bundler):** see [docs/USAGE-GUIDE.md](docs/USAGE-GUIDE.md).
- **I want architecture and DI details:** see [docs/DEPENDENCY-INJECTION.md](docs/DEPENDENCY-INJECTION.md) and [docs/RENDERING-ARCHITECTURE.md](docs/RENDERING-ARCHITECTURE.md).
- **I want full usage, decorators, actions, templates, and playground workflow:** see [docs/USAGE-GUIDE.md](docs/USAGE-GUIDE.md).

## Run Locally

```bash
npm install
npm run build
npm run serve:dev
```

Playground: `http://localhost:3000`

---

## Documentation

- [docs/README.md](docs/README.md) - Main documentation index (English).
- [docs/README.es.md](docs/README.es.md) - Indice principal de documentacion (espanol).
- [docs/USAGE-GUIDE.md](docs/USAGE-GUIDE.md) - Full setup, usage, and playground workflow.
- [CHANGELOG.md](CHANGELOG.md) - Release history and notable changes.

---

## License

[MIT](LICENSE) © janmbaco
