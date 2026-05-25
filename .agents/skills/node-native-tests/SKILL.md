---
name: node-native-tests
description: Write and maintain TypeScript tests for Node.js-only modules using only the native node:test runner and node:assert/strict, with no browser, DOM, Jest, Vitest, or transpiler-based test runner.
---

# Node Native Tests

Use this skill when writing tests for Node.js modules where the test stack must be:

- TypeScript source files executed directly by Node.js
- `node:test` for test definitions, lifecycle hooks, subtests, mocking, and timers
- `node:assert/strict` for assertions
- no browser APIs, DOM APIs, Jest, Vitest, Playwright, jsdom, tsx, ts-node, or Babel

## Workflow

1. Confirm the target is a Node.js module, not browser or DOM code.
2. Read the module API and existing package scripts before choosing file names or commands.
3. Add colocated `*.test.ts` files unless the package already has a dedicated Node test directory.
4. Write the failing test first, using only public exports.
5. Run the smallest native command that covers the new test.
6. Run type checking separately; Node executes TypeScript but does not type-check it.

## Native TypeScript Constraints

Node.js runs TypeScript through type stripping. Keep tests and imported test-only helpers inside erasable TypeScript syntax:

- Use `.ts`, `.mts`, or `.cts`; do not use `.tsx`.
- Include real file extensions in relative imports: `./parser.ts`, not `./parser`.
- Use `import type` for type-only imports.
- Avoid syntax that requires transformation: `enum`, parameter properties, runtime namespaces, decorators, and TypeScript path aliases.
- Do not assume `tsconfig.json` changes Node runtime behavior. `tsconfig.json` is for editors and `tsc`.

Recommended `tsconfig.json` options for native Node TypeScript projects:

```json
{
  "compilerOptions": {
    "noEmit": true,
    "target": "esnext",
    "module": "nodenext",
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true
  }
}
```

If the project imports `.ts` extensions and type-checks without emitting, also ensure the compiler accepts those imports, for example with `allowImportingTsExtensions` where appropriate.

## Running Tests

Prefer explicit globs for TypeScript tests:

```sh
node --test "**/*.test.ts"
```

For Node versions earlier than `v22.18.0`, TypeScript execution may require:

```sh
node --experimental-strip-types --test "**/*.test.ts"
```

Type-check separately:

```sh
tsc --noEmit
```

Useful native runner flags:

- `--test-name-pattern "pattern"` to run matching tests.
- `--test-only` with `test.only()` for a temporary focused run; remove before finishing.
- `--watch` for local iteration.
- `--test-concurrency <n>` when file-level concurrency must be constrained.
- `--test-reporter spec` for readable local output.
- `--experimental-test-coverage` when native coverage is available in the target Node version.

## Test Structure

Use ESM-style imports unless the package is explicitly CommonJS:

```ts
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { parsePort } from "./parse-port.ts";

describe("parsePort", (): void => {
  test("accepts a valid TCP port", (): void => {
    assert.equal(parsePort("8080"), 8080);
  });

  test("rejects a non-numeric port", (): void => {
    assert.deepEqual(parsePort("abc"), {
      type: "error",
      error: "not-a-number",
    });
  });
});
```

Keep tests black-box:

- Assert observable return values, emitted values, written files, or explicit `Result`/`Option` errors.
- Do not assert private helper calls or implementation details.
- Prefer one structural `assert.deepEqual(actual, expected)` over many weak partial assertions.
- Use `assert.equal()` for primitives, `assert.deepEqual()` for records and arrays, and `assert.match()` for intentional text patterns.
- Import from `node:assert/strict`; do not import legacy `node:assert`.

## Async Tests

Return or await every async operation. Native tests fail on rejected promises when they are awaited by the test body.

```ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { readConfig } from "./read-config.ts";

test("reads a config file", async (): Promise<void> => {
  const config = await readConfig(
    new URL("./fixtures/app.json", import.meta.url),
  );

  assert.deepEqual(config, {
    mode: "test",
  });
});
```

When testing promise rejection, use `assert.rejects()` and await it:

```ts
await assert.rejects(
  async (): Promise<void> => {
    await readConfig(new URL("./fixtures/missing.json", import.meta.url));
  },
  {
    name: "Error",
  },
);
```

## Fixtures And Node APIs

Use Node standard modules for Node tests:

```ts
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";
```

Keep filesystem tests isolated:

- Create per-test temporary directories with `mkdtemp(join(tmpdir(), "package-name-"))`.
- Clean up with `afterEach()` or `try`/`finally`.
- Avoid shared fixture mutation. Read immutable fixtures from a `fixtures/` directory.
- Do not depend on test execution order.

## Mocking

Prefer dependency injection over mocks. When a mock is the simplest expression of behavior, use the native test context so cleanup is automatic:

```ts
import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";

test("calls the injected logger once", (context: TestContext): void => {
  const loggedMessages: Array<string> = [];
  const log = context.mock.fn((message: string): void => {
    loggedMessages.push(message);
  });

  log("ready");

  assert.equal(log.mock.callCount(), 1);
  assert.deepEqual(log.mock.calls[0]?.arguments, ["ready"]);
  assert.deepEqual(loggedMessages, ["ready"]);
});
```

For timers, use `context.mock.timers` and advance time deterministically. Avoid real sleeps.

## Do Not Use

- `expect`, snapshots, fake DOMs, or browser globals such as `window` and `document`.
- Transpiler-only TypeScript syntax unless the package already has a non-native test runner.
- `assert.ok(actual)` when a more precise assertion is available.
- `assert.doesNotThrow()` or `assert.doesNotReject()` as a substitute for asserting the real outcome.
- Focused tests, skipped tests, or random temporary files left behind after the run.

## Source Docs

- Node.js test runner: https://nodejs.org/api/test.html
- Node.js assert: https://nodejs.org/api/assert.html
- Running TypeScript natively: https://nodejs.org/learn/typescript/run-natively
- Node.js TypeScript API details: https://nodejs.org/api/typescript.html
