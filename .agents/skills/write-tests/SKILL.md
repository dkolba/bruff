---
name: write-tests
description: Common patterns and best-practices for writing tests (unit tests & E2E tests)
---

# Testing

- **T-1 (MUST)** For a simple function, colocate unit tests in `*.test.ts` in same directory as source file. These tests are run via Vitest.
- **T-2 (MUST)** For any E2E or integration tests involving browser interaction, use `*.spec.ts`. These tests are run via Playwright and typically reside in `packages/arcade/e2e`.
- **T-3 (MUST)** ALWAYS separate pure-logic unit tests from integration tests.
- **T-4 (SHOULD)** Prefer integration tests over heavy mocking.
- **T-5 (SHOULD)** Unit-test complex algorithms thoroughly.
- **T-6 (SHOULD)** Test the entire structure in one assertion if possible
- **T-7 (MUST)** Canvas-game E2E tests assert `GameState` through `window.__bruffTestApi` in `?test=1` mode by default. Use screenshots only for static DOM regions or after `freezeForSnapshot()`.

  ```ts
  expect(result).toBe([value]); // Good

  expect(result).toHaveLength(1); // Bad
  expect(result[0]).toBe(value); // Bad
  ```

---
