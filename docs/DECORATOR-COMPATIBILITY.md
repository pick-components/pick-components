# TypeScript Decorator Compatibility

This document lists the TypeScript and bundler setups that Pick Components is officially tested with, explains what each setup requires, and declares which setups have not been verified.

---

## Decorator modes

Pick Components supports two TypeScript decorator pipelines.

| Mode | `experimentalDecorators` | Accepts |
| ---- | ------------------------ | ------- |
| `auto` (default) | either value | TC39 Stage 3 and legacy decorators |
| `strict` | omitted or `false` | TC39 Stage 3 only |

Configure mode in the bootstrap call:

```typescript
// default — accepts both pipelines
await bootstrapFramework(Services);

// strict — accepts TC39 Stage 3 only
await bootstrapFramework(Services, {}, { decorators: "strict" });
```

---

## Tested setups

### Setup 1 — tsc + TC39 standard decorators

Used by the library source (`tsconfig.json`) and the examples (`examples/tsconfig.json`).

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

`experimentalDecorators` is omitted, which defaults to `false` and activates the TC39 Stage 3 decorator emit. Pick Components works with `@Reactive count = 0` without requiring the `accessor` keyword.

The library is compiled with plain `tsc`. The examples are bundled with esbuild (see [Setup 2](#setup-2--esbuild--tc39-standard-decorators)).

---

### Setup 2 — esbuild + TC39 standard decorators

Used by the downloadable playground examples (`scripts/build-examples.mjs`, `scripts/build-playground-lib.mjs`).

```javascript
// esbuild build options
{
  target: "es2022",
  format: "esm",
  platform: "browser",
  bundle: true
}
```

TypeScript compilation is configured with the same `tsconfig.json` as Setup 1 — no `experimentalDecorators`, `target: "ES2022"`. esbuild reads the project tsconfig and emits TC39 decorators.

This setup is exercised every time the playground download button generates a self-contained project folder.

---

### Setup 3 — Vite + legacy `experimentalDecorators`

Used in consumer projects that started with a standard Vite template.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "strict": true
  }
}
```

**`useDefineForClassFields: false` is required** when `experimentalDecorators` is `true`. Without it, TypeScript emits class field initializers using the native `Object.defineProperty` semantics, which run after the decorator and prevent `@Reactive` from intercepting property access. Setting it to `false` restores the legacy assignment semantics that the `experimentalDecorators` pipeline depends on.

Vite uses esbuild internally. No additional configuration beyond the tsconfig options above is needed.

---

## Compatibility summary

| Bundler | Decorator pipeline | Tested | Notes |
| ------- | ------------------ | ------ | ----- |
| `tsc` | TC39 Stage 3 | ✅ automated | Library source (CI unit + integration tests) |
| `tsc` | Legacy `experimentalDecorators` | ✅ automated | `examples/compat/01-tsc-legacy/` |
| esbuild standalone | TC39 Stage 3 | ✅ automated | Playground downloads (CI build) |
| Rollup | TC39 Stage 3 | ✅ automated | Browser distribution build (CI build) |
| webpack + ts-loader | TC39 Stage 3 | ✅ automated | `examples/compat/02-webpack-tc39/` |
| swc standalone | TC39 Stage 3 | ✅ automated | `examples/compat/03-swc-tc39/` |
| webpack + babel-loader | Legacy `experimentalDecorators` | ✅ automated | `examples/compat/04-babel-legacy/` |
| webpack + babel-loader | TC39 Stage 3 (2023-11) | ✅ automated | `examples/compat/05-babel-tc39/` |
| Vite (esbuild) | Legacy `experimentalDecorators` | ✅ known working | No dedicated compat example; requires `useDefineForClassFields: false` |
| bun | TC39 Stage 3 | ✅ automated | `examples/compat/06-bun-tc39/` — requires bun runtime |

Setups labelled **automated** are verified by either `tests/browser/compat-decorator-setups.test.ts` (compat examples) or the standard CI pipeline (library source, esbuild, Rollup). Setups labelled **known working** have been validated manually but do not have a dedicated compat example in this repository.

---

## Choosing between `auto` and `strict`

Use `auto` (the default) unless your project enforces TC39-only tooling as a policy. `auto` lets the framework accept whichever decorator form the compiler emits, which removes the need to align the bootstrap configuration with the tsconfig.

Use `strict` only when you intentionally want the framework to reject legacy decorator emit — for example, to enforce a migration to standard decorators across a team.

---

## Related

- [README — TypeScript And Decorators](../README.md#typescript-and-decorators)
- [Pick vs PickRender](PICK-VS-PICKRENDER.md)
- [Rendering Architecture](RENDERING-ARCHITECTURE.md)
