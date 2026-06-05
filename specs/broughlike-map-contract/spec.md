# Broughlike Map Contract Spec

## Goal

Add shared runtime contracts for future compact broughlike maps and tighten the existing Sigil glyph-map contract so every downloadable glyph map contains the core glyphs needed by a small tactics board: floor, wall, door, player, and enemy. This prepares the repo for a future map editor without implementing that editor or wiring maps into game, arcade, or CLI packages.

## User-visible behaviour

- `@bruff/contracts` exports a small broughlike map contract with terrain values for floor, wall, and door.
- The map contract validates unknown JSON as a rectangular, compact map payload and returns typed `Result` values instead of throwing.
- `@bruff/contracts` requires Sigil glyph maps to include `floor`, `wall`, `door`, `player`, and `enemy` entries.
- `@bruff/sigil` continues to allow additional user-named glyphs beyond the required keys.
- `@bruff/sigil` rejects downloads that omit any required glyph key through the shared contract validation path.
- `@bruff/game` package policy allows `@bruff/contracts` as a runtime dependency for future replay fixture and shared headless API contracts.
- No map editor package, arcade route, game state change, replay fixture migration, or CLI import is added in this slice.

## Out of scope

- Do not implement `@bruff/map-editor`.
- Do not integrate map contracts into `@bruff/game`, `@bruff/arcade`, or `@bruff/cli` yet.
- Do not change `GameState`, replay fixtures, headless API types, or game rendering implementation.
- Do not add runtime contract imports to `@bruff/cli`, `@bruff/utils`, `@bruff/glyph`, `@bruff/game-element`, or `@bruff/eslint-config`.
- Do not add tile types beyond floor, wall, and door in the first map contract.

## Open questions

None. The first pass uses exact required Sigil keys `floor`, `wall`, `door`, `player`, and `enemy`, and a rectangular broughlike map JSON shape.

## Edge cases

- Map parsing rejects non-rectangular row data.
- Map parsing rejects zero-sized maps and maps that exceed the small-board maximum.
- Map parsing rejects unknown terrain values.
- Map parsing rejects width and height values that do not match the row data.
- Sigil glyph maps with all required keys and extra keys remain valid.
- Sigil glyph maps missing one or more required keys fail validation with typed Zod issues.
