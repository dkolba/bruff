# `@bruff/glyph`

This package contains shared Unicode glyph constants for game rendering.
Universal repository rules still apply; these are the package-specific
extensions.

- **Language**: TypeScript.
- **Purpose**: Provide pure, readonly glyph tables and deterministic string helpers for renderer-facing code.
- **Runtime boundary**: No DOM, Canvas, terminal control, ANSI styling, logging, timers, randomness, or I/O in this package.
- **Dependencies**: No runtime dependencies. Do not import from `@bruff/game`, `@bruff/game-element`, or browser APIs.

## Table Shape

- **GL-1 (MUST)** Export glyph groups as `const` readonly records.
- **GL-2 (MUST)** Keep glyph tables grouped by Unicode block and gameplay affordance rather than alphabetical key order.
- **GL-3 (MUST)** Use descriptive uppercase keys for named glyphs. Single-character keys are allowed only when they preserve the identity of ASCII letters.
- **GL-4 (SHOULD)** Keep notes about rendering ambiguity in the README or package docs, not as conversational inline comments inside the tables.
- **GL-5 (SHOULD)** Prefer adding a glyph to an existing table before creating a new table.

## Helpers

- **GL-6 (MUST)** Helper functions stay pure string transformations.
- **GL-7 (MUST)** Helper functions declare explicit parameter and return types and include TSDoc.
- **GL-8 (MUST)** Do not add terminal styling helpers here. Terminal or shell concerns belong in a shell-adjacent package if they are ever needed.

## Testing

- **GL-9 (MUST)** Tests for this package are colocated `*.test.ts` Vitest browser tests.
- **GL-10 (MUST)** Tests assert public exports only. Do not test implementation details or table construction mechanics.
