/**
 * Ambient declaration for the observable-polyfill `document.when()`
 * extension. The polyfill (loaded in `loop.ts` via `apply()`)
 * implements the WICG Observable proposal at runtime, adding
 * `Document.when(eventName)`. TypeScript's `lib.dom.d.ts` has no
 * entry for this method, so without this augmentation every call
 * site needs an `as any` cast (see the wide eslint-disable blocks
 * in `keydown.ts` and `touch.ts` before T49).
 *
 * Re-imports the polyfill's `Observable` type so the global
 * augmentation does not introduce a fresh, unrelated `Observable`
 * symbol.
 */
import type { Observable } from "observable-polyfill/fn";

declare global {
  interface Document {
    /**
     * Returns an {@link Observable} of DOM `Event`s for the given
     * event name. The returned observable supports the standard
     * pipeline operators (`filter`, `map`, `flatMap`, `take`).
     *
     * @param eventName - The DOM event type to listen for
     * @returns An observable that emits each matching event
     */
    when(eventName: string): Observable<Event>;
  }
}

// eslint-disable-next-line unicorn/require-module-specifiers -- A bare `export {}` is the canonical way to mark an ambient `.d.ts` as a module so the top-level `import type` is valid; there is no symbol to export.
export {};
