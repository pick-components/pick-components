import securityStyles from "./security.styles.css";
import { PickComponent, PickRender, Reactive } from "pick-components";

// Las expresiones {{...}} las evalúa el motor de templates contra una lista de propiedades permitidas.
// Solo las propiedades no privadas y no-lifecycle del componente están en el ámbito.
// Las expresiones fallidas se resuelven a cadena vacía y emiten un console.warn.
@PickRender({
  selector: "template-security-example",
  styles: securityStyles,
  template: `
    <section class="panel">
      <div class="group">
        <h3>✅ Permitidas</h3>
        <p><code>count + 1</code> <output>{{count + 1}}</output></p>
        <p><code>user.name</code> <output>{{user.name}}</output></p>
        <p><code>label.toUpperCase()</code> <output>{{label.toUpperCase()}}</output></p>
        <p><code>count > 0 ? "positivo" : "cero"</code> <output>{{count > 0 ? "positivo" : "cero"}}</output></p>
      </div>

      <div class="group">
        <h3>🚫 Vacías silenciosamente (console.warn emitido)</h3>
        <p><code>{{iife}}</code> <output>{{(() => count + 1)()}}</output></p>
        <p><code>{{lifecycleLabel}}</code> <output>{{onInit()}}</output></p>
      </div>

      <div class="group">
        <h3>🔇 Vacías silenciosamente (sin advertencia)</h3>
        <p><code>{{privateLabel}}</code> <output>{{_secret}}</output></p>
      </div>

      <div class="group">
        <h3>⛔ Posiciones bloqueadas</h3>
        <p class="note">Los bindings en nombres de etiqueta, atributos de evento y contenido de
          <code>&lt;script&gt;</code> / <code>&lt;style&gt;</code> nunca son extraídos
          por el motor de templates — aparecen como texto literal.</p>
        <p class="note">Abre la consola del navegador y filtra por
          <code>[ExpressionResolver]</code> para ver las advertencias de las dos
          expresiones del grupo anterior.</p>
      </div>
    </section>
  `,
})
class TemplateSecurityExample extends PickComponent {
  @Reactive count = 5;
  @Reactive user = { name: "Ada" };
  @Reactive label = "hola";

  // Estas propiedades guardan el texto de la expresión para mostrarlo en el template
  // sin que sea evaluado:
  readonly iife = "(() => count + 1)()";
  readonly lifecycleLabel = "onInit()";
  readonly privateLabel = "_secret";

  // Los campos privados están excluidos de la lista permitida — se resuelven a cadena vacía:
  private readonly _secret = "oculto";
}
