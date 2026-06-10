# Quilt Grid Size and Glyph I/O Constraints

## Architecture constraints

- `QuiltElement` remains a small lifecycle coordinator. It may not gain map resizing, import parsing, export serialization, rendering, or validation methods.
- DOM, `File`, object URL, download, file input, and Canvas 2D APIs stay in Quilt shell modules allowed by `packages/quilt/AGENTS.md`.
- Pure model, state, command, storage, and render-plan modules must not import browser globals.
- Terrain JSON shapes and terrain names must come from `@bruff/contracts`.
- Sigil glyph JSON shape must come from `@bruff/contracts`.
- Production Arcade code must not import `@bruff/quilt`, register `<tool-quilt>`, or expose `/tools-map` outside the existing development-only path.

## Data constraints

- Grid sizes are square and limited to 4, 5, 6, 7, 8, and 9.
- Terrain drawing is limited to `floor`, `wall`, and `door`.
- Resize preservation is top-left anchored by tile coordinate.
- New cells created by growing the map are `floor`.
- Exported map JSON must validate through `parseBroughlikeMap`.
- Imported glyph JSON must validate through `parseSigilGlyphMap`.
- Imported glyph rendering uses only `floor`, `wall`, and `door` entries.

## Rendering constraints

- The board remains canvas-rendered.
- Imported glyph paths are drawn dark gray.
- Imported glyph paths are scaled/clipped to the destination tile.
- The existing fallback terrain rendering remains available when no glyph JSON is imported.
- Canvas sizing continues to derive tile size from the current square viewport and map dimensions.

## Dependency constraints

- Do not add React, Svelte, Lit, PixiJS, Phaser, Three.js, Konva, Tiled, ECS packages, canvas abstraction libraries, map editor toolkits, or serialization libraries.
- Do not add runtime dependencies for SVG path parsing unless the project already owns them; prefer browser `Path2D` at the Canvas execution boundary.
