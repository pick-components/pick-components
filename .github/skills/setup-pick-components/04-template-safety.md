# Template Safety in Pick Components

Templates in Pick Components are **plain HTML strings** with safe reactive bindings. No `eval`, no `new Function`, no Angular-style bracket syntax.

## Template Format

Store templates as separate HTML files imported as raw strings:

```typescript
import template from "./race-controls.template.html?raw";

@PickRender({
  selector: "race-controls",
  template,
  styles,
})
export class RaceControlsComponent extends PickComponent { }
```

## Data Binding Syntax

### Reactive interpolation — `{{expression}}`

Re-evaluates and patches the DOM whenever a `@Reactive` property changes:

```html
<h2>{{control.modeLabel}}</h2>
<p>Runners: {{control.totalCount}}</p>
<span>{{count % 2 === 0 ? "Even" : "Odd"}}</span>
<p>{{name.toUpperCase()}}</p>
```

### Reactive attribute binding

`{{}}` goes **inside** the attribute value — no bracket prefix:

```html
<button disabled="{{!isValid}}">Register</button>
<div class="{{row.isFinished ? 'row-finished' : 'row-pending'}}">{{row.label}}</div>
```

### One-shot object binding — `[[Rules.*]]`

Resolved once before `connectedCallback` (not reactive). This reads from a property available in template context:

```html
<input [[Rules.username]] />
<!-- Spreads the attributes defined in Rules.username object onto the input -->
```

## Event Handling

### `<pick-action>` — the primary event mechanism

Wrap any clickable element. The `action` attribute names the handler defined in `getViewActions()`:

```html
<pick-action action="startRace"><button>Start</button></pick-action>
<pick-action action="selectPriority" value="high"><button>High</button></pick-action>
<pick-action action="removeNote" value="{{$item.id}}"><button>x</button></pick-action>
```

Wire handlers in the component:

```typescript
export class RaceControlsComponent extends PickComponent {
  getViewActions(): PickViewActions {
    return {
      startRace: () => { this.startRaceRequested$.notify(); },
      selectPriority: (value) => { this.priority = value; },
      removeNote: (value) => { this.removeNoteRequested$.notify(value); },
    };
  }
}
```

### `@Listen` — raw DOM event delegation

For native DOM events (input, change, submit, etc.):

```typescript
import { Listen } from "pick-components";

export class MyFormComponent extends PickComponent {
  @Listen("input#searchInput", "input")
  onSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  @Listen("form#noteForm", "submit")
  onSubmit(event: Event): void {
    event.preventDefault();
    // ...
  }
}
```

## Conditional Rendering — `<pick-select>`

```html
<pick-select>
  <on condition="{{dogsLoading}}">
    <p aria-busy="true">Loading images...</p>
  </on>
  <on condition="{{dogImages.length > 0}}">
    <div class="gallery"><!-- content --></div>
  </on>
  <otherwise>
    <pick-action action="requestDogImages"><button>Load images</button></pick-action>
  </otherwise>
</pick-select>
```

## List Rendering — `<pick-for>`

```html
<pick-for items="{{tasks}}" key="id">
  <p>{{$index}}. {{$item.label}}</p>
</pick-for>
```

- `items="{{array}}"` — reactive array binding
- `key="id"` — property name for identity tracking
- `{{$item.prop}}` — current item
- `{{$index}}` — zero-based index

## Slots

```html
<!-- In the component template -->
<slot name="header"></slot>
<slot></slot>
<slot name="actions"></slot>
```

## Real Example from Kronometa

```html
<!-- race-controls.template.html -->
<section class="panel">
  <header>
    <h3>{{control.modeLabel}}</h3>
    <p class="clock">{{raceClockLabel}}</p>
  </header>

  <div class="counters">
    <span>Pending: {{control.pendingCount}}</span>
    <span>Running: {{control.runningCount}}</span>
    <span>Finished: {{control.finishedCount}}</span>
  </div>

  <div class="actions">
    <pick-action action="requestStartMass">
      <button disabled="{{!control.canStartMass}}">Start mass</button>
    </pick-action>

    <pick-action action="requestUndo">
      <button disabled="{{!control.canUndo}}">{{control.lastActionLabel}}</button>
    </pick-action>
  </div>

  <pick-select>
    <on condition="{{feedback !== ''}}">
      <div class="feedback">{{feedback}}</div>
    </on>
  </pick-select>
</section>
```

## Security: Safe Expression Evaluator

Pick Components parses `{{}}` expressions into a **safe AST**. No `eval` or `new Function`.

✅ **Allowed:**
- Property access: `control.phase`, `runner.name`
- Array/index access: `items[0]`, `notes.length`
- Arithmetic and comparison: `count + 1`, `count % 2 === 0`, `age > 18`
- Logical operators: `&&`, `||`, `!`
- Ternary: `isReady ? "Go" : "Wait"`
- String methods: `.toUpperCase()`, `.trim()`

❌ **Blocked:**
- Inline event handler attributes: `onclick`, `onchange`, `oninput`, etc.
- `style` attribute bindings
- `javascript:` / `data:` / `vbscript:` URLs
- Global access: `window`, `eval()`, `console`
- Assignment: `x = 5`

## Validation Rule

**Templates display. Components and services validate.**

```typescript
// ✅ Validation in component, display in template
export class RunnerRowComponent extends PickComponent {
  @Reactive manualTimeCanSave = false;
  @Reactive manualTimeInputInvalid = false;
  @Reactive manualTimeHelp = "";

  @Listen("input#timeInput", "input")
  onTimeInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.manualTimeCanSave = isValidDuration(input);
    this.manualTimeInputInvalid = !this.manualTimeCanSave;
    this.manualTimeHelp = this.manualTimeCanSave ? "" : "Format: MM:SS.mmm";
  }
}
```

```html
<input id="timeInput" class="{{manualTimeInputInvalid ? 'invalid' : ''}}" />
<p>{{manualTimeHelp}}</p>
<pick-action action="saveTime">
  <button disabled="{{!manualTimeCanSave}}">Save</button>
</pick-action>
```

## Performance Patterns

Pre-compute view models in services or lifecycle — never compute in templates:

```typescript
// ✅ Pre-computed in lifecycle binding
component.control = {
  phase: state.phase,
  canStartMass: state.canStart && state.mode === "mass",
  pendingCount: state.runners.filter(r => !r.started).length,
};
```

```html
<!-- Template just displays -->
<span>{{control.pendingCount}}</span>
<button disabled="{{!control.canStartMass}}">Start</button>
```

