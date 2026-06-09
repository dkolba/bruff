# Create Quilt Spec

## Goal

Create Quilt, a development-only frontend tool for creating roguelike game maps. Quilt lives in a new pnpm workspace package named `@bruff/quilt` at `packages/quilt` and exposes a plain browser Web Component registered as `<tool-quilt>`. The editor treats maps as high-performance data grids rendered through canvas, not as DOM tile components, and keeps the map model, editor state, commands, rendering, validation, preview-font loading, and browser-command wiring outside the custom element class. `@bruff/arcade` mounts Quilt at a development-only URL so contributors can open it locally without shipping the dev-tools router or Quilt code in production bundles.

## User-Visible Behaviour

- Developers can import `QuiltElement` from `@bruff/quilt` and register it as a custom element, or use the package helper to register `<tool-quilt>`.
- Navigating to `/tools-map` in the Arcade dev server displays `<tool-quilt>`.
- Production Arcade builds do not expose `/tools-map`, do not include the dev-tools router, do not register `<tool-quilt>`, and do not include `@bruff/quilt` code.
- The rendered editor displays a tile grid on terrain and overlay canvases inside an open shadow DOM, with the canvas square sized to the smaller viewport dimension so the map fills the available viewport width or height.
- The editor supports minimal Paint and Erase toolbar controls. Paint changes clicked terrain tiles to `wall`; Erase changes clicked terrain tiles back to `floor`; both flow through undoable command data.
- Terrain rendering projects tile-level draw commands with distinct fill colours for `floor`, `wall`, and `door` instead of filling whole dirty chunks as a single colour; tile size is derived from the current canvas size and map dimensions.
- Arcade E2E coverage includes one narrow interaction that paints and erases a single tile through `<tool-quilt>` at `/tools-map` and asserts canvas pixels change.
- The editor exposes a plain TypeScript API for creating map data, creating editor state, executing commands, undoing commands, redoing commands, and serializing map data through the shared `@bruff/contracts` broughlike map JSON contract.
- `@bruff/arcade` uses the editor only from its development-only tools router, following the existing Sigil route pattern.
- The `<tool-quilt>` Web Component remains a small coordinator for lifecycle and dependency wiring; state transitions, rendering, validation, preview-font handling, and browser commands live in focused modules.
- The package uses no third-party UI framework, renderer, canvas abstraction, ECS library, or map editor toolkit.
- Future glyph rendering can rely on `SigilGlyphMap` stable top-level keys (`floor`, `wall`, `door`, `player`, `enemy`) and per-entry display `name` fields, but this slice does not load Sigil glyph JSON.

## Out Of Scope

- Do not use PixiJS, React, Svelte, Lit, Phaser, Three.js, Konva, Tiled, or any third-party renderer/UI framework.
- Do not render cells as DOM elements, custom elements, or framework components.
- Do not migrate existing game maps, `GameState`, render commands, replay fixtures, or screenshots.
- Do not expose Quilt from production Arcade routes, production-reachable Arcade imports, or production-reachable custom element registration.
- Do not implement WebGL rendering in the first package version.
- Do not implement procedural generation, pathfinding, lighting simulation, scripting, binary storage, chunk streaming, multiplayer editing, or file picker integration.
- Do not create a full content pipeline for tile sprites or image atlases.
- Do not change the existing `@bruff/contracts` broughlike map or `SigilGlyphMap` runtime schemas in this slice.

## Open Questions

None. The decisions below are resolved for this SDTE pass.

## Resolved Decisions

- Package name: use `@bruff/quilt`.
- Package location: use `packages/quilt` so the existing `packages/*` workspace pattern discovers it.
- Custom element tag: use `tool-quilt`.
- Arcade development URL: use `/tools-map`.
- Arcade Sigil URL: keep `/tools` mounting `<tool-sigil>`.
- Rendering: use Canvas 2D with separate terrain and overlay canvases; terrain draw plans emit tile-level draw commands so dirty chunks redraw their contained terrain values without turning the whole chunk one colour.
- Map model: use chunked typed-array layers internally, not nested `Cell` objects, while import/export uses the shared rectangular `BroughlikeMap` contract.
- State model: keep immutable `QuiltState` separate from `TileMapData`.
- Editing model: represent edits as command data and pure command application functions, not command classes with mutating methods. Paint writes the selected terrain tile ID; Erase writes `floorTileId`.
- Metadata model: use ECS-inspired entity records and component maps outside tile layers.
- Storage: start with the existing `@bruff/contracts` `BroughlikeMap` JSON shape (`version`, `width`, `height`, `rows`) for interchange; defer binary chunk formats and chunk-oriented JSON.
- Integration: consume the editor only from `packages/arcade/dev-tools-router.ts`, which is loaded only behind `import.meta.env.DEV` and absent from production bundles.

## Edge Cases

- Large maps must not require a full-map redraw after a single tile edit.
- Dirty chunk redraws must render each terrain tile in the chunk from map data; they must not fill the entire chunk with one colour.
- The canvas square must resize from `min(window.innerWidth, window.innerHeight)` and redraw the map so the longest map dimension fills the square.
- Brush operations crossing chunk boundaries must mark every affected chunk dirty.
- Tile coordinates, world coordinates, and screen coordinates must stay separate and explicitly converted.
- Canvas hit testing must clamp or reject pointer positions outside the map bounds.
- Undo and redo must preserve map data, editor state, and dirty chunk tracking deterministically.
- Entity metadata must support multiple entities on the same tile without bloating tile layers.
- Serialization must round-trip the shared `BroughlikeMap` JSON terrain values `floor`, `wall`, and `door`.
- Invalid serialized input must return typed `Result.error` values from the shared broughlike map parser rather than throwing.
- The Web Component must clean up event listeners and animation frame work when disconnected.
- The Arcade dev router must mount exactly one route element and must not leave `<bruff-game>` or `<tool-sigil>` mounted on `/tools-map`.
- The Arcade paint/erase interaction E2E must assert an observable canvas result after deterministic clicks without becoming a full editor workflow test.
- The Arcade production bundle-clean check must fail if emitted assets contain `dev-tools-router`, `<tool-quilt>` registration strings, `<tool-quil>` typo registration strings, `tool-quilt`, `tool-quil`, `@bruff/quilt`, `@bruff/quil`, `/tools-map`, or other quilt-only route strings.
- The editor must remain usable in real browser tests with deterministic input simulation.

## Verification

- Package exposure: `packages/quilt/module/quilt-element.test.ts` verifies `QuiltElement`, `<tool-quilt>` registration, open shadow DOM setup, idempotent connection, and external map data helpers.
- Small Web Component coordinator: `packages/quilt/module/quilt-element.test.ts` asserts validation, preview-font, and browser-command behaviour stays outside `QuiltElement`; focused module tests cover `module/validation`, `module/preview-font`, and `module/browser`.
- Chunked map model: `packages/quilt/module/model/tile-map-data.test.ts` and `tile-layer.test.ts` cover chunk keys, tile-to-chunk conversion, typed-array layer reads/writes, immutable chunk replacement, and missing chunk fallback.
- Commands and undo/redo: `packages/quilt/module/commands/editor-command.test.ts` and `module/state/execute-editor-command.test.ts` cover paint command data, command execution, dirty chunk tracking, undo, redo, and empty stack behaviour.
- Entity metadata: `packages/quilt/module/entities/map-entity.test.ts` verifies branded entity IDs, component records, collection updates, and multiple entities on one tile.
- Serialization: `packages/quilt/module/storage/broughlike-map.test.ts` verifies `BroughlikeMap` serialization, parsing through `@bruff/contracts`, and typed invalid-input errors.
- Rendering boundary: `packages/quilt/module/render/coordinates.test.ts`, `map-draw-plan.test.ts`, and `canvas-renderer.test.ts` cover coordinate conversion, pure terrain/overlay draw plans, tile-level terrain fills for `floor`, `wall`, and `door`, viewport-scaled tile sizing through the runtime, and Canvas 2D executor side effects.
- Arcade dev routing: `packages/arcade/e2e/tools-route.spec.ts` verifies `/tools-map` mounts only `<tool-quilt>` while `/tools` still mounts `<tool-sigil>` and unknown routes fall back to `<bruff-game>`.
- Accessibility and interaction: `packages/arcade/e2e/accessibility.spec.ts` verifies `/tools-map` has no axe violations in dark and light schemes, and `quilt-interaction.spec.ts` verifies deterministic Paint and Erase clicks change the terrain canvas pixel from floor to wall and back to floor.
- Production exclusion: `packages/arcade/scripts/check-bundle-clean.mjs` rejects the dev-tools router, Quilt tag/package strings, typo variants, and `/tools-map`; `pnpm --filter @bruff/arcade run build` and root `pnpm run ok` passed.
