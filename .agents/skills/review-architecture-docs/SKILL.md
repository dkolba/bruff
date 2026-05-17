---
name: review-architecture-docs
description: Audit and update durable architecture guidance after a cross-layer implementation, file move, package boundary change, coverage config change, or SDTE feature. Use when Codex needs to reconcile AGENTS.md, package AGENTS.override.md files, local .agents/skills, older specs, dynamic imports, and test or coverage configuration with the architecture that was actually implemented.
---

# Review Architecture Docs

Use this after implementation changes the canonical shape of the codebase, especially when work:

- moves files or public module paths;
- changes layer responsibilities;
- introduces or retires an architectural boundary;
- updates test, coverage, or build configuration;
- completes an SDTE feature whose design should become durable project guidance.

## Workflow

1. **Collect the implemented facts**
   - Read the changed source files and tests, not just specs.
   - Identify new canonical module paths, public functions, layer ownership, test ownership, and config paths.
   - Note any pre-existing dirty worktree changes and do not revert them.

2. **Audit durable guidance**
   - Root `AGENTS.md`.
   - Every `packages/*/AGENTS.override.md`.
   - Every local `.agents/skills/*/SKILL.md`.
   - Older specs that mention moved files, old boundaries, or retired plans.
   - Config files whose paths mirror source structure, such as coverage includes/excludes, lint boundaries, build entry points, and dynamic imports.

3. **Search for drift**
   - Use `rg` for old path fragments, old function names, and old architectural claims.
   - Search both exact paths and conceptual terms. Example: after render-command work, search `render`, `RenderCommand`, `Canvas`, `RenderStats`, `effects/render`, and old file paths.
   - Treat older specs as historical records unless they are actively misleading future work. Prefer brief corrections over rewriting history.

4. **Patch only durable guidance**
   - Update rules and skills that future agents must follow.
   - Keep wording implementation-shaped: name the real files, functions, and layer boundary.
   - Do not duplicate detailed design docs in skills; keep skills procedural.
   - Avoid broad refactors or unrelated cleanup.

5. **Verify**
   - Run `npm run ok` when repo-wide instructions, skills, package rules, or config changed.
   - If only markdown outside package formatting changed and the repo gate is too costly, run the nearest documented formatter/gate and state the limitation.

## Checklist

- [ ] Root and package AGENTS files match the implemented layer ownership.
- [ ] Relevant local skills describe the current file paths and workflow.
- [ ] Older specs no longer point future work at removed or renamed files.
- [ ] Dynamic imports still resolve after file moves.
- [ ] Coverage, lint, typecheck, and build config paths match the current tree.
- [ ] Tests mentioned by docs actually exist.
- [ ] Verification command was run and reported.

## Output

Summarize:

- files updated;
- stale guidance removed or corrected;
- guidance reviewed but left unchanged;
- verification run;
- any dirty worktree changes that pre-existed or were intentionally left untouched.
