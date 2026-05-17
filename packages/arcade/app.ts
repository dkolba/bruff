type AppElementName = "bruff-game";

const mountElement = (elementName: AppElementName): void => {
  const element = document.createElement(elementName);
  const mountRoot = document.querySelector("#arcade-root");

  if (mountRoot instanceof HTMLElement) {
    const existingElement = mountRoot.querySelector(elementName);
    if (existingElement instanceof HTMLElement) {
      return;
    }

    mountRoot.replaceChildren(element);
    return;
  }

  document.body.replaceChildren(element);
};

const mountApp = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    const { mountDevRoute, routePathname } =
      await import("./dev-tools-router.js");
    if (routePathname(globalThis.location.pathname) === "tools") {
      mountDevRoute(globalThis.location.pathname);
      return;
    }

    mountElement("bruff-game");
    await import("@bruff/game");
    return;
  }

  mountElement("bruff-game");
  await import("@bruff/game");
};

await mountApp();
