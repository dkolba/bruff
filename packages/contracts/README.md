# @bruff/contracts

Shared runtime object and type contracts for the monorepo.

This package owns Zod schemas, inferred readonly TypeScript types, and small pure parser helpers for object shapes that need to cross package boundaries.

## Exports

### `@bruff/contracts`

The root export is universal. It is safe for Node.js and browser code, and must not depend on DOM globals, Canvas APIs, game shell code, or package-specific runtime state.

Use it for shared contract schemas and parser helpers:

- `sharedObjectSchema`
- `parseSharedObject(input)`
- `SharedObject`
- `ParseSharedObjectError`

## API

### `sharedObjectSchema`

Zod schema for a minimal package-local shared object contract with a non-empty `kind` string.

### `parseSharedObject(input)`

Parses an `unknown` input with `sharedObjectSchema.safeParse()` and returns a `Result<SharedObject, ParseSharedObjectError>` from `@bruff/utils`.

Invalid inputs return an explicit error value with reason `"INVALID_SHARED_OBJECT"` and the Zod issues. Parser helpers in this package do not throw.

## Boundary

This package is intentionally unused by current workspace packages at creation time. Do not migrate `@bruff/game`, `@bruff/game-element`, `@bruff/arcade`, `@bruff/sigil`, `@bruff/glyph`, `@bruff/cli`, or `@bruff/utils` to consume `@bruff/contracts` as part of package scaffolding work.

Add concrete contract domains only when a shape is shared across package boundaries and needs runtime validation.

## Development

```sh
pnpm run format
pnpm run lint
pnpm run typecheck
```

## Testing

Tests run in real browsers via Vitest + Playwright:

```sh
pnpm run test
pnpm run test:chromium
pnpm run test:firefox
pnpm run test:webkit
pnpm run test:watch
```
