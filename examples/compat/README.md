# Decorator Compatibility Examples

Minimal examples that prove Pick Components compiles and renders correctly with different TypeScript compilers and bundlers.

Each example registers a `<hello-compat>` custom element and renders a paragraph. The Playwright test suite (`tests/browser/compat-decorator-setups.test.ts`) builds and verifies all of them automatically.

## Prerequisites

The library must be built before running any example:

```
npm run build:lib
```

## Examples

| Folder | Compiler / Bundler | Decorator mode |
|---|---|---|
| `01-tsc-legacy/` | tsc (no bundler) | Legacy (`experimentalDecorators: true`) |
| `02-webpack-tc39/` | webpack + ts-loader | TC39 Stage 3 |
| `03-swc-tc39/` | swc (no bundler) | TC39 Stage 3 |
| `04-babel-legacy/` | webpack + babel-loader | Legacy |
| `05-babel-tc39/` | webpack + babel-loader | TC39 Stage 3 (2023-11) |
| `06-bun-tc39/` | bun | TC39 Stage 3 |

## Building manually

From the repository root:

```
npm run build:compat
```

Or individually:

```
# 01 — tsc + legacy decorators
node_modules/.bin/tsc -p examples/compat/01-tsc-legacy/tsconfig.json

# 02 — webpack + ts-loader + TC39
node_modules/.bin/webpack --config examples/compat/02-webpack-tc39/webpack.config.mjs

# 03 — swc + TC39
node_modules/.bin/swc examples/compat/03-swc-tc39/src/main.ts --out-file examples/compat/03-swc-tc39/dist/main.js --config-file examples/compat/03-swc-tc39/.swcrc

# 04 — webpack + babel-loader + legacy
node_modules/.bin/webpack --config examples/compat/04-babel-legacy/webpack.config.mjs

# 05 — webpack + babel-loader + TC39
node_modules/.bin/webpack --config examples/compat/05-babel-tc39/webpack.config.mjs

# 06 — bun (requires bun runtime installed separately)
bun build examples/compat/06-bun-tc39/src/main.ts --outfile examples/compat/06-bun-tc39/dist/bundle.js --target browser
```

Open the corresponding `index.html` via an HTTP server (not `file://`) to test in the browser.

## How it works

Non-bundler examples (01 — tsc-legacy, 03 — swc) output a single compiled JS file. The `index.html` uses an import map to resolve the `pick-components` bare specifier to the browser bundle produced by `npm run build:lib`:

```html
<script type="importmap">
  { "imports": { "pick-components": "../../../dist/browser/pick-components.js" } }
</script>
```

Bundler examples (02, 04, 05, 06) resolve `pick-components` via an alias pointing to `dist/index.js` and produce a self-contained `dist/bundle.js`.
