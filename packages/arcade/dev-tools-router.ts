import "@bruff/sigil";
import { registerQuiltElement } from "@bruff/quilt";

/**
 * TODO: Also use a register function for the sigil custom element
 */
registerQuiltElement();

/**
 * Arcade route variants supported by the dev tools router.
 */
export type ArcadeRoute = "game" | "tools" | "quilt";

/**
 * Custom element names mounted by the arcade app shell.
 */
type ArcadeElementName = "bruff-game" | "tool-sigil" | "tool-quilt";

const GAME_ROUTE: ArcadeRoute = "game";
const TOOLS_ROUTE: ArcadeRoute = "tools";
const QUILT_ROUTE: ArcadeRoute = "quilt";
const GAME_ELEMENT_NAME: ArcadeElementName = "bruff-game";
const TOOL_SIGIL_ELEMENT_NAME: ArcadeElementName = "tool-sigil";
const TOOL_QUILT_ELEMENT_NAME: ArcadeElementName = "tool-quilt";

/**
 * Maps a browser pathname to the arcade dev route.
 *
 * @param pathname - Current `window.location.pathname`
 * @returns The matching arcade route
 */
export const routePathname = (pathname: string): ArcadeRoute => {
  if (pathname === "/tools") {
    return TOOLS_ROUTE;
  }

  if (pathname === "/tools-map") {
    return QUILT_ROUTE;
  }

  return GAME_ROUTE;
};

/**
 * Maps an arcade route to the custom element mounted for that route.
 *
 * @param route - Arcade route
 * @returns The custom element name for the route
 */
const routeElementName = (route: ArcadeRoute): ArcadeElementName => {
  if (route === TOOLS_ROUTE) {
    return TOOL_SIGIL_ELEMENT_NAME;
  }

  if (route === QUILT_ROUTE) {
    return TOOL_QUILT_ELEMENT_NAME;
  }

  return GAME_ELEMENT_NAME;
};

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
