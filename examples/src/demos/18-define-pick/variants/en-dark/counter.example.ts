import counterStyles from "./counter.styles.css";
import { definePick } from "pick-components";

// definePick is the fully decorator-free API.
// No class, no @Reactive, no @Listen — everything is configured via ctx.
export const counterDef = definePick<{ count: number }>("counter-example", (ctx) => {
  // Declare reactive state. Each field maps to a {{mustache}} binding.
  ctx.state({ count: 0 });

  // Actions are methods where `this` is the component state.
  ctx.on({
    decrement() { this.count--; },
    reset() { this.count = 0; },
    increment() { this.count++; },
  });

  ctx.css(counterStyles);

  ctx.html(`
    <div class="counter">
      <p>Counter: {{count}}</p>
      <div class="actions">
        <pick-action action="decrement"><button type="button">−</button></pick-action>
        <pick-action action="reset"><button type="button">Reset</button></pick-action>
        <pick-action action="increment"><button type="button">+</button></pick-action>
      </div>
    </div>
  `);
});
