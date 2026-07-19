import { afterEach, describe, expect, it } from "vitest";

import isTestMode, { isTestModeForEnvironment } from "./test-mode.js";

afterEach(() => {
  document.body.innerHTML = "";
  history.replaceState({}, "", "/");
});

describe("isTestMode", () => {
  it("returns true when the test query parameter is present", (): void => {
    history.replaceState({}, "", "?test=1");

    expect(isTestMode()).toBe(true);
  });

  it("returns true when bruff-game has data-test-mode=true", (): void => {
    history.replaceState({}, "", "/");
    const gameElement = document.createElement("bruff-game");
    gameElement.dataset["testMode"] = "true";
    document.body.append(gameElement);

    expect(isTestMode()).toBe(true);

    gameElement.remove();
  });

  it("returns false when test mode is not enabled", (): void => {
    history.replaceState({}, "", "/");

    expect(isTestMode()).toBe(false);
  });
});

describe("isTestModeForEnvironment", () => {
  it("returns false when the build flag is disabled", (): void => {
    history.replaceState({}, "", "?test=1");

    expect(
      isTestModeForEnvironment({
        document,
        isBuildEnabled: false,
        // eslint-disable-next-line unicorn/no-unnecessary-global-this -- window property needed for type narrowing
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
    history.replaceState({}, "", "/");

    expect(
      isTestModeForEnvironment({
        isBuildEnabled: true,
        // eslint-disable-next-line unicorn/no-unnecessary-global-this -- window property needed for type narrowing
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
