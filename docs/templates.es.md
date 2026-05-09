# Sistema de Templates

Pick Components usa un sistema de templates con conciencia HTML que tiene dos dialectos activos en tiempo de ejecución, contextos de extracción limitados y manejo gestionado del host para proyección e inputs.

## Dialectos

- **Bindings reactivos `{{...}}`:** Se suscribe a propiedades del componente; actualiza el DOM cuando los valores cambian.
- **Reglas de validación `[[RULES.campo]]`:** Emite atributos de validación HTML basados en `component.rules`, típicamente hidratados por el inicializador antes del primer render real.

## Reglas de extracción

- Contextos parseados: nodos de texto y valores de atributo.
- Contextos excluidos: nombres de etiqueta, nombres de atributo, `<script>`, `<style>`, `<template>`, comentarios HTML, atributos de evento, atributo `style`, atributo `srcdoc`.
- Los atributos URL con bindings dinámicos, como `href`, `src` y `formaction`, se escriben solo cuando el valor resuelto tiene una forma URL segura: URLs relativas o `http:`, `https:`, `mailto:` o `tel:`.

Ejemplo (permitido):

```html
<p>Valor: {{count}}</p>
<div class="tema-{{mode}}"></div>
```

Ejemplos bloqueados:

```html
<{{tag}}></{{tag}}>
<button onclick="{{handler}}">Click</button>
<script>{{code}}</script>
```

## Proyección de contenido con `<slot>` nativo

Usa elementos estándar `<slot>` y `<slot name="x">` dentro de los templates de los componentes. El Shadow DOM gestiona la proyección de forma nativa. Asigna contenido a slots con nombre usando el atributo `slot="x"` en los hijos del Light DOM.

## CSS y estilos en Shadow DOM

Los estilos de los componentes están delimitados al Shadow Root y nunca se filtran al documento global. Declara los estilos mediante la opción `styles` en `@Pick` / `@PickRender`; se inyectan como un elemento `<style>` dentro del Shadow Root en cada render.

### `:host` — estilos del elemento host

Usa la pseudo-clase `:host` para dar estilo al propio elemento custom desde dentro del Shadow Root. Esto elimina la necesidad de un override externo de `display` o layout.

```css
/* Siempre como bloque */
:host {
  display: block;
}

/* Contenedor de layout transparente */
:host {
  display: contents;
}

/* Condicional mediante atributo */
:host([hidden]) {
  display: none;
}

/* Responsivo */
:host {
  display: flex;
  gap: 1rem;
}
@media (max-width: 600px) {
  :host {
    flex-direction: column;
  }
}
```

En `@Pick`:

```typescript
ctx.css(`
  :host { display: block; padding: 1rem; }
`);
```

En `@PickRender`:

```typescript
@PickRender({
  selector: 'my-card',
  styles: `:host { display: block; border: 1px solid #ccc; }`,
  template: `...`,
})
```

### `::slotted()` — estilos sobre contenido proyectado

El pseudo-elemento `::slotted()` aplica estilos a los hijos del Light DOM proyectados en un `<slot>`. Solo se pueden apuntar los hijos directos proyectados (no los nietos).

```css
/* Todos los hijos proyectados */
::slotted(*) {
  color: inherit;
}

/* Tipo de elemento específico proyectado */
::slotted(p) {
  margin: 0;
}

/* Hijos proyectados con una clase */
::slotted(.destacado) {
  background: yellow;
}
```

### Propiedades CSS personalizadas — theming a través del Shadow DOM

Las propiedades CSS personalizadas (variables) atraviesan el límite del Shadow DOM y son el patrón recomendado para el theming.

```css
/* La página consumidora define los tokens de tema */
:root {
  --card-bg: #fff;
  --card-padding: 1rem;
}

/* Los estilos del componente las consumen con un fallback */
:host {
  background: var(--card-bg, white);
  padding: var(--card-padding, 0.5rem);
}
```

Esto permite theming externo sin romper el encapsulamiento.

## Hosts gestionados

- Un host gestionado es un elemento renderizado a través de Pick Components con metadatos del componente adjuntos.
- Transferencia de clases: las clases del host se fusionan en el elemento outlet; los duplicados se eliminan; las clases del host van primero.
- Transferencia de ID: el ID del host se mueve al outlet solo cuando el outlet no tiene ID; en caso contrario ambos conservan sus IDs.

## Selección del outlet

La resolución del outlet se prioriza como:

1. Elemento con la clase `.outlet`
2. Único elemento hijo cuando solo existe uno
3. Elemento raíz como fallback

## Manejo de inputs

- Los atributos del host se copian a propiedades del componente mediante `PickElementFactory`
  cuando la propiedad existe en la instancia del componente.
- Los valores de atributos reactivos son gestionados por `BindingResolver`.
- Valores soportados: primitivos (`title="Card"`), referencias de objeto/array
  (`items="{{entries}}"` almacenados por ID en `ObjectRegistry`), texto mixto
  (`msg="Hola {{name}}"`), y atributos booleanos como
  `disabled="{{loading}}"`.
- Los atributos estructurales de los primitivos como `<pick-action action="save">`
  son consumidos por esos primitivos y no son inputs del componente.

## Primitivos Pick

### `<pick-action>`

```html
<pick-action action="save" value="{{draft}}">
  <button type="button">Guardar</button>
</pick-action>
```

- `action`: nombre de la acción expuesta por `ctx.on(...)` o `getViewActions()`.
- `event`: alias de `action`; usa `action` en código nuevo.
- `value`: primer argumento opcional pasado a la acción.
- `bubble`: propagación opt-in más allá del PickComponent más cercano.

El evento DOM es siempre `pick-action`, pero las acciones gestionadas se detienen en el componente más cercano a menos que `bubble` esté presente.

### `<pick-for>`

```html
<pick-for items="{{todos}}" key="id">
  <p>{{$item.text}}</p>
</pick-for>
```

`items` recibe el array. `key` es opcional pero recomendado cuando las filas tienen un identificador estable. Cada fila expone `$item` a su template.

### `<pick-select>`

```html
<pick-select>
  <on condition="{{loading}}">
    <p aria-busy="true">Cargando...</p>
  </on>
  <otherwise>
    <p>Listo</p>
  </otherwise>
</pick-select>
```

Las ramas `<on>` se renderizan cuando su `condition` se resuelve como verdadera. Si ninguna rama `<on>` coincide, se renderiza `<otherwise>`.

## Depuración de expresiones de template

Las expresiones de template se evalúan en tiempo de ejecución en el navegador. Una expresión fallida **nunca lanza una excepción** — se resuelve a cadena vacía. Algunos fallos emiten `console.warn` con el prefijo `[ExpressionResolver]`; otros se resuelven silenciosamente por diseño.

### Por qué una expresión se evalúa a cadena vacía

| Causa | Ejemplo | Advertencia en consola |
| ----- | ------- | ---------------------- |
| IIFE o función flecha | `{{(() => x)()}}` | Sí |
| Método lifecycle llamado | `{{onInit()}}` | Sí |
| Propiedad no existe en el componente | `{{propDesconocida}}` | Ninguna |
| Propiedad empieza por `_` | `{{_campo}}` | Ninguna |

### Formato de la advertencia en consola

Cuando el motor de templates no puede evaluar una expresión emite una de estas:

```
[ExpressionResolver] Expression evaluation error: <mensaje> in "<expresión>"
[ExpressionResolver] Accessing non-whitelisted property "<nombre>" in expression "<expresión>"
```

### Cómo detectar errores de expresiones en las DevTools del navegador

1. Abre las DevTools del navegador → pestaña **Console**.
2. Filtra por `[ExpressionResolver]` para aislar las advertencias de templates.
3. La advertencia incluye la expresión fallida y el motivo.

### Ejemplos de expresiones inválidas

```html
<!-- IIFE — se evalúa a cadena vacía, console.warn emitido -->
<p>{{(() => count + 1)()}}</p>

<!-- Método lifecycle — cadena vacía tras la advertencia -->
<p>{{onInit()}}</p>

<!-- Propiedad que empieza por _ — silenciosamente vacía, sin advertencia -->
<p>{{_estadoInterno}}</p>
```

### Posiciones bloqueadas en el template

Los bindings en las siguientes posiciones **nunca se extraen** y aparecen como texto literal:

```html
<{{tag}}></{{tag}}>              <!-- nombre de etiqueta — no parseado -->
<button onclick="{{handler}}">  <!-- atributo de evento — no parseado -->
<script>{{code}}</script>       <!-- contenido de script — no parseado -->
<style>{{rule}}</style>         <!-- contenido de style — no parseado -->
```

### Playground

Consulta el ejemplo **Seguridad de Templates** en el playground para una demostración en vivo de expresiones permitidas e ignoradas silenciosamente.
