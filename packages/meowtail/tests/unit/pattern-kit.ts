import { activeElementInRoot, elementByIdInRoot } from "../../src/shared/dom-root";

export type AriaPattern =
  | "listbox"
  | "toolbar"
  | "menu"
  | "tabs"
  | "tree"
  | "radio-group"
  | "combobox";

const specs: Record<AriaPattern, { container: string; children: string }> = {
  listbox: { container: '[role="listbox"]', children: '[role="option"]' },
  toolbar: {
    container: '[role="toolbar"]',
    children: 'button, a[href], input:not([type="hidden"])',
  },
  menu: {
    container: '[role="menu"]',
    children: '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]',
  },
  tabs: { container: '[role="tablist"]', children: '[role="tab"]' },
  tree: { container: '[role="tree"]', children: '[role="treeitem"]' },
  "radio-group": {
    container: '[role="radiogroup"], fieldset',
    children: '[role="radio"], input[type="radio"]',
  },
  combobox: { container: '[role="combobox"]', children: '[role="option"]' },
};
const references = [
  "aria-controls",
  "aria-labelledby",
  "aria-describedby",
  "aria-activedescendant",
  "aria-owns",
];
const describe = (element: Element) =>
  `<${element.tagName.toLowerCase()}${element.id ? ` id="${element.id}"` : ""}${element.getAttribute("role") ? ` role="${element.getAttribute("role")}"` : ""}>`;
const all = (root: Element, selector: string): Element[] => [
  ...(root.matches(selector) ? [root] : []),
  ...root.querySelectorAll(selector),
];
const enabled = (element: Element) =>
  !element.matches(':disabled, [aria-disabled="true"]') &&
  !element.closest('[hidden], [aria-hidden="true"], [inert]');
const named = (element: Element) =>
  Boolean(
    element.getAttribute("aria-label")?.trim() ||
    element.getAttribute("aria-labelledby")?.trim() ||
    (element.matches("fieldset") && element.querySelector("legend")?.textContent?.trim()),
  );
const focus = (element: Element) => (element as HTMLElement).focus();
const current = (container: Element) => {
  const active = activeElementInRoot(container);
  const id = active?.getAttribute("aria-activedescendant");
  return id ? elementByIdInRoot(active!, id) : active;
};
const key = async (target: Element, value: string) => {
  const view = target.ownerDocument.defaultView!;
  target.dispatchEvent(
    new view.KeyboardEvent("keydown", {
      key: value,
      bubbles: true,
      cancelable: true,
      composed: true,
    }),
  );
  await Promise.resolve();
};

export async function checkPattern(root: Element, pattern: AriaPattern): Promise<void> {
  const errors: string[] = [];
  const fail = (element: Element, rule: string) => errors.push(`${describe(element)}: ${rule}`);
  for (const element of all(root, "*")) {
    for (const attr of references) {
      for (const id of (element.getAttribute(attr) ?? "").trim().split(/\s+/).filter(Boolean)) {
        if (!elementByIdInRoot(element, id)) fail(element, `${attr} references missing id "${id}"`);
      }
    }
    const role = element.getAttribute("role");
    if (
      (role === "option" || role === "tab") &&
      !["true", "false"].includes(element.getAttribute("aria-selected") ?? "")
    )
      fail(element, "requires aria-selected");
    if (
      ["radio", "menuitemcheckbox", "menuitemradio"].includes(role ?? "") &&
      !["true", "false", ...(role === "menuitemcheckbox" ? ["mixed"] : [])].includes(
        element.getAttribute("aria-checked") ?? "",
      )
    )
      fail(element, "requires aria-checked");
    if (
      (role === "combobox" || element.hasAttribute("aria-haspopup")) &&
      !["true", "false"].includes(element.getAttribute("aria-expanded") ?? "")
    )
      fail(element, "requires aria-expanded");
  }
  const spec = specs[pattern];
  const containers = all(root, spec.container);
  if (!containers.length) fail(root, `requires ${pattern} container`);
  for (const container of containers) {
    if (
      (["tabs", "listbox", "radio-group"].includes(pattern) ||
        (pattern === "toolbar" && containers.length > 1)) &&
      !named(container)
    )
      fail(container, "requires an accessible name");
    const children = all(container, spec.children).filter(
      (child) => child !== container && enabled(child),
    );
    const nativeRadios =
      pattern === "radio-group" &&
      children.length > 0 &&
      children.every((child) => child.matches('input[type="radio"]'));
    if (pattern !== "combobox" && !children.length)
      fail(container, "requires enabled composite children");
    const stops = children.filter((child) => (child as HTMLElement).tabIndex === 0);
    const virtual =
      (container.hasAttribute("aria-activedescendant") || pattern === "combobox") &&
      (container as HTMLElement).tabIndex === 0;
    if (!nativeRadios && stops.length + Number(virtual) !== 1)
      fail(
        container,
        "requires exactly one composite tab stop or a focusable aria-activedescendant container",
      );
    if (nativeRadios) continue;
    const entry = virtual ? container : stops[0];
    if (!entry) continue;
    focus(entry);
    await Promise.resolve();
    const vertical = container.getAttribute("aria-orientation")
      ? container.getAttribute("aria-orientation") === "vertical"
      : ["listbox", "menu", "tree", "combobox"].includes(pattern);
    const keys = vertical
      ? ["ArrowDown", "ArrowUp", "Home", "End"]
      : ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (["listbox", "radio-group"].includes(pattern)) keys.push(" ");
    if (pattern === "tabs") keys.push(" ", "Enter");
    for (const value of keys) {
      const target = activeElementInRoot(container);
      if (!target) {
        fail(container, `${value}: no focused element`);
        break;
      }
      await key(target, value);
      const active = activeElementInRoot(container);
      const resolved = current(container);
      if (
        !active ||
        !container.contains(active) ||
        !resolved ||
        (!container.contains(resolved) && !virtual) ||
        active.closest('[aria-hidden="true"], [inert], [hidden]') ||
        resolved.closest('[aria-hidden="true"], [inert], [hidden]')
      )
        fail(container, `${value}: focus left the composite or entered a hidden subtree`);
    }
  }
  if (errors.length) throw new Error(`Pattern violations:\n${errors.join("\n")}`);
}

type Saved = { object: object; key: PropertyKey; descriptor: PropertyDescriptor | undefined };
export function checkSsrPurity(render: () => string): string {
  const saved: Saved[] = [];
  const globals = Object.getOwnPropertyDescriptors(globalThis);
  const violations = new Set<string>();
  const replace = (object: object, key: PropertyKey, descriptor: PropertyDescriptor) => {
    saved.push({ object, key, descriptor: Object.getOwnPropertyDescriptor(object, key) });
    Object.defineProperty(object, key, { configurable: true, ...descriptor });
  };
  const originalDate = Date;
  const originalPerformance = globalThis.performance;
  const originalCrypto = globalThis.crypto;
  let result = "";
  let failure: unknown;
  try {
    for (const name of [
      "document",
      "window",
      "navigator",
      "location",
      "localStorage",
      "sessionStorage",
      "matchMedia",
    ])
      replace(globalThis, name, {
        get() {
          violations.add(name);
          return undefined;
        },
      });
    const guardedDate = new Proxy(originalDate, {
      apply(target, thisArg, args) {
        violations.add("Date()");
        return Reflect.apply(target, thisArg, args);
      },
      construct(target, args, newTarget) {
        if (!args.length) violations.add("new Date()");
        return Reflect.construct(target, args, newTarget);
      },
      get(target, property, receiver) {
        if (property === "now") {
          violations.add("Date.now");
          return () => {
            return 0;
          };
        }
        return Reflect.get(target, property, receiver);
      },
    });
    replace(globalThis, "Date", { value: guardedDate, writable: true });
    replace(Math, "random", {
      get: () => {
        violations.add("Math.random");
        return () => 0;
      },
    });
    for (const [name, object, methods] of [
      ["performance", originalPerformance, ["now"]],
      ["crypto", originalCrypto, ["randomUUID", "getRandomValues"]],
    ] as const) {
      if (!object) continue;
      replace(globalThis, name, {
        value: new Proxy(object, {
          get(target, property) {
            if (methods.some((method) => method === property)) {
              violations.add(`${name}.${String(property)}`);
              return (value?: unknown) => {
                return property === "now" ? 0 : property === "getRandomValues" ? value : "";
              };
            }
            const value = Reflect.get(target, property, target);
            return typeof value === "function" ? value.bind(target) : value;
          },
        }),
        writable: true,
      });
    }
    result = render();
  } catch (error) {
    failure = error;
  } finally {
    for (const item of saved.reverse()) {
      if (item.descriptor) Object.defineProperty(item.object, item.key, item.descriptor);
      else Reflect.deleteProperty(item.object, item.key);
    }
    for (const name of Reflect.ownKeys(globalThis))
      if (!Object.hasOwn(globals, name)) Reflect.deleteProperty(globalThis, name);
    for (const name of Reflect.ownKeys(globals))
      Object.defineProperty(globalThis, name, globals[name as keyof typeof globals]!);
  }
  if (violations.size)
    throw new Error(
      `SSR purity violations: ${[...violations].join(", ")}${failure ? `; render failed: ${String(failure)}` : ""}`,
    );
  if (failure) throw failure;
  return result;
}

export async function checkDirection(
  mount: (dir: "ltr" | "rtl") => { root: Element; unmount: () => void },
): Promise<void> {
  const descriptors = Object.getOwnPropertyDescriptors(globalThis);
  const measurements: number[][] = [];
  try {
    for (const dir of ["ltr", "rtl"] as const) {
      const mounted = mount(dir);
      try {
        const root = mounted.root;
        root.setAttribute("dir", dir);
        await Promise.resolve();
        const container = all(
          root,
          '[role="toolbar"], [role="tablist"], [role="radiogroup"], [role="listbox"], [role="menu"], [role="tree"]',
        )[0];
        if (!container) throw new Error(`${dir}: no composite found`);
        const children = all(
          container,
          '[role="tab"], [role="radio"], [role="option"], [role="menuitem"], [role="treeitem"], button, input[type="radio"], a[href]',
        ).filter((child) => enabled(child));
        const entry = children.find((child) => (child as HTMLElement).tabIndex === 0);
        if (!entry || children.length < 3)
          throw new Error(
            `${dir}: direction check requires a tab stop and at least three children`,
          );
        const indexes: number[] = [];
        for (const arrow of ["ArrowRight", "ArrowLeft"]) {
          focus(entry);
          await Promise.resolve();
          const target = activeElementInRoot(container);
          if (!target) throw new Error(`${dir}: cannot focus entry`);
          await key(target, arrow);
          const index = children.indexOf(current(container)!);
          if (index < 0 || children[index] === entry)
            throw new Error(`${dir}: ${arrow} did not move focus within the composite`);
          indexes.push(index);
        }
        if (indexes[0] === indexes[1])
          throw new Error(`${dir}: horizontal arrows did not move in opposite directions`);
        measurements.push(indexes);
      } finally {
        mounted.unmount();
      }
    }
    if (measurements[0]![0] !== measurements[1]![1] || measurements[0]![1] !== measurements[1]![0])
      throw new Error("RTL horizontal arrows do not mirror LTR");
  } finally {
    for (const name of Reflect.ownKeys(globalThis))
      if (!Object.hasOwn(descriptors, name)) Reflect.deleteProperty(globalThis, name);
    for (const name of Reflect.ownKeys(descriptors))
      Object.defineProperty(globalThis, name, descriptors[name as keyof typeof descriptors]!);
  }
}
