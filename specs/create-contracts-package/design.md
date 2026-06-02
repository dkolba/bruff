# Create Contracts Package Design

## Layer Assignment

| Area               | Files                                                                   | Runtime contract                                                                                            |
| ------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Package metadata   | `packages/contracts/package.json`                                       | Declares `@bruff/contracts`, root export, scripts, and direct `zod` dependency.                             |
| TypeScript config  | `packages/contracts/tsconfig.json`                                      | Extends `../../tsconfig.base.json`, sets package-local path aliases, and includes source/test/config files. |
| Lint config        | `packages/contracts/eslint.config.js`                                   | Reuses `@bruff/eslint-config` with the same coverage ignore pattern as other packages.                      |
| Public root export | `packages/contracts/index.ts`                                           | Re-exports schemas, inferred types, and parser helpers from package modules.                                |
| Contract modules   | `packages/contracts/module/**/*.ts`                                     | Owns Zod schema definitions, readonly inferred types, and pure helpers.                                     |
| Tests              | `packages/contracts/module/**/*.test.ts`                                | Verifies parsing behaviour through public exports or package-level module APIs.                             |
| Documentation      | `packages/contracts/README.md`, `packages/contracts/AGENTS.override.md` | Documents package role, rules, commands, and no-consumer-migration boundary.                                |

The contracts package is a universal package. It must not depend on DOM APIs, Canvas APIs, browser globals, shell effects, or game-layer modules.

## Public API Surface

The first implementation should expose a small pattern that future contracts can copy:

```ts
// @bruff/contracts
export {
  sharedObjectSchema,
  parseSharedObject,
  type ParseSharedObjectError,
  type SharedObject,
} from "./module/shared-object.js";
```

The concrete initial contract should be intentionally generic and package-local, such as a `SharedObject` contract used only to prove the package API shape:

```ts
import { z } from "zod";
import { error, ok, type Result } from "@bruff/utils";

/**
 * Runtime schema for a minimal shared object contract.
 */
export const sharedObjectSchema = z.object({
  kind: z.string().min(1),
});

/**
 * Readonly TypeScript type inferred from {@link sharedObjectSchema}.
 */
export type SharedObject = Readonly<z.infer<typeof sharedObjectSchema>>;

/**
 * Structured parse failure for {@link parseSharedObject}.
 */
export type ParseSharedObjectError = Readonly<{
  reason: "INVALID_SHARED_OBJECT";
  issues: ReadonlyArray<ZodIssue>;
}>;

/**
 * Parses an unknown input into a shared object contract.
 */
export const parseSharedObject = (
  input: unknown,
): Result<SharedObject, ParseSharedObjectError> => {
  const parsedSharedObject = sharedObjectSchema.safeParse(input);

  return parsedSharedObject.success
    ? ok(parsedSharedObject.data)
    : error({
        reason: "INVALID_SHARED_OBJECT",
        issues: parsedSharedObject.error.issues,
      });
};
```

During implementation, define `ZodIssue` from the installed Zod version's exported public issue type without type assertions. Prefer the public type exposed by the installed package over private/internal namespaces.

## Data Shape Changes

No `GameState` shape changes are needed.

No action variants are needed.

No branded ID types are required for the package scaffold. Future concrete contracts that include IDs must use branded ID types, either imported from `@bruff/utils` or declared locally when the brand is specific to the contract domain.

No existing shared object shapes are migrated in this work.

## Dependency Plan

Add `zod` to the root `pnpm-workspace.yaml` catalog with an exact stable version selected during implementation, then reference it from `packages/contracts/package.json` as `"zod": "catalog:"`.

Add `@bruff/utils` as a workspace dependency because parser helpers should return the repository-standard `Result<T, E>` value shape. Reuse `ok`, `error`, and `Result` rather than creating another result type.

Add the same local dev dependencies used by universal TypeScript packages:

- `@bruff/eslint-config`
- `@vitest/browser`
- `@vitest/browser-playwright`
- `@vitest/coverage-v8`
- `eslint`
- `playwright`
- `prettier`
- `rimraf`
- `typescript`
- `vitest`

## Test Strategy

Use TDD when executing the tasks:

1. Scaffold package metadata and an empty public export.
2. Add failing tests for the first schema and parser helper.
3. Implement the schema and helper.
4. Run the new package gates.

Tests should cover:

- valid input returns `ok` with a readonly inferred type-compatible value;
- invalid input returns `error` with reason `"INVALID_SHARED_OBJECT"`;
- parser accepts `unknown` input and does not throw for invalid input;
- public root export exposes the schema, parser, error type, and inferred type.

Browser Vitest is acceptable for consistency with existing universal packages. If the contracts package remains purely Node-safe, a Node-only smoke test may also be added, but it should not replace the normal workspace gates unless the package establishes its own documented test convention.

## Reuse Map

| Existing file                          | Reuse                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `packages/utils/package.json`          | Base package metadata and scripts pattern for a universal package.     |
| `packages/utils/tsconfig.json`         | Package-local `baseUrl`, `paths`, `include`, and `exclude` pattern.    |
| `packages/utils/eslint.config.js`      | Shared ESLint config wiring and coverage ignore pattern.               |
| `packages/utils/vitest.config.ts`      | Browser Vitest and coverage threshold pattern.                         |
| `packages/utils/module/fp/result.ts`   | Canonical `Result`, `ok`, and `error` value shape.                     |
| `packages/utils/module/types/brand.ts` | Existing branded type utility for future contract IDs.                 |
| `packages/utils/README.md`             | README structure for exports, development commands, and test commands. |
| `pnpm-workspace.yaml`                  | Catalog dependency declaration pattern and workspace discovery.        |

## Collaboration Diagram

```text
unknown input
  |
  v
@bruff/contracts Zod schema
  |
  v
safeParse result
  |
  +-- valid --> @bruff/utils ok<SharedObject>
  |
  +-- invalid --> @bruff/utils error<ParseSharedObjectError>
```

## Tradeoffs

### Chosen: New Dedicated `@bruff/contracts` Package

Pros:

- Gives runtime contracts a clear home outside `@bruff/utils`.
- Avoids making generic utilities depend on Zod.
- Lets future packages adopt shared validation incrementally.

Cons:

- Adds another workspace package and dependency edge.
- Introduces Zod to the dependency graph before consumers use it.

### Alternative: Put Schemas In `@bruff/utils`

Pros:

- Fewer packages and less metadata.
- Existing packages already depend on `@bruff/utils`.

Cons:

- Makes a generic utility package own product/domain contracts.
- Pulls Zod into the broadest shared package.
- Blurs the current distinction between utilities and object shape declarations.

### Alternative: Define Schemas In Each Consumer Package

Pros:

- Keeps contracts close to immediate use.
- Avoids creating a package before there are real consumers.

Cons:

- Encourages duplicate schemas once objects cross package boundaries.
- Makes shared runtime validation harder to audit.
- Delays the package boundary until migration pressure is higher.

## Implementation Constraints

- Do not import from `@bruff/contracts` in any existing workspace package during this work.
- Do not use type assertions to coerce Zod output.
- Every exported function must declare an explicit return type.
- Every public type must have TSDoc.
- Every shared exported type must be readonly.
- Parser helpers must use `safeParse` or an equivalent non-throwing Zod API.
- The package must pass `format`, `lint`, `typecheck`, and `test` before any task is marked complete.
