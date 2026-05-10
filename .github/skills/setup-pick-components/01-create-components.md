# Create Pick Components

Use this prompt when you need Copilot to generate Pick Components with proper architecture.

## Component APIs — Choose the Right One

Pick Components has **four APIs** depending on how much decorator/class syntax you want:

| API | When to use |
|-----|-------------|
| `@PickRender` | Full-featured with decorator: initializer, lifecycle, skeleton, errorTemplate |
| `defineComponent` | Decorator-free alternative to `@PickRender`; class uses `@Reactive`/`@Listen`, registration via `bootstrapFramework` |
| `@Pick` | Inline context (decorator, but setup via `ctx.*`) |
| `definePick` | Fully decorator-free, functional — no class, no `@Reactive`, no `@Listen` |

### `pick-action` — ALWAYS a custom element

**`<pick-action>` is a custom element, not an HTML attribute.** It wraps the interactive element:

```html
<!-- ✅ CORRECT — pick-action wraps the button -->
<pick-action action="increment"><button type="button">+</button></pick-action>

<!-- ❌ WRONG — pick-action="..." as an attribute does nothing -->
<button pick-action="increment" type="button">+</button>
```

This applies equally to `@PickRender`, `@Pick`, and `definePick` components.

---

## `@Pick` — Inline context with decorator

Use when you want decorator syntax but prefer configuring via `ctx.*` instead of class fields:

```typescript
import { Pick, PickComponent } from "pick-components";
import counterStyles from "./counter.styles.css";

@Pick<{ count: number }>("my-counter", (ctx) => {
  ctx.state({ count: 0 });

  // ctx.on defines the view-action map for <pick-action action="...">
  ctx.on({
    increment() { this.count++; },
    decrement() { this.count--; },
    reset() { this.count = 0; },
  });

  ctx.css(counterStyles);

  ctx.html(`
    <div class="counter">
      <p>{{count}}</p>
      <pick-action action="decrement"><button type="button">−</button></pick-action>
      <pick-action action="reset"><button type="button">Reset</button></pick-action>
      <pick-action action="increment"><button type="button">+</button></pick-action>
    </div>
  `);
})
export class MyCounter extends PickComponent {}
```

Register at bootstrap:

```typescript
// bootstrap.ts
import { bootstrapFramework, Services } from "pick-components/bootstrap";

await bootstrapFramework(Services);
await import("./my-counter.js"); // dynamic import: decorator side effects run after services are registered
```

---

## `definePick` — Decorator-free functional API

Use when decorators are unavailable or you want fully explicit registration:

```typescript
import { definePick } from "pick-components";
import counterStyles from "./counter.styles.css";

export const counterDef = definePick<{ count: number }>("my-counter", (ctx) => {
  ctx.state({ count: 0 });

  // ctx.on defines the view-action map for <pick-action action="...">
  ctx.on({
    increment() { this.count++; },
    decrement() { this.count--; },
    reset() { this.count = 0; },
  });

  ctx.css(counterStyles);

  ctx.html(`
    <div class="counter">
      <p>{{count}}</p>
      <pick-action action="decrement"><button type="button">−</button></pick-action>
      <pick-action action="reset"><button type="button">Reset</button></pick-action>
      <pick-action action="increment"><button type="button">+</button></pick-action>
    </div>
  `);
});
```

Register explicitly at bootstrap — no side effects until `bootstrapFramework` runs:

```typescript
// bootstrap.ts
import { counterDef } from "./my-counter.js";
await bootstrapFramework(Services, {}, { components: [counterDef] });
```

> For the full `ctx.*` API (ctx.listen, ctx.computed, ctx.intent, ctx.lifecycle, ctx.initializer, etc.) see [05-inline-context-api.md](./05-inline-context-api.md).

---

## `defineComponent` — Decorator-free alternative to `@PickRender`

Use when decorators are unavailable **but you still want a class** with `@Reactive` and `@Listen`. The class itself is written identically to a `@PickRender` component; only the registration moves to `bootstrapFramework`:

```typescript
import { PickComponent, Reactive, Listen, defineComponent } from "pick-components";
import counterStyles from "./counter.styles.css";

// Class written as normal — @Reactive and @Listen are still used here
class CounterExample extends PickComponent {
  @Reactive count = 0;

  @Listen("#decrementButton", "click")
  decrement(): void { this.count--; }

  @Listen("#resetButton", "click")
  reset(): void { this.count = 0; }

  @Listen("#incrementButton", "click")
  increment(): void { this.count++; }
}

// defineComponent replaces @PickRender — returns a ComponentDefinition descriptor
export const counterDef = defineComponent(CounterExample, {
  selector: "counter-example",
  styles: counterStyles,
  template: `
    <div class="counter">
      <p>{{count}}</p>
      <div class="actions">
        <button id="decrementButton" type="button">−</button>
        <button id="resetButton" type="button">Reset</button>
        <button id="incrementButton" type="button">+</button>
      </div>
    </div>
  `,
});
```

Register explicitly at bootstrap:

```typescript
// bootstrap.ts
import { counterDef } from "./counter.example.js";
await bootstrapFramework(Services, {}, { components: [counterDef] });
```

> **Note:** Unlike `definePick`, `defineComponent` still uses `@Reactive` and `@Listen` on the class body. It does NOT use `ctx.on()`.

`defineComponent` accepts the same config options as `@PickRender` — you can pass `initializer`, `lifecycle`, `skeleton`, and `errorTemplate` alongside `selector`, `template`, and `styles`:

```typescript
export const myDef = defineComponent(MyComponent, {
  selector: "my-component",
  template,
  styles,
  initializer: () => Services.getNew(MyComponentInitializer),
  lifecycle:    () => Services.getNew(MyComponentLifecycle),
  skeleton:     '<p aria-busy="true">Loading…</p>',
  errorTemplate: '<p role="alert">Failed to load.</p>',
});
```

---

## `@PickRender` — Full-featured with initializer/lifecycle

## Component Structure

Pick Components use `@PickRender` decorator with `initializer` and `lifecycle`:

```typescript
import { PickRender, PickComponent, Reactive, Services } from "pick-components";
import template from "./my-component.template.html?raw";
import styles from "./my-component.styles.css?raw";

interface MyComponentView {
  title: string;
  count: number;
  isLoading: boolean;
}

@PickRender({
  selector: "my-component",
  initializer: () => Services.getNew(MyComponentInitializer),  // Hydration (fresh instance)
  lifecycle: () => Services.getNew(MyComponentLifecycle),      // Subscriptions (fresh instance)
  skeleton: '<div>Loading...</div>',                         // While initializing
  errorTemplate: '<div role="alert">Failed to load</div>',  // On error
  template,  // HTML string with ?raw
  styles,    // CSS string with ?raw
})
export class MyComponent extends PickComponent {
  @Reactive data: MyComponentView = {
    title: "Initial",
    count: 0,
    isLoading: false,
  };

  readonly actionRequested$ = this.createIntent();
  readonly valueChanged$ = this.createIntent<string>();

  requestAction(): void {
    this.actionRequested$.notify();
  }

  changeValue(newValue: string): void {
    this.valueChanged$.notify(newValue);
  }

  // Called by initializer to hydrate component
  hydrate(data: MyComponentView): void {
    this.data = data;
  }
}
```

## Key Patterns

### Initializer (Hydration)

Loads initial data before component renders:

```typescript
import { PickInitializer } from "pick-components";

export class MyComponentInitializer extends PickInitializer<MyComponent> {
  constructor(private readonly service: MyService) {
    super();
  }

  protected onInitialize(component: MyComponent): boolean {
    // Load initial data
    const initialData = this.service.getInitialData();
    component.hydrate(initialData);
    return true;  // Return false if initialization fails
  }
}
```

### Lifecycle (Subscriptions)

Manages subscriptions and intent handling:

```typescript
import { PickLifecycleManager } from "pick-components";

export class MyComponentLifecycle extends PickLifecycleManager<MyComponent> {
  constructor(private readonly service: MyService) {
    super();
  }

  protected onComponentReady(component: MyComponent): void {
    // Subscribe to service updates
    this.addSubscription(
      this.service.data$.subscribe((data) => {
        component.data = data;
      })
    );

    // Subscribe to component intents
    this.addSubscription(
      component.actionRequested$.subscribe(() => {
        this.service.performAction();
      })
    );

    // Cleanup is automatic when component unmounts
  }
}
```

### Template (my-component.template.html)
```html
<div class="my-component">
  <h2>{{data.title}}</h2>
  <p>Count: {{data.count}}</p>
  <pick-action action="requestAction">
    <button disabled="{{data.isLoading}}">Click me</button>
  </pick-action>
</div>
```

### `pick-action` in `@PickRender` / `defineComponent` — two patterns

**Pattern A — via intent + lifecycle** (preferred when the action triggers async logic or service calls):

The template uses `<pick-action action="requestAction">` → the component method fires `actionRequested$.notify()` → the lifecycle reacts and calls the service.

**Pattern B — via `getViewActions()`** (simpler for pure UI actions with no service interaction):

```typescript
import { PickViewActions } from "pick-components";

export class MyComponent extends PickComponent {
  @Reactive count = 0;

  // getViewActions() maps pick-action names to handlers.
  // `this` is the component instance.
  getViewActions(): PickViewActions {
    return {
      increment: () => { this.count++; },
      decrement: () => { this.count--; },
      reset:     () => { this.count = 0; },
    };
  }
}
```

```html
<!-- Template -->
<pick-action action="increment"><button type="button">+</button></pick-action>
<pick-action action="decrement"><button type="button">−</button></pick-action>
<pick-action action="reset"><button type="button">Reset</button></pick-action>
```

> Use Pattern A when the action needs a service. Use Pattern B for simple local state mutations.

### Composition Root Registration

Initializers and lifecycles must be registered with factory functions so `Services.getNew()` creates a fresh instance each time:

```typescript
// bootstrap.ts (composition root)
import { Services } from "pick-components";

Services.register(MyService, () => new MyService());

// Register with factory so getNew() always creates a fresh instance
Services.register(
  MyComponentInitializer,
  () => new MyComponentInitializer(Services.get(MyService))
);
Services.register(
  MyComponentLifecycle,
  () => new MyComponentLifecycle(Services.get(MyService))
);
```

## Anti-Patterns to NEVER Use

❌ Register initializers/lifecycles as direct instances — Use factory functions  
❌ Instantiate services with `new` outside the composition root — Use `Services.get()`  
❌ Skip `initializer` — Always hydrate data upfront  
❌ Mix business logic in components — Use lifecycle binding  
❌ Template logic beyond expressions — Validate in services  
❌ Use `pick-action` as an HTML attribute — It is a **custom element**, always wrap: `<pick-action action="name"><button>...</button></pick-action>`  

## Real Example from Kronometa

```typescript
@PickRender({
  selector: "race-controls",
  initializer: () => Services.getNew(RaceControlsInitializer),  // Load race state
  lifecycle: () => Services.getNew(RaceControlsLifecycle),      // Subscribe to updates
  skeleton: '<section aria-busy="true"><p>Loading...</p></section>',
  template,
  styles,
})
export class RaceControlsComponent extends PickComponent {
  @Reactive control: RaceControlView = EMPTY_CONTROL;
  @Reactive raceClockLabel = EMPTY_CONTROL.raceClockLabel;
  @Reactive feedback = "";
  readonly startMassRequested$ = this.createIntent();
  readonly undoRequested$ = this.createIntent();
  readonly exportRequested$ = this.createIntent();

  hydrate(control: RaceControlView): void {
    this.control = control;
    this.raceClockLabel = control.raceClockLabel;
  }

  requestStartMass(): void {
    this.startMassRequested$.notify();
  }
}
```

**Key principles:**
- Register initializer/lifecycle with factory functions and use `Services.getNew()`
- `initializer` for data loading, `lifecycle` for subscriptions
- Both `skeleton` and `errorTemplate` define loading/error states
- Components emit **intents** (user actions), services handle domain logic
