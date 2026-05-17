import "@bruff/sigil";

/** Arcade route variants supported by the dev tools router. */
export type ArcadeRoute = "game" | "tools";

/** Custom element names mounted by the arcade app shell. */
export type ArcadeElementName = "bruff-game" | "tool-sigil";

const GAME_ROUTE: ArcadeRoute = "game";
const TOOLS_ROUTE: ArcadeRoute = "tools";
const GAME_ELEMENT_NAME: ArcadeElementName = "bruff-game";
const TOOL_SIGIL_ELEMENT_NAME: ArcadeElementName = "tool-sigil";

/**
 * Maps a browser pathname to the arcade dev route.
 *
 * @param pathname - Current `window.location.pathname`
 * @returns The matching arcade route
 */
export const routePathname = (pathname: string): ArcadeRoute =>
  pathname === "/tools" ? TOOLS_ROUTE : GAME_ROUTE;

/**
 * Maps an arcade route to the custom element mounted for that route.
 *
 * @param route - Arcade route
 * @returns The custom element name for the route
 */
export const routeElementName = (route: ArcadeRoute): ArcadeElementName =>
  route === TOOLS_ROUTE ? TOOL_SIGIL_ELEMENT_NAME : GAME_ELEMENT_NAME;

const findMountRoot = (): HTMLElement => {
  const mountRoot = document.querySelector("#arcade-root");
  return mountRoot instanceof HTMLElement ? mountRoot : document.body;
};

const mountElement = (elementName: ArcadeElementName): void => {
  const mountRoot = findMountRoot();
  const existingElement = mountRoot.querySelector(elementName);
  if (existingElement instanceof HTMLElement) {
    return;
  }

  mountRoot.replaceChildren(document.createElement(elementName));
};

/**
 * Mounts the current dev route into the arcade host document.
 *
 * @param pathname - Current `window.location.pathname`
 * @returns Nothing
 */
export const mountDevRoute = (pathname: string): void => {
  mountElement(routeElementName(routePathname(pathname)));
};
