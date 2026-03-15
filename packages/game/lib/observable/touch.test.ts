import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apply, isSupported } from "observable-polyfill/fn";
import createTouchObservable from "./touch.js";
import { getCardinalDirection } from "../helpers/get-cardinal-direction.js";

if (!isSupported()) {
  apply();
}

vi.mock("../helpers/get-cardinal-direction.js", () => ({
  getCardinalDirection: vi.fn(),
}));

const ZERO = 0;
const NEGATIVE_FORTY = -40;

const isSafariNotChrome = (userAgent: string) =>
  userAgent.includes("Safari") && !userAgent.includes("HeadlessChrome");

const unsupportedBrowsers =
  navigator.userAgent.includes("Firefox") ||
  isSafariNotChrome(navigator.userAgent);

const createTouchEventStart = (xPos: number, yPos: number) =>
  new TouchEvent("touchstart", {
    touches: [
      new Touch({
        clientX: xPos,
        clientY: yPos,
        identifier: 1,
        target: document.body,
      }),
    ],
  });

const createTouchEventMove = (xPos: number, yPos: number) =>
  new TouchEvent("touchmove", {
    touches: [
      new Touch({
        clientX: xPos,
        clientY: yPos,
        identifier: 1,
        target: document.body,
      }),
    ],
  });

const createTouchEventEnd = (xPos: number, yPos: number) =>
  new TouchEvent("touchend", {
    changedTouches: [
      new Touch({
        clientX: xPos,
        clientY: yPos,
        identifier: 1,
        target: document.body,
      }),
    ],
  });

const simulateTouchGesture = (
  start: { xPos: number; yPos: number },
  move: { xPos: number; yPos: number },
  end: { xPos: number; yPos: number },
) => {
  const startEvent = createTouchEventStart(start.xPos, start.yPos);
  document.dispatchEvent(startEvent);

  const moveEvent = createTouchEventMove(move.xPos, move.yPos);
  document.dispatchEvent(moveEvent);

  const endEvent = createTouchEventEnd(end.xPos, end.yPos);
  document.dispatchEvent(endEvent);
};

const simulateTouchMoveWithNoTouches = (
  start: { xPos: number; yPos: number },
  end: { xPos: number; yPos: number },
) => {
  const startEvent = createTouchEventStart(start.xPos, start.yPos);
  document.dispatchEvent(startEvent);

  const moveEvent = new TouchEvent("touchmove", {
    touches: [],
  });
  document.dispatchEvent(moveEvent);

  const endEvent = createTouchEventEnd(end.xPos, end.yPos);
  document.dispatchEvent(endEvent);
};

describe.skipIf(unsupportedBrowsers)("createTouchObservable", () => {
  beforeEach(() => {
    vi.mocked(getCardinalDirection).mockReturnValue("north");
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  it("should create an observable for touch gestures", () => {
    const direction$ = createTouchObservable();
    const next = vi.fn();
    direction$.subscribe(next);

    simulateTouchGesture(
      { xPos: 10, yPos: 50 },
      { xPos: 10, yPos: 10 },
      { xPos: 10, yPos: 10 },
    );

    expect(getCardinalDirection).toHaveBeenCalledWith(ZERO, NEGATIVE_FORTY);
    expect(next).toHaveBeenCalledWith("north");
  });
});

describe.skipIf(unsupportedBrowsers)("createTouchObservable Edge Cases", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  it("should not emit a direction for small movements", () => {
    const direction$ = createTouchObservable();
    const next = vi.fn();
    direction$.subscribe(next);

    simulateTouchGesture(
      { xPos: 10, yPos: 10 },
      { xPos: 11, yPos: 11 },
      { xPos: 11, yPos: 11 },
    );

    expect(getCardinalDirection).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
  it("should handle touchmove events with no touches", () => {
    const direction$ = createTouchObservable();
    const next = vi.fn();
    direction$.subscribe(next);

    simulateTouchMoveWithNoTouches(
      { xPos: 10, yPos: 50 },
      { xPos: 10, yPos: 10 },
    );

    expect(next).not.toHaveBeenCalled();
    expect(getCardinalDirection).not.toHaveBeenCalled();
  });
  it("should not emit if touchstart has no touches", () => {
    const direction$ = createTouchObservable();
    const next = vi.fn();
    direction$.subscribe({ next });

    const startEvent = new TouchEvent("touchstart", {
      touches: [],
    });
    document.dispatchEvent(startEvent);

    expect(next).not.toHaveBeenCalled();
  });
});
