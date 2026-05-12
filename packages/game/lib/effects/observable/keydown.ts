// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- Ambient .d.ts that script-mode-augments the global `Document`; loaded via triple-slash so cross-project consumers (e.g. @bruff/arcade) pick up the augmentation through the import chain without having to list the .d.ts in their own tsconfig include.
/// <reference path="./observable-polyfill.d.ts" />
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
  document
    .when("keydown")
    .filter(isKeyboardEvent)
    .map((event) => normaliseKey(event.key))
    .filter(isSome)
    .map((option) => option.value);

export default createKeyDownObservable;
