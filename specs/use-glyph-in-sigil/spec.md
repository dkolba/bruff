# Use Glyph in Sigil

## Goal

Extend the development-only `@bruff/sigil` tool so a user can map every entered emoji to one glyph exported by `@bruff/glyph`, annotate that emoji/glyph combination with an OSI license, and download JSON that preserves the selected emoji, glyph identity, glyph character, and `"LICENSE"` value. The workflow must make individual mappings fast by filtering the glyph choices through a staged pre-selection before the user chooses the exact glyph.

## User-visible Behaviour

- The sigil tool continues to load a local font and extract one row per distinct entered character.
- Each row is treated as an emoji/glyph combination row when the source character is an emoji or symbol the user wants to map.
- Each row shows the source emoji, the extracted source-font preview, and the current editable export name.
- Each row provides a first-stage glyph group select populated from every readonly object glyph table exported by `@bruff/glyph`, such as `ASCII`, `LATIN_EXTENDED`, `BOX`, `BLOCK`, `BRAILLE`, `GREEK`, `RUNIC`, `MISC_SYMBOLS`, `DINGBATS`, and `COMBINING`.
- Each row provides a second-stage glyph select populated only with glyphs from the currently selected group.
- Selecting a group never forces the user to traverse every glyph in `@bruff/glyph`; the individual glyph select is limited to the staged group.
- Each row can map exactly one source emoji to exactly one selected `@bruff/glyph` glyph.
- Changing the staged group clears or replaces only the row's selected glyph when the previous glyph is not available in the new group.
- Each row provides a `"LICENSE"` select populated from all licenses listed by the Open Source Initiative at `https://opensource.org/licenses`.
- License options display a human-readable name and SPDX identifier when OSI provides one.
- The downloaded JSON stores the selected license in a field named exactly `"LICENSE"` for each emoji/glyph combination.
- The last selected license is memorized during the current `<tool-sigil>` session.
- When the user starts editing another emoji/glyph combination, its license defaults to the last selected license unless that row already has an explicit license.
- The memorized license does not need to survive a page reload or new browser session.
- Download remains unavailable while any included row has no selected glyph or no selected license.
- Existing missing-glyph, duplicate-name, invalid-name, preview-font, object URL cleanup, and typed error behaviours continue to work.

## Out of Scope

- Persisting the last selected license to local storage, IndexedDB, cookies, a backend, or the downloaded font file.
- Legal validation that the selected license is correct for a particular emoji, font, or glyph.
- Fetching OSI licenses at runtime from the browser tool.
- Editing or expanding the `@bruff/glyph` catalog as part of this feature.
- Adding fuzzy search, autocomplete, or visual glyph similarity matching.
- Automatically choosing glyphs or licenses from emoji names.
- Supporting many-to-one, one-to-many, or range-based emoji mappings.
- Changing the arcade production bundle boundary; `@bruff/sigil` remains development-only.
- Changing the existing font extraction path format, bounds format, or uploaded-font preview behaviour except where the downloaded combination payload is extended.

## Open Questions (Resolved)

- **Q: What does staged glyph selection mean?**  
  A: Use a group-first workflow based on the top-level readonly object glyph tables exported from `@bruff/glyph`. The user first chooses a group, then chooses a glyph from only that group's entries.

- **Q: Are `@bruff/glyph` helper functions selectable?**  
  A: No. `braille()` and `combine()` are helper functions, not finite catalog tables. The selectable catalog is every exported readonly object table whose entries are string glyphs.

- **Q: What is the default staged pre-selection?**  
  A: Default each new row to the first group in the ordered catalog projection. The first individual glyph remains unselected until the user chooses it, so the mapping is explicit.

- **Q: What is a glyph identity in downloaded JSON?**  
  A: Store the `@bruff/glyph` group name, the glyph key inside that group, and the actual glyph character. This keeps the mapping stable even when two keys share a visible character or a future catalog grows.

- **Q: How should OSI licenses be sourced?**  
  A: Source the license list from OSI's official license page/API during development through a generated local module. The browser tool imports that local readonly data and does not depend on network availability.

- **Q: Which license identifier should the JSON store?**  
  A: Store the SPDX identifier when OSI provides one; otherwise store the OSI license `id`. The select label can include the display name, but `"LICENSE"` carries the machine-readable identifier.

- **Q: Is `"LICENSE"` uppercase required?**  
  A: Yes. The downloaded JSON field is named exactly `"LICENSE"`.

- **Q: Does "last selected license" persist after refresh?**  
  A: No. It is memorized only in the in-memory `ToolSigilState` for the current component session.

- **Q: Should non-emoji characters be blocked?**  
  A: No. Sigil already works from user-entered Unicode characters. This feature should not introduce Unicode emoji validation; the user decides which entered characters need mappings.

## Edge Cases

- No `@bruff/glyph` groups available: rows show a visible typed error and download remains disabled.
- A glyph group exists but contains no entries: the group can be hidden from the select, or shown disabled, but it must not produce an invalid mapping.
- Two glyph groups contain the same visible glyph character: the selected group and key disambiguate the mapping.
- A selected group changes: preserve the selected glyph only if the same group/key still exists; otherwise clear the glyph selection for that row.
- A user edits a row after selecting a license elsewhere: the row keeps its explicit license and is not overwritten by the memorized default.
- A user selects a license in one row and then creates new rows by typing more characters: new rows default to the memorized license.
- A selected OSI license entry has no SPDX ID: use the OSI `id` as the stored `"LICENSE"` value.
- A generated OSI license list is empty: show a visible typed error and disable download.
- Duplicate source characters: the existing dedupe behaviour remains one row per code point in first-seen order.
- Supplementary-plane emoji: continue using code point iteration rather than UTF-16 code units.
- Invalid glyph names: continue reporting existing validation errors and do not download.
- Missing uploaded-font glyphs: keep successful rows editable and downloadable only when every included row has a selected `@bruff/glyph` glyph and license.
