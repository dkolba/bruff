# @bruff/sigil

Development-only browser tool for extracting selected glyphs from a local font into compact JSON. The package registers `<tool-sigil>` for the arcade `/tools` dev route; production arcade builds must not import this package.

The tool maps each entered source character to one glyph from `@bruff/glyph` and one OSI license value before download. Rows use a staged picker: choose a glyph group first, then choose one glyph from that group rather than scanning the full shared glyph catalog.

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
