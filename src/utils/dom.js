export function getScrollableParent(element) {
  while (element) {
    const style = window.getComputedStyle(element);
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      element.scrollHeight > element.clientHeight
    ) {
      return element;
    }
    element = element.parentElement;
  }
  return null; // or document as a fallback
}
