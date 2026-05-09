import counterStyles from "./counter.styles.css";
import { definePick } from "pick-components";

// definePick es la API completamente sin decoradores.
// Sin clase, sin @Reactive, sin @Listen — todo se configura via ctx.
export const counterDef = definePick<{ count: number }>("counter-example", (ctx) => {
  // Declara el estado reactivo. Cada campo se mapea a un binding {{mustache}}.
  ctx.state({ count: 0 });

  // Las acciones son métodos donde `this` es el estado del componente.
  ctx.on({
    decrement() { this.count--; },
    reset() { this.count = 0; },
    increment() { this.count++; },
  });

  ctx.css(counterStyles);

  ctx.html(`
    <div class="counter">
      <p>Contador: {{count}}</p>
      <div class="actions">
        <button pick-action="decrement" type="button">−</button>
        <button pick-action="reset" type="button">Reiniciar</button>
        <button pick-action="increment" type="button">+</button>
      </div>
    </div>
  `);
});
