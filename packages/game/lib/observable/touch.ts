import { FIVE, ONE } from "../constants.js";
import { getCardinalDirection } from "../helpers/get-cardinal-direction.js";
import type { Observable } from "observable-polyfill/fn";

/**
 * Checks if an event is a touch event.
 *
 * @param event - The event to check
 * @returns True if the event is a KeyboardEvent
 */
const isTouchEvent = (event: Event): event is TouchEvent =>
  event instanceof TouchEvent;

/**
 * Creates an observable that emits cardinal directions for a single touch gesture.
 *
 * @param startEvent - The touchstart event
 * @param touchMove$ - Observable of touchmove events
 * @param touchEnd$ - Observable of touchend events
 * @returns Observable of cardinal direction strings or null
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
 * Creates an observable that emits cardinal directions based on touch gestures.
 *
 * @returns Observable that emits cardinal direction strings
 */
const createTouchObservable = (): Observable<string> => {
  /* eslint-disable @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

  // Without global augmentation, we must cast document as any to access 'when'
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

  return direction$.filter(
    (direction): direction is string => direction !== null,
  ) as any;
};

export default createTouchObservable;
