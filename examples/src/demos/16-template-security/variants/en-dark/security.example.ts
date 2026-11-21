import securityStyles from "./security.styles.css";
import { PickComponent, PickRender, Reactive } from "pick-components";

// {{...}} expressions are evaluated by the template engine against a property allow-list.
// Only non-private, non-lifecycle component properties are in scope.
// Failing expressions resolve to an empty string; some blocked expressions also emit a console.warn.
@PickRender({
  selector: "template-security-example",
  styles: securityStyles,
  template: `
    <section class="panel">
      <h2>Break the template</h2>
      <div class="group">
        <h3>✅ Allowed</h3>
        <p><code>count + 1</code> <output data-result="allowed">{{count + 1}}</output></p>
        <pick-action action="increment"><button type="button">Increment</button></pick-action>
        <p><code>user.name</code> <output>{{user.name}}</output></p>
        <p><code>label.toUpperCase()</code> <output>{{label.toUpperCase()}}</output></p>
        <p><code>count > 0 ? "positive" : "zero"</code> <output>{{count > 0 ? "positive" : "zero"}}</output></p>
      </div>

      <div class="group">
        <h3>Rejected expressions</h3>
        <p><code>{{iife}}</code> <output data-result="rejected">{{(() => count + 1)()}}</output><span class="rejection">Expression rejected. Arrow functions cannot run in a template. Try count + 1.</span></p>
        <p><code>{{lifecycleLabel}}</code> <output>{{onInit()}}</output></p>
      </div>

      <div class="group">
        <h3>🔇 Silently empty (no warning)</h3>
        <p><code>{{privateLabel}}</code> <output>{{_secret}}</output></p>
      </div>

      <div class="group">
        <h3>⛔ Blocked template positions</h3>
        <p class="note">Bindings in tag names, event handler attributes, and
          <code>&lt;script&gt;</code> / <code>&lt;style&gt;</code> content are never
          extracted by the template engine — they appear as literal text.</p>
        <p class="note">Open the browser console and filter by
          <code>[ExpressionResolver]</code> to see warnings for the two expressions
          in the group above.</p>
      </div>
    </section>
  `,
})
class TemplateSecurityExample extends PickComponent {
  @Reactive count = 5;

  increment(): void {
    this.count += 1;
  }
  @Reactive user = { name: "Ada" };
  @Reactive label = "hello";

  // These properties hold the expression text so the template can display it
  // without evaluating the expression itself:
  readonly iife = "(() => count + 1)()";
  readonly lifecycleLabel = "onInit()";
  readonly privateLabel = "_secret";

  // Private fields are excluded from the allow-list — they resolve to empty string:
  private readonly _secret = "hidden";
}
