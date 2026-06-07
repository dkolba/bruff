# @bruff/sigil

Development-only browser tool for extracting selected glyphs from a local font into compact JSON. The package registers `<tool-sigil>` for the arcade `/tools` dev route; production arcade builds must not import this package.

The tool starts from the selected concrete schema preset, restores the preset character textarea, and lets each required contract glyph choose one typed source character before download. Each extracted row maps to one glyph from `@bruff/glyph` and one OSI license value. Rows use a staged picker: choose a glyph group first, then choose one glyph from that group rather than scanning the full shared glyph catalog.

## Development

```sh
pnpm run format
pnpm run generate:osi-licenses
pnpm run lint
pnpm run typecheck
```

## Testing

Tests run in real browsers via Vitest + Playwright:

```sh
pnpm run test
pnpm run test:watch
```

## JSON Output

The downloadable JSON is keyed by editable glyph names. Each entry stores the source Unicode character, selected `@bruff/glyph` mapping, exact `"LICENSE"` value, `advanceWidth`, `unitsPerEm`, glyph bounds, and SVG path data generated at `font.unitsPerEm`.

The shared payload contract lives in `@bruff/contracts`. `@bruff/sigil` re-exports the contract-owned payload types from `module/glyph-json.ts` and validates completed glyph maps with `parseSigilGlyphMap()` before download.

Downloadable glyph maps must include `floor`, `wall`, `door`, `player`, and `enemy` glyph keys. The current tool preset pre-fills the textarea with `".#+@e"` and preselects one typed character for each required `SigilGlyphMap` key. Typed characters that are not selected by a required contract glyph can be previewed but are omitted from the exported `SigilGlyphMap` JSON.

The generated `mappedGlyph` value records:

- `groupName`
- `glyphKey`
- `glyph`

The generated `"LICENSE"` value stores the SPDX identifier when the OSI catalog provides one, otherwise the OSI license id.

## OSI License Catalog

`module/osi-license-catalog.ts` is generated data used by the browser tool so local usage and tests do not depend on network availability. Refresh it with:

```sh
pnpm run generate:osi-licenses
```

## Font Limits

The first version targets TTF, OTF, and WOFF files supported by `opentype.js`. WOFF2 decompression, complex shaping, ligatures, kerning pairs, color glyph layers, and font editing are out of scope.
