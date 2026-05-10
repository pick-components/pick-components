# InlineContext API — `@Pick` and `definePick`

Both `@Pick` and `definePick` receive the same `InlineContext` object as their setup argument. This reference covers every `ctx.*` method with real examples.

## Quick reference

| Method | Purpose | Equivalent in `@PickRender` |
|--------|---------|---------------------------|
| `ctx.state()` | Declare reactive state | `@Reactive` fields |
| `ctx.on()` | Map `pick-action` names to handlers | `getViewActions()` |
| `ctx.listen()` | Native DOM event delegation | `@Listen` decorator |
| `ctx.computed()` | Derived (cached) state properties | Getter + `@Reactive` |
| `ctx.intent()` | Declare an intent signal property | `this.createIntent()` |
| `ctx.initializer()` | Async data loading on mount | `PickInitializer` class |
| `ctx.lifecycle()` | Subscriptions + cleanup | `PickLifecycleManager` class |
| `ctx.html()` | Component template string | `template` config |
| `ctx.css()` | Scoped CSS string | `styles` config |
| `ctx.skeleton()` | Loading placeholder template | `skeleton` config |
| `ctx.errorTemplate()` | Error fallback template | `errorTemplate` config |
| `ctx.props()` | Type-annotate observed attributes | `@PickRender` props config |
| `ctx.ref()` | Register a template element reference | n/a |
| `ctx.rules()` | Business validation config spread via `[[Rules.*]]` | n/a |

---

## `ctx.state(initial)` — reactive state

Declares the reactive state object. Each field becomes a reactive property bound to `{{mustache}}` expressions in the template.

```typescript
ctx.state({ count: 0, label: "default" });
```

---

## `ctx.on(handlers)` — pick-action map

Maps action names to handler functions. Each handler is called with `this` bound to the component state. Connect actions in the template using `<pick-action action="name">`.

```typescript
ctx.on({
  increment() { this.count++; },
  decrement() { this.count--; },
  reset()     { this.count = 0; },
  select(value) { this.selected = value as string; },  // value comes from pick-action value="..."
});
```

```html
<!-- Template: pick-action is a CUSTOM ELEMENT, not an attribute -->
<pick-action action="increment"><button type="button">+</button></pick-action>
<pick-action action="select" value="option-a"><button type="button">A</button></pick-action>
```

---

## `ctx.listen(selector?, eventName, handler)` — native DOM events

For native DOM events (input, change, submit, keydown, etc.) that `pick-action` doesn't cover. `this` inside the handler is the component state.

```typescript
// Delegated — fires when element matching selector emits the event
ctx.listen("#searchInput", "input", function (event) {
  this.query = (event.target as HTMLInputElement).value;
});

ctx.listen("form#noteForm", "submit", function (event) {
  event.preventDefault();
  this.notes.push(this.draft);
  this.draft = "";
});

// Root listener — fires on any event reaching the component root
ctx.listen("keydown", function (event) {
  if ((event as KeyboardEvent).key === "Escape") this.open = false;
});
```

> **Rule:** Use `ctx.on` for intent-driven user actions (buttons, picks). Use `ctx.listen` for native value-change events (inputs, forms, keyboard).

---

## `ctx.computed(definitions)` — derived state

Defines getter functions whose return values are cached and re-evaluated when accessed state changes. Use `this` to read from reactive state.

```typescript
ctx.state({ firstName: "Ada", lastName: "Lovelace", progress: 68 });

ctx.computed({
  fullName()      { return `${this.firstName} ${this.lastName}`.trim(); },
  initials()      { return `${this.firstName[0] ?? ""}${this.lastName[0] ?? ""}`.toUpperCase(); },
  progressLabel() { return `${Math.min(Math.max(this.progress, 0), 100)}%`; },
  status()        { return this.progress >= 80 ? "Ready" : "In progress"; },
});
```

Computed properties are available in templates like normal state: `{{fullName}}`, `{{status}}`.

---

## `ctx.intent(name)` — intent signals

Declares a per-instance `IIntentSignal` property on the component. Used to signal external intent from an action to the lifecycle (pub/sub decoupling).

```typescript
import type { IIntentSignal } from "pick-components";

// Declare the type shape for the component+state combined
type CatalogComponent = PickComponent & CatalogState & {
  refreshRequested$: IIntentSignal;
};

ctx.intent("refreshRequested$");

ctx.on({
  refresh() {
    // `this` is the component — cast to access the intent
    (this as CatalogComponent).refreshRequested$.notify();
  },
});
```

Subscribe in `ctx.lifecycle`:

```typescript
ctx.lifecycle({
  onInit(component, subs) {
    const host = component as CatalogComponent;
    subs.addSubscription(
      host.refreshRequested$.subscribe(() => service.refresh()),
    );
  },
});
```

---

## `ctx.initializer(fn, createDeps?)` — async data loading

Runs once on mount before the component renders. Use it to load initial data. Optionally accepts a `createDeps` factory to inject services.

```typescript
ctx.initializer(
  async function (component, deps) {
    component.products = await deps!.catalog.loadCatalog();
  },
  () => ({ catalog: Services.get<CatalogService>("CatalogService") }),
);
```

> **Note:** `createDeps` is called fresh each time the component mounts. Never capture services outside the factory — that would create hidden singletons.

---

## `ctx.lifecycle(hooks, createDeps?)` — subscriptions and cleanup

Subscribe to signals or service observables on mount; unsubscribe on unmount. `subs.addSubscription(unsubscribe)` registers cleanup automatically.

```typescript
ctx.lifecycle(
  {
    onInit(component, subs, deps) {
      const catalog = deps!.catalog;
      catalog.startStockUpdates();

      subs.addSubscription(
        catalog.onStockChange((updated) => {
          component.products = updated;
        }),
      );
    },
    onDestroy(_component, _subs, deps) {
      deps!.catalog.stopStockUpdates();
    },
  },
  () => ({ catalog: Services.get<CatalogService>("CatalogService") }),
);
```

---

## `ctx.html(template)` — component template

Sets the HTML template string. Supports `{{reactive}}`, `[[CONSTANT]]`, `<pick-action>`, `<pick-select>`, `<pick-for>`, and `<slot>`. See [04-template-safety.md](./04-template-safety.md) for full template syntax.

```typescript
ctx.html(`
  <div class="panel">
    <p>{{fullName}}</p>
    <pick-action action="reset"><button type="button">Reset</button></pick-action>
  </div>
`);
```

---

## `ctx.css(styles)` — scoped styles

Sets scoped CSS for the component. Usually imported from a `.css` file:

```typescript
import myStyles from "./my-component.styles.css";
ctx.css(myStyles);
```

---

## `ctx.skeleton(template)` and `ctx.errorTemplate(template)`

Define loading and error placeholder HTML shown while `ctx.initializer` is running or if it throws:

```typescript
ctx.skeleton('<p aria-busy="true">Loading catalog…</p>');
ctx.errorTemplate('<p role="alert">Failed to load catalog.</p>');
```

---

## Complete example — `@Pick` with all ctx methods

```typescript
import { Pick, Services } from "pick-components";
import type { IIntentSignal, InlineContext, PickComponent } from "pick-components";
import myStyles from "./my-component.styles.css";

interface MyState {
  query: string;
  results: string[];
  loading: boolean;
}

type MyComponent = PickComponent & MyState & { searchRequested$: IIntentSignal };

@Pick<MyState>("my-search", (ctx: InlineContext<MyState>) => {
  ctx.state({ query: "", results: [], loading: false });

  ctx.intent("searchRequested$");

  ctx.computed({
    hasResults() { return this.results.length > 0; },
    placeholder() { return this.loading ? "Searching…" : "No results"; },
  });

  ctx.on({
    search() { (this as MyComponent).searchRequested$.notify(); },
    clear()  { this.query = ""; this.results = []; },
  });

  ctx.listen("#searchInput", "input", function (event) {
    this.query = (event.target as HTMLInputElement).value;
  });

  ctx.initializer(
    async function (component, deps) {
      component.results = await deps!.svc.getDefaults();
    },
    () => ({ svc: Services.get("SearchService") }),
  );

  ctx.lifecycle(
    {
      onInit(component, subs, deps) {
        const host = component as MyComponent;
        subs.addSubscription(
          host.searchRequested$.subscribe(async () => {
            component.loading = true;
            component.results = await deps!.svc.search(component.query);
            component.loading = false;
          }),
        );
      },
    },
    () => ({ svc: Services.get("SearchService") }),
  );

  ctx.skeleton('<p aria-busy="true">Loading…</p>');
  ctx.errorTemplate('<p role="alert">Failed to load.</p>');
  ctx.css(myStyles);
  ctx.html(`
    <div class="search">
      <input id="searchInput" type="search" value="{{query}}" />
      <pick-action action="search"><button type="button">Search</button></pick-action>
      <pick-action action="clear"><button type="button">Clear</button></pick-action>
      <p>{{hasResults ? results.length + ' results' : placeholder}}</p>
    </div>
  `);
})
export class MySearch {}
```
