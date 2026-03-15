# Code Guidelines

## Implementation Best Practices

### 0 — Purpose

These rules ensure maintainability, safety, and developer velocity.
**MUST** rules are enforced by CI; **SHOULD** rules are strongly recommended.

---

### 1 — Before Coding

- **BP-1 (MUST)** Ask the user clarifying questions.
- **BP-2 (SHOULD)** Draft and confirm an approach for complex work.
- **BP-3 (SHOULD)** If ≥ 2 approaches exist, list clear pros and cons.

---

### 2 — While Coding

- **C-1 (MUST)** Follow TDD: scaffold stub -> write failing test -> implement.
- **C-2 (MUST)** Name functions with existing domain vocabulary for consistency.
- **C-3 (SHOULD NOT)** Introduce classes when small testable functions suffice.
- **C-4 (SHOULD)** Prefer simple, composable, testable functions.
- **C-5 (MUST)** Prefer branded `type`s for IDs
  ```ts
  type UserId = Brand<string, "UserId">; // ✅ Good
  type UserId = string; // ❌ Bad
  ```
- **C-6 (MUST)** Use `import type { … }` for type-only imports.
- **C-7 (SHOULD NOT)** Add comments except for critical caveats; rely on self‑explanatory code.
- **C-8 (SHOULD)** Default to `type`; use `interface` only when more readable or interface merging is required.
- **C-9 (SHOULD NOT)** Extract a new function unless it will be reused elsewhere, is the only way to unit-test otherwise untestable logic, or drastically improves readability of an opaque block.

---

### 3 — Testing

- **T-1 (MUST)** For a simple function, colocate unit tests in `*.test.ts` in same directory as source file. These tests are run via Vitest.
- **T-2 (MUST)** For any E2E or integration tests involving browser interaction, use `*.spec.ts`. These tests are run via Playwright and typically reside in `packages/game/e2e` or alongside the component they test.
- **T-3 (MUST)** ALWAYS separate pure-logic unit tests from integration tests.
- **T-4 (SHOULD)** Prefer integration tests over heavy mocking.
- **T-5 (SHOULD)** Unit-test complex algorithms thoroughly.
- **T-6 (SHOULD)** Test the entire structure in one assertion if possible

  ```ts
  expect(result).toBe([value]); // Good

  expect(result).toHaveLength(1); // Bad
  expect(result[0]).toBe(value); // Bad
  ```

---

### 4 — Code Organization

- **O-1 (MUST)** Place code in `packages/utils` if reusable, domain agnostic logic.
- **O-2 (SHOULD)** Incremental progress over big bangs - Small changes that compile and pass tests
- **O-3 (SHOULD)** Learning from existing code - Study and plan before implementing
- **O-4 (SHOULD)** Pragmatic over dogmatic - Adapt to project reality
- **O-5 (MUST)** Clear intent over clever code - Be boring and obvious
- **O-6 (MUST)** Single responsibility per function/class
- **O-7 (MUST)** Avoid premature abstractions
- **O-8 (MUST)** If you need to explain it, it's too complex

#### Technical Standards

##### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

##### Functional Programming

Prefer a functional programming style to create predictable and testable code.
Use functional reactive programming patterns extensively.
Only use observables that conform to the WICG Observable API proposal.

##### Composition with `pipe()`

Function composition is the primary method for building complex logic from simple, reusable functions. Always use the `pipe()` utility from `@bruff/utils` for this purpose.

- **Clarity**: `pipe` makes the flow of data explicit and easy to follow.
- **Reusability**: Encourages the creation of small, single-purpose functions.

##### Currying

Curry functions when it aids in creating partially applied functions that can be reused in different contexts, especially within a `pipe`.

##### Writing Functions Best Practices

When evaluating whether a function you implemented is good or not, use this checklist:

1. Can you read the function and HONESTLY easily follow what it's doing? If yes, then stop here.
2. Does the function have very high cyclomatic complexity? (number of independent paths, or, in a lot of cases, number of nesting if if-else as a proxy). If it does, then it's probably sketchy.
3. Are there any common data structures and algorithms that would make this function much easier to follow and more robust? Parsers, trees, stacks / queues, etc.
4. Are there any unused parameters in the function?
5. Are there any unnecessary type casts that can be moved to function arguments?
6. Is the function easily testable without mocking core features (e.g. sql queries, redis, etc.)? If not, can this function be tested as part of an integration test?
7. Does it have any hidden untested dependencies or any values that can be factored out into the arguments instead? Only care about non-trivial dependencies that can actually change or affect the function.
8. Brainstorm 3 better function names and see if the current name is the best, consistent with rest of codebase.

IMPORTANT: you SHOULD NOT refactor out a separate function unless there is a compelling need, such as:

- the refactored function is used in more than one place
- the refactored function is easily unit testable while the original function is not AND you can't test it any other way
- the original function is extremely hard to follow and you resort to putting comments everywhere just to explain it

#### Code Quality

- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

##### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

##### TypeScript and Typeing

- Never introduce type assertions in generated code.
- Refactor existing casts into safe alternatives.
- If a cast seems unavoidable, prefer type guards or generics first.
- If still required, add explicit suppression with justification.
- All types, for TypeScript files, must be written using TSDoc annotations.

###### Key Rules

TypeScript:

1.  **Be Explicit**: Provide types for all function parameters and return values.
2.  **Prohibit Type Casting**: Avoid all type assertions (`as` and `<Type>`) in TypeScript code. Treat casts as errors unless explicitly justified.
3.  **Allowed Patterns (use instead of casts)**:

- Type narrowing (`typeof`, `in`, discriminated unions)
- User-defined type guards (`obj is T`)
- `satisfies` operator (preferred over assertions)
- Proper generics instead of forcing types

4. **Disallowed Patterns**:

- `value as Type`
- `<Type>value`
- Casting from `any` or `unknown` without validation
- The `any` type is strictly forbidden. If a type is truly unknown, use `unknown` and perform necessary type-checking.

5. **Exceptions for Types**: Allowed only with explicit lint suppression and justification:

```ts
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- <reason>
```

---

### 5 — Tooling Gates

- **G-1 (MUST)** `pnpm run format` passes.
- **G-2 (MUST)** `pnpm run lint` passes.
- **G-3 (MUST)** `pnpm run test` passes.
- **G-4 (MUST)** `pnpm run typecheck` passes.
- **G-5 (MUST)** `pnpm run build` passes.

---

### 6 - Git

- **GH-1 (MUST**) Use Conventional Commits format when writing commit messages: https://www.conventionalcommits.org/en/v1.0.0
- **GH-2 (SHOULD NOT**) Refer to Gemini, Google, Claude or Anthropic in commit messages.

### 7 - Important Reminders

**NEVER**:

- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions - verify with existing code

**ALWAYS**:

- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Stop after 3 failed attempts and reassess

### 8 - Code Organization

This outlines the development standards and best practices for this project. Adhering to these guidelines ensures consistency, maintainability, and quality across the codebase.
The project is organized into a monorepo with the primary packages being:

- `packages/game` - The main game logic and application-specific code.
- `packages/utils` - Utility and helper functions

### `@bruff/utils`

This package contains shared, reusable utility functions.

- **Language**: **TypeScript**.
- **Purpose**: To house generic, pure functions (e.g., data manipulation, math helpers) that can be used across the entire project or even in other projects.
- **Typing**: While using `.ts` files, all type information **must be declared using TSDoc annotations**.
- **Style**: Must adhere to the "double quotes" and "two-space indentation" rule.

### `@bruff/game` (TypeScript)

This package contains the core game logic and application-specific code.

- **Language**: **TypeScript**.
- **Purpose**: To implement the main features and logic of the game.
- **Typing**: While using `.ts` files, all type information **must be declared using TSDoc annotations**.
- **Dependencies**: This package will consume utilities from `@bruff/utils`.

```typescript
// packages/game/lib/loop.ts

import {
  BASE_SIZE,
  HALF,
  HUE_MULTIPLIER,
  ONE,
  PULSE_MAGNITUDE,
  PULSE_SPEED,
  RANGE_SCALE,
  ROTATION_SPEED,
  TWO,
} from "./constants.ts";

/**
 * Creates an animated background pattern of radiating bars that rotate and pulse.
 * The bars emanate from the center of the canvas in both directions, with colors
 * that shift based on position and time.
 *
 * @param CanvasRenderingContext2D - The 2D rendering context of the canvas
 * @param number - The current timestamp for animation timing
 * @returns void
 *
 * @remarks
 * The animation uses the following effects:
 * - Rotation: The entire pattern rotates based on the timestamp
 * - Pulsing: The bars' size pulses using a sine wave
 * - Color shifting: Colors transition across the hue spectrum
 * - Symmetry: Bars radiate both left and right from center
 */
const radiatingBarsBackgroundAnimation = (
  context: CanvasRenderingContext2D,
  timestamp: number,
) => {
  context.save();
  context.translate(context.canvas.width / TWO, context.canvas.height / TWO);
  context.rotate(timestamp * ROTATION_SPEED);

  const range =
    Math.max(context.canvas.width, context.canvas.height) * RANGE_SCALE;
  const size = BASE_SIZE + Math.sin(timestamp * PULSE_SPEED) * PULSE_MAGNITUDE;
  for (let index = 0; index < range; index += size) {
    context.fillStyle = hsla({
      alpha: ONE,
      hue: (index / range) * HUE_MULTIPLIER + timestamp * ROTATION_SPEED,
      lightness: HALF,
      saturation: ONE,
    });
    context.fillRect(index, -range, size, range * TWO);
    context.fillRect(-index, -range, size, range * TWO);
  }

  context.restore();
};
```
