# @bruff/glyph

Shared Unicode glyph tables for the roguelike renderer.

This package is pure data plus tiny string helpers. It does not touch DOM,
Canvas, terminal state, ANSI colours, logging, randomness, or time.

## API

### Glyph tables

`index.ts` exports readonly tables grouped by Unicode block and gameplay use:

- `ASCII` for classic roguelike baseline symbols.
- `BOX`, `BLOCK`, and `BRAILLE` for terrain, UI frames, bars, particles, and dense map detail.
- `GREEK`, `CYRILLIC`, `RUNIC`, `OGHAM`, `COPTIC`, and `ALCHEMICAL` for arcane entities, shrines, inscriptions, and rare items.
- `GEO`, `ARROWS`, `MATH`, `MISC_SYMBOLS`, `DINGBATS`, `LETTERLIKE`, `CURRENCY`, `SUPER_SUB`, and `ENCLOSED` for entities, markers, status displays, and labels.

Table key order follows Unicode/category order rather than alphabetical order.
That keeps related glyphs next to each other while choosing glyphs for gameplay.

### `braille(mask)`

Generates a Braille pattern from an eight-bit dot mask. Bits are mapped to dots
1 through 8, with overflowing bits ignored.

```ts
braille(1); // "⠁"
braille(255); // "⣿"
```

### `combine(base, ...combiners)`

Appends one or more combining marks to a base glyph.

```ts
combine("@", COMBINING.ENCLOSING_CIRCLE); // "@⃝"
```

## Development

```sh
pnpm --filter @bruff/glyph run format
pnpm --filter @bruff/glyph run lint
pnpm --filter @bruff/glyph run typecheck
pnpm --filter @bruff/glyph run test
```

Tests run in real browsers through Vitest Browser + Playwright.
