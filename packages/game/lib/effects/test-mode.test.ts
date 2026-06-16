import { afterEach, describe, expect, it } from "vitest";
import isTestMode, { isTestModeForEnvironment } from "./test-mode.js";

afterEach(() => {
  document.body.innerHTML = "";
  globalThis.window.history.replaceState({}, "", "/");
});

describe("isTestMode", () => {
  it("returns true when the test query parameter is present", (): void => {
    globalThis.window.history.replaceState({}, "", "?test=1");

    expect(isTestMode()).toBe(true);
  });

  it("returns true when bruff-game has data-test-mode=true", (): void => {
    globalThis.window.history.replaceState({}, "", "/");
    const gameElement = document.createElement("bruff-game");
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

describe("isTestModeForEnvironment", () => {
  it("returns false when the build flag is disabled", (): void => {
    globalThis.window.history.replaceState({}, "", "?test=1");

    expect(
      isTestModeForEnvironment({
        document,
        isBuildEnabled: false,
        window: globalThis.window,
      }),
    ).toBe(false);
  });

  it("returns false without window or document globals", (): void => {
    expect(
      isTestModeForEnvironment({
        isBuildEnabled: true,
      }),
    ).toBe(false);
  });

  it("returns false without a document global", (): void => {
    globalThis.window.history.replaceState({}, "", "/");

    expect(
      isTestModeForEnvironment({
        isBuildEnabled: true,
        window: globalThis.window,
      }),
    ).toBe(false);
  });

  it("uses the data attribute without a window global", (): void => {
    const testDocument = document.implementation.createHTMLDocument();
    const gameElement = testDocument.createElement("bruff-game");
    gameElement.dataset["testMode"] = "true";
    testDocument.body.append(gameElement);

    expect(
      isTestModeForEnvironment({
        document: testDocument,
        isBuildEnabled: true,
      }),
    ).toBe(true);
  });
});
