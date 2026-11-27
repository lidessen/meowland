import { elementByIdInRoot } from "../shared/dom-root";

export interface AgentNode {
  ref: string;
  part: string | null;
  role: string | null;
  label: string;
  value: string | null;
  state: Record<string, string>;
  disabled: boolean;
  confirm: boolean;
}

export interface AgentAction {
  targetRef: string;
  type: "click" | "input" | "select" | "focus";
  value?: string;
}

export interface AgentActionReceipt {
  source: "agent";
  type: AgentAction["type"];
  targetRef: string;
  part: string | null;
}

export interface AgentBridgeOptions {
  root: Element;
  confirm?: (action: AgentAction, node: AgentNode) => boolean | Promise<boolean>;
  onAction?: (receipt: AgentActionReceipt) => void;
}

export interface AgentQuery {
  part?: string;
  role?: string;
  label?: string;
}

const candidates =
  "[data-meowui-part], button, input, select, textarea, a[href], [role], [contenteditable], [tabindex]";

function parent(element: Element): Element | null {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return "host" in root ? (root as ShadowRoot).host : null;
}

function blocked(element: Element): boolean {
  for (let current: Element | null = element; current; current = parent(current)) {
    if (current.matches('[data-agent-hidden], [hidden], [inert], [aria-hidden="true"]'))
      return true;
    const style = current.ownerDocument.defaultView?.getComputedStyle(current);
    if (
      style?.display === "none" ||
      style?.visibility === "hidden" ||
      style?.visibility === "collapse"
    )
      return true;
  }
  return false;
}

function disabled(element: Element): boolean {
  for (let current: Element | null = element; current; current = parent(current)) {
    if (current.matches(':disabled, [aria-disabled="true"], [data-disabled]')) return true;
  }
  return false;
}

function hasAncestor(element: Element, selector: string): boolean {
  for (let current: Element | null = element; current; current = parent(current)) {
    if (current.matches(selector)) return true;
  }
  return false;
}

function visibleText(element: Element): string {
  if (blocked(element)) return "";
  if (hasAncestor(element, "[data-agent-secret]")) return "[REDACTED]";
  return Array.from(element.childNodes, (child) =>
    child.nodeType === 3
      ? (child.textContent ?? "")
      : child.nodeType === 1
        ? visibleText(child as Element)
        : "",
  )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function label(element: Element): string {
  const explicit = element.getAttribute("aria-label");
  if (explicit) return explicit;
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => elementByIdInRoot(element, id))
      .filter((item): item is HTMLElement => item !== null)
      .map(visibleText)
      .join(" ")
      .trim();
    if (text) return text;
  }
  if ("labels" in element) {
    const labels = (element as HTMLInputElement).labels;
    if (labels?.length) return Array.from(labels, visibleText).join(" ").trim();
  }
  return element.getAttribute("placeholder") || visibleText(element);
}

function role(element: Element): string | null {
  const explicit = element.getAttribute("role");
  if (explicit) return explicit;
  switch (element.localName) {
    case "button":
      return "button";
    case "a":
      return element.hasAttribute("href") ? "link" : null;
    case "select":
      return element.hasAttribute("multiple") ? "listbox" : "combobox";
    case "textarea":
      return "textbox";
    case "input": {
      const type = (element as HTMLInputElement).type;
      if (type === "hidden") return null;
      if (type === "checkbox" || type === "radio") return type;
      if (["button", "submit", "reset"].includes(type)) return "button";
      if (type === "range") return "slider";
      if (type === "number") return "spinbutton";
      if (type === "search") return "searchbox";
      return "textbox";
    }
    default:
      return null;
  }
}

/** Inspect and operate only the mounted subtree provided by the host. */
export function createAgentBridge(options: AgentBridgeOptions) {
  const refs = new WeakMap<Element, string>();
  const elements = new Map<string, Element>();
  let nextRef = 0;

  function describe(element: Element): AgentNode {
    let ref = refs.get(element);
    if (!ref) {
      ref = `agent-${++nextRef}`;
      refs.set(element, ref);
    }
    elements.set(ref, element);
    const state: Record<string, string> = {};
    for (const attribute of element.attributes) {
      if (
        attribute.name === "data-state" ||
        (attribute.name.startsWith("aria-") &&
          ["checked", "selected", "expanded", "pressed", "invalid"].includes(
            attribute.name.slice(5),
          ))
      ) {
        state[attribute.name] = attribute.value;
      }
    }
    if ("checked" in element && typeof (element as HTMLInputElement).checked === "boolean")
      state.checked = String((element as HTMLInputElement).checked);
    const value = hasAncestor(element, "[data-agent-secret]")
      ? "[REDACTED]"
      : "value" in element && typeof (element as HTMLInputElement).value === "string"
        ? (element as HTMLInputElement).value
        : element.hasAttribute("contenteditable")
          ? element.textContent
          : null;
    return {
      ref,
      part: element.getAttribute("data-meowui-part"),
      role: role(element),
      label: label(element),
      value,
      state,
      disabled: disabled(element),
      confirm: hasAncestor(element, "[data-agent-confirm]"),
    };
  }

  function snapshot(): AgentNode[] {
    const found = [...options.root.querySelectorAll(candidates)];
    if (options.root.matches(candidates)) found.unshift(options.root);
    return found
      .filter(
        (element) =>
          !blocked(element) &&
          !(element.localName === "input" && (element as HTMLInputElement).type === "hidden"),
      )
      .map(describe);
  }

  function query(filter: AgentQuery = {}): AgentNode[] {
    return snapshot().filter(
      (node) =>
        (filter.part === undefined || node.part === filter.part) &&
        (filter.role === undefined || node.role === filter.role) &&
        (filter.label === undefined || node.label === filter.label),
    );
  }

  async function act(action: AgentAction): Promise<AgentActionReceipt> {
    const element = elements.get(action.targetRef);
    const check = () => {
      if (
        !element ||
        !(element === options.root || options.root.contains(element)) ||
        blocked(element) ||
        disabled(element)
      )
        throw new Error("Agent target is unavailable or disabled");
      return describe(element);
    };
    const node = check();
    if (node.confirm || options.confirm) {
      if (!options.confirm || !(await options.confirm(action, node)))
        throw new Error("Agent permission denied");
      check();
    }
    const target = element as HTMLElement;
    const view = target.ownerDocument.defaultView;
    if (!view) throw new Error("Agent target has no DOM window");
    switch (action.type) {
      case "click":
        target.click();
        break;
      case "focus":
        target.focus();
        break;
      case "input":
      case "select": {
        if (action.value === undefined) throw new Error("Agent action requires a value");
        if (action.type === "select" && target.localName !== "select")
          throw new Error("Agent select requires a select element");
        if (
          action.type === "input" &&
          !["input", "textarea"].includes(target.localName) &&
          !target.hasAttribute("contenteditable")
        )
          throw new Error("Agent input requires an editable element");
        if (target.hasAttribute("contenteditable")) target.textContent = action.value;
        else
          (target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value =
            action.value;
        target.dispatchEvent(new view.Event("input", { bubbles: true, composed: true }));
        target.dispatchEvent(new view.Event("change", { bubbles: true, composed: true }));
        break;
      }
      default:
        throw new Error("Unsupported agent action");
    }
    const receipt: AgentActionReceipt = {
      source: "agent",
      type: action.type,
      targetRef: action.targetRef,
      part: node.part,
    };
    options.onAction?.(receipt);
    return receipt;
  }
  return { snapshot, query, act };
}
