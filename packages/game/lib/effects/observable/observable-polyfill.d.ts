/**
 * Ambient declaration for the observable-polyfill `document.when()`
 * extension. The polyfill (loaded in `loop.ts` via `apply()`)
 * implements the WICG Observable proposal at runtime, adding
 * `Document.when(eventName)`. TypeScript's `lib.dom.d.ts` has no
 * entry for this method, so without this augmentation every call
 * site needs an `as any` cast.
 *
 * The file is a script (no top-level `import` / `export`), so the
 * `Document` interface merges directly into the global type. The
 * polyfill's `Observable` type is referenced via the inline
 * `import(…)` type expression so we still avoid duplicating the
 * pipeline interface here.
 *
 * Consumers of `keydown.ts` and `touch.ts` outside this package
 * (notably `@bruff/arcade`) pick the augmentation up through the
 * triple-slash reference at the top of those files — without it,
 * cross-project compilation does not load this declaration.
 */

interface Document {
  /**
   * Returns an `Observable` of DOM `Event`s for the given event
   * name. The returned observable supports the standard pipeline
   * operators (`filter`, `map`, `flatMap`, `take`).
   *
   * @param eventName - The DOM event type to listen for
   * @returns An observable that emits each matching event
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Inline `import()` type expression keeps this file a script, so its augmentation merges into the global Document interface automatically. A top-level `import type { Observable }` would turn the file into a module that requires explicit loading, breaking cross-project consumers (e.g. @bruff/arcade) that follow the import chain into this package's source.
  when(eventName: string): import("observable-polyfill/fn").Observable<Event>;
}
