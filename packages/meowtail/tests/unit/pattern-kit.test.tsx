import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h, type Child } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { Button } from "../../src/components/button";
import { SegmentedControl } from "../../src/components/segmented-control";
import { Tabs } from "../../src/components/tabs";
import { Toolbar } from "../../src/components/toolbar";
import { checkDirection, checkPattern, checkSsrPurity } from "./pattern-kit";

const items = ["One", "Two", "Three"].map((label, index) => ({
  value: String(index),
  label,
  content: label,
}));
const tabs = () => <Tabs id="views" label="Views" items={items} />;
const toolbar = () => (
  <Toolbar label="Actions">
    <button>One</button>
    <button>Two</button>
    <button>Three</button>
  </Toolbar>
);
const segmented = () => (
  <SegmentedControl label="Views" value={signal("0")} options={items} onValueChange={() => {}} />
);

function mount(node: Child, shadow = false) {
  const before = Object.getOwnPropertyDescriptors(globalThis);
  const dom = new Window();
  for (const name of [
    "document",
    "HTMLElement",
    "HTMLInputElement",
    "Element",
    "Node",
    "MutationObserver",
  ] as const)
    Object.defineProperty(globalThis, name, {
      value: dom[name],
      configurable: true,
      writable: true,
    });
  const computedStyle = dom.getComputedStyle.bind(dom);
  const getStyle: typeof dom.getComputedStyle = (element) => {
    const style = computedStyle(element);
    return new Proxy(style, {
      get(target, property, receiver) {
        if (property === "direction") return element.closest("[dir]")?.getAttribute("dir") || "ltr";
        return Reflect.get(target, property, receiver);
      },
    });
  };
  dom.getComputedStyle = getStyle;
  Object.defineProperty(globalThis, "getComputedStyle", {
    value: getStyle,
    configurable: true,
    writable: true,
  });
  const host = dom.document.createElement("div");
  dom.document.body.append(host);
  const target = shadow ? host.attachShadow({ mode: "open" }) : host;
  const root = dom.document.createElement("div");
  target.append(root);
  // Happy DOM has no layout; toolbar eligibility needs a visible rectangle.
  Object.defineProperty(dom.HTMLElement.prototype, "getClientRects", {
    value: () => [{ width: 10, height: 10 }],
    configurable: true,
  });
  const rendered = createWebRenderer(createRuntime()).render(node, root as unknown as Element);
  return {
    root: root as unknown as Element,
    unmount() {
      rendered.unmount();
      host.remove();
      for (const name of Reflect.ownKeys(globalThis))
        if (!Object.hasOwn(before, name)) Reflect.deleteProperty(globalThis, name);
      for (const name of Reflect.ownKeys(before))
        Object.defineProperty(globalThis, name, before[name as keyof typeof before]!);
    },
  };
}

for (const [name, view, pattern] of [
  ["Toolbar", toolbar, "toolbar"],
  ["Tabs", tabs, "tabs"],
  ["SegmentedControl", segmented, "radio-group"],
] as const) {
  test(`checks ${name}`, async () => {
    const instance = mount(view());
    try {
      await Promise.resolve();
      await checkPattern(instance.root, pattern);
    } finally {
      instance.unmount();
    }
  });
}
test("checks focus and references inside a shadow root", async () => {
  const instance = mount(tabs(), true);
  try {
    await checkPattern(instance.root, "tabs");
  } finally {
    instance.unmount();
  }
});
test("reports missing tab stops and dangling references together", async () => {
  const instance = mount(
    <div role="listbox" aria-label="Choices" aria-controls="missing">
      <div role="option" aria-selected="false" tabIndex={-1}>
        One
      </div>
      <div role="option" aria-selected="false" tabIndex={-1}>
        Two
      </div>
    </div>,
  );
  try {
    await expect(checkPattern(instance.root, "listbox")).rejects.toThrow(
      /missing id "missing"[\s\S]*exactly one composite tab stop/,
    );
  } finally {
    instance.unmount();
  }
});
test("rejects focus escaping the composite", async () => {
  const instance = mount(
    <div role="listbox" aria-label="Choices">
      <div role="option" aria-selected="true" tabIndex={0}>
        One
      </div>
      <div role="option" aria-selected="false" tabIndex={-1}>
        Two
      </div>
    </div>,
  );
  try {
    instance.root.addEventListener("keydown", () =>
      (instance.root.ownerDocument.body as HTMLElement).focus(),
    );
    instance.root.ownerDocument.body.tabIndex = -1;
    await expect(checkPattern(instance.root, "listbox")).rejects.toThrow(
      /focus left the composite/,
    );
  } finally {
    instance.unmount();
  }
});
for (const [name, view] of [
  ["Toolbar", toolbar],
  ["Tabs", tabs],
  ["SegmentedControl", segmented],
  ["Button", () => <Button>Save</Button>],
] as const) {
  test(`renders ${name} without browser globals or nondeterminism`, () => {
    expect(checkSsrPurity(() => createWebRenderer(createRuntime()).renderToHtml(view()))).toContain(
      "<",
    );
  });
}
test("detects SSR reads and restores descriptors after errors", () => {
  const before = Object.getOwnPropertyDescriptors(globalThis);
  expect(() =>
    checkSsrPurity(() => {
      void globalThis.document;
      Date.now();
      Math.random();
      return "";
    }),
  ).toThrow(/document.*Date.now.*Math.random/);
  expect(Object.getOwnPropertyDescriptors(globalThis)).toEqual(before);
  expect(() =>
    checkSsrPurity(() => {
      throw new Error("render failure");
    }),
  ).toThrow("render failure");
  expect(Object.getOwnPropertyDescriptors(globalThis)).toEqual(before);
  expect(() =>
    checkSsrPurity(() => {
      new Date().getTime();
      performance.now();
      crypto.randomUUID();
      crypto.getRandomValues(new Uint8Array(1));
      return "";
    }),
  ).toThrow(/new Date\(\).*performance.now.*crypto.randomUUID.*crypto.getRandomValues/);
});
for (const [name, view] of [
  ["Toolbar", toolbar],
  ["Tabs", tabs],
] as const) {
  test(`checks ${name} direction`, async () => {
    const before = Object.getOwnPropertyDescriptors(globalThis);
    await checkDirection(() => mount(view()));
    expect(Object.getOwnPropertyDescriptors(globalThis)).toEqual(before);
  });
}
test("rejects direction-insensitive widgets and restores globals", async () => {
  const before = Object.getOwnPropertyDescriptors(globalThis);
  await expect(
    checkDirection(() => {
      const instance = mount(
        <div role="toolbar" aria-label="Actions">
          <button tabIndex={0}>One</button>
          <button tabIndex={-1}>Two</button>
          <button tabIndex={-1}>Three</button>
        </div>,
      );
      const buttons = [...instance.root.querySelectorAll("button")];
      instance.root.addEventListener("keydown", (event) => {
        const key = (event as KeyboardEvent).key;
        if (key === "ArrowRight" || key === "ArrowLeft")
          buttons[
            (buttons.indexOf(event.target as HTMLButtonElement) + (key === "ArrowRight" ? 1 : 2)) %
              3
          ]!.focus();
      });
      return instance;
    }),
  ).rejects.toThrow(/do not mirror/);
  expect(Object.getOwnPropertyDescriptors(globalThis)).toEqual(before);
});
