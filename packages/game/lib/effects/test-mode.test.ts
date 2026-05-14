import { describe, expect, it } from "vitest";
import isTestMode from "./test-mode.js";

describe("isTestMode", () => {
  it("returns true when the test query parameter is present", (): void => {
    globalThis.window.history.replaceState({}, "", "?test=1");

    expect(isTestMode()).toBe(true);
  });

  it("returns true when bruff-game has data-test-mode=true", (): void => {
    globalThis.window.history.replaceState({}, "", "/");
    const gameElement = document.createElement("bruff-game");
    // eslint-disable-next-line dot-notation -- TS4111 requires indexed access for index-signature-backed DOMStringMap keys.
    gameElement.dataset["testMode"] = "true";
    document.body.append(gameElement);

    expect(isTestMode()).toBe(true);

    gameElement.remove();
  });

  it("returns false when test mode is not enabled", (): void => {
    globalThis.window.history.replaceState({}, "", "/");

    expect(isTestMode()).toBe(false);
  });
});
