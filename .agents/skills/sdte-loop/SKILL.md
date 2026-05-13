---
name: sdte-loop
description: Run the Spec → Design → Tasks → Execution workflow for non-trivial work — produces /specs/<feature>/{spec,design,tasks}.md, drives atomic per-task execution, and ends with a Review phase. Invoke when starting a new package, new game system, GameState shape change, or any change touching > 3 files or crossing a layer boundary.
---

# Spec → Design → Tasks → Execution (SDTE) Loop

A pure-markdown workflow for non-trivial work. Every multi-file feature progresses through four sequential phases — **Spec**, **Design**, **Tasks**, **Execution** — plus a final **Review**. All artifacts live in `/specs/<feature-name>/` inside the repo and are committed alongside code so the workflow is fully Git-native and auditable.

## When SDTE applies

- **S-1 (MUST)** Use SDTE for any work that introduces a new package, introduces a new game system (e.g. combat, FOV, inventory), modifies `GameState` shape or `stateVersion`, touches more than three source files, or crosses a layer boundary.
- **S-2 (SHOULD NOT)** Use SDTE for trivial work: typo fixes, dependency bumps, single-file refactors, formatting passes.
- **S-3 (MUST)** When SDTE applies, do not begin implementation until `tasks.md` exists with at least one atomic task ready to execute.

## Artifacts

Each feature owns a folder `/specs/<kebab-feature-name>/` containing:

| File             | Required | Purpose                                                              |
| ---------------- | -------- | -------------------------------------------------------------------- |
| `spec.md`        | yes      | What is being built and why. The intent contract.                    |
| `design.md`      | yes      | How it will be built. Architecture, tradeoffs, layer assignment.     |
| `tasks.md`       | yes      | Atomic, independently executable steps as a checkbox list.           |
| `constraints.md` | optional | Non-negotiables — perf budgets, API constraints, dependency limits.  |
| `acceptance.md`  | optional | Verifiable acceptance criteria with concrete examples or test cases. |

- **S-4 (MUST)** All artifacts are committed to the repo as work progresses — they are part of the deliverable, not throwaway notes.
- **S-5 (MUST)** All files are plain Markdown, no YAML frontmatter.
- **S-6 (SHOULD)** Add `constraints.md` whenever performance, dependency, or API-shape rules apply to the feature; add `acceptance.md` whenever the spec is testable as concrete examples.

## Spec phase (the _what & why_)

`spec.md` answers what is being built and why. It must contain:

- **Goal** — one paragraph describing the user-visible outcome.
- **User-visible behaviour** — bullet list of observable changes.
- **Out of scope** — explicit non-goals to prevent drift.
- **Open questions** — anything ambiguous, all resolved before Design begins.
- **Edge cases** — boundary conditions, error states, unusual inputs.

Workflow:

- **S-7 (MUST)** Walk the spec as a fresh reader and surface every ambiguity, missing constraint, or uncovered edge case. Resolve each by editing `spec.md` directly — never carry an open question into Design.
- **S-8 (SHOULD NOT)** Make implementation decisions in `spec.md`; those belong in `design.md`. If you find yourself describing data structures or function signatures, you have crossed into Design territory.

## Design phase (the _how_)

`design.md` answers how the spec will be implemented. It must contain:

- **Layer assignment** for every new module (per the package's layer rules).
- **Public API surface** — function signatures, types, exported names.
- **Data shape changes** — `GameState` deltas, new action variants, branded ID types.
- **Tradeoffs** — chosen approach plus at least one alternative considered, with reasoning.
- **Reuse map** — existing functions and modules to leverage, referenced by file path.

Workflow:

- **S-9 (MUST)** Every architectural decision lists at least one alternative considered (BP-3 applied at design level).
- **S-10 (MUST)** Reference existing functions and modules by file path so reuse is explicit (reinforces O-3).
- **S-11 (SHOULD)** Inline a small ASCII diagram or table whenever more than two modules collaborate; readers must be able to see the data flow without opening multiple files.
- **S-12 (MUST)** The design must respect the package's layer rules. If a feature appears to need an upward dependency, the design is wrong — fix the design, not the rules.

## Task breakdown (the _atomic steps_)

`tasks.md` is an ordered checkbox list of atomic, independently executable steps.

Format:

```md
- [ ] T1 — Add `Direction` branded type to `core/types.ts`
- [ ] T2 — Implement `moveEntity(state, action)` reducer in `state/move.ts`
- [ ] T3 — Add unit tests for `moveEntity` covering boundary clamping
- [ ] T4 — Wire `MOVE_ENTITY` variant into root pipeline in `effects/loop.ts`
```

Rules:

- **S-13 (MUST)** Every task is small enough to compile, lint, and test on its own.
- **S-14 (MUST)** Tasks are imperative verbs ("Add", "Implement", "Wire", "Refactor"), never vague nouns.
- **S-15 (MUST)** Each task names the file(s) it touches or creates so scope is unambiguous.
- **S-16 (SHOULD NOT)** Bundle "implement + test" into one task — separate them so test failures fail loudly and the diff stays minimal.
- **S-17 (MUST)** Reject any task whose name contains "system", "feature", or "support" — those are project-level descriptors, not atomic steps. Decompose further.
- **S-18 (MUST)** Tasks are numbered sequentially (T1, T2, …) so they can be referenced from commits and PR descriptions.

## Execution loop

The execution rule is one sentence repeated until done:

> **Execute the next unchecked task in `tasks.md`. Mark it complete (`[x]`) only when the code compiles, tests pass, and the change is staged. Update `tasks.md` in the same commit.**

Rules:

- **S-19 (MUST)** Pick the topmost unchecked task. Do not reorder mid-flight.
- **S-20 (MUST)** Every executed task ends in a green `pnpm run ok` for the affected package(s) before being checked off.
- **S-21 (MUST)** If a task uncovers a missing or incorrect design decision, stop, edit `design.md` and `tasks.md` to reflect the new understanding, then resume — never silently widen scope.
- **S-22 (MUST)** Mark tasks `[x]` in the same commit that implements them. Unchecked completed work is treated as not done; checked uncommitted work is a lie.
- **S-23 (SHOULD)** Use one Conventional Commit per task (per GH-1). Reference the task ID in the commit body, e.g. `Implements T2`.

## Review phase

After every task is checked off:

- **S-24 (MUST)** Walk `spec.md` (and `acceptance.md` if present) and verify each behaviour is actually implemented. Append a `## Verification` section to `spec.md` recording how each requirement was tested.
- **S-25 (MUST)** Reconcile drift: if `design.md` no longer describes the implementation, update it before the feature is closed.
- **S-26 (SHOULD)** Open the PR with a one-paragraph summary linking to `/specs/<feature-name>/spec.md` so reviewers start with the same context.

## Anti-patterns

- **Coarse tasks** — "Build authentication" is a feature, not a task. Decompose until each item is verifiable in isolation.
- **Imprecise spec** — vague specs cause Codex to fill gaps with assumptions, sometimes incorrectly. Tighten the spec until ambiguities surface as explicit open questions, then resolve them before moving on.
- **Skipped completion tracking** — `tasks.md` is the source of truth. If it disagrees with reality (work done but unchecked, or checked but uncommitted), the workflow has failed and the run is not auditable.
- **Acceptance written after the fact** — `acceptance.md` written _after_ implementation is theatre. Write it during Spec or Design while the requirements are still fresh.
- **Big-bang execution** — completing many tasks in one commit destroys the audit trail and makes it hard to revert one without reverting all. One task = one verifiable commit.
