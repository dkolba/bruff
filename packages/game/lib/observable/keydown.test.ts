import { apply, isSupported } from "observable-polyfill/fn";
import { describe, expect, it, vi } from "vitest";
import createKeyDownObservable from "./keydown.js";

if (!isSupported()) {
  apply();
}

describe("createKeyDownObservable", () => {
  it("should create an observable that emits the key of a keydown event", () => {
    const keyDown$ = createKeyDownObservable();
    const next = vi.fn();
    keyDown$.subscribe(next);

    const keyboardEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });
    document.dispatchEvent(keyboardEvent);

    expect(next).toHaveBeenCalledWith("ArrowUp");
  });
});
