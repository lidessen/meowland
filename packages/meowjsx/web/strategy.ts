import { isSignal, unwrap, type RendererCleanup, type RenderStrategy } from "../src/index";
import { ATTRIBUTE_NAMES, HTML_NAMESPACE, SVG_NAMESPACE, isRecord } from "./html-facts";

/** DOM nodes are text, comment, and element nodes; the strategy owns all three. */
export type DomNode = Node;

function setDOMStyle(element: Element, value: unknown): void {
  if (
    !(element instanceof HTMLElement) ||
    value === null ||
    value === undefined ||
    value === false
  ) {
    if (value === null || value === undefined || value === false) element.removeAttribute("style");
    else element.setAttribute("style", String(value));
    return;
  }

  if (typeof value === "string") {
    element.style.cssText = value;
    return;
  }

  if (isRecord(value)) {
    element.style.cssText = "";
    for (const [property, propertyValue] of Object.entries(value)) {
      const resolved = unwrap(propertyValue);
      if (resolved === null || resolved === undefined || resolved === false) continue;
      const cssProperty = property.startsWith("--")
        ? property
        : property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      element.style.setProperty(cssProperty, String(resolved));
    }
    return;
  }

  element.setAttribute("style", String(value));
}

/**
 * Land one prop on a real element: class and style, raw HTML, events, and the
 * attribute/property split the Web runtime has always used.
 */
export function setDOMProperty(element: Element, name: string, value: unknown): RendererCleanup {
  const resolved = unwrap(value);
  const target = element as unknown as Record<string, unknown>;

  if (name === "ref") {
    const cleanup = typeof resolved === "function" ? resolved(element) : undefined;
    return typeof cleanup === "function" ? cleanup : () => {};
  }

  if (name === "class" || name === "className") {
    element.setAttribute("class", resolved == null || resolved === false ? "" : String(resolved));
    return () => {};
  }

  if (name === "style") {
    setDOMStyle(element, resolved);
    if (!isRecord(resolved)) return () => {};

    const subscriptions = Object.values(resolved)
      .filter(isSignal)
      .map((source) => source.subscribe(() => setDOMStyle(element, resolved)));
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }

  if (name === "dangerouslySetInnerHTML") {
    if (isRecord(resolved) && typeof resolved.__html === "string")
      element.innerHTML = resolved.__html;
    return () => {};
  }

  if (name.startsWith("on") && name.length > 2) {
    const eventName = name.slice(2).replace(/^:/, "").toLowerCase();
    const propertyName = `on${eventName}`;
    const handler = typeof resolved === "function" ? resolved : null;
    // Bubbling focus events and custom events do not all expose on* properties.
    if (!(propertyName in element)) {
      if (!handler) return () => {};
      element.addEventListener(eventName, handler as EventListener);
      return () => element.removeEventListener(eventName, handler as EventListener);
    }
    target[propertyName] = handler;
    return () => {
      if (target[propertyName] === handler) target[propertyName] = null;
    };
  }

  const attributeName = ATTRIBUTE_NAMES[name] ?? name;
  if (resolved === null || resolved === undefined || resolved === false) {
    if (typeof target[name] === "boolean") target[name] = false;
    element.removeAttribute(attributeName);
    return () => {};
  }

  if (resolved === true) {
    if (typeof target[name] === "boolean") target[name] = true;
    element.setAttribute(attributeName, "");
    return () => {};
  }

  if (
    !name.includes("-") &&
    !name.startsWith("data") &&
    !name.startsWith("aria") &&
    name in target
  ) {
    try {
      if (Reflect.set(target, name, resolved)) return () => {};
    } catch {
      // Some DOM setters reject values by throwing instead of returning false.
    }
    // Getter-only DOM properties must also fall through in non-strict bundles.
  }

  element.setAttribute(attributeName, String(resolved));
  return () => {};
}

function createHostElement(type: string, parent: DomNode | undefined): Element {
  const parentElement = parent as Element | undefined;
  const parentNamespace = parentElement?.namespaceURI;
  const parentName = (parentElement?.localName ?? parentElement?.nodeName)?.toLowerCase();

  if (type === "svg") return document.createElementNS(SVG_NAMESPACE, type);
  if (parentNamespace === SVG_NAMESPACE && parentName !== "foreignobject")
    return document.createElementNS(SVG_NAMESPACE, type);
  if (parentNamespace === SVG_NAMESPACE && parentName === "foreignobject")
    return document.createElementNS(HTML_NAMESPACE, type);
  return document.createElement(type);
}

/**
 * The DOM target of the MeowJSX renderer seam: node creation, tree operations,
 * and property landing. Component, Signal, lifecycle, and hook semantics stay
 * in core.
 */
export function createDomStrategy(): RenderStrategy<DomNode> {
  return {
    createText: (value) => document.createTextNode(value),
    createElement: (type, parent) => createHostElement(type, parent),
    createMarker: (kind) => document.createComment(`meowjsx:${kind}`),
    getNextSibling: (node) => node.nextSibling,
    insert(parent, node, before) {
      parent.insertBefore(node, before ?? null);
    },
    remove(node) {
      (node as ChildNode).remove();
    },
    setProperty(node, name, value) {
      return setDOMProperty(node as unknown as Element, name, value);
    },
    ownsChildren(vnode) {
      return Object.hasOwn(vnode.props, "dangerouslySetInnerHTML");
    },
  };
}
