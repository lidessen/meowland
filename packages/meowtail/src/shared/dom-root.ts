/** IDs and focus are scoped to the actual DOM tree, including isolated content leaves. */
export function elementByIdInRoot(element: Element, id: string): HTMLElement | null {
  const root = element.getRootNode() as Document | ShadowRoot;
  return typeof root.getElementById === "function" ? root.getElementById(id) : null;
}

export function activeElementInRoot(element: Element): Element | null {
  return (element.getRootNode() as Document | ShadowRoot).activeElement ?? null;
}
