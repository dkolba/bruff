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
- **T-7 (MUST)** Canvas-game E2E tests assert `GameState` through `window.__bruffTestApi` in `?test=1` mode by default. Use `gotoTestMode(page)` from `packages/arcade/e2e/base-fixtures.ts` and drive gameplay with `dispatchInput()` plus `stepFrames()`.
- **T-8 (MUST)** Treat rendered frames and logical ticks separately. `stepFrames(n)` may render and advance manual clock time; it increments `frameIndex` and moves enemies only when queued input creates a logical tick.
- **T-9 (MUST)** Screenshot assertions are narrow and self-validating: static DOM regions, or canvas after a deterministic replay checkpoint followed by `freezeForSnapshot()`. Use `await expect(locator).toHaveScreenshot("name.png")`; do not call `locator.screenshot()` unless the test also makes an explicit assertion on the returned bytes.
- **T-10 (MUST)** Replay tests use JSON fixtures in `packages/game/tests/fixtures/` and committed final-state snapshots in `packages/game/tests/snapshots/`; fixture parsing returns typed `Result` values, never throws.
- **T-11 (MUST)** Do not leave dangling locators in tests. Every locator created in a test must be used in an assertion such as `toBeVisible()`, `toHaveText()`, `toHaveScreenshot()`, or an equivalent explicit expectation.

  ```ts
  expect(result).toBe([value]); // Good

  expect(result).toHaveLength(1); // Bad
  expect(result[0]).toBe(value); // Bad
  ```

---
