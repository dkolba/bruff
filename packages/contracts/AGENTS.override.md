# `@bruff/contracts`

This package contains shared runtime object and type contracts.

- **Language**: **TypeScript**.
- **Purpose**: To house Zod schemas, inferred readonly types, and pure parser helpers for shapes shared across package boundaries.
- **Typing**: While using `.ts` files, all public type information **must be declared using TSDoc annotations**.
- **Style**: Must adhere to the "double quotes" and "two-space indentation" rule.

## Package Boundary

- **C-1 (MUST)** The root export is universal and must be safe to import in Node.js and browsers.
- **C-2 (MUST)** Do not import DOM, Canvas, Vite app, CLI, game shell, or browser-global APIs.
- **C-3 (MUST)** Do not migrate existing workspace packages to consume `@bruff/contracts` unless that migration is the explicit task.
- **C-4 (MUST)** Export schemas and inferred types from the same source module.

## Contract Rules

- **C-5 (MUST)** Runtime contracts are declared with Zod schemas.
- **C-6 (MUST)** Parser helpers accept `unknown` input and return `Result<T, E>` from `@bruff/utils`.
- **C-7 (MUST)** Parser helpers use non-throwing Zod APIs such as `safeParse`.
- **C-8 (MUST)** Parse failures are explicit typed values with a reason code and relevant Zod issues.
- **C-9 (MUST)** Shared exported types are readonly.
- **C-10 (MUST)** Future contract IDs use branded ID types.
