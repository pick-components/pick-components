# Usage Guide

This guide contains the expanded technical content moved from the root README to keep onboarding fast while preserving full implementation details.

## Choose Your Setup

### Option A - npm + bundler

Use this in Vite, Rollup, Webpack, esbuild, or similar toolchains.

```typescript
import { bootstrapFramework, Services } from "pick-components";
```

This path does not specifically require Vite, but it does require a toolchain that can resolve npm package imports for the browser.

### Option B - plain HTML + browser-ready ESM

Use this when you want to import the framework directly in the browser with no bundler.

For this mode, use the browser-ready artifacts prepared for GitHub Releases rather than trying to import the npm package directly in the browser.

Release assets are published here:

- `https://github.com/pick-components/pick-components/releases`
- `https://github.com/pick-components/pick-components/releases/tag/v<version>`

Direct asset URLs follow this pattern:

- `https://github.com/pick-components/pick-components/releases/download/v<version>/pick-components.js`
- `https://github.com/pick-components/pick-components/releases/download/v<version>/pick-components-bootstrap.js`

Recommended flow:

1. Download the browser bundle from the project's GitHub Release assets.
2. Copy it into your site's public assets, for example `/vendor/pick-components.js`.
3. Write your component source in TypeScript or modern JavaScript.
4. Transpile it before serving it to the browser.
5. Import the generated JavaScript from your HTML with `<script type="module">`.

Minimal HTML:

```html
<!doctype html>
<html lang="en">
  <body>
    <hello-card></hello-card>
    <script type="module" src="./hello-card.js"></script>
  </body>
</html>
```

Minimal TypeScript source:

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

The browser-ready distribution is self-contained and does not rely on external runtime packages or Node builtins. It is intended for direct browser import once the file is being served by your site.

The npm package is optimized for development and consumption. The plain-browser distribution is documented and prepared as a separate release artifact flow, not as a browser-importable npm package entrypoint.

For GitHub Releases, the project also prepares a heavier browser distribution with:

- non-minified bundles
- minified bundles
- source maps for all browser bundles
- SHA256 checksums

Build the release artifacts locally with:

```bash
npm run build:release
```

This creates `.release-artifacts/v<version>/`, which mirrors the intended GitHub Release contents.

This direct browser path assumes a modern browser environment with ESM. TypeScript syntax and decorators must still be transpiled unless your target runtime explicitly supports the exact JavaScript decorator syntax you are serving.

## Copilot AI Setup (Optional)

If you want Copilot to follow Pick Components conventions (components, DI, tests, and templates), install the workspace skill into your project:

```bash
npx --package=pick-components pick-components-copilot
```

This copies `.github/skills/setup-pick-components/` into your project root. Commit the result to enable the skill for your whole team.

To install into a specific directory:

```bash
npx --package=pick-components pick-components-copilot --target /path/to/your-project
```

Once installed, type `/setup-pick-components` in Copilot chat to activate the skill.

## TypeScript and Decorators

Pick Components works with both TypeScript decorator emits:

- Standard decorators: `experimentalDecorators` omitted or `false`.
- Legacy decorators: `experimentalDecorators: true`.

You should not need to change a Vite/TypeScript project just to use Pick Components. The default bootstrap accepts both modes.

Recommended public syntax:

```typescript
class Counter extends PickComponent {
  @Reactive count = 0;
}
```

`@Reactive accessor count = 0` is still supported for users who explicitly want TC39 auto-accessors, but it is not required.

The playground and downloaded examples transpile with this compiler shape:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "experimentalDecorators": false
  }
}
```

If your project uses TypeScript's `experimentalDecorators` pipeline, the default bootstrap already supports it:

```typescript
await bootstrapFramework(Services);
```

Strict decorator mode is available only when you intentionally want to accept TC39 standard decorators only:

```typescript
await bootstrapFramework(Services, {}, { decorators: "strict" });
```

For a full list of tested bundler and tsconfig combinations, see [DECORATOR-COMPATIBILITY.md](DECORATOR-COMPATIBILITY.md).

## Using without decorators: `defineComponent` and `definePick`

`defineComponent` and `definePick` are the decorator-free equivalents of `@PickRender` and `@Pick`. They return `ComponentDefinition` descriptors, and registration happens when you pass those descriptors to `bootstrapFramework` through the `components` option.

### `defineComponent` - class-based, no registration decorator

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

### `definePick` - no class, no decorators

```typescript
import { definePick } from "pick-components";

export const helloDef = definePick<{ name: string }>("hello-card", (ctx) => {
  ctx.state({ name: "world" });
  ctx.html(`<p>Hello {{name}}</p>`);
});
```

### Register explicitly in `bootstrapFramework`

```typescript
import { bootstrapFramework, Services } from "pick-components";
import { counterDef } from "./counter.js";
import { helloDef } from "./hello.js";

await bootstrapFramework(Services, {}, {
  components: [counterDef, helloDef],
});
```

For the deeper comparison and migration guidance, see [PICK-VS-PICKRENDER.md](PICK-VS-PICKRENDER.md#using-without-decorators-definecomponent-and-definepick).

## Bootstrap

Call `bootstrapFramework()` once in your entry point before component modules that use `@Pick`, `@PickRender`, `@Reactive`, or `@Listen` are evaluated:

```typescript
import { bootstrapFramework, Services } from "pick-components";

await bootstrapFramework(Services);
await import("./my-component.js");
```

## Usage

The examples below use the standard package import form:

```typescript
import { bootstrapFramework, Services } from "pick-components";

await bootstrapFramework(Services);
```

### Presentational Component (Slot Projection)

Components that wrap child content in a styled layout using native Shadow DOM slots. No state, no logic.

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

### Data Display Component (Reactive Props)

Components that receive data via attributes and render it reactively.

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

### Interactive Component (Local State + Events)

Components with local state that responds to user interactions.

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

### Class-Based Component (`@PickRender`)

For components that need async initialization or a lifecycle manager to wire external services.

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

## Template Security

Pick Components validates static templates at compile time. Inline event handlers, executable elements, `srcdoc`, `style`, `srcset`, and unsafe URL protocols are rejected with explicit errors. Template expressions are evaluated through a constrained parser and dynamic URL bindings are checked by the attribute binding policy. Templates are developer-authored code, but they are still validated so templates remain declarative and do not become hidden JavaScript execution environments.

Manual verification: a template with `<img src="x" onerror="this.insertAdjacentHTML('afterend', '<strong id=xss-ok>ONERROR EJECUTADO</strong>')">` must fail rendering with a clear Pick Components error. `ONERROR EJECUTADO` must not appear.

## Component Intentions

Use `@Reactive` for state that renders. Use intent signals for one-shot user actions such as save, refresh, or mode change, which a lifecycle manager can coordinate with services.

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

`@Pick` has the same capability through `ctx.intent<T>("name$")`. Prefer this pattern for actions and commands; keep `getPropertyObservable()` for real state changes.

## View Actions

`<pick-action>` is the declarative bridge from view markup to component actions. It listens to click and keyboard activation on its child content, then dispatches a `pick-action` event that the nearest PickComponent handles.

```html
<pick-action action="archive" value="{{selectedId}}">
  <button type="button">Archive</button>
</pick-action>
```

- `action` is the action name exposed by `ctx.on(...)` or `getViewActions()`.
- `value` is optional and becomes the first action argument.
- The child can be any visual trigger, not only a `<button>`.
- `event` is also accepted as an alias for `action`, but new code should use `action`.
- Handled actions stop at the nearest component by default.
- Add `bubble` only when a parent component should be allowed to handle the same action.

## Template Syntax

| Syntax            | Description                                               |
| ----------------- | --------------------------------------------------------- |
| `{{expression}}`  | Reactive binding - re-evaluates on property change        |
| `[[RULES.field]]` | Validation rules - expands to HTML5 validation attributes |
| `<slot>`          | Default projection slot (native Shadow DOM)               |
| `<slot name="X">` | Named projection slot (native Shadow DOM)                 |

## Commands

| Command                    | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| `npm install`              | Install dependencies                                              |
| `npm run build:lib`        | Compile library to `dist/`                                        |
| `npm run build:browser`    | Bundle browser-ready ESM artifacts to `dist/browser/`             |
| `npm run build:prod`       | Compile library + browser-ready ESM artifacts                     |
| `npm run build:release`    | Prepare GitHub release browser artifacts in `.release-artifacts/` |
| `npm run build`            | Compile library + examples                                        |
| `npm run serve:dev`        | Start dev server on `http://localhost:3000`                       |
| `npm run serve:dist`       | Serve built examples with SEO file-first routes on port `8080`    |
| `npm test`                 | Run full test suite (unit + integration)                          |
| `npm run test:unit`        | Unit tests only                                                   |
| `npm run test:integration` | Integration tests only                                            |
| `npm run test:coverage`    | Run unit + integration tests with an 80% V8 coverage threshold    |
| `npm run lint`             | Lint source files                                                 |
| `npm run format`           | Format source files                                               |

## Interactive Playground

The project ships with 15 interactive examples that run in the browser via a TypeScript playground with live preview. Each example has an editable code panel (CodeMirror) and an iframe sandbox that re-transpiles and re-executes on every change.

Try it online: <https://pick-components.github.io/pick-components/>

### Running the playground

```bash
npm install
npm run build
npm run serve:dev
```

To preview the built examples with the production-oriented static server:

```bash
npm run build
npm run serve:dist
```

The playground also includes an edge worker template at `deploy/cloudflare/public-route-worker.mjs`. It serves prerendered public routes first, then falls back to the SPA shell for app-only paths. Crawler and browser requests receive the same canonical HTML; the client bundle only enhances it.

### Examples

| #   | Tab                      | Category     | Description                                      |
| --- | ------------------------ | ------------ | ------------------------------------------------ |
| 01  | Hello World              | Basics       | Minimal `@PickRender` component                  |
| 02  | Reactive State           | Basics       | `@Reactive` state and simple actions             |
| 03  | Template Bindings        | Basics       | Simple template bindings with `{{...}}`          |
| 04  | Template Expressions     | Basics       | Expressions inside `{{...}}`                     |
| 05  | Computed Bindings        | Basics       | Getter-derived bindings                          |
| 06  | @Pick Component          | Basics       | Functional authoring with `@Pick`                |
| 07  | Pick Actions             | Primitives   | Declarative view actions with `<pick-action>`    |
| 07b | Pick Actions with @Pick  | Primitives   | The same action model via `ctx.on(...)`          |
| 08  | Pick Select              | Primitives   | Conditional branches with `<pick-select>`        |
| 09  | Pick For                 | Primitives   | List rendering with `<pick-for>`                 |
| 10  | Forms and Rules          | Primitives   | Validation rules provided before render          |
| 11  | DI Injection             | Architecture | InjectKit bridge and constructor dependencies    |
| 12  | Real API                 | Architecture | Initializer + lifecycle + `createIntent()`       |
| 13  | Dashboard                | Architecture | Multi-service composition and split template/CSS |
| 14  | @Pick Advanced           | Architecture | Full `@Pick` component with services and state   |
| 15  | Native Slots             | Basics       | Native named and default slot projection         |

### Docker deployment

```bash
docker build -t pick-components .
docker run -p 8080:8080 pick-components
```

- Playground: `http://localhost:8080`
- Public routes: `http://localhost:8080/es/01-hello`
