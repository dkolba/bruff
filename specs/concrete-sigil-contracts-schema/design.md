# Concrete Sigil Contracts Schema Design

## Layer assignment

| Module | Layer | Responsibility |
| --- | --- | --- |
| `packages/sigil/module/sigil-schema-catalog.ts` | Pure catalog | Defines available concrete schema presets, default textarea characters, and default required glyph character selections. |
| `packages/sigil/module/tool-sigil-state-types.ts` | Pure state types | Adds selected schema id, schema options, editable characters, required glyph selections, select options, and contract validation issues to `ToolSigilState` and `ToolSigilViewModel`. |
| `packages/sigil/module/tool-sigil-required-glyph-selection.ts` | Pure state helper | Derives distinct textarea character options, default required glyph selections, invalid selection state, and selected-character lookups. |
| `packages/sigil/module/tool-sigil-contract-validation.ts` | Pure validation | Validates produced glyph JSON and the final `SigilGlyphMap` payload through shared contracts and returns path-aware user-visible reasons. |
| `packages/sigil/module/tool-sigil-state.ts` | Pure state transitions | Initializes schema state, handles textarea edits, handles required glyph select changes, re-extracts typed characters, completes missing selected glyph rows, and preserves valid user choices. |
| `packages/sigil/module/tool-sigil-missing-drafts.ts` | Pure projection helper | Creates renderable placeholder drafts for selected required glyph characters that the uploaded font cannot extract. |
| `packages/sigil/module/tool-sigil-state-selectors.ts` | Pure projection | Projects textarea value, schema selector state, required glyph select view state, validation errors, and download disabled state. |
| `packages/sigil/module/tool-sigil-template.ts` | Web component shell template | Renders the schema selector, restored textarea, and one labeled source-character select per required contract glyph. |
| `packages/sigil/module/tool-sigil-bindings.ts` | Web component shell bindings | Routes textarea input, schema select changes, and required glyph select changes to control handlers. |
| `packages/sigil/module/tool-sigil-render.ts` | Web component shell render | Renders glyph rows, contract validation errors, and delegates schema and required glyph select rendering. |
| `packages/sigil/module/tool-sigil-schema-render.ts` | Web component shell render | Renders selected schema options into the schema select. |
| `packages/sigil/module/tool-sigil-required-glyph-render.ts` | Web component shell render | Renders required glyph source-character select options and invalid selection state. |
| `packages/sigil/module/tool-sigil.ts` | Web component coordinator | Wires schema, textarea, and required glyph selection events into pure state transitions. |

## Public API surface

```ts
/** Stable id for a concrete sigil contract schema preset. */
export type SigilSchemaId = Brand<string, "SigilSchemaId">;

/** One required glyph entry within a schema preset. */
export type SigilSchemaGlyph = Readonly<{
  name: RequiredSigilGlyphName;
  defaultUnicode: string;
}>;

/** One schema preset selectable in the sigil tool. */
export type SigilSchemaOption = Readonly<{
  id: SigilSchemaId;
  label: string;
  defaultCharacters: string;
  requiredGlyphs: ReadonlyArray<SigilSchemaGlyph>;
}>;

/** Selected textarea character for one required contract glyph. */
export type RequiredGlyphSelection = Readonly<{
  name: RequiredSigilGlyphName;
  unicode: string;
}>;

/** One select option derived from the textarea. */
export type RequiredGlyphCharacterOption = Readonly<{
  label: string;
  unicode: string;
}>;

/** View state for one required glyph source-character select. */
export type RequiredGlyphSelectionView = Readonly<{
  name: RequiredSigilGlyphName;
  selectedUnicode: string;
  isValid: boolean;
  options: ReadonlyArray<RequiredGlyphCharacterOption>;
}>;

/** User-visible validation reason returned from shared contract parsing. */
export type ToolSigilContractIssue = Readonly<{
  path: string;
  message: string;
}>;

export const SIGIL_GLYPH_MAP_SCHEMA_ID: SigilSchemaId;
export const SIGIL_SCHEMA_OPTIONS: ReadonlyArray<SigilSchemaOption>;
export const DEFAULT_SIGIL_SCHEMA_ID: SigilSchemaId;
export const findSigilSchemaOption: (
  schemaOptions: ReadonlyArray<SigilSchemaOption>,
  schemaId: SigilSchemaId,
) => Option<SigilSchemaOption>;
```

State APIs to add or update:

```ts
export const setToolSigilCharacters: (
  state: ToolSigilState,
  characters: string,
) => ToolSigilState;

export const setToolSigilSchema: (
  state: ToolSigilState,
  schemaId: SigilSchemaId,
) => ToolSigilState;

export const setToolSigilRequiredGlyphCharacter: (
  state: ToolSigilState,
  name: RequiredSigilGlyphName,
  unicode: string,
) => ToolSigilState;
```

`ToolSigilControlHandlers` includes:

```ts
onCharactersInput: (characters: string) => void;
onSchemaChange: (schemaId: string) => void;
onRequiredGlyphCharacterChange: (
  name: RequiredSigilGlyphName,
  unicode: string,
) => void;
```

## Data shape changes

`ToolSigilState` keeps or adds:

```ts
characters: string;
selectedSchemaId: SigilSchemaId;
schemaOptions: ReadonlyArray<SigilSchemaOption>;
requiredGlyphSelections: ReadonlyArray<RequiredGlyphSelection>;
contractIssues: ReadonlyArray<ToolSigilContractIssue>;
```

`ToolSigilViewModel` keeps or adds:

```ts
characters: string;
selectedSchemaId: SigilSchemaId;
schemaOptions: ReadonlyArray<SigilSchemaOption>;
requiredGlyphSelections: ReadonlyArray<RequiredGlyphSelectionView>;
contractIssues: ReadonlyArray<ToolSigilContractIssue>;
```

Initial state sets `characters` to `".#+@e"` from the default `SigilGlyphMap` schema. Required glyph selections are initialized from each schema glyph's `defaultUnicode`:

```ts
[
  { name: "floor", unicode: "." },
  { name: "wall", unicode: "#" },
  { name: "door", unicode: "+" },
  { name: "player", unicode: "@" },
  { name: "enemy", unicode: "e" },
]
```

`namesByUnicode` is still used to label extracted rows, but required glyph row labels come from `requiredGlyphSelections` so a contract glyph can choose any typed source character.

No `GameState`, action, replay, or migration changes are required.

## Reuse map

- `packages/contracts/module/sigil-glyph-json.ts` provides `requiredSigilGlyphNames`, `RequiredSigilGlyphName`, the individual glyph contract, and the `SigilGlyphMap` contract parser used for exact validation reasons.
- `packages/sigil/module/glyph-json.ts` already re-exports contract glyph names and types for sigil modules.
- `packages/sigil/module/sigil-schema-catalog.ts` already centralizes the `SigilGlyphMap` preset and can carry default textarea characters plus default required glyph selections.
- `packages/sigil/module/tool-sigil-state.ts` already owns pure initialization, character updates, schema changes, font-load extraction, and download projection.
- `packages/sigil/module/tool-sigil-missing-drafts.ts` already completes the renderable draft list after extraction and should now complete rows for selected required glyph characters.
- `packages/sigil/module/extract-glyphs.ts` remains the only extraction function and continues to accept the editable textarea character string.
- `packages/sigil/module/tool-sigil-render.ts` already renders row names and validation messaging areas.
- `packages/sigil/module/tool-sigil-schema-render.ts` owns schema selector DOM option replacement.
- `packages/sigil/module/tool-sigil-bindings.ts` already routes textarea and select `change` events.
- `packages/sigil/module/tool-sigil.test.ts`, `tool-sigil-state.test.ts`, `tool-sigil-bindings.test.ts`, `tool-sigil-render.test.ts`, `tool-sigil-download.test.ts`, and `tool-sigil-error.test.ts` cover component, state, binding, render, download, and validation behaviour.

## Data flow

```text
SIGIL_SCHEMA_OPTIONS
        |
createToolSigilState()
        |
default schema -> characters + requiredGlyphSelections
        |
textarea input -> distinct candidate characters
        |
required glyph selects -> selected source characters by contract name
        |
font load -> extractSigilGlyphs(font, characters)
        |
completeMissingDrafts(font, selected required characters, drafts)
        |
build selected SigilGlyphMap JSON
        |
shared contract parser -> exact path-aware issues
        |
ToolSigilViewModel -> textarea + schema select + required glyph selects + rows + errors
```

## Tradeoffs

### Chosen approach: schema catalog plus editable candidate characters

Pros:

- Keeps the tool schema-driven while restoring user control over the extraction character set.
- Allows each contract glyph to explicitly choose exactly one candidate character.
- Keeps extraction unchanged because `extractSigilGlyphs()` still consumes a character string.
- Preserves exact shared-contract validation by parsing the produced JSON at the boundary before download.
- Keeps future schemas declarative through catalog metadata.

Cons:

- Adds another mapping layer between extracted characters and contract glyph names.
- Requires invalid-selection state when textarea edits remove selected characters.

### Alternative: keep the current fixed schema characters

Pros:

- Smaller implementation and fewer controls.
- Avoids invalid selection states.

Cons:

- Does not satisfy the requirement to let users type characters and pick one per required glyph.
- Prevents fonts with different source code points from producing a valid `SigilGlyphMap`.

### Alternative: infer required glyph selections from typed character order

Pros:

- Avoids five additional selects.
- Keeps the form smaller.

Cons:

- Does not provide explicit per-glyph control.
- Becomes ambiguous when users reorder, remove, or duplicate characters.
- Makes contract validation failures harder for users to fix.

### Alternative: validate only when downloading

Pros:

- Reduces continuous validation work.

Cons:

- Hides exact contract failures until the end of the workflow.
- Conflicts with the requirement to display exact reasons when a produced glyph or combination is invalid.

## Test strategy

- Add pure state tests proving initial state restores the textarea with `".#+@e"` and default required glyph selections.
- Add pure helper tests proving typed characters are deduplicated into select options without losing display labels.
- Add state tests proving textarea edits update required glyph option lists and preserve still-valid selected characters.
- Add state tests proving removing a selected textarea character marks only affected required glyph selections invalid.
- Add state tests proving required glyph select changes update the exported contract mapping by glyph name.
- Add validation tests proving invalid produced glyphs expose exact shared-contract path and message reasons.
- Add validation tests proving invalid `SigilGlyphMap` combinations expose exact shared-contract path and message reasons.
- Add binding tests proving textarea input and required glyph select changes call their handlers.
- Add render/component tests proving the textarea, schema selector, and five required glyph selects are labeled, keyboard-accessible, and prefilled.
- Add download tests proving unselected typed glyphs are omitted from exported `SigilGlyphMap` JSON.
- Run `pnpm --filter @bruff/sigil run format`, `lint`, `typecheck`, `test:chromium`, `test:firefox`, and `test:webkit` before final completion.
