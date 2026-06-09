# `@bruff/quilt` — Development Map Tool

Quilt is a development-only frontend tool for creating Bruff game maps. It exports the plain Web Component `<tool-quilt>` and pure editor APIs.

## Package-specific allowances

- **QU-1** DOM APIs are allowed only in shell modules: `module/quilt-element.ts`, `module/runtime/**`, `module/controller/**`, `module/browser/**`, and Canvas executor modules.
- **QU-2** The `this` keyword is allowed only in `QuiltElement` Web Component lifecycle code.
- **QU-3** Canvas 2D execution belongs in renderer shell modules. Pure render modules return draw plans.

## Package-specific obligations

- **QU-4 (MUST)** `QuiltElement` remains a small coordinator. It attaches shadow DOM, delegates runtime setup, stores teardown handles, and exposes registration only. Do not add state transition, rendering, validation, preview-font, or browser-command methods to the class.
- **QU-5 (MUST)** Domain modules use readonly records, branded IDs, data ADTs, and standalone functions. Commands are data, not classes.
- **QU-6 (MUST)** Tile data uses typed-array layers and immutable chunk replacement. Do not model maps as nested `Cell` objects.
- **QU-7 (MUST)** Import and export shared map JSON through `@bruff/contracts` `BroughlikeMap` helpers. Invalid input returns typed `Result.error` values and never throws.
- **QU-8 (MUST)** Do not add third-party runtime UI frameworks, renderers, ECS packages, canvas abstraction libraries, map editor toolkits, or serialization libraries.
- **QU-9 (MUST)** Production-reachable Arcade code must not import `@bruff/quilt` or register `<tool-quilt>`.
