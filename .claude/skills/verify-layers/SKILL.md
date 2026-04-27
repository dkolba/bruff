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
assets/     — imports core/ + state/ only
effects/    — imports core/ + state/ only
```

No circular dependencies. No upward dependencies (e.g. `core/` must never import from `state/`).

## How to Run

Search `packages/game/lib/` (and sub-directories) for import violations:

```bash
# Check that core files import nothing from the project
grep -rn "from \"\.\." packages/game/lib/core/

# Check state files import only from core
grep -rn "from \"\.\." packages/game/lib/state/ | grep -v "/core/"

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
- [ ] No file in `state/` imports from `input/`, `render/`, `assets/`, or `effects/`
- [ ] No circular imports anywhere
- [ ] All `@bruff/utils` imports are allowed from any layer
- [ ] All external package imports are only in the shell (`effects/`, entry point)
