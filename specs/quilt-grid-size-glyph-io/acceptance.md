# Quilt Grid Size and Glyph I/O Acceptance

## Grid resizing

- Given a 4x4 map with a wall at `3,3`, when the user selects `9x9`, then the wall remains at `3,3` and every new cell outside the original 4x4 area is `floor`.
- Given a 9x9 map with a door at `8,8` and a wall at `3,3`, when the user selects `4x4`, then the wall remains at `3,3` and the door at `8,8` is not present in the exported map.
- Given any current map, when the user selects its existing size, then the rendered map and exported JSON are unchanged.

## Terrain drawing

- Given the `floor` draw button is active, when the user clicks a tile, then that tile exports as `floor`.
- Given the `wall` draw button is active, when the user clicks a tile, then that tile exports as `wall`.
- Given the `door` draw button is active, when the user clicks a tile, then that tile exports as `door`.
- Given the active draw mode changes, then the toolbar exposes the active mode to assistive technology and visible styling.

## Export

- Given a valid drawn map, when the user clicks export, then Quilt downloads deterministic JSON matching the shared `BroughlikeMap` contract.
- Given a 9x9 drawn map, when the user clicks export, then the downloaded JSON validates through `parseBroughlikeMap`.

## Import

- Given a valid Sigil glyph JSON file matching `SigilGlyphMap`, when the user imports it, then Quilt uses the `floor`, `wall`, and `door` path data for terrain tile rendering.
- Given imported glyph JSON has been applied, when the board renders, then terrain glyph paths are dark gray.
- Given invalid glyph JSON, when the user imports it, then Quilt displays a validation error and keeps the prior rendering state.
- Given file selection is cancelled, then Quilt keeps the current map and rendering state.

## Production safety

- Given an Arcade production build, emitted assets do not contain `/tools-map`, `<tool-quilt>`, `tool-quilt`, `@bruff/quilt`, or the development tools router.
