# Compatibilidad de Decoradores en TypeScript

Este documento lista los setups de TypeScript y bundler con los que Pick Components ha sido probado oficialmente, explica qué requiere cada uno, y declara qué setups no han sido verificados.

---

## Modos de decoradores

Pick Components soporta dos pipelines de decoradores de TypeScript.

| Modo | `experimentalDecorators` | Acepta |
| ---- | ------------------------ | ------ |
| `auto` (por defecto) | cualquier valor | Decoradores TC39 Stage 3 y legacy |
| `strict` | omitido o `false` | Solo decoradores TC39 Stage 3 |

El modo se configura en la llamada de bootstrap:

```typescript
// por defecto — acepta ambos pipelines
await bootstrapFramework(Services);

// strict — acepta únicamente TC39 Stage 3
await bootstrapFramework(Services, {}, { decorators: "strict" });
```

---

## Setups probados

### Setup 1 — tsc + decoradores estándar TC39

Usado por el código fuente de la librería (`tsconfig.json`) y los ejemplos (`examples/tsconfig.json`).

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

`experimentalDecorators` está omitido, lo que equivale a `false` y activa la emisión de decoradores TC39 Stage 3. Pick Components funciona con `@Reactive count = 0` sin requerir la palabra clave `accessor`.

La librería se compila con `tsc` puro. Los ejemplos se empaquetan con esbuild (ver [Setup 2](#setup-2--esbuild--decoradores-estándar-tc39)).

---

### Setup 2 — esbuild + decoradores estándar TC39

Usado por los ejemplos descargables del playground (`scripts/build-examples.mjs`, `scripts/build-playground-lib.mjs`).

```javascript
// opciones de build de esbuild
{
  target: "es2022",
  format: "esm",
  platform: "browser",
  bundle: true
}
```

La compilación de TypeScript usa el mismo `tsconfig.json` que el Setup 1 — sin `experimentalDecorators`, `target: "ES2022"`. esbuild lee el tsconfig del proyecto y emite decoradores TC39.

Este setup se ejercita cada vez que el botón de descarga del playground genera una carpeta de proyecto autocontenida.

---

### Setup 3 — Vite + `experimentalDecorators` legacy

Usado en proyectos de consumo que empezaron con una plantilla estándar de Vite.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "strict": true
  }
}
```

**`useDefineForClassFields: false` es obligatorio** cuando `experimentalDecorators` está en `true`. Sin él, TypeScript emite los inicializadores de campo de clase usando la semántica nativa de `Object.defineProperty`, que se ejecuta después del decorador e impide que `@Reactive` pueda interceptar el acceso a la propiedad. Establecerlo en `false` restaura la semántica de asignación legacy que el pipeline `experimentalDecorators` necesita.

Vite usa esbuild internamente. No se necesita configuración adicional más allá de las opciones del tsconfig indicadas.

---

## Tabla de compatibilidad

| Bundler | Pipeline de decoradores | Probado | Notas |
| ------- | ----------------------- | ------- | ----- |
| `tsc` | TC39 Stage 3 | ✅ CI | Código fuente de la librería (tests CI unitarios e integración) |
| `tsc` | Legacy `experimentalDecorators` | ✅ CI | `examples/compat/01-tsc-legacy/` |
| esbuild standalone | TC39 Stage 3 | ✅ CI | Descargas del playground (build CI) |
| Rollup | TC39 Stage 3 | ✅ CI | Build de distribución browser (build CI) |
| webpack + ts-loader | TC39 Stage 3 | ✅ CI | `examples/compat/02-webpack-tc39/` |
| swc standalone | TC39 Stage 3 | ✅ CI | `examples/compat/03-swc-tc39/` |
| webpack + babel-loader | Legacy `experimentalDecorators` | ✅ CI | `examples/compat/04-babel-legacy/` |
| webpack + babel-loader | TC39 Stage 3 (2023-11) | ✅ CI | `examples/compat/05-babel-tc39/` |
| Vite (esbuild) | Legacy `experimentalDecorators` | ✅ verificado manualmente | Sin ejemplo compat dedicado; requiere `useDefineForClassFields: false` |
| bun | TC39 Stage 3 | ✅ CI | `examples/compat/06-bun-tc39/` |

Los setups etiquetados como **CI** están verificados en cada pull request por `tests/browser/compat-decorator-setups.test.ts` (ejemplos compat, proyecto `compat` en `.github/workflows/ci.yml`) o por el pipeline CI estándar (fuente de la librería, esbuild, Rollup). Los setups etiquetados como **verificado manualmente** han sido validados manualmente pero no tienen un ejemplo compat dedicado en este repositorio.

---

## Elegir entre `auto` y `strict`

Usa `auto` (el valor por defecto) a menos que tu proyecto aplique una política de usar únicamente TC39. `auto` permite al framework aceptar cualquier forma de decorador que emita el compilador, eliminando la necesidad de alinear la configuración del bootstrap con el tsconfig.

Usa `strict` solo cuando quieras explícitamente que el framework rechace la emisión de decoradores legacy — por ejemplo, para forzar la migración a decoradores estándar en un equipo.

---

## Relacionados

- [README — TypeScript y Decoradores](../README.md#typescript-and-decorators)
- [Pick vs PickRender](PICK-VS-PICKRENDER.es.md)
- [Arquitectura de Renderizado](RENDERING-ARCHITECTURE.es.md)
