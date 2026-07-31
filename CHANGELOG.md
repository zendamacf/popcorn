# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-08-01

### Changed
- Migrated from JavaScript to TypeScript.
- Migrated from ESLint to Biome.
- Migrated from Yarn to Bun.
- Replaced the compiled demo with a Vite live demo app.
- Simplified seat rendering to a single `SeatShape` (removed empty seat subclasses).
- Removed unused Webpack/Babel dependencies.
- Updated Konva library from 6.0.0 to 10.3.0.

### Fixed
- Legend seat swatches now use the configured available/booked/selected colours.
- Cursor styles on seat hover under Konva 10 (pointer enter/leave + Konva Core import for `Konva.DD`).

### Added
- `unavailableColor` option for the X mark on unavailable seats.
- Unit tests with Vitest and Codecov coverage reporting.
- Optional `seatSvg` option to draw seats from SVG path data instead of circles.

## [0.0.2] - 2020-05-29

### Fixed
- Event handler payload key is `detail`, not `details`
- Browser events are no longer ignored on most canvas elements

## [0.0.1] - 2020-05-22

### Added
- Initial release
