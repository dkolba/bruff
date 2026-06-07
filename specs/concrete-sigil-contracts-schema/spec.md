# Concrete Sigil Contracts Schema

## Goal

Update the `@bruff/sigil` browser tool so glyph extraction starts from a concrete shared contract schema instead of a free-form character textarea. The first available schema option is the shared `SigilGlyphMap` contract, preselected when `<tool-sigil>` loads, with its required glyph names prefilled to the source characters needed by the game map.

## User-visible behaviour

- The free-form `Characters` textarea is removed from `<tool-sigil>`.
- A schema selector replaces it in the form.
- The selector initially contains one option: `SigilGlyphMap`.
- `SigilGlyphMap` is selected when the custom element is initially connected.
- Selecting `SigilGlyphMap` requests the required source characters for its required glyph names:
  - `floor` uses `.`
  - `wall` uses `#`
  - `door` uses `+`
  - `player` uses `@`
  - `enemy` uses `e`
- The extracted glyph rows use the required contract names as their initial names instead of names inferred from the character.
- Unsupported characters remain visible as typed extraction errors when the uploaded font or extractor cannot produce a glyph for them.

## Out of scope

- Adding schemas beyond `SigilGlyphMap`.
- Changing the `@bruff/contracts` `SigilGlyphMap` runtime schema.
- Adding support for currently unsupported source characters.
- Changing `@bruff/glyph` catalog groups or glyph choices.
- Auto-selecting mapped glyphs or licenses.
- Changing the downloaded JSON filename or download side effects.

## Open questions

Resolved before design:

- The request mentions `SigilGlyphMapSigilGlyphMap`; this spec treats that as the existing shared `SigilGlyphMap` contract and uses `SigilGlyphMap` as the user-facing option label.
- The schema catalog starts with a single option but must be modeled so future schemas can be added without reintroducing free-form input.
- Required names are applied as row names, while source characters continue to drive extraction and preview.

## Edge cases

- A user connects `<tool-sigil>` with no font selected: the selector shows `SigilGlyphMap`, the summary remains zero ready glyphs, and no extraction errors are shown until a font is loaded.
- A font lacks one or more required characters: rows are created only for successfully extracted glyphs and typed extraction errors describe missing or unsupported glyphs.
- More than one required glyph uses the same source character in a future schema: duplicate source characters must not produce ambiguous row state.
- Changing the selected schema after a font is loaded re-extracts glyphs for the new schema characters.
- Re-selecting the current schema is idempotent and does not clear valid mapped glyph or license choices for unchanged source characters.
- The selector remains keyboard-accessible and labeled.

## Verification

- Verified the textarea is removed and the schema select is present with `SigilGlyphMap` preselected via `tool-sigil.test.ts`, `tool-sigil-render.test.ts`, and `tool-sigil-bindings.test.ts`.
- Verified `SigilGlyphMap` derives the source character order `".#+@e"` and prefilled names for `floor`, `wall`, `door`, `player`, and `enemy` via `sigil-schema-catalog.test.ts` and `tool-sigil-state.test.ts`.
- Verified schema changes flow through `<tool-sigil>` bindings and coordinator state with component, binding, and state tests.
- Verified unsupported or missing schema characters continue to surface typed missing-glyph errors with `tool-sigil-error.test.ts`.
- Verified downloads still validate through the shared `SigilGlyphMap` contract and include mapped glyph plus `"LICENSE"` fields with `tool-sigil-download.test.ts` and regression tests.
- Gates run for `@bruff/sigil`: `pnpm --filter @bruff/sigil run format`, `pnpm --filter @bruff/sigil run lint`, `pnpm --filter @bruff/sigil run typecheck`, `pnpm --filter @bruff/sigil run test:chromium`, `pnpm --filter @bruff/sigil run test:firefox`, and `pnpm --filter @bruff/sigil run test:webkit`.
