/**
 * Replaces an element's children with one text node.
 */
export const appendText = (element: Element, text: string): void => {
  element.replaceChildren(document.createTextNode(text));
};
