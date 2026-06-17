import { log } from "@bruff/utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GameElement } from "./game-element.js";

const SINGLE_CALL = 1;
const createGameElement = (): GameElement => {
  const element = document.createElement("bruff-game");
  if (!(element instanceof GameElement)) {
    throw new TypeError("Failed to create GameElement");
  }
  return element;
};

const registerGameElement = (): void => {
  if (!customElements.get("bruff-game")) {
    // eslint-disable-next-line wc/tag-name-matches-class
    customElements.define("bruff-game", GameElement);
  }
};

const createConnectedGameElement = (): GameElement => {
  registerGameElement();
  const element = createGameElement();
  document.body.append(element);
  return element;
};

const expectSingleCall = (spy: ReturnType<typeof vi.spyOn>): void => {
  expect(spy).toHaveBeenCalledTimes(SINGLE_CALL);
};

const getConnectedCallbackError = (element: GameElement): unknown => {
  try {
    element.connectedCallback();
  } catch (error: unknown) {
    return error;
  }

  return null;
};

// eslint-disable-next-line init-declarations
let gameElement: GameElement;

beforeEach(() => {
  document.body.innerHTML = "";
  gameElement = createConnectedGameElement();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("GameElement structure", () => {
  it("should be defined as a custom element", () => {
    expect(customElements.get("bruff-game")).toBeDefined();
  });

  it("should create an instance that is a GameElement", () => {
    expect(gameElement).toBeInstanceOf(GameElement);
  });

  it("should be attached to the DOM", () => {
    expect(document.body.contains(gameElement)).toBe(true);
  });

  it("should not recreate shadow root if one already exists", () => {
    gameElement.connectedCallback();
    expect(gameElement.shadowRoot).toBeDefined();
    const firstShadowRoot = gameElement.shadowRoot;
    gameElement.connectedCallback();
    expect(gameElement.shadowRoot).toBe(firstShadowRoot);
  });

  it("owns the HUD inside the shadow root", () => {
    const hud = gameElement.shadowRoot?.querySelector("#bruff-hud");

    expect(hud).toBeInstanceOf(HTMLDivElement);
    expect(hud?.textContent).toBe("bruff");
    expect(hud?.getAttribute("aria-label")).toBe("bruff status");
  });

  it("stores and clears a per-instance test API", () => {
    const testApi = { getState: vi.fn() };

    gameElement.setTestApi(testApi);
    expect(gameElement.testApi).toBe(testApi);

    gameElement.setTestApi(undefined);
    expect(gameElement.testApi).toBeUndefined();
  });
});

describe("GameElement log forwarding", () => {
  it("forwards log events to the matching console method while connected", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(vi.fn());

    log({ level: "error", message: "boom" });

    expectSingleCall(consoleErrorSpy);
  });

  it("stops forwarding after disconnect", () => {
    const consoleInfoSpy = vi
      .spyOn(console, "info")
      .mockImplementation(vi.fn());

    log({ level: "info", message: "before" });
    const beforeDisconnectCalls = consoleInfoSpy.mock.calls.length;
    gameElement.remove();
    log({ level: "info", message: "after" });

    expect(consoleInfoSpy.mock.calls.length).toBe(beforeDisconnectCalls);
  });

  it("resubscribes after reconnect", () => {
    const consoleInfoSpy = vi
      .spyOn(console, "info")
      .mockImplementation(vi.fn());

    gameElement.remove();
    document.body.append(gameElement);
    log({ level: "info", message: "again" });

    expectSingleCall(consoleInfoSpy);
  });

  it("disconnectedCallback is a no-op before first connect", () => {
    const detachedElement = new GameElement();

    expect(() => detachedElement.disconnectedCallback()).not.toThrow();
  });
});

const mockStencilError = (templateElement: HTMLTemplateElement): void => {
  const realCreateElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName === "div") {
      const div = realCreateElement("div");
      vi.spyOn(div, "querySelector").mockReturnValue(templateElement);
      return div;
    }
    return realCreateElement(tagName);
  });

  const invalidNode = realCreateElement("div");
  vi.spyOn(templateElement.content, "cloneNode").mockReturnValue(invalidNode);
};

describe("GameElement Error Cases", () => {
  it("should throw TypeError if template is missing", () => {
    const originalTemplate = GameElement.template;
    GameElement.template = (): string => "<div>No template here</div>";
    const element = new GameElement();
    const error = getConnectedCallbackError(element);

    expect(error).toBeInstanceOf(TypeError);
    expect(error).toHaveProperty("message", "Template element not found");
    GameElement.template = originalTemplate;
  });

  it("should throw TypeError if stencil is not a DocumentFragment", () => {
    const originalTemplate = GameElement.template;
    GameElement.template = (): string => "<template>Content</template>";
    const element = new GameElement();
    const templateElement = document.createElement("template");

    mockStencilError(templateElement);

    const error = getConnectedCallbackError(element);

    expect(error).toBeInstanceOf(TypeError);
    expect(error).toHaveProperty("message", "Failed to clone template");

    vi.restoreAllMocks();
    GameElement.template = originalTemplate;
  });
});
