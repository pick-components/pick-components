# Entrega Compatible con SEO

Pick Components soporta rutas públicas SEO-friendly con un modelo HTML-first. Las URLs públicas devuelven HTML completo y navegable, y el runtime del navegador mejora ese documento después de cargar.

La regla importante es que crawlers y navegadores reciben el mismo HTML canónico. La detección puede ajustar caché u observabilidad, pero no debe decidir si la página tiene contenido.

## Salida de Build

`npm run build:examples` genera archivos prerenderizados bajo:

```text
examples/es/<ruta>/index.html
examples/en/<route>/index.html
```

Cada página generada incluye:

- enlaces canonical y alternate por idioma;
- anchors reales de navegación;
- atributos del contrato de prerender para adopción de DOM;
- estado inicial serializado para el shell del playground;
- el bundle cliente como enhancement progresivo.

## Entrega Local y Nginx

Tanto el servidor de desarrollo como el servidor estático de producción usan rutas file-first:

```text
/es/01-hello
  -> /es/01-hello/index.html
  -> /es/01-hello
  -> /index.html
```

Los assets estáticos con extensión no usan fallback SPA. Un `bundle.js` inexistente sigue siendo `404`, evitando que assets rotos devuelvan HTML por error.

Archivos relevantes:

- `scripts/serve-examples.mjs`
- `scripts/serve-dist.mjs`
- `examples/nginx.conf`

## Docker

La imagen Docker compila la librería y los examples, y después copia las rutas públicas generadas a Nginx:

```bash
docker build -t pick-components .
docker run -p 8080:8080 pick-components
```

Cuando el contenedor arranca, rutas públicas como `/es/01-hello` deben devolver directamente la página prerenderizada.

## Edge Worker

Para despliegues estilo Cloudflare Workers, usa:

- `deploy/cloudflare/public-route-worker.mjs`
- `deploy/cloudflare/wrangler.example.toml`

El worker usa la misma política que Nginx: HTML público primero, shell SPA solo para rutas app-only, y ninguna rama de contenido especial para crawlers.

## Adopción en Runtime

Las páginas generadas marcan los hosts prerenderizados con el contrato de prerender de Pick. En el primer arranque, el runtime comprueba versión del contrato, selector, modo de root y hash del template. Si el markup es compatible, se adopta; si no, se usa el render normal como fallback.

### Prerenderizar un widget

En el servidor, obtén los atributos del anfitrión desde la entrada de bootstrap que puede ejecutarse sin DOM. Comparte la cadena de la plantilla resuelta con el módulo del widget.

```javascript
import { elementPrerenderAttributes } from "pick-components/bootstrap";

const template = "<span>{{productId}}</span>";
const attributes = elementPrerenderAttributes("product-card", template);
```

Con el serializador HTML del servidor, aplica `attributes` y `product-id="123"` a `<product-card>`. Genera `<span>123</span>` como único hijo y escapa los datos de la aplicación. Al cargar el módulo, Pick comprueba el contrato y la estructura del hijo. Si coinciden con la plantilla, mueve el nodo original al árbol de sombra y conecta sus enlaces reactivos. Si difieren, renderiza la plantilla actual. El hash identifica la versión de la plantilla y el servidor sigue siendo responsable de la procedencia y el escapado de su HTML. Véase [Distribuir un widget independiente](GETTING-STARTED.es.md#distribuir-un-widget-independiente).

## Documentos Relacionados

- Pick vs PickRender: [PICK-VS-PICKRENDER.es.md](PICK-VS-PICKRENDER.es.md)
- Arquitectura de renderizado: [RENDERING-ARCHITECTURE.es.md](RENDERING-ARCHITECTURE.es.md)
- Versión en inglés: [SEO.md](SEO.md)
