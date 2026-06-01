# Sigil Glyph Contracts Design

## Layer Assignment

| File                                                 | Package            | Role                                                                                             |
| ---------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| `packages/contracts/module/sigil-glyph-json.ts`      | `@bruff/contracts` | Universal Zod schemas, inferred readonly payload types, and parser for Sigil glyph JSON maps.    |
| `packages/contracts/module/sigil-glyph-json.test.ts` | `@bruff/contracts` | Browser Vitest coverage for valid and invalid payload parsing.                                   |
| `packages/contracts/index.ts`                        | `@bruff/contracts` | Root export for the new schemas, types, and parser.                                              |
| `packages/sigil/module/glyph-json.ts`                | `@bruff/sigil`     | Sigil-local bridge that re-exports contract-owned payload types and keeps extraction-only types. |
| `packages/sigil/module/glyph-name.ts`                | `@bruff/sigil`     | Produces glyph maps and validates them through `parseSigilGlyphMap`.                             |
| `packages/sigil/module/glyph-name.test.ts`           | `@bruff/sigil`     | Tests validation failure from contract parsing.                                                  |
| `packages/sigil/package.json`                        | `@bruff/sigil`     | Adds `@bruff/contracts` dependency.                                                              |

## Public API Surface

`@bruff/contracts` adds these root exports:

```ts
sigilGlyphBoundsSchema;
sigilSourceGlyphSchema;
sigilGlyphMappingSchema;
sigilGlyphSchema;
sigilGlyphMapSchema;
parseSigilGlyphMap(input);
SigilGlyphBounds;
SigilSourceGlyph;
SigilGlyphMapping;
SigilGlyph;
SigilGlyphMap;
ParseSigilGlyphMapError;
```

`parseSigilGlyphMap(input)` returns `Result<SigilGlyphMap, ParseSigilGlyphMapError>` and uses Zod `safeParse`.

## Data Shape Changes

No JSON shape change. Ownership changes from `@bruff/sigil` type declarations to `@bruff/contracts` schemas and inferred readonly types.

## Data Flow

```txt
@bruff/sigil font extraction
  -> SigilSourceGlyph drafts
  -> createSigilGlyph()
  -> SigilGlyphMap
  -> parseSigilGlyphMap()
  -> download JSON
```

## Tradeoffs

- Chosen: move only the downloadable payload contract into `@bruff/contracts`. This keeps `@bruff/contracts` focused on cross-package runtime object contracts and avoids pulling UI or font-tool implementation details into the shared package.
- Alternative: move every Sigil type into `@bruff/contracts`. Rejected because extraction errors, draft rows, and UI state are package-local and would make the shared package own non-shared implementation details.
- Alternative: validate only in `glyph-download.ts`. Rejected because the invalid map should fail while producing the domain value, before shell download code receives it.

## Reuse Map

- Reuse `Result`, `ok`, and `error` from `@bruff/utils`.
- Reuse the existing `@bruff/contracts` parser pattern in `packages/contracts/module/shared-object.ts`.
- Reuse Sigil map construction in `packages/sigil/module/glyph-name.ts`.
- Preserve Sigil extraction-only types in `packages/sigil/module/glyph-json.ts`.
