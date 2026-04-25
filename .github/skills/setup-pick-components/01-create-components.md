# Create Pick Components

Use this prompt when you need Copilot to generate Pick Components with proper architecture.

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
