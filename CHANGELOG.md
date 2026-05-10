# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added `docs/GETTING-STARTED.md` and `docs/GETTING-STARTED.es.md`: step-by-step guide (project → npm → Copilot skill → first component) covering all four component APIs (`@Pick`, `definePick`, `@PickRender`, `defineComponent`).
- Added `.github/skills/setup-pick-components/05-inline-context-api.md`: complete `ctx.*` InlineContext API reference for `@Pick` and `definePick` (`ctx.state`, `ctx.on`, `ctx.listen`, `ctx.computed`, `ctx.intent`, `ctx.lifecycle`, `ctx.initializer`, `ctx.skeleton`, `ctx.errorTemplate`, `ctx.html`, `ctx.css`, `ctx.props`, `ctx.ref`, `ctx.rules`).

### Changed
- Updated `.github/skills/setup-pick-components/SKILL.md` description with all four API names and `ctx.*` keywords for better Copilot skill discovery.
- Updated `.github/skills/setup-pick-components/01-create-components.md` with a 4-API comparison table, `@Pick`, `definePick`, and `defineComponent` sections, `getViewActions()` patterns, and `pick-action` custom element warning.
- Updated `docs/README.md` and `docs/README.es.md` with `GETTING-STARTED` entries.
- Updated `README.md` Start Paths with a link to `GETTING-STARTED.md`.
- Fixed broken `SETUP.md` link in `.github/copilot-instructions.md`.

### Fixed
- Fixed `definePick` playground example (`18-define-pick`) where `pick-action` was used as an HTML attribute instead of a custom element wrapper; all four locale variants updated.
- Moved brand SVG assets from `examples/.github/brand/` to `examples/brand/` so GitHub Pages serves them correctly (`.github/` paths are not exposed as HTTP routes by GitHub Pages).
- Fixed `release.yml` workflow never triggering: `GITHUB_TOKEN`-based tag pushes do not trigger other workflows. Added `workflow_dispatch` to `release.yml` and a `gh workflow run` step in `tag-release.yml` that explicitly triggers the release after tag creation.

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
- Added `.github/brand/` SVG asset set as the repository source of truth for runtime and README branding.
- Added documentation indexes `docs/README.md` and `docs/README.es.md` to improve navigation across EN/ES docs.
- Added `docs/DEPENDENCY-INJECTION.md` and `docs/DEPENDENCY-INJECTION.es.md` for factory-first DI guidance.
- Added `docs/USAGE-GUIDE.md` and `docs/WHY-PICK-COMPONENTS.md` as complementary long-form documentation.

### Changed
- `bootstrapFramework` now validates all `componentOverrides` entries atomically before applying any patch.
- `componentOverrides` now rejects unknown selectors during pre-validation.
- `componentOverrides` now validates that `patch.selector`, when provided, matches the override key during pre-validation.
- Updated repository and playground links from the old `janmbaco` namespace to `pick-components/pick-components`.
- Updated `README.md` with theme-aware branding header and docs-oriented onboarding flow.
- Updated playground shell UI with responsive mobile drawer navigation and aligned branding assets.
- Updated examples/prerender build scripts to consume `.github/brand` assets as canonical branding inputs.

### Fixed
- Removed stale references to old `janmbaco` GitHub repository and legacy playground URL in project metadata and guidance docs.
- Fixed unit prerender expectations by updating `prerender-examples` snapshot and color-token assertions after branding/theme updates.

[Unreleased]: https://github.com/pick-components/pick-components/compare/v1.0.7...HEAD
[1.0.7]: https://github.com/pick-components/pick-components/compare/v1.0.6...v1.0.7