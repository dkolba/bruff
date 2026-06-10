# Quilt Grid Size and Glyph I/O Spec

## Goal

Expand Quilt so developers can choose a square map size from 4x4 through 9x9, draw `floor`, `wall`, and `door` terrain explicitly, export the drawn terrain map as JSON, and import Sigil glyph JSON that supplies dark-gray path rendering for each tile type. The editor remains development-only, uses shared `@bruff/contracts` schemas for map and glyph JSON shapes, and preserves existing drawn tiles whenever a resize keeps those tile coordinates inside the new grid.

## User-visible behaviour

- Quilt displays a grid-size select element with exactly these options: `4x4`, `5x5`, `6x6`, `7x7`, `8x8`, and `9x9`.
- Selecting a new grid size resizes the currently drawn map immediately.
- Resizing preserves tiles at the same `x, y` coordinates when those coordinates still exist in the new size.
- When shrinking, tiles outside the new width or height are discarded.
- When growing, existing tiles remain unchanged and newly available cells are initialized as `floor`.
- Quilt displays separate draw-mode buttons for `floor`, `wall`, and `door`.
- Activating a draw-mode button makes subsequent tile clicks draw that terrain type.
- The active draw type is visibly indicated so a developer can tell which terrain will be painted next.
- Terrain type names and import/export JSON values come from `@bruff/contracts` broughlike terrain/map contracts, not from a Quilt-only duplicate vocabulary.
- Quilt displays an export button that downloads the current drawn terrain map as a JSON file.
- The exported map JSON uses the shared broughlike map shape from `@bruff/contracts`, including contract terrain values `floor`, `wall`, and `door`.
- Quilt displays an import button that opens a file upload flow for Sigil glyph JSON.
- The uploaded glyph JSON uses the shared Sigil glyph map shape from `@bruff/contracts`, with entries such as `floor`, `wall`, `door`, `player`, and `enemy`.
- After a valid glyph JSON import, Quilt uses the imported SVG path data for the corresponding terrain tiles when drawing the board.
- Imported glyph paths for terrain tiles render in dark gray.
- If no glyph JSON has been imported, Quilt still renders the editable board with the existing terrain fallback rendering.
- Invalid map export state, invalid glyph JSON, unreadable files, or unsupported terrain values are surfaced as user-visible errors without crashing the component.
- The feature remains available only in the development-only Quilt route; production Arcade bundles must not gain Quilt route exposure.

## Out of scope

- Do not implement this expansion yet in this SDTE phase.
- Do not add tile types beyond `floor`, `wall`, and `door` for terrain drawing.
- Do not add editing controls for `player` or `enemy` placement in this slice, even though imported glyph JSON contains those entries.
- Do not introduce image atlases, sprite sheets, WebGL, third-party renderers, UI frameworks, or map editor libraries.
- Do not change Quilt into DOM-cell rendering; the board remains canvas-rendered.
- Do not persist imported glyph JSON or drawn maps to local storage in this slice.
- Do not add non-square map sizes.
- Do not implement drag painting, flood fill, selection rectangles, copy/paste, layers beyond existing terrain, or keyboard shortcuts unless already required by existing Quilt behaviour.
- Do not expose Quilt from production Arcade routes or production-reachable imports.

## Open questions

None. The decisions below resolve the ambiguities in the request for this specification pass.

## Resolved decisions

- The phrase “already dawn map” is interpreted as “already drawn map”.
- Resize preservation is top-left anchored: a tile at `x, y` keeps the same `x, y` if `x < newWidth` and `y < newHeight`.
- Growing a map initializes newly created cells to `floor`.
- The grid-size select controls square maps only; the width and height always match the selected size.
- The export button downloads the drawn terrain map, not the imported Sigil glyph map.
- The import button uploads Sigil glyph JSON for visual tile rendering, not terrain map JSON.
- Only imported `floor`, `wall`, and `door` glyph paths are used for terrain rendering in this slice.
- If a valid Sigil glyph map lacks an extra non-terrain entry or contains extra entries, Quilt relies on the shared `@bruff/contracts` parser result to decide validity.
- The contract layer must be the source of truth for accepted map sizes and JSON shapes. If current contracts do not accept 8x8 or 9x9 maps, the later design must include a contracts update before Quilt export can claim support for those sizes.

## Edge cases

- Resizing from 9x9 to 4x4 preserves only the 16 tiles whose coordinates are within `0 <= x < 4` and `0 <= y < 4`.
- Resizing from 4x4 to 9x9 preserves the original 16 tiles and initializes the other 65 tiles as `floor`.
- Repeated resize operations must not corrupt preserved tile values.
- Resizing to the currently selected size is a no-op from the user’s perspective.
- Export after resize reflects the current size and current terrain values.
- Export before glyph import still works because map JSON does not depend on preview glyph paths.
- Glyph import after terrain drawing changes only visual rendering, not terrain data.
- Invalid glyph JSON reports a validation error and leaves the previous rendering mode unchanged.
- File read cancellation or an empty file leaves the editor state unchanged and does not crash.
- Imported path strings that parse but draw outside a tile are scaled/clipped to the tile viewport so one glyph cannot overdraw unrelated tiles.
- Terrain values not allowed by `@bruff/contracts` are rejected rather than coerced.
- The active draw type must survive resize unless the resize operation itself fails.
- Canvas redraws after resize must continue to fit the square viewport using the current Quilt scaling behaviour.
- Downloaded JSON must be deterministic for the same map state so tests can compare it reliably.
