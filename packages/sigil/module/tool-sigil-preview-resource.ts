import {
  allocatePreviewFontFamily,
  clearPreviewFontFace,
  createPreviewFontState,
  installPreviewFontFace,
  loadPreviewFontFace,
  type PreviewFontState,
} from "./preview-font.js";

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
 * Creates the preview font resource manager used by `<tool-sigil>`.
 *
 * @param handlers - Coordinator callbacks for current preview load results
 * @returns A resource object for loading and clearing browser font faces
 */
export const createToolSigilPreviewResource = (
  handlers: ToolSigilPreviewResourceHandlers,
): ToolSigilPreviewResource => {
  let previewFontState: PreviewFontState = createPreviewFontState();
  let currentFontLoadToken = 0;

  const clear = (): void => {
    previewFontState = clearPreviewFontFace(previewFontState);
  };

  const load = (fontFile: File, fontLoadToken: number): string => {
    currentFontLoadToken = fontLoadToken;
    const { fontFamily, fontState } =
      allocatePreviewFontFamily(previewFontState);
    previewFontState = fontState;
    loadPreviewFontFace(fontFile, fontFamily)
      .then((previewFontFace) => {
        if (fontLoadToken !== currentFontLoadToken) {
          return;
        }

        previewFontState = installPreviewFontFace(
          previewFontState,
          previewFontFace,
        );
        handlers.onPreviewFontLoaded(fontLoadToken, fontFamily);
      })
      .catch(() => {
        if (fontLoadToken !== currentFontLoadToken) {
          return;
        }

        clear();
        handlers.onPreviewFontCleared(fontLoadToken);
      });

    return fontFamily;
  };

  return {
    clear,
    disconnect: clear,
    load,
  };
};
