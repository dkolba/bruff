import { getCardinalDirection, isSome } from "@bruff/utils";
import type { Observable } from "observable-polyfill/fn";

import type { InputAction } from "../../core/actions.ts";
import { FIVE, ONE } from "../../core/constants.js";
import { normaliseKey } from "../../input/normalise-input.js";

/** !TODO:
This file is currently not included in coverage, because Playwright does not 
provide a clean touch interface
*/

/**
Checks if an event is a touch event.

@param event - The event to check
@returns True if the event is a KeyboardEvent
*/
const isTouchEvent = (event: Event): event is TouchEvent =>
  event instanceof TouchEvent;

/**
Creates an observable that emits cardinal directions for a single touch gesture.

@param startEvent - The touchstart event
@param touchMove$ - Observable of touchmove events
@param touchEnd$ - Observable of touchend events
@returns Observable of cardinal direction strings or null
*/
const createTouchDirectionObservable = (
  startEvent: TouchEvent,
  touchMove$: Observable<TouchEvent>,
  touchEnd$: Observable<TouchEvent>,
): Observable<string | null> | Array<never> => {
  const [startTouch] = startEvent.touches;
  if (startTouch === undefined) {
    return [];
  }
  let lastTouch = startTouch;
  const controller = new AbortController();
  const { signal } = controller;

  touchMove$.subscribe(
    (event: TouchEvent) => {
      const [touch] = event.touches;
      if (touch !== undefined) {
        lastTouch = touch;
      }
    },
    { signal },
  );

  return touchEnd$.take(ONE).map((): string | null => {
    controller.abort();
    const dx = lastTouch.clientX - startTouch.clientX;
    const dy = lastTouch.clientY - startTouch.clientY;
    if (Math.abs(dx) < FIVE && Math.abs(dy) < FIVE) {
      return null;
    }
    return getCardinalDirection(dx, dy);
  });
};

/**
Creates an observable that emits a normalised {@link InputAction}
for each completed touch gesture. The cardinal direction produced
by the gesture is run through `normaliseKey`; gestures that don't
map to a known direction are silently dropped.

@returns Observable that emits one `InputAction` per recognised swipe
*/
const createTouchObservable = (): Observable<InputAction> => {
  /* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return -- !TODO remove type casts - document.when() is part of the WICG Observable API proposal; TypeScript types do not yet cover this interface */
  const touchStart$ = (document as any)
    .when("touchstart")
    .filter((event: Event): event is TouchEvent =>
      isTouchEvent(event),
    ) as Observable<TouchEvent>;
  const touchMove$ = (document as any)
    .when("touchmove")
    .filter((event: Event): event is TouchEvent =>
      isTouchEvent(event),
    ) as Observable<TouchEvent>;
  const touchEnd$ = (document as any)
    .when("touchend")
    .filter((event: Event): event is TouchEvent =>
      isTouchEvent(event),
    ) as Observable<TouchEvent>;

  const direction$ = touchStart$.flatMap((startEvent: TouchEvent) =>
    createTouchDirectionObservable(startEvent, touchMove$, touchEnd$),
  );

  return direction$
    .filter((direction): direction is string => direction !== null)
    .map((direction: string) => normaliseKey(direction))
    .filter(isSome)
    .map((option: any) => option.value) as Observable<InputAction>;
  /* eslint-enable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- !TODO remove type casts */
};

export default createTouchObservable;
