# Create Contracts Package Spec

## Goal

Create a new pnpm workspace package named `@bruff/contracts` in `packages/contracts` that provides shared object and type contracts declared with Zod. The package gives future workspace packages one canonical place to define runtime-validated shapes and inferred readonly TypeScript types, without migrating any existing package to consume those contracts yet.

## User-Visible Behaviour

- Developers can import shared schemas and inferred types from `@bruff/contracts` after the package is created.
- The workspace recognizes `packages/contracts` automatically through the existing `packages/*` workspace pattern.
- The new package has its own package metadata, TypeScript config, lint config, README, tests, and public root export.
- The package depends on `zod` directly and exposes Zod schemas rather than duplicating validation logic in each consumer.
- No current workspace package imports from `@bruff/contracts` as part of this work.

## Out Of Scope

- Do not migrate `@bruff/game`, `@bruff/game-element`, `@bruff/arcade`, `@bruff/sigil`, `@bruff/glyph`, `@bruff/cli`, or `@bruff/utils` to use `@bruff/contracts`.
- Do not change any existing `GameState` shape, action variant, reducer, render command, replay fixture, or snapshot.
- Do not create DOM, Canvas, Vite app, CLI, or game-shell code in the contracts package.
- Do not create package build output or generated type files unless the existing workspace packaging pattern changes before implementation.
- Do not add a broad validation framework beyond Zod schemas, inferred types, and small pure parser helpers.

## Open Questions

None. The decisions below are resolved for this SDTE pass.

## Resolved Decisions

- Package name: use `@bruff/contracts` to match the workspace package naming convention.
- Package location: use `packages/contracts` so `pnpm-workspace.yaml` discovers it through `packages/*`.
- Runtime dependency: add `zod` as a package dependency, with the exact version declared through the root catalog when implementation occurs.
- Initial scope: include a minimal sample shared contract inside the package so tests can verify schema parsing and type inference, but do not model existing game or utility domain objects yet.
- Public API: expose only the root export `@bruff/contracts` at first. Add subpath exports only after multiple contract domains appear.

## Edge Cases

- Invalid inputs must be returned as explicit values through parser helpers, not thrown through package code.
- Consumers may need both runtime schemas and compile-time types, so the package must export schemas and inferred types from the same source file.
- TypeScript `exactOptionalPropertyTypes` means optional object properties need deliberate Zod modelling and tests.
- Shared exported types must be readonly to match repository public API immutability rules.
- Zod parsing APIs can throw or return rich error values depending on which API is used; package helpers must use non-throwing parse paths.
- The package must remain environment-agnostic and importable from Node.js and browser code.
- Existing workspace packages must keep compiling if `@bruff/contracts` exists but is unused.
