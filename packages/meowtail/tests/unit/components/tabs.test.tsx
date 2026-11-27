import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h, type Props } from "meowjsx";
import { unwrap, signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { Tabs } from "../../../src/components/tabs";
import { checkDirection, checkPattern, checkSsrPurity } from "../pattern-kit";

const patternItems = ["One", "Two", "Three"].map((label) => ({
  value: label,
  label,
  content: label,
}));

function mountTabs(
  orientation: "horizontal" | "vertical" = "horizontal",
  activation: "automatic" | "manual" = "automatic",
) {
  const before = Object.getOwnPropertyDescriptors(globalThis);
  const dom = new Window();
  for (const name of ["document", "HTMLElement", "Element", "Node", "MutationObserver"] as const)
    Object.defineProperty(globalThis, name, {
      value: dom[name],
      configurable: true,
      writable: true,
    });
  const computedStyle = dom.getComputedStyle.bind(dom);
  dom.getComputedStyle = (element) =>
    new Proxy(computedStyle(element), {
      get(target, property, receiver) {
        if (property === "direction") return element.closest("[dir]")?.getAttribute("dir") || "ltr";
        return Reflect.get(target, property, receiver);
      },
    });
  const root = dom.document.createElement("div");
  dom.document.body.append(root);
  const rendered = createWebRenderer(createRuntime()).render(
    <Tabs
      id="pattern-tabs"
      label="Views"
      items={patternItems}
      orientation={orientation}
      activation={activation}
    />,
    root as unknown as Element,
  );
  return {
    root: root as unknown as Element,
    unmount() {
      rendered.unmount();
      root.remove();
      for (const name of Reflect.ownKeys(globalThis))
        if (!Object.hasOwn(before, name)) Reflect.deleteProperty(globalThis, name);
      for (const name of Reflect.ownKeys(before))
        Object.defineProperty(globalThis, name, before[name as keyof typeof before]!);
    },
  };
}

test("tabs satisfy the composite pattern and mirror horizontal direction", async () => {
  const instance = mountTabs();
  try {
    await checkPattern(instance.root, "tabs");
  } finally {
    instance.unmount();
  }
  await checkDirection(() => mountTabs());
});

test("vertical manual tabs move focus without selecting until activated", async () => {
  const instance = mountTabs("vertical", "manual");
  try {
    const tabs = [...instance.root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    tabs[0]!.focus();
    const view = instance.root.ownerDocument.defaultView!;
    tabs[0]!.dispatchEvent(
      new view.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
    );
    expect(instance.root.ownerDocument.activeElement).toBe(tabs[1]!);
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    tabs[1]!.click();
    await Promise.resolve();
    expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");
  } finally {
    instance.unmount();
  }
});

test("tabs render on the server without impure global calls", () => {
  expect(
    checkSsrPurity(() =>
      createWebRenderer(createRuntime()).renderToHtml(
        <Tabs id="server-tabs" label="Views" items={patternItems} />,
      ),
    ),
  ).toContain('role="tablist"');
});

test("tabs keep panels mounted while controlled selection remains caller-owned", () => {
  const runtime = createRuntime();
  const buttons: Props[] = [];
  const panels: Props[] = [];
  runtime.use({
    render({ vnode }, next) {
      if (vnode.props.role === "tab") buttons.push(vnode.props);
      if (vnode.props.role === "tabpanel") panels.push(vnode.props);
      return next(vnode);
    },
  });
  const selected = signal("first");
  const requested: string[] = [];
  const html = createWebRenderer(runtime).renderToHtml(
    <Tabs
      id="test-tabs"
      label="Views"
      value={selected}
      onValueChange={(value) => requested.push(value)}
      items={[
        { value: "first", label: "First", content: "First content" },
        { value: "second", label: "Second", content: "Second content" },
      ]}
    />,
  );
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain("First content");
  expect(html).toContain("Second content");
  (buttons[1]!.onClick as () => void)();
  expect(requested).toEqual(["second"]);
  expect(unwrap(buttons[0]!["aria-selected"])).toBe("true");
  expect(unwrap(panels[1]!.hidden)).toBe(true);
});

test("tabs connect panels to their tabs and ignore disabled selection", () => {
  for (const controlled of [false, true]) {
    const runtime = createRuntime();
    const tabs: Props[] = [];
    const panels: Props[] = [];
    runtime.use({
      render({ vnode }, next) {
        if (vnode.props.role === "tab") tabs.push(vnode.props);
        if (vnode.props.role === "tabpanel") panels.push(vnode.props);
        return next(vnode);
      },
    });
    const value = signal("two");
    const changes: string[] = [];
    createWebRenderer(runtime).renderToHtml(
      <Tabs
        id="views"
        label="Views"
        value={controlled ? value : undefined}
        onValueChange={(next) => changes.push(next)}
        items={[
          { value: "one", label: "One", content: "First page" },
          { value: "two", label: "Two", content: "Second page" },
          { value: "three", label: "Three", content: "Unavailable", disabled: true },
        ]}
      />,
    );
    expect(tabs[1]!["aria-controls"]).toBe(panels[1]!.id);
    expect(panels[1]!["aria-labelledby"]).toBe(tabs[1]!.id);
    expect(unwrap(tabs[1]!["aria-selected"])).toBe(controlled ? "true" : "false");
    expect(unwrap(panels[1]!.hidden)).toBe(!controlled);
    expect(unwrap(tabs[controlled ? 1 : 0]!.tabIndex)).toBe(0);
    (tabs[2]!.onClick as () => void)();
    expect(changes).toEqual([]);
  }
});

test("tabs without an id generate distinct, connected ARIA references", () => {
  const runtime = createRuntime();
  const tabs: Props[] = [];
  const panels: Props[] = [];
  runtime.use({
    render({ vnode }, next) {
      if (vnode.props.role === "tab") tabs.push(vnode.props);
      if (vnode.props.role === "tabpanel") panels.push(vnode.props);
      return next(vnode);
    },
  });
  const items = [
    { value: "first", label: "First", content: "First content" },
    { value: "second", label: "Second", content: "Second content" },
  ];
  const renderer = createWebRenderer(runtime);
  renderer.renderToHtml(<Tabs label="Views" items={items} />);
  renderer.renderToHtml(<Tabs label="Views" items={items} />);

  expect(tabs).toHaveLength(4);
  for (const [index, tab] of tabs.entries()) {
    expect(tab["aria-controls"]).toBe(panels[index]!.id);
    expect(panels[index]!["aria-labelledby"]).toBe(tab.id);
  }
  expect(tabs[0]!.id).not.toBe(tabs[2]!.id);
});
