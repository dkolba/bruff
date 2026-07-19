/**
Browser globals needed to decide whether test mode is active.
*/
export type TestModeEnvironment = Readonly<{
  document?: Document;
  isBuildEnabled: boolean;
  window?: Window;
}>;

const hasTestModeQueryParameter = (testWindow?: Window): boolean => {
  if (testWindow === undefined) {
    return false;
  }

  const searchParameters = new URLSearchParams(testWindow.location.search);
  return searchParameters.has("test");
};

/**
Decides whether the current environment has enabled browser test mode.

@param environment - Browser globals and build-time test-mode flag
@returns Whether browser test mode is active
*/
export const isTestModeForEnvironment = ({
  document: testDocument,
  isBuildEnabled,
  window: testWindow,
}: TestModeEnvironment): boolean => {
  if (!isBuildEnabled) {
    return false;
  }

  if (hasTestModeQueryParameter(testWindow)) {
    return true;
  }

  if (testDocument === undefined) {
    return false;
  }

  const gameElement = testDocument.querySelector<HTMLElement>("bruff-game");
  return gameElement?.dataset["testMode"] === "true";
};

const isTestMode = (): boolean =>
  isTestModeForEnvironment({
    document,
    isBuildEnabled: __BRUFF_TEST_MODE__,
    // eslint-disable-next-line unicorn/no-unnecessary-global-this -- window property needed for type narrowing
    window: globalThis.window,
  });

export default isTestMode;
