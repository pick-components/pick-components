# Por Qué Existe Pick Components

No trabajo a tiempo completo en el frontend web. Pero de vez en cuando termino construyendo algo para la web — un proyecto personal, algo pequeño o una herramienta para un amigo — y cada vez que entro en ese mundo tengo la misma sensación: demasiadas capas, demasiados frameworks, demasiadas librerías apiladas unas sobre otras, y muy poca sensación de poder ver el proyecto de extremo a extremo. Llega un punto en el que sientes que algo no encaja.

Pick Components nació de esa sensación. No nació de "quiero construir otro framework", y desde luego no nació de querer competir con React, Angular o Vue. Nació de querer algo útil para mis propios proyectos: una forma de construir Web Components nativos con límites más claros, templates controlados y menos dependencia de runtimes grandes.

Esta idea es anterior a este repositorio. Hace más de cinco años, en `FieldDocumentMaker`, dentro de `FieldDocumentMaker.Editor/src/components`, tenía un componente base que ya contenía la primera forma, todavía tosca, de esta idea. Una cosa que descubrí desarrollando ese proyecto fue que, en JavaScript, `a.b` y `a["b"]` son dos formas de llegar a la misma propiedad. Eso cambió mi forma de pensar en cómo trabaja la UI: menos "ejecuta código aquí" y más "resuelve esto desde la estructura".

Aquel componente antiguo ya tenía versiones tempranas de ideas que luego se volvieron centrales en este proyecto: bindings de template `{{...}}`, bindings basados en propiedades, actualizaciones reactivas del DOM y un pequeño paso de compilación de DOM/template. Lo que todavía faltaba era una arquitectura más limpia y una línea más firme sobre aquello a lo que los templates deberían limitarse.

Con el tiempo, eso se convirtió en una regla de diseño. Quería expresiones en templates, pero no quería `eval`, `new Function` ni JavaScript arbitrario ejecutándose dentro de templates. Esa decisión empujó el proyecto hacia parsear un lenguaje de expresiones limitado, construir un AST y evaluarlo bajo reglas explícitas. Gran parte de lo que hoy es Pick Components viene de tomarse en serio esa idea, en lugar de tratar los templates como un lugar donde vale todo.

Los modelos de lenguaje me ayudaron mucho durante todo el desarrollo. No solo como generadores de código — que también lo fueron, y de forma valiosísima —, sino para explorar arquitectura, probar ideas, refactorizar, formalizar intuiciones difusas y acelerar implementación y documentación. La dirección seguía teniendo que salir de mí, pero hicieron mucho más fácil iterar sobre el diseño del framework.

Por eso construí Pick Components: para crear Web Components nativos con una arquitectura interna más explícita, templates controlados, estado reactivo, un lifecycle claro y menos dependencia de runtimes grandes. Si esto te resulta útil, pruébalo, lee el código, cuestiona el diseño, abre issues y contribuye si quieres ayudar a darle forma.
