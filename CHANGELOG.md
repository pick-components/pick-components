# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added `componentOverrides` to `bootstrapFramework` to allow shallow metadata overrides by selector.
- Added `patch(componentId, patch)` to `IComponentMetadataRegistry` and `ComponentMetadataRegistry`.
- Added `.github/release.yml` to standardize automatic GitHub Release Notes categories.

### Changed
- `bootstrapFramework` now validates all `componentOverrides` entries atomically before applying any patch.
- `componentOverrides` now reject unknown selectors during pre-validation.
- `componentOverrides` now validate that `patch.selector`, when provided, matches the override key during pre-validation.
- Updated repository and playground links from the old `janmbaco` namespace to `pick-components/pick-components`.

### Fixed
- Removed stale references to old `janmbaco` GitHub repository and legacy playground URL in project metadata and guidance docs.

[Unreleased]: https://github.com/pick-components/pick-components/compare/v1.0.6...HEAD