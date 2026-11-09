const mountGameElement = (): void => {
  const element = document.createElement("bruff-game");
  const mountRoot = document.querySelector("#arcade-root");

  if (mountRoot instanceof HTMLElement) {
    const existingElement = mountRoot.querySelector("bruff-game");
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
    if (routePathname(location.pathname) !== "game") {
      mountDevRoute(location.pathname);
      return;
    }

    mountGameElement();
    await import("@bruff/game");
    return;
  }

  mountGameElement();
  await import("@bruff/game");
};

await mountApp();
