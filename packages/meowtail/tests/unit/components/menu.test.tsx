import { expect, test } from "bun:test";
import { createRuntime, h, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Menu, type MenuTriggerBindings } from "../../../src/components/menu";

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
        return <button {...bindings}>操作</button>;
      }}
      onOpenChange={(open) => events.push(String(open))}
      items={[
        {
          type: "group",
          id: "files",
          label: "文件",
          items: [
            { id: "copy", label: "复制", onSelect: () => events.push("copy") },
            { id: "locked", label: "锁定", disabled: true, onSelect: () => events.push("locked") },
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
        return <button {...bindings}>操作</button>;
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
      trigger={(bindings) => <button {...bindings}>打开</button>}
      items={[
        {
          id: "formats",
          label: "格式",
          children: [{ id: "text", label: "文本", onSelect: () => events.push("selected") }],
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
  let props: Props | undefined;
  const changes: boolean[] = [];
  const runtime = createRuntime();
  runtime.use({
    render({ vnode }, next) {
      if (vnode.props.role === "menu") props = vnode.props;
      return next(vnode);
    },
  });
  createWebRenderer(runtime).renderToHtml(
    <Menu
      id="walk"
      trigger={(bindings) => <button {...bindings}>操作</button>}
      items={[]}
      onOpenChange={(next) => changes.push(next)}
    />,
  );
  const doc: {
    activeElement: object | null;
    addEventListener: () => void;
    removeEventListener: () => void;
  } = { activeElement: null, addEventListener() {}, removeEventListener() {} };
  let clicked = "";
  let menuRoot: object;
  const rows = ["Alpha", "Beta", "Charlie"].map((label) => ({
    dataset: { menuLabel: label },
    closest: () => menuRoot,
    focus() {
      doc.activeElement = this;
    },
    click() {
      clicked = label;
    },
  }));
  menuRoot = { ownerDocument: doc, getRootNode: () => doc, querySelectorAll: () => rows };
  (props!.ref as (node: object) => void)(menuRoot);
  const key = (value: string, shiftKey = false) => {
    const observed = { prevented: false, stopped: false };
    (props!.onKeyDown as (event: KeyboardEvent) => void)({
      key: value,
      shiftKey,
      preventDefault() {
        observed.prevented = true;
      },
      stopPropagation() {
        observed.stopped = true;
      },
    } as KeyboardEvent);
    return observed;
  };
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
});
