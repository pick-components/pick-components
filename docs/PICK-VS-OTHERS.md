# Pick Components vs Lit / Angular / Glimmer

This document explains what Pick Components is and what it is not, to help developers coming from other frameworks set accurate expectations.

---

## What Pick Components is not

### Not a Lit replacement

Lit is a Google-maintained library for building Web Components with tagged template literals (`html\`...\``), property reflection, and a reactive update system that diffs attribute and property values.

Pick Components does not use tagged template literals. Templates are plain HTML strings compiled into a reactive binding graph at runtime. The binding model is explicit and based on named state properties — there is no virtual DOM diffing and no property reflection cycle.

If you are already using Lit and it meets your needs, there is no reason to switch.

### Not Angular

Angular is a full application framework with a module system, dependency injection container, zone-based change detection, a CLI, AOT compilation, and an opinionated project structure.

Pick Components is a component framework, not an application framework. It has no router beyond `<pick-router>` for the simple case, no module system, no CLI, no AOT step, and no zone.js. Dependency injection is explicit and factory-first — there is no container that auto-discovers or auto-wires services.

### Not Glimmer

Glimmer VM is the rendering layer inside Ember. It uses a compiled bytecode format for templates, a reference-based reactivity model, and a strict owner tree for component ownership.

Pick Components compiles templates at runtime in the browser, not at build time. There is no bytecode, no Ember owner model, and no glimmer-component class contract to implement.

---

## What Pick Components is

### Native Web Components first

Every component registered with `@Pick` or `@PickRender` becomes a native custom element. There is no virtual component tree sitting between your component and the browser. Shadow DOM, slots, attribute observation, and `customElements` are used directly.

### Controlled templates

Templates are plain HTML strings. Expressions inside `{{...}}` are parsed by a deterministic AST pipeline — no `eval`, no `new Function`. Only safe read-only property access and a whitelisted set of method calls are permitted. Arbitrary JavaScript cannot run inside a template.

### Explicit lifecycle and services

The rendering pipeline is explicit and sequential:

```
Skeleton → Initializer → Template Compile → DOM Replace → Listeners → onRenderComplete → LifecycleManager
```

Each step has a single responsibility. There are no lifecycle ambiguities about when state is ready, when the DOM exists, or when services are available.

### Explicit dependency injection

Services are injected through factory functions. Nothing is auto-discovered, auto-wired, or auto-instantiated. Every dependency a component receives is declared explicitly at the composition root.

### Zero runtime dependencies

The npm package has no runtime dependencies. The browser-ready distribution is a single self-contained file.

---

## Quick comparison table

| Aspect | Pick Components | Lit | Angular | Glimmer |
| ------ | --------------- | --- | ------- | ------- |
| Template syntax | `{{prop}}` in HTML strings | Tagged template literals | `{{ prop }}` in `.html` files | `{{prop}}` in `.hbs` files |
| Reactivity model | Signal-based, per-property subscriptions | Property reflection + update cycle | Zone.js + change detection | Tracked references + autotracking |
| DOM strategy | Native Shadow DOM, no diffing | LitElement manages Shadow DOM | Zone-triggered DOM updates | Compiled bytecode, incremental rendering |
| DI | Explicit factory functions | Not included | Full container with decorators | Owner-based component tree |
| Bundle size | Zero runtime deps | ~5 kB (lit-core) | Large (framework) | Medium (standalone) |
| SSR | HTML-first prerender adoption | Lit SSR (experimental) | Angular Universal | Glimmer SSR (Fastboot) |
| Templates compiled at | Runtime (browser) | Build time (tagged template literals) | Build time (AOT) | Build time (bytecode) |

---

## When to use Pick Components

Pick Components fits well when:

- You want native Web Components without a large framework runtime.
- Business logic belongs in services, not in components.
- You prefer explicit wiring over convention-based auto-discovery.
- Your templates should be constrained — no arbitrary JavaScript, no XSS vectors.
- You want signal-based reactivity with fine-grained updates and no diffing step.

It is a poor fit when:

- You need a full application framework with routing, state management, AOT, and a large ecosystem out of the box.
- Your team is already productive with Lit, Angular, or another framework.

---

## Related

- [README](../README.md)
- [Pick vs PickRender](PICK-VS-PICKRENDER.md)
- [Rendering Architecture](RENDERING-ARCHITECTURE.md)
- [TypeScript Decorator Compatibility](DECORATOR-COMPATIBILITY.md)
