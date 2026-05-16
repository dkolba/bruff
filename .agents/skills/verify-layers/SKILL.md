---
name: verify-layers
description: Audit import dependencies in packages/game to verify they comply with the layered architecture rules
---

# Verify Layers

Use when you want to audit or enforce the layered architecture dependency rules before committing.

## Dependency Rules

```
core/       — zero imports (fully dependency-free)
state/      — imports core/ only
input/      — imports core/ + state/ only
render/     — imports core/ + state/ only
effects/    — shell wiring over core/state/input/render plus allowed workspace utilities
```

No circular dependencies. No upward dependencies (e.g. `core/` must never import from `state/`).

`@bruff/utils` imports are allowed from any layer for shared pure helpers and types. `log()` from `@bruff/utils` is shell-only: it may be imported by `effects/` or the entry point, but not by `core/`, `state/`, `input/`, or `render/`. Production code should not call `console.*` directly; console forwarding is handled by the logging event bus sink.

## How to Run

Search `packages/game/lib/` (and sub-directories) for import violations:

```bash
# Check that core files import nothing from the project
grep -rn "from \"\.\." packages/game/lib/core/

# Check inner layers for upward imports
rg 'from "\\.\\.' packages/game/lib/state packages/game/lib/render packages/game/lib/input

# Check for circular dependencies using madge (if available)
npx madge --circular packages/game/lib/
```

## What to Report

For each violation found, report:

- **File**: the file containing the bad import
- **Import**: the offending import path
- **Rule broken**: which dependency rule it violates
- **Fix**: move the dependency to the correct layer or invert it

## Checklist

- [ ] No file in `core/` imports from any project path
- [ ] No file in `state/` imports from `input/`, `render/`, or `effects/`
- [ ] No file in `core/`, `state/`, `input/`, or `render/` imports `log` from `@bruff/utils`
- [ ] `render/project-render-commands.ts` projects `GameState` to `RenderCommand` values without DOM or Canvas access
- [ ] Foreground Canvas command execution is centralized in `effects/execute-render-command.ts`
- [ ] `effects/clock.ts` is the only production file that reads `performance.now()`
- [ ] `window.__bruffTestApi` is attached only behind the `__BRUFF_TEST_MODE__` / `isTestMode()` gate
- [ ] No production file calls `console.*` outside the event-bus console sink
- [ ] No circular imports anywhere
- [ ] All `@bruff/utils` imports are allowed from any layer
- [ ] All external package imports are only in the shell (`effects/`, entry point)
