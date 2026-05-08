import type { InputAction } from "../../core/actions.ts";
import { isSome } from "@bruff/utils";
import { normaliseKey } from "../../input/normalise-input.js";
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
 * Creates an observable that emits a normalised {@link InputAction}
 * for each `keydown` event whose key has a known mapping. Unknown
 * keys are silently dropped (no action emitted).
 *
 * @returns Observable that emits one `InputAction` per recognised keydown
 */
const createKeyDownObservable = (): Observable<InputAction> =>
  /* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion -- document.when() is part of the WICG Observable API proposal; TypeScript types do not yet cover this interface */
  (document as any)
    .when("keydown")
    .filter((event: Event): event is KeyboardEvent => isKeyboardEvent(event))
    .map((keyDownEvent: any) => normaliseKey(keyDownEvent.key))
    .filter(isSome)
    .map((option: any) => option.value) as any;
/* eslint-enable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unnecessary-type-assertion */

export default createKeyDownObservable;
