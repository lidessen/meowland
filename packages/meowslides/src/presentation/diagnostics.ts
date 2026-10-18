interface AxisBoundary {
  start: number;
  end: number;
}
type VisualBox = Pick<DOMRect, "width" | "height" | "left" | "right" | "top" | "bottom">;

interface Boundaries {
  x?: AxisBoundary;
  y?: AxisBoundary;
}

const allocatedParts = new Set([
  "presentation-layout/header",
  "presentation-layout/body",
  "presentation-layout/footer",
]);
const clips = /^(auto|scroll|hidden|clip)$/;

/** A visual warning for this finite canvas, not a general CSS layout validator. */
export function hasPresentationOverflow(slide: HTMLElement, scale: number): boolean {
  const view = slide.ownerDocument.defaultView;
  if (!view || scale <= 0) return false;
  // DOMRect float rounding must not turn an exactly one-logical-pixel
  // font metric overhang into a warning after the canvas is scaled.
  const tolerance = scale + 0.001;
  const canvas = slide.getBoundingClientRect();
  const topLayer = [":popover-open", "dialog:modal"]
    .filter((selector) => view.CSS?.supports(`selector(${selector})`))
    .join(",");
  const outside = (rect: VisualBox, bounds: Boundaries): boolean =>
    rect.width > 0 &&
    rect.height > 0 &&
    ((!!bounds.x &&
      (rect.left < bounds.x.start - tolerance || rect.right > bounds.x.end + tolerance)) ||
      (!!bounds.y &&
        (rect.top < bounds.y.start - tolerance || rect.bottom > bounds.y.end + tolerance)));
  const visit = (element: Element, inherited: Boundaries): boolean => {
    const style = view.getComputedStyle(element);
    const part = element.getAttribute("data-meowui-part");
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse" ||
      part === "presentation/background" ||
      (!!topLayer && element.matches(topLayer))
    )
      return false;
    const rect = element.getBoundingClientRect();
    // An inline text fragment's DOMRect uses the font's em box, which can be
    // taller than CSS line-height. Its text lines are checked below instead.
    const inlineText =
      style.display === "inline" &&
      !element.matches("img,video,audio,canvas,svg,iframe,object,embed,input,select,textarea");
    if (outside(rect, inlineText ? { x: inherited.x } : inherited)) return true;
    // Named regions own their allocation. A nested layout receives a new local
    // boundary even when its outer reading area intentionally scrolls.
    const local: Boundaries = allocatedParts.has(part ?? "")
      ? { x: { start: rect.left, end: rect.right }, y: { start: rect.top, end: rect.bottom } }
      : { ...inherited };
    // First check the scroll owner's box above. Its clipped/scrolled content
    // may exceed that box without exceeding the presentation's visible area.
    if (clips.test(style.overflowX)) local.x = undefined;
    if (clips.test(style.overflowY)) local.y = undefined;
    // Native text controls own internal text scrolling and do not expose their
    // visible line geometry through the authored DOM's text nodes.
    if (element.matches("textarea,input,select,video,audio")) return false;
    for (const node of element.childNodes) {
      if (node.nodeType === 1) {
        if (visit(node as Element, local)) return true;
      } else if (node.nodeType === 3 && node.textContent?.trim() && (local.x || local.y)) {
        const range = slide.ownerDocument.createRange();
        range.selectNodeContents(node);
        const lineHeight = Number.parseFloat(style.lineHeight) * scale;
        for (const line of range.getClientRects()) {
          // Range rectangles describe font metrics, not CSS line boxes. Tight
          // headings may have harmless em-box overhang above and below their
          // allocation; preserve each rendered line's position and horizontal
          // extent while limiting that font box to its computed line-height.
          const height = Number.isFinite(lineHeight)
            ? Math.min(line.height, lineHeight)
            : line.height;
          const inset = (line.height - height) / 2;
          if (
            outside(
              {
                left: line.left,
                right: line.right,
                top: line.top + inset,
                bottom: line.bottom - inset,
                width: line.width,
                height,
              },
              local,
            )
          )
            return true;
        }
      }
    }
    return false;
  };
  const bounds = {
    x: { start: canvas.left, end: canvas.right },
    y: { start: canvas.top, end: canvas.bottom },
  };
  for (const child of slide.children) if (visit(child, bounds)) return true;
  return false;
}
