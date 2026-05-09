import counterStyles from "./counter.styles.css";
import { PickComponent, Reactive, Listen, defineComponent } from "pick-components";

// defineComponent es una alternativa sin decoradores a @PickRender.
// La clase usa @Reactive y @Listen como siempre — solo cambia el registro.
class ContadorEjemplo extends PickComponent {
  // @Reactive vuelve a renderizar el componente para mantener {{count}} sincronizado.
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

// defineComponent reemplaza el decorador @PickRender.
// Devuelve un descriptor ComponentDefinition que consume bootstrapFramework.
export const counterDef = defineComponent(ContadorEjemplo, {
  selector: "counter-example",
  styles: counterStyles,
  template: `
    <div class="counter">
      <p>Contador: {{count}}</p>
      <div class="actions">
        <button id="decrementButton" type="button">−</button>
        <button id="resetButton" type="button">Reiniciar</button>
        <button id="incrementButton" type="button">+</button>
      </div>
    </div>
  `,
});
