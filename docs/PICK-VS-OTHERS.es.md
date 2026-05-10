# Pick Components vs React / Vue / Lit / Angular / Svelte / Glimmer

Este documento explica qué es Pick Components y qué no es, para ayudar a los desarrolladores que vienen de otros frameworks a calibrar las expectativas.

---

## Lo que Pick Components no es

### No es React

React es una librería de UI centrada en JSX, estado con hooks y reconciliación sobre un árbol virtual de componentes.

Pick Components apunta directamente a custom elements nativos. No hay árbol virtual gestionado por framework entre tu componente y el navegador, ni runtime de hooks.

Eso no impide integrarlo dentro de una app React: puedes consumir componentes de Pick como custom elements en pantallas concretas sin migrar toda la base.

Si React ya os da velocidad y estabilidad, lo más práctico suele ser continuar ahí y evaluar Pick solo para casos concretos.

### No es Vue

Vue es un framework progresivo con convenciones de SFC, un sistema reactivo basado en refs/proxies y patrones de aplicación para routing y stores.

Pick Components no define un modelo SFC ni una capa de framework de aplicación. Se centra en custom elements nativos explícitos, servicios explícitos y factories de lifecycle predecibles.

Con un stack Vue consolidado, suele tener más sentido comparar por caso de uso que plantear una migración general.

### No es un reemplazo de Lit

Lit es una librería mantenida por Google para construir Web Components con template literals etiquetados (`html\`...\``), reflexión de propiedades y un sistema de actualización reactiva que compara valores de atributos y propiedades.

Pick Components no usa template literals etiquetados. Los templates son cadenas HTML planas compiladas en tiempo de ejecución en un grafo de bindings reactivos. El modelo de binding es explícito y está basado en propiedades de estado nombradas — no hay diffing de DOM virtual ni ciclo de reflexión de propiedades.

Si ya usas Lit y cubre tus necesidades, mantener Lit es una decisión totalmente válida.

### No es Angular

Angular es un framework completo de aplicación con sistema de módulos, contenedor de inyección de dependencias, detección de cambios basada en zones, CLI, compilación AOT y una estructura de proyecto opinionada.

Pick Components es un framework de componentes, no de aplicación. No tiene router más allá de `<pick-router>` para el caso simple, ni sistema de módulos, ni CLI, ni paso AOT, ni zone.js. La inyección de dependencias es explícita y factory-first — no hay contenedor que auto-descubra o auto-conecte servicios.

Para equipos cómodos con Angular CLI, DI y su ecosistema, cambiar solo por cambiar rara vez compensa.

### No es Svelte

Svelte se apoya en transformaciones en tiempo de compilación que reescriben código y templates a operaciones DOM imperativas.

Pick Components no requiere paso de compilación. Los templates son cadenas HTML planas interpretadas en runtime por un motor de bindings determinista, y el cableado del componente permanece explícito en factories y hooks de lifecycle.

Si vuestro flujo depende de las ventajas del compilador de Svelte, lo razonable suele ser seguir con ese enfoque.

### No es Glimmer

Glimmer VM es la capa de renderizado dentro de Ember. Usa un formato de bytecode compilado para los templates, un modelo de reactividad basado en referencias y un árbol de propietarios estricto para la propiedad de componentes.

Pick Components compila los templates en tiempo de ejecución en el navegador, no en tiempo de build. No hay bytecode, no hay modelo de propietario de Ember, y no hay contrato de clase `glimmer-component` que implementar.

En proyectos asentados sobre Ember/Glimmer, Pick suele encajar mejor como referencia comparativa que como sustitución inmediata.

---

## Lo que Pick Components sí es

### Native Web Components primero

Cada componente registrado con `@Pick` o `@PickRender` se convierte en un custom element nativo. No hay árbol virtual de componentes entre el componente y el navegador. Shadow DOM, slots, observación de atributos y `customElements` se usan directamente.

### Templates controlados

Los templates son cadenas HTML planas. Las expresiones dentro de `{{...}}` son analizadas por un pipeline AST determinista — sin `eval`, sin `new Function`. Solo se permiten accesos de lectura seguros a propiedades y un conjunto habilitado de llamadas a métodos. No puede ejecutarse JavaScript arbitrario dentro de un template.

### Lifecycle y servicios explícitos

El pipeline de renderizado es explícito y secuencial:

```
Skeleton → Initializer → Template Compile → DOM Replace → Listeners → onRenderComplete → LifecycleManager
```

Cada paso tiene una única responsabilidad. No hay ambigüedades de lifecycle sobre cuándo el estado está listo, cuándo existe el DOM o cuándo los servicios están disponibles.

### Inyección de dependencias explícita

Los servicios se inyectan a través de funciones factory. Nada se auto-descubre, auto-conecta o auto-instancia. Cada dependencia que recibe un componente se declara explícitamente en la raíz de composición.

### Cero dependencias en runtime

El paquete npm no tiene dependencias en runtime. La distribución lista para el navegador es un único archivo autocontenido.

---

## Tabla comparativa rápida

| Aspecto | Pick Components | React | Vue | Lit | Angular | Svelte | Glimmer |
| ------- | --------------- | ----- | --- | --- | ------- | ------ | ------- |
| Modelo principal | Custom elements nativos | Librería UI sobre JSX + reconciliación | Framework progresivo sobre SFC + runtime reactivo | Librería de Web Components | Framework completo de aplicación | Componentes compiler-first | VM de renderizado de Ember |
| Sintaxis de templates | `{{prop}}` en cadenas HTML | JSX | Templates SFC / funciones render | Template literals etiquetados | `{{ prop }}` en ficheros `.html` | Sintaxis de templates de Svelte | `{{prop}}` en ficheros `.hbs` |
| Modelo de reactividad | Basado en señales, suscripciones por propiedad | Estado/hooks + reconciliación | Reactividad con proxies/refs | Reflexión de propiedades + ciclo de actualización | Zone.js + detección de cambios | Asignaciones reactivas en compilación | Referencias rastreadas + autotracking |
| Estrategia DOM | Shadow DOM nativo, sin diffing | Diffing de Virtual DOM | Diffing de Virtual DOM | LitElement gestiona Shadow DOM | Actualizaciones DOM disparadas por Zone | Actualizaciones imperativas generadas por compilador | Bytecode compilado, renderizado incremental |
| DI | Funciones factory explícitas | Librerías/patrones del ecosistema | Provide/inject + ecosistema | No incluida | Contenedor completo con decoradores | Manual/basada en módulos | Árbol de componentes basado en owner |
| Requisito de build | Opcional (sin build para browser ESM plano; habitual con TS/decoradores) | Habitual | Habitual | Habitual | Flujo CLI/AOT requerido | Compilador requerido | Toolchain habitual de Ember/Glimmer |
| SSR | Adopción HTML-first prerendered | Frameworks del ecosistema | Frameworks del ecosistema | Lit SSR (experimental) | Angular Universal | SvelteKit SSR | Glimmer SSR (Fastboot) |

`Requisito de build` se refiere a si el framework exige compilación para poder ejecutarse. Pick Components puede ejecutarse directamente en el navegador con ESM y sin bundler; muchos proyectos igualmente usan build para TypeScript, decoradores y optimización.

---

## Cuándo usar Pick Components

Pick Components encaja bien cuando:

- Quieres Web Components nativos sin un gran runtime de framework.
- La lógica de negocio pertenece a los servicios, no a los componentes.
- Prefieres el cableado explícito sobre el auto-descubrimiento por convención.
- Los templates deben ser controlados — sin JavaScript arbitrario, sin vectores XSS.
- Quieres reactividad basada en señales con actualizaciones finas y sin paso de diffing.

No encaja bien cuando:

- Necesitas un framework de aplicación completo con routing, gestión de estado, AOT y un ecosistema amplio desde el principio.
- Tu equipo ya es productivo con Lit, Angular u otro framework.

---

## Relacionados

- [README](../README.md)
- [Pick vs PickRender](PICK-VS-PICKRENDER.es.md)
- [Arquitectura de Renderizado](RENDERING-ARCHITECTURE.es.md)
- [Compatibilidad de Decoradores TypeScript](DECORATOR-COMPATIBILITY.es.md)
