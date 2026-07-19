import { appendText } from "./dom-text.js";
import type { SigilExtractionError } from "./glyph-json.js";

const EMPTY_COUNT = 0;

/** Creates visible alert elements for extraction and naming errors. */
export const createErrorElements = (
  errors: ReadonlyArray<SigilExtractionError>,
): ReadonlyArray<HTMLElement> => {
  if (errors.length === EMPTY_COUNT) {
    return [];
  }

  const alert = document.createElement("div");
  alert.setAttribute("role", "alert");
  alert.replaceChildren(
    ...errors.map((toolError) => {
      const paragraph = document.createElement("p");
      appendText(paragraph, toolError.message);
      return paragraph;
    }),
  );

  return [alert];
};
