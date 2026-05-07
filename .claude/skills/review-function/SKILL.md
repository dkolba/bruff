---
name: review-function
description: Review or evaluate a specific function for quality, complexity, naming, testability, and hidden dependencies. Use after writing or before extracting a function. Ends with a recommendation to keep, refactor, or rename.
---

# Reviewing a Function

When evaluating whether a function you implemented is good or not, walk this checklist in order. Stop at the first item that returns "yes — leave it alone."

1. **Readability** — Can you read the function and HONESTLY easily follow what it's doing? If yes, then **stop here**.
2. **Cyclomatic complexity** — Does the function have very high cyclomatic complexity? (Number of independent paths, or as a proxy, the depth of nested `if`/`else`.) If it does, it's probably sketchy.
3. **Data structures** — Are there any common data structures and algorithms that would make this function much easier to follow and more robust? Parsers, trees, stacks/queues, etc.
4. **Unused parameters** — Are there any unused parameters?
5. **Type casts** — Are there any unnecessary type casts that can be moved to function arguments?
6. **Testability** — Is the function easily testable without mocking core features (SQL queries, Redis, etc.)? If not, can it be tested as part of an integration test?
7. **Hidden dependencies** — Does it have any hidden untested dependencies, or any values that can be factored out into the arguments instead? Only care about non-trivial dependencies that can actually change or affect the function.
8. **Naming** — Brainstorm 3 better function names and see if the current name is the best, consistent with the rest of the codebase.

## When NOT to extract a function

You SHOULD NOT refactor out a separate function unless there is a compelling need, such as:

- The refactored function is used in **more than one place**, OR
- The refactored function is **easily unit testable** while the original function is not, AND you can't test it any other way, OR
- The original function is **extremely hard to follow** and you find yourself putting comments everywhere just to explain it.

Premature extraction creates noise and indirection without a payoff. Three similar lines is better than a premature abstraction (per O-7).

## Output

End the review with one of:

- **Keep** — function is fine; document why if non-obvious.
- **Rename to `<x>`** — naming is the only issue.
- **Refactor** — describe the specific change (split, inline, replace with `pipe`, etc.) and the reason.
