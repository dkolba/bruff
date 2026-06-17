import { apply, isSupported } from "observable-polyfill/fn";
import { describe, expect, it, vi } from "vitest";

import createKeyDownObservable from "./keydown.js";

if (!isSupported()) {
  apply();
}

describe("createKeyDownObservable", () => {
  it("emits a normalised InputAction for a recognised keydown event", () => {
    const keyDown$ = createKeyDownObservable();
    const next = vi.fn();
    keyDown$.subscribe(next);

    const keyboardEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });
    document.dispatchEvent(keyboardEvent);

    expect(next).toHaveBeenCalledWith({ type: "move-up" });
  });

  it("ignores non-keyboard keydown events", () => {
    const keyDown$ = createKeyDownObservable();
    const next = vi.fn();
    keyDown$.subscribe(next);

    document.dispatchEvent(new Event("keydown"));

    expect(next).not.toHaveBeenCalled();
  });
});
