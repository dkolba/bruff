import type { Observable } from "observable-polyfill/fn";

/**
 * Checks if an event is a keyboard event.
 *
 * @param event - The event to check
 * @returns True if the event is a KeyboardEvent
 */
const isKeyboardEvent = (event: Event): event is KeyboardEvent =>
  event instanceof KeyboardEvent;

const createKeyDownObservable = (): Observable<string> =>
  /* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */
  (document as any)
    .when("keydown")
    .filter((event: Event): event is KeyboardEvent => isKeyboardEvent(event))
    .map((keyDownEvent: any) => keyDownEvent.key) as any;

export default createKeyDownObservable;
