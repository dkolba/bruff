import {
  allocatePreviewFontFamily,
  clearPreviewFontFace,
  createPreviewFontState,
  installPreviewFontFace,
  loadPreviewFontFace,
  type PreviewFontState,
} from "./preview-font.js";

const NEXT_FONT_LOAD_TOKEN_OFFSET = 1;

/** Callbacks emitted by the preview font resource owner. */
export type ToolSigilPreviewResourceHandlers = Readonly<{
  onPreviewFontCleared: (fontLoadToken: number) => void;
  onPreviewFontLoaded: (fontLoadToken: number, fontFamily: string) => void;
}>;

/** Browser preview font resource owned outside the custom element class. */
export type ToolSigilPreviewResource = Readonly<{
  clear: () => void;
  disconnect: () => void;
  load: (fontFile: File, fontLoadToken: number) => string;
}>;

/**
Creates the preview font resource manager used by `<tool-sigil>`.

@param handlers - Coordinator callbacks for current preview load results
@returns A resource object for loading and clearing browser font faces
*/
export const createToolSigilPreviewResource = (
  handlers: ToolSigilPreviewResourceHandlers,
): ToolSigilPreviewResource => {
  let previewFontState: PreviewFontState = createPreviewFontState();
  let currentFontLoadToken = 0;
  const clear = (): void => {
    currentFontLoadToken += NEXT_FONT_LOAD_TOKEN_OFFSET;
    previewFontState = clearPreviewFontFace(previewFontState);
  };
  const load = (fontFile: File, fontLoadToken: number): string => {
    currentFontLoadToken = fontLoadToken;
    const { fontFamily, fontState } =
      allocatePreviewFontFamily(previewFontState);
    previewFontState = fontState;
    // eslint-disable-next-line no-void -- Fire-and-forget in synchronous context; errors are handled inside the async IIFE.
    void (async (): Promise<void> => {
      try {
        // eslint-disable-next-line unicorn/no-declarations-before-early-exit -- The early exit check depends on the async operation completing
        const previewFontFace = await loadPreviewFontFace(
          fontFile,
          fontFamily,
        );
        if (fontLoadToken !== currentFontLoadToken) {
          return;
        }
        previewFontState = installPreviewFontFace(
          previewFontState,
          previewFontFace,
        );
        handlers.onPreviewFontLoaded(fontLoadToken, fontFamily);
      } catch {
        if (fontLoadToken !== currentFontLoadToken) {
          return;
        }
        clear();
        handlers.onPreviewFontCleared(fontLoadToken);
      }
    })();
    return fontFamily;
  };
  return {
    clear,
    disconnect: clear,
    load,
  };
};
