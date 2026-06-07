# Concrete Sigil Contracts Schema

## Goal

Update the `@bruff/sigil` browser tool so `SigilGlyphMap` remains the selected shared contract schema, while users can type the source characters available for extraction and explicitly choose exactly one typed character for each required contract glyph: `floor`, `wall`, `door`, `player`, and `enemy`.

## User-visible behaviour

- The `Characters` textarea is present in `<tool-sigil>` again.
- The textarea is prefilled with the default source characters for `SigilGlyphMap`: `".#+@e"`.
- The schema selector remains present and initially contains one option: `SigilGlyphMap`.
- `SigilGlyphMap` is selected when the custom element is initially connected.
- The tool displays one source-character select for each required `SigilGlyphMap` glyph:
  - `floor`
  - `wall`
  - `door`
  - `player`
  - `enemy`
- Each required glyph select lists the distinct characters currently typed in the `Characters` textarea.
- Each required glyph select has exactly one selected character whenever at least one typed character is available.
- The initial required glyph selections are prefilled as:
  - `floor` selects `.`
  - `wall` selects `#`
  - `door` selects `+`
  - `player` selects `@`
  - `enemy` selects `e`
- Editing the textarea updates the available options in every required glyph select.
- Uploading a font extracts glyphs for the typed textarea characters.
- Every required `SigilGlyphMap` row remains visible after a font upload, even when the uploaded font lacks one or more selected characters.
- Unsupported or missing selected characters remain visible as typed extraction errors when the uploaded font or extractor cannot produce a glyph for them.
- The JSON export uses the selected character for each required contract glyph name.
- If the generated JSON does not satisfy the shared `SigilGlyphMap` contract, the UI displays the exact validation reason for each failing contract path or field.
- If an individual produced glyph does not satisfy the shared glyph contract, the UI displays the exact validation reason for that glyph path or field.
- Download remains disabled while any selected character is missing, unsupported, incomplete, unmapped, unlicensed, duplicated in a way that violates the contract, or contract-invalid.

## Out of scope

- Adding schemas beyond `SigilGlyphMap`.
- Changing the `@bruff/contracts` `SigilGlyphMap` runtime schema.
- Adding support for currently unsupported source characters.
- Changing the `@bruff/glyph` catalog groups or glyph choices.
- Auto-selecting mapped glyphs or licenses.
- Changing the downloaded JSON filename or download side effects.
- Exporting glyphs that are typed in the textarea but not selected by a required `SigilGlyphMap` glyph select.

## Open questions

Resolved before design:

- The request mentions the existing prefilled glyphs `wall`, `floor`, `door`, `player`, and `enemy`; this spec treats those as the required keys of the existing shared `SigilGlyphMap` contract.
- The schema selector remains because the tool is still schema-driven, but the textarea is reintroduced as the user-editable candidate character list for the selected schema.
- Duplicate typed characters are deduplicated in the per-glyph selects so each select option corresponds to one character, not one textarea position.
- When a textarea edit removes a character currently selected by a required glyph select, that select becomes invalid until the user chooses one of the remaining typed characters or restores the removed character.
- Whitespace typed into the textarea is treated as a candidate character like any other character unless existing extraction rules reject it.
- Exact contract reasons are the validation issues returned by the shared contract parser, displayed with enough path context for the user to identify the failing required glyph or field.

## Edge cases

- A user connects `<tool-sigil>` with no font selected: the selector shows `SigilGlyphMap`, the textarea shows `".#+@e"`, each required glyph select has its default character selected, the summary remains zero ready glyphs, and no extraction errors are shown until a font is loaded.
- A user clears the textarea: each required glyph select has no valid option, every required glyph is reported as missing a selected source character, and download is disabled.
- A user types only one character: every required glyph select offers that character, but using it for multiple contract glyphs must still validate against the shared contract before download is enabled.
- A user types duplicate characters: each duplicated character appears once in each required glyph select.
- A user removes a selected character from the textarea: the affected required glyph select is marked invalid, its required glyph row remains visible, and download is disabled until a valid typed character is selected.
- A font lacks one or more selected characters: rows remain visible for every required schema glyph, missing glyph rows keep the required names visible, and typed extraction errors describe missing or unsupported glyphs.
- A typed character is not selected by any required glyph select: it may be extracted for preview, but it is not included in the exported `SigilGlyphMap` JSON.
- Changing the selected schema after a font is loaded re-evaluates textarea candidates, required glyph selections, extraction, and contract validation for the new schema.
- Re-selecting the current schema is idempotent and does not clear valid required glyph selections, mapped glyph choices, or license choices when their source characters still exist in the textarea.
- The textarea, schema selector, and required glyph selects remain keyboard-accessible and labeled.

## Verification

- Verified the restored `Characters` textarea, preselected `SigilGlyphMap` schema selector, and required glyph source-character selects with `tool-sigil-render.test.ts`, `tool-sigil-required-glyph-render.test.ts`, `tool-sigil-bindings.test.ts`, and `tool-sigil.test.ts`.
- Verified textarea edits update distinct required glyph character options and invalid selection state with `tool-sigil-required-glyph-selection.test.ts`, `tool-sigil-state.test.ts`, and component tests.
- Verified uploaded fonts extract typed textarea characters while required `floor`, `wall`, `door`, `player`, and `enemy` rows remain visible with missing selected glyph errors via `tool-sigil-state.test.ts`, `tool-sigil-error.test.ts`, and regression tests.
- Verified JSON export is built from selected required glyph characters and omits unselected typed glyphs with `tool-sigil-download.test.ts` and `tool-sigil-regression.test.ts`.
- Verified exact shared-contract validation reasons are surfaced for invalid produced glyph JSON with `glyph-name.test.ts`, `tool-sigil-contract-validation.test.ts`, and `tool-sigil-error.test.ts`.
- Verified `@bruff/sigil` gates passed: `pnpm --filter @bruff/sigil run format`, `lint`, `typecheck`, `test:chromium`, `test:firefox`, and `test:webkit`.
