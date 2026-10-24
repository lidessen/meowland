import { expect, test } from "bun:test";
import { createRuntime, h, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Menu, type MenuTriggerBindings } from "../../../src/components/menu";
import { mountComponent } from "./mount";

test("menu names groups and actions, blocks disabled callbacks and reports closure before action", () => {
  const runtime = createRuntime();
  const rows: Props[] = [];
  const events: string[] = [];
  let trigger: MenuTriggerBindings | undefined;
  runtime.use({
    render({ vnode }, next) {
      if (vnode.props.role === "menuitem") rows.push(vnode.props);
      return next(vnode);
    },
  });
  const html = createWebRenderer(runtime).renderToHtml(
    <Menu
      id="actions"
      trigger={(bindings) => {
        trigger = bindings;
        return <button {...bindings}>Actions</button>;
      }}
      onOpenChange={(open) => events.push(String(open))}
      items={[
        {
          type: "group",
          id: "files",
          label: "Files",
          items: [
            { id: "copy", label: "Copy", onSelect: () => events.push("copy") },
            {
              id: "locked",
              label: "Locked",
              disabled: true,
              onSelect: () => events.push("locked"),
            },
          ],
        },
        { type: "separator", id: "sep" },
      ]}
    />,
  );
  expect(html).toContain('role="menu"');
  expect(html).toContain('aria-labelledby="actions-group-files"');
  expect(html).toContain('role="separator"');
  expect(trigger?.["aria-haspopup"]).toBe("menu");
  (rows[1]!.onClick as () => void)();
  expect(events).toEqual([]);
  (rows[0]!.onClick as () => void)();
  expect(events).toEqual(["false", "copy"]);
});

test("menu trigger supports arrow-key opening without treating composition as a command", () => {
  let trigger: MenuTriggerBindings | undefined;
  const changes: boolean[] = [];
  createWebRenderer(createRuntime()).renderToHtml(
    <Menu
      id="keys"
      items={[]}
      onOpenChange={(value) => changes.push(value)}
      trigger={(bindings) => {
        trigger = bindings;
        return <button {...bindings}>Actions</button>;
      }}
    />,
  );
  trigger!.onKeyDown({ key: "ArrowDown", preventDefault() {} } as KeyboardEvent);
  trigger!.onKeyDown({ key: "ArrowDown", isComposing: true, preventDefault() {} } as KeyboardEvent);
  expect(changes).toEqual([true]);
});

test("nested actions close their root before invoking the selected leaf", () => {
  const runtime = createRuntime();
  const rows = new Map<string, Props>();
  const events: string[] = [];
  runtime.use({
    render({ vnode }, next) {
      if (typeof vnode.props["data-menu-id"] === "string")
        rows.set(vnode.props["data-menu-id"], vnode.props);
      return next(vnode);
    },
  });
  const html = createWebRenderer(runtime).renderToHtml(
    <Menu
      id="nested"
      onOpenChange={(open) => events.push(String(open))}
      trigger={(bindings) => <button {...bindings}>Open</button>}
      items={[
        {
          id: "formats",
          label: "Format",
          children: [{ id: "text", label: "Text", onSelect: () => events.push("selected") }],
        },
      ]}
    />,
  );
  expect(html).toContain('aria-controls="nested-submenu-formats"');
  expect(rows.get("formats")!["aria-haspopup"]).toBe("menu");
  (rows.get("text")!.onClick as () => void)();
  expect(events).toEqual(["false", "selected"]);
});

test("menu keyboard walks enabled rows and typeahead excludes shortcut text", () => {
  const changes: boolean[] = [];
  let clicked = "";
  const view = mountComponent(
    <Menu
      id="walk"
      trigger={(bindings) => <button {...bindings}>Actions</button>}
      items={[
        { id: "alpha", label: "Alpha", shortcut: "B", onSelect: () => (clicked = "Alpha") },
        { id: "locked", label: "Blocked", disabled: true },
        { id: "beta", label: "Beta", onSelect: () => (clicked = "Beta") },
        { id: "charlie", label: "Charlie", onSelect: () => (clicked = "Charlie") },
      ]}
      onOpenChange={(next) => changes.push(next)}
    />,
  );
  const menuRoot = view.host.querySelector('[role="menu"]')!;
  const doc = menuRoot.ownerDocument;
  const rows = menuRoot.querySelectorAll('button[role="menuitem"]:not(:disabled)');
  const key = (value: string, shiftKey = false) => {
    const event = new doc.defaultView!.KeyboardEvent("keydown", {
      key: value,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    let propagated = false;
    const observe = () => {
      propagated = true;
    };
    view.host.addEventListener("keydown", observe);
    try {
      menuRoot.dispatchEvent(event);
      return { prevented: event.defaultPrevented, stopped: !propagated };
    } finally {
      view.host.removeEventListener("keydown", observe);
    }
  };
  try {
    key("ArrowUp");
    expect(doc.activeElement).toBe(rows[2]);
    key("ArrowDown");
    expect(doc.activeElement).toBe(rows[0]);
    key("End");
    expect(doc.activeElement).toBe(rows[2]);
    key("Home");
    expect(doc.activeElement).toBe(rows[0]);
    key("b");
    expect(doc.activeElement).toBe(rows[1]);
    expect(key("Tab")).toEqual({ prevented: false, stopped: true });
    expect(key("Tab", true)).toEqual({ prevented: false, stopped: true });
    expect(changes).toEqual([false, false]);
    expect(clicked).toBe("");
  } finally {
    view.unmount();
  }
});
