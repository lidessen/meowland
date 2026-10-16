import type { ObservedComponent } from "meowjsx";
import { pageFrameOptions } from "meowui";
import type { CaptureActiveFocus, CaptureScrollView, CaptureSnapshot } from "../capture/types";

export const captureInstanceId = (instance: ObservedComponent<Node>): string =>
  `n${String(instance.id).padStart(3, "0")}`;

function parent(element: Element): Element | null {
  const root = element.getRootNode();
  return element.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
}

function closestAttribute(element: Element, attribute: string): string | undefined {
  for (let current: Element | null = element; current; current = parent(current)) {
    const value = current.getAttribute(attribute);
    if (value !== null) return value;
  }
  return undefined;
}

/** Reuse current observation membership. Ancestors contain their descendants' nodes. */
function association(
  element: Element,
  instances: readonly ObservedComponent<Node>[],
): Pick<CaptureActiveFocus, "status" | "instanceId" | "reason"> {
  const candidates = instances.filter((instance) => instance.nodes.has(element));
  const deepest = candidates.filter(
    (candidate) =>
      !candidates.some((other) => {
        for (let ancestor = other.parent; ancestor; ancestor = ancestor.parent)
          if (ancestor === candidate) return true;
        return false;
      }),
  );
  return deepest.length === 1
    ? { status: "observed", instanceId: captureInstanceId(deepest[0]!) }
    : { status: "unknown", reason: deepest.length ? "ambiguous-owner" : "unmapped-node" };
}

/** Read once, without moving focus, scrolling, reading values or installing subscriptions. */
export function readCaptureFacts(
  document: Document,
  instances: readonly ObservedComponent<Node>[],
): Pick<CaptureSnapshot, "activeFocus" | "scrollViews"> {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  let activeFocus: CaptureActiveFocus;
  if (!active || active === document.body || active === document.documentElement)
    activeFocus = { status: "none" };
  else {
    const part = closestAttribute(active, "data-meowui-part");
    activeFocus = {
      ...association(active, instances),
      ...(part ? { part } : {}),
    };
    if (active instanceof HTMLIFrameElement)
      activeFocus = {
        status: "unknown",
        reason: "iframe-content-unobserved",
        ...(part ? { part } : {}),
      };
    else if (active.localName.includes("-") && !active.shadowRoot)
      activeFocus = {
        status: "unknown",
        reason: "shadow-content-unobserved",
        ...(part ? { part } : {}),
      };
  }

  // This set only deduplicates this read's DOM walk; it is not an observation index.
  const elements = new Set<Element>();
  const visit = (element: Element) => {
    if (!element.isConnected || elements.has(element)) return;
    elements.add(element);
    for (const child of element.children) visit(child);
    if (element.shadowRoot) for (const child of element.shadowRoot.children) visit(child);
  };
  for (const instance of instances)
    for (const node of instance.nodes) if (node instanceof Element) visit(node);

  const scrollViews: CaptureScrollView[] = [];
  for (const element of elements) {
    const style = getComputedStyle(element);
    const part = element.getAttribute("data-meowui-part") ?? undefined;
    const frame =
      part === "page-frame/body" &&
      element.parentElement?.getAttribute("data-meowui-part") === "page-frame/root"
        ? element.parentElement
        : undefined;
    const declared =
      element.getAttribute("data-scroll-owner") ??
      frame?.getAttribute(pageFrameOptions.attribute("scrollOwner"));
    const declaredOwner = declared === "layout" || declared === "content" ? declared : undefined;
    if (
      !declaredOwner &&
      ![style.overflowX, style.overflowY].some((overflow) =>
        ["auto", "scroll", "hidden"].includes(overflow),
      )
    )
      continue;
    const related = association(element, instances);
    const region =
      closestAttribute(element, "data-region-content") ?? closestAttribute(element, "data-region");
    scrollViews.push({
      status: related.status === "observed" ? "observed" : "unknown",
      ...(related.instanceId ? { instanceId: related.instanceId } : {}),
      ...(related.reason ? { reason: related.reason } : {}),
      ...(part ? { part } : {}),
      ...(region ? { region } : {}),
      ...(declaredOwner ? { declaredOwner } : {}),
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop,
    });
  }
  return { activeFocus, scrollViews };
}
