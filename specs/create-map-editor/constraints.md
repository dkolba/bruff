# Create Quilt Constraints

## Runtime Dependencies

- Do not add PixiJS, React, Svelte, Lit, Phaser, Three.js, Konva, Tiled, ECS libraries, canvas abstraction libraries, or serialization libraries.
- Runtime workspace dependencies planned for the initial package are `@bruff/utils` and `@bruff/contracts`.
- `@bruff/arcade` may add `@bruff/quilt` only as a development-only workspace dependency.
- Browser platform APIs are allowed only in shell modules.
- The `<tool-quilt>` class must stay a small coordinator for lifecycle and dependency wiring; state, rendering, validation, preview-font handling, and browser-command logic live in focused modules.

## Rendering

- Render map cells through Canvas 2D, not DOM elements.
- Use at least two canvases: one terrain canvas and one overlay canvas.
- Keep tile, world, and screen coordinate conversion explicit.
- Redraw terrain by dirty chunk, not by full-map repaint for every edit.
- Overlay redraws may be full overlay redraws because overlay state is transient and small.

## Model

- Store tile layers in typed arrays.
- Store terrain-like data by layer, not as rich nested `Cell` objects.
- Keep entity metadata outside tile arrays.
- Use immutable state transitions and structural sharing for changed chunks.
- Commands are data ADTs with pure apply/undo helpers, not classes.

## Package Scope

- Implement `packages/quilt` and the dev-only Arcade route needed to open it locally.
- Do not integrate the editor into runtime game packages.
- Do not modify `@bruff/game` state, render commands, or replay fixtures.
- Do not add binary storage or an editor-specific chunk JSON format in the first package version.
- Import and export map JSON through the shared `@bruff/contracts` `BroughlikeMap` contract.

## Arcade Dev Route

- Mount the editor at `/tools-map` only in the Vite dev server.
- Keep `/tools` mounted to `<tool-sigil>`.
- Production-reachable Arcade modules must not statically import `@bruff/quilt`.
- The dev tools router must remain behind `import.meta.env.DEV`.
- Production bundles must not contain the dev-tools router, `<tool-quilt>` registration, `<tool-quil>` typo registration, `tool-quilt`, `tool-quil`, `@bruff/quilt`, `@bruff/quil`, or `/tools-map`.
