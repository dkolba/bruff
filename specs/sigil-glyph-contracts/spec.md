# Sigil Glyph Contracts

## Goal

Move the shared runtime contract for the Sigil downloadable glyph JSON payload into `@bruff/contracts`, then have `@bruff/sigil` create glyph JSON values through those contract-owned types and validate completed glyph maps before they are exposed for download.

## User-visible Behaviour

- Developers can import Sigil glyph JSON schemas, inferred readonly types, and a parser from `@bruff/contracts`.
- The Sigil tool continues to download the same JSON shape: editable glyph names map to entries containing source glyph data, `mappedGlyph`, and exact `"LICENSE"` values.
- `@bruff/sigil` depends on `@bruff/contracts` for the shared glyph JSON payload types instead of owning duplicate payload type definitions.
- Invalid completed glyph JSON maps become typed Sigil extraction errors instead of being silently accepted.

## Out Of Scope

- Do not change the glyph download JSON shape.
- Do not move Sigil-only extraction errors, draft rows, UI state, DOM code, font parsing, or catalog projection into `@bruff/contracts`.
- Do not migrate `@bruff/game`, `@bruff/cli`, `@bruff/arcade`, `@bruff/glyph`, `@bruff/game-element`, or `@bruff/utils` to consume the new Sigil contracts.
- Do not introduce subpath exports for `@bruff/contracts`; use the existing root export.

## Open Questions

- None. The migration target is the existing Sigil downloadable glyph map shape.

## Edge Cases

- Unknown inputs to the contract parser return `Result.error` and never throw.
- Glyph maps may be empty records when no rows are downloadable.
- Glyph names remain dynamic JSON object keys.
- Numeric glyph metrics must be finite numbers.
- Contract validation failure inside `@bruff/sigil` must surface as a typed `SigilExtractionError`.

## Verification

- `@bruff/contracts` exports Sigil glyph JSON schemas, inferred readonly types, and `parseSigilGlyphMap(input)` from the root export.
- `@bruff/sigil` re-exports contract-owned payload types from `module/glyph-json.ts`.
- `createSigilGlyphMap()` validates produced maps with `parseSigilGlyphMap()` and returns a typed `invalid-glyph-json` extraction error on contract failure.
- Verified with `CI=true pnpm --filter @bruff/contracts run format`, `CI=true pnpm --filter @bruff/contracts run lint`, `CI=true pnpm --filter @bruff/contracts run typecheck`, and `CI=true pnpm --filter @bruff/contracts run test`.
- Verified with `CI=true pnpm --filter @bruff/sigil run format`, `CI=true pnpm --filter @bruff/sigil run lint`, `CI=true pnpm --filter @bruff/sigil run typecheck`, and `CI=true pnpm --filter @bruff/sigil run test`.
- Final package-boundary guidance was verified with `CI=true pnpm run ok`.
