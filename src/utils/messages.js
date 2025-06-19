
export const addNewLinesBeforeCodeblocks = (markdown) =>
  markdown.match(/([^\n])(\n```)/)
    ? markdown.replace(/([^\n])(\n```)/g, "$1\n$2")
    : markdown;

export function normalizeMessageText(message) {
  return addNewLinesBeforeCodeblocks(
    Array.isArray(message.content.content)
      ? message.content.content
          .filter((tc) => tc.type === "text")
          .map((tc) => tc.text)
          .join(" ")
      : message.content.content,
  );
}

export function extractMessageImages(message) {
  return Array.isArray(message.content.content)
    ? message.content.content
        .filter((t) => t.type === "image_url")
        .map((t) => t.image_url.url)
    : [];
}
