import { describe, expect, it, vi } from "vitest";

import { createValidFontFile } from "./font-test-fixture.js";
import {
  createToolSigilPreviewResource,
  type ToolSigilPreviewResource,
} from "./tool-sigil-preview-resource.js";
import { waitForComponentUpdate } from "./tool-sigil-test-support.js";

const CURRENT_FONT_LOAD_TOKEN = 1;

type DeferredFontFaceLoad = Readonly<{
  resolve: () => void;
  restore: () => void;
}>;

type PreviewResourceDisconnectTest = Readonly<{
  addFontFace: ReturnType<typeof vi.spyOn>;
  deferredFontFaceLoad: DeferredFontFaceLoad;
  onPreviewFontLoaded: ReturnType<typeof vi.fn>;
  previewResource: ToolSigilPreviewResource;
  restore: () => void;
}>;

const createDeferredFontFaceLoad = (): DeferredFontFaceLoad => {
  const originalFontFace = globalThis.FontFace;
  let resolveFontFaceLoad: (() => void) | null = null;

  class StubFontFace extends originalFontFace {
    override load(): Promise<FontFace> {
      return new Promise<FontFace>((resolve) => {
        resolveFontFaceLoad = (): void => {
          resolve(this);
        };
      });
    }
  }

  Object.defineProperty(globalThis, "FontFace", {
    configurable: true,
    value: StubFontFace,
  });

  return {
    resolve: (): void => {
      if (resolveFontFaceLoad !== null) {
        resolveFontFaceLoad();
      }
    },
    restore: (): void => {
      Object.defineProperty(globalThis, "FontFace", {
        configurable: true,
        value: originalFontFace,
      });
    },
  };
};

const createPreviewResourceDisconnectTest =
  (): PreviewResourceDisconnectTest => {
    const deferredFontFaceLoad = createDeferredFontFaceLoad();
    const addFontFace = vi.spyOn(document.fonts, "add");
    const onPreviewFontLoaded = vi.fn();
    const previewResource = createToolSigilPreviewResource({
      onPreviewFontCleared: vi.fn(),
      onPreviewFontLoaded,
    });

    return {
      addFontFace,
      deferredFontFaceLoad,
      onPreviewFontLoaded,
      previewResource,
      restore: (): void => {
        addFontFace.mockRestore();
        deferredFontFaceLoad.restore();
      },
    };
  };

const disconnectBeforePreviewLoadSettles = async (
  testContext: PreviewResourceDisconnectTest,
): Promise<void> => {
  testContext.previewResource.load(
    createValidFontFile("component-test.ttf"),
    CURRENT_FONT_LOAD_TOKEN,
  );
  await waitForComponentUpdate();
  testContext.previewResource.disconnect();

  testContext.deferredFontFaceLoad.resolve();
  await waitForComponentUpdate();
};

const expectPreviewLoadIgnored = (
  testContext: PreviewResourceDisconnectTest,
): void => {
  expect(testContext.addFontFace).not.toHaveBeenCalled();
  expect(testContext.onPreviewFontLoaded).not.toHaveBeenCalled();
};

describe("createToolSigilPreviewResource", () => {
  it("ignores pending preview font loads after disconnect", async () => {
    const testContext = createPreviewResourceDisconnectTest();

    try {
      await disconnectBeforePreviewLoadSettles(testContext);
      expectPreviewLoadIgnored(testContext);
    } finally {
      testContext.restore();
    }
  });
});
