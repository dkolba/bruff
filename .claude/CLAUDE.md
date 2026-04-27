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

### 3 — Code Organization

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
  - Self-review changes
  - Ensure commit message explains "why"
  - Run "pnpm run ok" before committing

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

### 4 — Tooling Gates

- **G-1 (MUST)** `pnpm run format` passes.
- **G-2 (MUST)** `pnpm run lint` passes.
- **G-3 (MUST)** `pnpm run test` passes.
- **G-4 (MUST)** `pnpm run typecheck` passes.
- **G-5 (MUST)** `pnpm run build` passes.

---

### 5 - Git

- **GH-1 (MUST**) Use Conventional Commits format when writing commit messages: https://www.conventionalcommits.org/en/v1.0.0
- **GH-2 (SHOULD NOT**) Refer to Gemini, Google, Claude or Anthropic in commit messages.

### 6 - Important Reminders

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

### 7 - Code Organization

This outlines the development standards and best practices for this project. Adhering to these guidelines ensures consistency, maintainability, and quality across the codebase.
The project is organized into a monorepo with the primary packages being:

- `packages/game` - The main game logic and application-specific code.
- `packages/utils` - Utility and helper functions

---

### 8 — Game Architecture (`packages/game`)

Rules specific to the roguelike game engine.

#### 8.1 — Layered Architecture

Strict dependency direction — inner layers must never import outer layers:

| Layer       | May import from          |
|-------------|--------------------------|
| `core/`     | nothing (zero imports)   |
| `state/`    | `core/` only             |
| `input/`    | `core/`, `state/`        |
| `render/`   | `core/`, `state/`        |
| `assets/`   | `core/`, `state/`        |
| `effects/`  | `core/`, `state/`        |

- **A-1 (MUST)** No circular dependencies.
- **A-2 (MUST)** `core/` has zero project imports.
- **A-3 (MUST)** Dependencies flow inward toward `core/` only.

#### 8.2 — Pure Core / Impure Shell

- **A-4 (MUST)** All game logic (`core/`, `state/`, `input/`, `render/`) is pure: no DOM access, no `fetch`, no `Math.random()`, no `Date.now()`.
- **A-5 (MUST)** All side effects (Canvas draws, event listeners, timers) live in `effects/` or the entry point only.

#### 8.3 — State & Immutability

- **A-6 (MUST)** Single immutable global `GameState` object — no hidden or local state.
- **A-7 (MUST)** `GameState` includes a `stateVersion: number` for replay compatibility.
- **A-8 (MUST)** All state transitions are pure functions: `(state, action) => state`.
- **A-9 (MUST)** Zero mutation anywhere — no mutable variables, no array `.push()`, no object property assignment.

#### 8.4 — Entity Identity

- **A-10 (MUST)** Every entity has a branded ID type: `Brand<string, "EntityNameId">`.
- **A-11 (MUST)** IDs are generated deterministically via the seeded PRNG stored in state — never `Math.random()` or `crypto.randomUUID()`.
- **A-12 (MUST)** IDs are never reused within a run.
- **A-13 (MUST)** `spawnOrder: number` is tracked on every entity for deterministic tie-breaking.

#### 8.5 — Actions & Event System

- **A-14 (MUST)** All events are discriminated unions: `InputAction`, `GameAction`, `SystemEvent`, `RenderCommand`.
- **A-15 (MUST)** Tag field is always `type` — not `kind`, not `action`.
- **A-16 (MUST)** Input is normalised into `InputAction` before entering the core pipeline.
- **A-17 (MUST)** Input actions are processed before system-generated actions within a tick (FIFO order preserved).
- **A-18 (MUST)** Every `switch` over a discriminated union ends with an exhaustiveness guard:
  ```ts
  default: {
    const _exhaustive: never = action;
    throw new Error(`Unhandled action: ${JSON.stringify(_exhaustive)}`);
  }
  ```

#### 8.6 — Determinism

- **A-19 (MUST)** All randomness flows through a seeded PRNG stored in `GameState` — zero external entropy sources.
- **A-20 (MUST)** Time is a controlled input fed into the root pipeline — never read from `Date.now()` or `performance.now()` inside core.
- **A-21 (MUST)** Fixed-timestep simulation — tick rate is configurable via `Config`, never tied to render FPS.

#### 8.7 — Zero External Runtime Dependencies

- **A-22 (MUST)** `packages/game` has zero external runtime dependencies beyond `@bruff/utils` and browser built-ins.
- **A-23 (MUST)** All FP helpers, PRNG, and math utilities are implemented in-house in `@bruff/utils`.
