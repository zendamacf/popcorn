# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

popcorn: a small browser library for seat reservation (cinema-style seat maps), drawn on a canvas with Konva. It ships as a single minified file, `dist/popcorn.min.js`, which is attached to each GitHub release. The usage docs are in `README.md`.

## Commands

Bun is the package manager (`bun.lock`).

```bash
bun install --frozen-lockfile
bun run dev                  # Vite dev server, opens the live demo at /demo/
bun run build                # library build into dist/
bun run build:demo           # demo build (GitHub Pages)
bun run verify:demo          # checks that docs/index.html references the demo release URL
bun run lint                 # Biome check on src
bun run typecheck            # tsc --noEmit
bun run test                 # Vitest (happy-dom)
bun run test:coverage        # what CI runs
```

Run a single test: `bunx vitest run src/utils.test.ts` (add `-t "name"` to filter by test name).

## Architecture

- **Source**: `src/popcorn.ts` is the main class (`Popcorn`): options, seat layout, selection, events (`popcorn.selectseat`, `popcorn.deselectseat`, `popcorn.maxseats`), `selected` getter and setter, `destroy()`. Other files: `eventSeat.ts` (seat event data), `legend.ts`, `shapes/seatShape.ts` (a single `SeatShape` for all seats), `defaults.ts`, `utils.ts`, `types.d.ts`. Tests sit next to the source (`*.test.ts`).
- **Public API**: the README documents it. Change the README, the types and the demo together when you change options, events or methods.
- **Build**: `vite.config.ts` builds the library and adds a license banner with the version from `package.json`.
- **Demo**: `demo/` is a Vite app that imports `src/popcorn` directly. `scripts/demo-version.ts` sets the release version that the live demo links to (`demoVersion`). Bump it by hand when you target a new release.
- **CI**: `testing.yml` (coverage), `linting.yml` (lint and typecheck), `smoketest.yml` (build, check that `dist/popcorn.min.js` exists, start the dev server, build the demo and verify it), `pages.yml` (demo), `release.yml`.
- **Konva**: the only runtime dependency. Import from `konva` the same way the existing code does, because Konva 10 needs the Core import for drag and drop (see the 1.0.0 changelog).

## Releases

`release.yml` runs when a `v*` tag is pushed. It builds the library and creates a GitHub release with `dist/popcorn.min.js`. The release notes come from the matching `## [X.Y.Z]` section of `CHANGELOG.md`, and the workflow fails if that section is missing.

- Write user-facing changes under `## [Unreleased]` in `CHANGELOG.md` (Keep a Changelog format: Added, Changed, Fixed, Removed).
- To release, rename `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`, bump `version` in `package.json` and `demoVersion` in `scripts/demo-version.ts`, then tag `vX.Y.Z`. Do not bump versions or tag unless the task asks for a release.

## Workflow notes

- Style is enforced by Biome (`bun run lint`). The lint script checks `src` only.
- Add tests for behavior changes. Coverage is reported to Codecov (patch target 70%).
- Dependabot groups updates (monthly). Do not edit `bun.lock` by hand.

## Commit format

Use [Conventional Commits](https://www.conventionalcommits.org/) for every commit and PR title: `type(scope): lowercase imperative summary`. Types: `feat`, `fix`, `docs`, `chore` (`chore(deps): ...` for dependency bumps, `chore: release X.Y.Z` for releases), `test`, `refactor`, `ci`. A scope is optional and names the area (`demo`, `legend`, ...). The PR number is added at the end on merge, for example `(#80)`. Older history does not follow this format, but new commits must.
