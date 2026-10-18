/** Small, explainable hints, not an accessibility or design certification. */
export function inspectCanvas(root: HTMLElement, document: Document): string[] {
  const issues: string[] = [];
  if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    issues.push(
      "Horizontal overflow in the canvas: check fixed widths, long titles and container constraints.",
    );
  for (const element of root.querySelectorAll<HTMLElement>(
    "button, input:not([type=hidden]), select, textarea",
  )) {
    if (!element.getClientRects().length) continue;
    const labelled = (element.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .some((id) => document.getElementById(id)?.textContent?.trim());
    const labels = "labels" in element ? (element as HTMLInputElement).labels : null;
    const named =
      element.getAttribute("aria-label")?.trim() ||
      labelled ||
      (labels && [...labels].some((label) => label.textContent?.trim())) ||
      (element.tagName === "BUTTON" && element.textContent?.trim());
    if (!named)
      issues.push(
        `Missing accessible name: ${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}`,
      );
  }
  return issues;
}
