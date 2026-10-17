import { expect, test } from "bun:test";
import { createRuntime, h, signal, unwrap, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Tabs } from "../../../src/components/tabs";

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
