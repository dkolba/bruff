# Code Guidelines

## Implementation Best Practices

### 0 — Purpose

These rules ensure maintainability, safety, and developer velocity.
**MUST** rules are enforced by CI; **SHOULD** rules are strongly recommended.

---

### 1 — Before Coding

- **BP-1 (MUST)** Ask the user clarifying questions.
- **BP-2 (SHOULD)** Draft and confirm an approach for complex work. For non-trivial features, invoke the `sdte-loop` skill.
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
- **C-10 (SHOULD)** Name by kind: functions use verbs (`updatePlayer`, `clamp`), variables/types use nouns (`GameState`, `enemies`), booleans use predicates (`isActive`, `playerMoved`).
- **C-11 (SHOULD NOT)** Use boolean parameters to control function behaviour — split into two explicit functions instead.
- **C-12 (SHOULD NOT)** Reassign function parameters. Treat every parameter as `const`.
- **C-13 (SHOULD NOT)** Use vague names like `data`, `item`, `thing`, `info`, `value`, `obj`, `result`. Prefer intent-revealing names (`userList`, `pendingActions`, `parsedInput`) — Meaningless Name Anti-Pattern.
- **C-14 (SHOULD NOT)** Use abbreviations beyond well-established acronyms (DOM, URL, HTTP, ID). `usrLst` is wrong; `userList` is right — Noise Word Anti-Pattern.
- **C-15 (SHOULD NOT)** Nest control flow more than three levels deep (Arrow Code). Flatten with early returns, extracted predicates, or `pipe()` composition.
- **C-16 (MUST)** Return explicitly. Every function declares its return type; implicit `undefined` returns are forbidden. A function that legitimately returns nothing returns `void`.
- **C-17 (SHOULD NOT)** Use imperative loops (`for`, `while`, `do…while`) when `.map()`, `.filter()`, `.reduce()`, or `pipe()` express the intent more clearly. Reach for declarative iteration first.
- **C-18 (SHOULD NOT)** Use the `this` keyword in domain code. Domain logic is built from standalone arrow functions; `this` may appear only in Web Component lifecycle methods (e.g. `connectedCallback`) where the platform requires it.
- **C-19 (SHOULD NOT)** Declare module-level mutable state. Modules export `const` bindings and pure functions only — no top-level `let` reassignment, no `var`, no exported mutable objects. Shared mutable state lives in `GameState` (per A-6). A local `let` inside a single function as an accumulator is acceptable but `.reduce()` is usually clearer.

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
- **O-9 (MUST)** DRY — eliminate duplication via abstraction once the same logic appears in three places (Rule of Three). Two near-identical blocks may stay until the third confirms the pattern.
- **O-10 (MUST)** KISS — choose the boring, obvious approach. Cleverness is a defect; if a colleague has to ask "why is it like this?", simplify.
- **O-11 (SHOULD)** Keep files ≤ ~200 lines (Small Files Principle). Files larger than this almost always hide a missing module boundary.
- **O-12 (MUST)** One responsibility per file (extends O-6 from per-function to per-file). The file's name is its contract — if you can't pick a precise name, the file does too much.

#### Technical Standards

##### Architecture Principles

- **Functional Core, Imperative Shell** - All side effects (DOM, Canvas, I/O, logging) live in the shell; the core is pure and has no knowledge of the shell.
- **Logging Through the Event Bus** - Production code emits logs with `log()` from `@bruff/utils`; direct `console.*` calls belong only in the event-bus console sink and tests.
- **Command–Query Separation** - A function either returns a value (query) or produces a side effect (command), never both.
- **Illegal States Unrepresentable** - Encode invariants in the type system (discriminated unions, branded types, refinement via narrowing) so impossible states cannot be expressed.
- **Data-First Design** - Pass data through transformations; do not wrap data in objects with methods. State is plain records; behaviour is free functions.
- **Point-Free Style** (where readable) - Prefer `pipe(parse, validate, persist)` over `(x) => persist(validate(parse(x)))` when the intermediate names add no information.
- **Stable Dependencies Principle** - Code depends in the direction of stability; less-stable code depends on more-stable code, never the reverse. The deeper a layer (per §8), the more stable.
- **Functions as First-Class Values** - Functions are passed, returned, and composed like any other value. Curried factories (`(config) => (input) => output`) are preferred over closures over module state.
- **Higher-Order Functions** - Functions that take or return functions are the canonical extension mechanism. Reach for `pipe`, `compose`, currying, and factory functions before reaching for new types or classes.
- **Algebraic Data Types (ADTs)** - Sum types (discriminated unions) for choices, product types (records) for combinations. Every domain type is one or the other; classes are forbidden (C-3).
- **Wrap Effects in Explicit Functions** - Every side-effecting call (HTTP, Canvas draw, timer, DOM access) lives in a named single-purpose function in the shell. Never inline `fetch()`, `requestAnimationFrame`, or `document.querySelector` into business logic.
- **Transform Before Update** - Shell effects produce raw data → pure transformations turn it into typed actions → reducers apply actions to state. Never pipe shell results directly into a state mutation.
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

The codebase is **exception-free everywhere**. Errors are values, not control flow.

- **Exception-Free Domain Rule** — `core/`, `state/`, `input/`, `render/`, **and** `effects/` never `throw`. Domain functions return `Result<T, E>` or `Option<T>`; shell functions return `Result<T, E>` and surface failures as values.
- **Railway-Oriented Programming** — chain operations through `Result<T, E>`. The success track threads transformations; the failure track short-circuits without ceremony.
- **Standard return shapes** — adopt these once in `@bruff/utils` and reuse everywhere:

  ```ts
  type Result<T, E> = { type: "ok"; value: T } | { type: "error"; error: E };
  type Option<T> = { type: "some"; value: T } | { type: "none" };
  ```

- **Boundary conversion** — third-party APIs that throw must be wrapped at the call site so the error becomes a `Result.error`. Throws are never re-thrown into our code.
- **No silent failures** — every failure mode is encoded in the return type. Drop-on-floor handling is forbidden; an explicit `Result.error` with a typed reason is mandatory.
- **Descriptive errors** — the `E` type carries enough context for debugging (typed reason code + relevant inputs); string-only errors are forbidden in new code.

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

6. **Mandate Readonly on shared types**: Use `Readonly<T>` and `ReadonlyArray<T>` (or the equivalent `readonly` modifiers) for every type that flows through state, props, or a public API. The compiler enforces immutability at the type level; A-9 enforces it at runtime. Both are required.

   ```ts
   type GameState = Readonly<{
     player: Readonly<Player>;
     enemies: ReadonlyArray<Enemy>;
   }>;
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

### 7 — Workspace Map

The repo is a pnpm monorepo. Package-specific rules auto-load from `packages/<package-name>` when you edit files inside the matching package.

| Package                | Role                                                                                 | Package-specific rule                      |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| `@bruff/game`          | Roguelike game logic — pure layered architecture (`core/state/input/render/effects`) | `packages/game/AGENTS.override.md`         |
| `@bruff/game-element`  | Imperative shell — Web Component base class that mounts the canvas                   | `packages/game-element/AGENTS.override.md` |
| `@bruff/arcade`        | E2E host — Vite app + Playwright tests across desktop/mobile browsers                | `packages/arcade/AGENTS.override.md`       |
| `@bruff/utils`         | Shared utilities: pure FP helpers plus shell-adjacent browser/logging services       | `packages/utils/AGENTS.override.md`        |
| `@bruff/eslint-config` | Shared ESLint flat config                                                            | (none — config-only package)               |

When working in a single package, also read its `README.md` for build/test commands and architectural role.

### 8 — Testing

Testing rules complement the `write-tests` skill (which covers file conventions and assertion style). The rules in this section are non-negotiable properties every test must satisfy.

- **T-1 (MUST)** Tests follow **FIRST principles**. Each is a defect if missing:
  - **F**ast — runs in milliseconds; slow tests get skipped and rot.
  - **I**ndependent — no shared state, no order dependency. Any test runs in isolation.
  - **R**epeatable — deterministic. Same input, same result, every machine, every run.
  - **S**elf-validating — boolean pass/fail with no human inspection of output.
  - **T**imely — written alongside (or before, per C-1) the code under test, never bolted on later.
- **T-2 (SHOULD)** Test bodies use **Given–When–Then** structure (or `// arrange`, `// act`, `// assert` comments) so a reader sees the setup, action, and expectation at a glance.
- **T-3 (MUST)** **Black-box testing** — assert against observable behaviour through the public API only. Never reach into private implementation, internal state shape, or call counts. A behaviour-preserving refactor must not require touching tests.
- **T-4 (MUST)** Canvas gameplay E2E tests are state-first. Use the deterministic `?test=1` browser API (`window.__bruffTestApi`) for simulation assertions; reserve screenshots for static DOM regions or frames frozen via `freezeForSnapshot()`.
