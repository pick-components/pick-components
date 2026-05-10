# Pick Components vs React / Vue / Lit / Angular / Svelte / Glimmer

This document explains what Pick Components is and what it is not, to help developers coming from other frameworks set accurate expectations.

---

## What Pick Components is not

### Not React

React is a UI library centered around JSX, hook-based state, and reconciliation over a virtual component tree.

Pick Components targets native custom elements directly. There is no framework-managed virtual tree between your component and the browser, and no hook runtime.

That does not prevent coexistence inside a React app: Pick components can be consumed as custom elements in targeted screens without migrating the entire codebase.

If React already gives your team speed and stability, staying there is usually the pragmatic choice; evaluate Pick only for specific use cases.

### Not Vue

Vue is a progressive framework with SFC conventions, a reactivity system based on refs/proxies, and app-level patterns for routing and stores.

Pick Components does not define an SFC model or an app framework layer. It focuses on explicit native custom elements, explicit services, and predictable lifecycle factories.

With an established Vue stack, case-by-case evaluation is usually more realistic than a broad migration.

### Not a Lit replacement

Lit is a Google-maintained library for building Web Components with tagged template literals (`html\`...\``), property reflection, and a reactive update system that diffs attribute and property values.

Pick Components does not use tagged template literals. Templates are plain HTML strings compiled into a reactive binding graph at runtime. The binding model is explicit and based on named state properties — there is no virtual DOM diffing and no property reflection cycle.

If Lit already fits your needs, continuing with Lit is a perfectly valid choice.

### Not Angular

Angular is a full application framework with a module system, dependency injection container, zone-based change detection, a CLI, AOT compilation, and an opinionated project structure.

Pick Components is a component framework, not an application framework. It has no router beyond `<pick-router>` for the simple case, no module system, no CLI, no AOT step, and no zone.js. Dependency injection is explicit and factory-first — there is no container that auto-discovers or auto-wires services.

For teams invested in Angular CLI, DI, and ecosystem tooling, switching just to switch rarely pays off.

### Not Svelte

Svelte relies on compile-time transformations that rewrite component code and templates into imperative DOM operations.

Pick Components does not require a compiler step. Templates are plain HTML strings interpreted at runtime by a deterministic binding engine, and component wiring stays explicit in factories and lifecycle hooks.

If your workflow depends on Svelte's compiler advantages, staying with that model is often the sensible path.

### Not Glimmer

Glimmer VM is the rendering layer inside Ember. It uses a compiled bytecode format for templates, a reference-based reactivity model, and a strict owner tree for component ownership.

Pick Components compiles templates at runtime in the browser, not at build time. There is no bytecode, no Ember owner model, and no glimmer-component class contract to implement.

In established Ember/Glimmer projects, Pick is usually better as a comparative reference than an immediate replacement.

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

| Aspect | Pick Components | React | Vue | Lit | Angular | Svelte | Glimmer |
| ------ | --------------- | ----- | --- | --- | ------- | ------ | ------- |
| Primary model | Native custom elements | UI library around JSX + reconciliation | Progressive framework around SFC + reactive runtime | Web Components library | Full app framework | Compiler-first components | Ember rendering VM |
| Template syntax | `{{prop}}` in HTML strings | JSX | SFC templates / render functions | Tagged template literals | `{{ prop }}` in `.html` files | Svelte template syntax | `{{prop}}` in `.hbs` files |
| Reactivity model | Signal-based, per-property subscriptions | State/hooks + reconciliation | Proxy/ref-based reactivity | Property reflection + update cycle | Zone.js + change detection | Compile-time reactive assignments | Tracked references + autotracking |
| DOM strategy | Native Shadow DOM, no diffing | Virtual DOM diffing | Virtual DOM diffing | LitElement manages Shadow DOM | Zone-triggered DOM updates | Compiler-generated imperative updates | Compiled bytecode, incremental rendering |
| DI | Explicit factory functions | Library/ecosystem-driven | Provide/inject + ecosystem | Not included | Full container with decorators | Manual/module-based | Owner-based component tree |
| Build requirement | Optional (no build needed for plain browser ESM; common for TS/decorators) | Typical | Typical | Typical | Required CLI/AOT flow | Required compiler | Typical Ember/Glimmer toolchain |
| SSR | HTML-first prerender adoption | Ecosystem frameworks | Ecosystem frameworks | Lit SSR (experimental) | Angular Universal | SvelteKit SSR | Glimmer SSR (Fastboot) |

`Build requirement` means whether the framework itself requires a compile/build pipeline to run. Pick Components can run directly in the browser with ESM and no bundler; many projects still choose a build step for TypeScript, decorators, and optimization.

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
