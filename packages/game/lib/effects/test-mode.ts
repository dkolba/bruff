const hasTestModeQueryParameter = (): boolean => {
  if (globalThis.window === undefined) {
    return false;
  }

  const searchParameters = new URLSearchParams(
    globalThis.window.location.search,
  );
  return searchParameters.has("test");
};

const hasTestModeDataAttribute = (): boolean => {
  if (globalThis.document === undefined) {
    return false;
  }

  const gameElement =
    globalThis.document.querySelector<HTMLElement>("bruff-game");
  // eslint-disable-next-line dot-notation -- TS4111 requires indexed access for index-signature-backed DOMStringMap keys.
  return gameElement?.dataset["testMode"] === "true";
};

const isTestMode = (): boolean =>
  __BRUFF_TEST_MODE__ &&
  (hasTestModeQueryParameter() || hasTestModeDataAttribute());

export default isTestMode;
