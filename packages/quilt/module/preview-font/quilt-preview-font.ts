/**
 * Preview font state kept outside QuiltElement.
 */
export type PreviewFontState = Readonly<{ type: "unloaded" }>;

/**
 * Creates initial preview font state.
 */
export const createPreviewFontState = (): PreviewFontState => ({
  type: "unloaded",
});
