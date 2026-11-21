# Getting Started with Pick Components

This guide walks you from a blank folder to your first running component. It assumes you have Node.js 18+ installed.

---

## Step 1 — Create your project

```bash
mkdir my-app && cd my-app
npm init -y
npm install typescript --save-dev
```

Add a minimal `tsconfig.json`:

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

> If your bundler requires a different `moduleResolution`, adjust accordingly. Pick Components ships standard ESM and works with Vite, Rollup, Webpack, and esbuild.

---

## Step 2 — Install Pick Components

```bash
npm install pick-components
```

---

## Step 3 — Set up the Copilot skill

The Copilot skill teaches GitHub Copilot the Pick Components conventions so it generates correct components, tests, DI wiring, and templates — rather than guessing.

Install into your project with:

```bash
npx --package=pick-components pick-components-copilot
```

This copies `.github/skills/setup-pick-components/` into your project. Commit the result so the whole team benefits.

If you prefer to install manually, copy the `setup-pick-components/` skill folder from the [repository](https://github.com/pick-components/pick-components/tree/main/.github/skills/setup-pick-components) into `.github/skills/` in your project.

---

## Step 4 — Activate in Copilot chat

Open GitHub Copilot chat (VS Code or the web) and type:

```
/setup-pick-components
```

Copilot loads the skill and is now ready to generate Pick Components code following framework conventions.

---

## Step 5 — Scaffold your project with Copilot

### 5a. Generate the entry files

Paste this prompt into Copilot chat:

> Create a minimal `index.html` and `src/bootstrap.ts` for a Pick Components project using npm and a bundler.

Copilot will produce:

**`index.html`**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <script type="module" src="./src/bootstrap.js"></script>
  </head>
  <body>
    <!-- your components go here -->
  </body>
</html>
```

**`src/bootstrap.ts`**
```typescript
import { bootstrapFramework, Services } from "pick-components/bootstrap";

await bootstrapFramework(Services);
```

> `bootstrapFramework` must complete before any component module is imported. Use top-level `await` (ESM) to guarantee ordering.

### 5b. Create your first component

Choose the style you prefer and paste the matching prompt into Copilot chat.

> **Tip:** tell Copilot where in the page the component should live so it also updates `index.html` for you. If it is the only component on the page, say "as the main page content". If it goes inside a specific section, describe that — e.g. "inside a `<main>` below a `<header>`".

#### Inline context — `@Pick` (decorator)

> Create a Pick Components counter component using `@Pick` with increment, decrement, and reset. Add it to `index.html` as the main page content.

#### Inline context — `definePick` (no decorators)

> Create a Pick Components counter component using `definePick` with increment, decrement, and reset. Add it to `index.html` as the main page content.

#### Class-based — `@PickRender` (decorator)

> Create a Pick Components counter component using `@PickRender` with increment, decrement, and reset. Add it to `index.html` as the main page content.

#### Class-based — `defineComponent` (no decorators)

> Create a Pick Components counter component using `defineComponent` with increment, decrement, and reset. Add it to `index.html` as the main page content.

---

## What Copilot generates

Below are the minimal outputs for each style.

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
    <p>Count: {{count}}</p>
    <pick-action action="increment"><button type="button">+</button></pick-action>
    <pick-action action="decrement"><button type="button">−</button></pick-action>
    <pick-action action="reset"><button type="button">Reset</button></pick-action>
  `);
})
class CounterApp {}
```

**`src/bootstrap.ts`**
```typescript
import { bootstrapFramework, Services } from "pick-components/bootstrap";

await bootstrapFramework(Services);
await import("./counter-app.js"); // dynamic import: decorators run after services are registered
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
    <p>Count: {{count}}</p>
    <pick-action action="increment"><button type="button">+</button></pick-action>
    <pick-action action="decrement"><button type="button">−</button></pick-action>
    <pick-action action="reset"><button type="button">Reset</button></pick-action>
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
    <p>Count: {{count}}</p>
    <pick-action action="increment"><button type="button">+</button></pick-action>
    <pick-action action="decrement"><button type="button">−</button></pick-action>
    <pick-action action="reset"><button type="button">Reset</button></pick-action>
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
    <p>Count: {{count}}</p>
    <pick-action action="increment"><button type="button">+</button></pick-action>
    <pick-action action="decrement"><button type="button">−</button></pick-action>
    <pick-action action="reset"><button type="button">Reset</button></pick-action>
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

## Which style should I choose?

| | `@Pick` | `definePick` | `@PickRender` | `defineComponent` |
|---|---|---|---|---|
| **Decorators** | yes | no | yes | no |
| **Class** | no | no | yes | yes |
| **State via** | `ctx.state()` | `ctx.state()` | `@Reactive` | `@Reactive` |
| **Actions via** | `ctx.on()` | `ctx.on()` | `getViewActions()` | `getViewActions()` |
| **Best for** | compact inline | no-decorator inline | full lifecycle | full lifecycle, no-decorator |

All four styles support `initializer`, `lifecycle`, `skeleton`, and `errorTemplate` for async hydration and loading states.

## Incremental adoption in existing apps

If you already have a React or Vue app, you can adopt Pick Components incrementally.

- Start with one isolated widget or section.
- Register Pick components in that local entry point.
- Use custom elements in targeted views without migrating the entire codebase.

Useful Copilot prompt:

> Integrate a Pick Components widget into an existing React page using a custom element and a dedicated bootstrap entry.

---

## Next steps

Once your first component works:

- Add more Copilot prompts to generate services, tests, and DI wiring
- Read [docs/USAGE-GUIDE.md](USAGE-GUIDE.md) for full feature coverage
- Read [docs/DEPENDENCY-INJECTION.md](DEPENDENCY-INJECTION.md) for factory-first DI patterns
- Read [docs/PICK-VS-PICKRENDER.md](PICK-VS-PICKRENDER.md) for a detailed comparison between `@Pick` and `@PickRender`
- Try the [live playground](https://pick-components.github.io/pick-components/) for interactive examples

### Useful follow-up Copilot prompts

> Write a unit test for my `CounterApp` component following AAA pattern.

> Add a `PickInitializer` to `CounterApp` that loads the initial count from a `CounterService`.

> Show me how to register `CounterService` in the composition root using `Services`.

> Add a `PickLifecycleManager` to `CounterApp` that subscribes to a `CounterService` observable.

### Ship an independent widget

Put the widget anywhere in the page. Its entry module can load later.

```html
<pick-product-card product-id="123"></pick-product-card>
<script type="module" src="/widgets/product-card.js"></script>
```

In the widget entry module, import from `pick-components/bootstrap` with your bundler or import map.

```javascript
import { bootstrapElement } from "pick-components/bootstrap";

await bootstrapElement("pick-product-card", (ctx) => {
  ctx.state({ productId: "", count: 0 });
  ctx.html(
    '<article><span>{{productId}}</span><button type="button">{{count}}</button></article>',
  );
  ctx.listen("button", "click", function () {
    this.count++;
  });
});
```

Each tag has a private service registry and each host renders into its own shadow root. Native events use `ctx.listen`. HTML inputs use kebab-case for writable state fields and deliver strings. Widget registration leaves application primitives such as `pick-router` to the application's bootstrap. A second definition of an existing tag raises an error.

For a prerendered widget, share the template string between the server and the entry module. Import `elementPrerenderAttributes` from the same bootstrap entry in Node and apply its return value as attributes on the host using your HTML serializer. Render one child with the template's element structure and escaped text values. For the example above this could be `<article><span>123</span><button type="button">0</button></article>`. The widget adopts a matching child and reconnects its bindings. A stale contract or changed structure triggers rendering from the current template. Prerender assumes trusted server-generated markup.
