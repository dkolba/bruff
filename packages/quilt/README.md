# @bruff/quilt

Quilt is a development-only frontend tool for creating Bruff game maps. It exposes the plain Web Component `<tool-quilt>` from `@bruff/quilt` and is mounted by `@bruff/arcade` only on the development route `/tools-map`.

## Scope

Quilt edits roguelike tile maps as canvas-rendered data grids. The durable map model, editor state, command application, validation, preview-font handling, browser commands, and rendering boundaries live in focused modules outside the custom element class.

`QuiltElement` is a small Web Component coordinator. It owns lifecycle wiring and delegates behaviour to runtime/controller helpers.

## No framework rule

Do not add React, Svelte, Lit, PixiJS, Phaser, Three.js, Konva, Tiled, ECS libraries, canvas abstraction libraries, serialization libraries, or map editor toolkits. Use browser platform APIs only in shell modules.

## Development

```sh
pnpm run format
pnpm run lint
pnpm run typecheck
pnpm run test
```

Tests run in real browsers through Vitest and Playwright.
