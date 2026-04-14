import type { Observable } from "observable-polyfill/fn";

/**
 * Checks if an event is a keyboard event.
 *
 * @param event - The event to check
 * @returns True if the event is a KeyboardEvent
 */
const isKeyboardEvent = (event: Event): event is KeyboardEvent =>
  event instanceof KeyboardEvent;

/**
 * Creates an observable that emits the key name for each keydown event on the document.
 *
 * @returns Observable that emits a key name string for each keydown event
 */
const createKeyDownObservable = (): Observable<string> =>
  /* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion -- document.when() is part of the WICG Observable API proposal; TypeScript types do not yet cover this interface */
  (document as any)
    .when("keydown")
    .filter((event: Event): event is KeyboardEvent => isKeyboardEvent(event))
    .map((keyDownEvent: any) => keyDownEvent.key) as any;
/* eslint-enable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */

export default createKeyDownObservable;
