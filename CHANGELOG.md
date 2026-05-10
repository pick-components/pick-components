# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2026-05-09

### Added
- Added `docs/DECORATOR-COMPATIBILITY.md` (and Spanish translation) documenting all tested TypeScript decorator setups and bundler combinations (closes #3).
- Added `docs/PICK-VS-OTHERS.md` (and Spanish translation) comparing Pick Components with Lit, Angular, and Glimmer (closes #5).
- Added six compatibility examples under `examples/compat/` covering tsc+legacy, webpack+ts-loader+TC39, swc+TC39, webpack+babel-loader+legacy, webpack+babel-loader+TC39, and bun+TC39.
- Added `scripts/build-compat-examples.mjs` to build all compat examples in one step (`npm run build:compat`).
- Added Playwright test suite `tests/browser/compat-decorator-setups.test.ts` verifying all six compat setups render correctly (`npm run test:compat`).
- Added `componentOverrides` to `bootstrapFramework` to allow shallow metadata overrides by selector.
- Added `patch(componentId, patch)` to `IComponentMetadataRegistry` and `ComponentMetadataRegistry`.
- Added `.github/release.yml` to standardize automatic GitHub Release Notes categories.
- Added `docs/templates.md` debugging section: why expressions evaluate to empty string, console warning format, DevTools filter workflow, invalid expression examples, and blocked template positions (closes #6).
- Added `docs/templates.es.md` as the Spanish companion for the full template system reference.
- Added playground example `16-template-security` (4 locale variants) showing allowed vs rejected template expressions and blocked template positions (closes #7).
- Added `defineComponent()` as a decorator-free alternative to `@PickRender` (closes #4).
- Added `definePick()` as a decorator-free alternative to `@Pick` with no class required (closes #4).
- Added `components` option to `bootstrapFramework` for explicit composition root registration (closes #4).
- Added `ComponentDefinition` discriminated union type exported from `pick-components`. The `kind` field uses string literal types (`'render' | 'pick'`), so descriptors can be constructed without importing `ComponentKind`.
- Added `ComponentKind` convenience constant object exported from `pick-components` with members `Render: 'render'` and `Pick: 'pick'`.
- Added playground examples `17-define-component` and `18-define-pick` (4 locale variants each).
- Added "Using without decorators" section to `docs/PICK-VS-PICKRENDER.md` and its Spanish translation.

### Changed
- `bootstrapFramework` now validates all `componentOverrides` entries atomically before applying any patch.
- `componentOverrides` now rejects unknown selectors during pre-validation.
- `componentOverrides` now validates that `patch.selector`, when provided, matches the override key during pre-validation.
- Updated repository and playground links from the old `janmbaco` namespace to `pick-components/pick-components`.

### Fixed
- Removed stale references to old `janmbaco` GitHub repository and legacy playground URL in project metadata and guidance docs.

[Unreleased]: https://github.com/pick-components/pick-components/compare/v1.0.7...HEAD
[1.0.7]: https://github.com/pick-components/pick-components/compare/v1.0.6...v1.0.7