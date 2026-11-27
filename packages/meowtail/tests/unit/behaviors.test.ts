import { expect, spyOn, test } from "bun:test";
import { Window } from "happy-dom";
import { signal } from "meowjsx/signal";
import { elementByIdInRoot } from "../../src/shared/dom-root";
import {
  createFocusRecovery,
  createListbox,
  createRovingFocus,
  createTypeahead,
  isTypeaheadKey,
} from "../../src/behaviors";

function setup(shadow = false) {
  const win = new Window() as unknown as {
    document: Document;
    KeyboardEvent: typeof KeyboardEvent;
  };
  const doc = win.document;
  const host = doc.createElement("div");
  doc.body.append(host);
  const tree = shadow ? host.attachShadow({ mode: "open" }) : host;
  const root = doc.createElement("div");
  root.tabIndex = -1;
  tree.append(root);
  const buttons = ["Alpha", "Alpine", "Beta", "Charlie"].map((label) => {
    const el = doc.createElement("button");
    el.textContent = label;
    root.append(el);
    return { key: label.toLowerCase(), label, el };
  });
  const key = (name: string, extra: KeyboardEventInit = {}) =>
    new win.KeyboardEvent("keydown", { key: name, cancelable: true, ...extra });
  return { win, doc, tree, root, buttons, key };
}

test("typeahead accumulates normalized prefixes, times out, and cycles repeated keys", () => {
  let now = 1000;
  const clock = spyOn(Date, "now").mockImplementation(() => now);
  try {
    const find = createTypeahead(700);
    const labels = ["  Alpha   One", "alpine", "Beta", "apple"];
    expect(find("a", labels, -1)).toBe(0);
    expect(find("l", labels, 0)).toBe(0);
    expect(find("p", labels, 0)).toBe(0);
    expect(find("h", labels, 0)).toBe(0);
    expect(find("a", labels, 0)).toBe(0);
    expect(find(" ", labels, 0)).toBe(0);
    expect(find("o", labels, 0)).toBe(0);
    now += 701;
    expect(find.active()).toBe(false);
    expect(find("a", labels, 0)).toBe(1);
    expect(find("a", labels, 1)).toBe(3);
    find.reset();
    expect(find.active()).toBe(false);
    expect(find("a", ["aardvark", "apple"], -1)).toBe(0);
    expect(find("a", ["aardvark", "apple"], 0)).toBe(0);
  } finally {
    clock.mockRestore();
  }
});

test("typeahead ignores shortcuts, controls and IME composition", () => {
  const { key } = setup();
  expect(isTypeaheadKey(key("a"))).toBe(true);
  for (const extra of [
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { isComposing: true },
  ])
    expect(isTypeaheadKey(key("a", extra))).toBe(false);
  expect(isTypeaheadKey(key("ArrowDown"))).toBe(false);
  expect(isTypeaheadKey(key("\n"))).toBe(false);
});

test("roving focus respects orientation, direction, boundaries and controlled signals", () => {
  const { buttons, key } = setup();
  const stop = signal<string | null>(null);
  const horizontal = createRovingFocus({
    items: buttons,
    orientation: "horizontal",
    loop: false,
    stop,
  });
  horizontal.reconcile();
  expect(stop.value).toBe("alpha");
  expect(horizontal.tabIndex("alpha")).toBe(0);
  expect(horizontal.keydown(key("ArrowDown"))).toBe(false);
  horizontal.keydown(key("ArrowRight"));
  expect(stop.value).toBe("alpine");
  buttons[1]!.el.style.direction = "rtl";
  horizontal.keydown(key("ArrowRight"));
  expect(stop.value).toBe("alpha");
  horizontal.keydown(key("ArrowLeft"));
  expect(stop.value).toBe("alpha");
  horizontal.keydown(key("End"));
  expect(stop.value).toBe("charlie");
  horizontal.keydown(key("Home"));
  expect(stop.value).toBe("alpha");
  const vertical = createRovingFocus({ items: buttons, orientation: "vertical" });
  vertical.reconcile();
  expect(vertical.keydown(key("ArrowRight"))).toBe(false);
  vertical.keydown(key("ArrowUp"));
  expect(vertical.stop.value).toBe("charlie");
  const both = createRovingFocus({ items: buttons, orientation: "both" });
  both.keydown(key("ArrowDown"));
  expect(both.stop.value).toBe("alpha");
  both.keydown(key("ArrowRight"));
  expect(both.stop.value).toBe("alpine");
});

test("roving focus keeps its fallback after an excluded item returns", () => {
  const { doc, buttons, key } = setup();
  const roving = createRovingFocus<string>();
  const cleanup = buttons.map((item) => roving.bind(item));
  roving.focus("alpine");
  const outside = doc.createElement("button");
  doc.body.append(outside);
  outside.focus();
  buttons[1]!.el.disabled = true;
  roving.reconcile();
  expect(roving.stop.value).toBe("alpha");
  buttons[1]!.el.disabled = false;
  roving.reconcile();
  expect(roving.tabIndex("alpha")).toBe(0);
  expect(roving.tabIndex("alpine")).toBe(-1);
  roving.keydown(key("End"));
  expect(roving.stop.value).toBe("charlie");
  cleanup.forEach((remove) => remove());
  expect(roving.stop.value).toBeNull();
  roving.dispose();
});

test("roving focus moves between items in an open shadow root", () => {
  const { tree, buttons, key } = setup(true);
  const roving = createRovingFocus({ items: buttons });
  buttons[1]!.el.focus();
  roving.keydown(key("ArrowDown"));
  expect((tree as ShadowRoot).activeElement).toBe(buttons[2]!.el);
});

test("real listbox skips unavailable items, navigates pages and uses typeahead", () => {
  const { doc, buttons, key } = setup();
  buttons[1]!.el.disabled = true;
  buttons[2]!.el.hidden = true;
  const list = createListbox({
    items: buttons,
    id: "real",
    focus: "real",
    pageSize: 2,
    loop: true,
  });
  list.keydown(key("ArrowDown"));
  expect(doc.activeElement).toBe(buttons[0]!.el);
  list.keydown(key("ArrowDown"));
  expect(list.highlighted.value).toBe("charlie");
  list.keydown(key("ArrowDown"));
  expect(list.highlighted.value).toBe("alpha");
  list.keydown(key("End"));
  list.keydown(key("PageUp"));
  expect(list.highlighted.value).toBe("alpha");
  list.keydown(key("PageDown"));
  expect(list.highlighted.value).toBe("charlie");
  list.keydown(key("Home"));
  expect(list.keydown(key(" "))).toBe(false);
  list.keydown(key("c"));
  expect(doc.activeElement).toBe(buttons[3]!.el);
  expect(list.keydown(key(" "))).toBe(true);
  list.dispose();
});

test("virtual listbox keeps controller focus and resolves active descendant in its shadow root", () => {
  const { doc, root, tree, buttons, key } = setup(true);
  const controller = doc.createElement("input");
  root.prepend(controller);
  const list = createListbox({ items: buttons, id: "choices", focus: "virtual", controller });
  for (const item of buttons) item.el.id = list.idForKey(item.key);
  controller.focus();
  list.keydown(key("ArrowDown"));
  list.keydown(key("ArrowDown"));
  const id = list.activeId();
  controller.setAttribute("aria-activedescendant", id!);
  expect((tree as ShadowRoot).activeElement).toBe(controller);
  expect(elementByIdInRoot(controller, controller.getAttribute("aria-activedescendant")!)).toBe(
    buttons[1]!.el,
  );
  expect(doc.getElementById(id!)).toBeNull();
  buttons[1]!.el.hidden = true;
  expect(list.activeId()).toBeUndefined();
  list.reconcile();
  expect(list.highlighted.value).toBe("alpha");
});

for (const shadow of [false, true]) {
  test(`focus recovery handles removal and disabling in ${shadow ? "shadow root" : "document"}`, () => {
    const { doc, tree, root, buttons } = setup(shadow);
    let items = [...buttons];
    const recovery = createFocusRecovery({ root, items: () => items });
    buttons[1]!.el.focus();
    buttons[1]!.el.remove();
    items = items.filter((item) => item !== buttons[1]);
    recovery.reconcile();
    const active = () => (shadow ? (tree as ShadowRoot).activeElement : doc.activeElement);
    expect(active()).toBe(buttons[2]!.el);
    buttons[2]!.el.disabled = true;
    recovery.reconcile();
    expect(active()).toBe(buttons[3]!.el);
    buttons[3]!.el.hidden = true;
    buttons[0]!.el.hidden = true;
    recovery.reconcile();
    expect(active()).toBe(root);
    recovery.dispose();
  });
}

test("focus recovery observes DOM changes and stops after disposal", async () => {
  const { doc, root, buttons } = setup();
  const recovery = createFocusRecovery({ root, items: () => buttons });
  buttons[0]!.el.focus();
  buttons[0]!.el.disabled = true;
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(doc.activeElement).toBe(buttons[1]!.el);
  recovery.dispose();
  buttons[1]!.el.disabled = true;
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(doc.activeElement).not.toBe(buttons[2]!.el);
});

test("focus recovery does not steal focus after an intentional departure", () => {
  const { doc, root, buttons } = setup();
  const recovery = createFocusRecovery({ root, items: () => buttons });
  const outside = doc.createElement("button");
  doc.body.append(outside);
  buttons[0]!.el.focus();
  outside.focus();
  buttons[0]!.el.disabled = true;
  recovery.reconcile();
  expect(doc.activeElement).toBe(outside);
  recovery.dispose();
});

test("roving focus excludes items under a hidden shadow host", () => {
  const { root, buttons } = setup(true);
  const roving = createRovingFocus({ items: buttons });
  const host = (root.getRootNode() as ShadowRoot).host as HTMLElement;
  host.hidden = true;
  roving.reconcile();
  expect(roving.stop.value).toBeNull();
  host.hidden = false;
  roving.reconcile();
  expect(roving.stop.value).toBe("alpha");
});
