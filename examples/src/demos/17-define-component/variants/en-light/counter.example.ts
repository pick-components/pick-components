import counterStyles from "./counter.styles.css";
import { PickComponent, Reactive, Listen, defineComponent } from "pick-components";

// defineComponent is a decorator-free alternative to @PickRender.
// The class uses @Reactive and @Listen as usual — only the registration changes.
class CounterExample extends PickComponent {
  // @Reactive state triggers a re-render, so {{count}} stays in sync.
  @Reactive count = 0;

  @Listen("#decrementButton", "click")
  decrement(): void {
    this.count--;
  }

  @Listen("#resetButton", "click")
  reset(): void {
    this.count = 0;
  }

  @Listen("#incrementButton", "click")
  increment(): void {
    this.count++;
  }
}

// defineComponent replaces the @PickRender decorator.
// It returns a ComponentDefinition descriptor consumed by bootstrapFramework.
export const counterDef = defineComponent(CounterExample, {
  selector: "counter-example",
  styles: counterStyles,
  template: `
    <div class="counter">
      <p>Counter: {{count}}</p>
      <div class="actions">
        <button id="decrementButton" type="button">−</button>
        <button id="resetButton" type="button">Reset</button>
        <button id="incrementButton" type="button">+</button>
      </div>
    </div>
  `,
});
