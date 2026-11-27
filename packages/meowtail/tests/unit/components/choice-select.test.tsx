import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { checkSsrPurity } from "../pattern-kit";
import { createRuntime, h, type Props } from "meowjsx";
import { unwrap, signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { ChoiceSelect } from "../../../src/components/choice-select";

const options = [
  { value: "draft", label: "Keep draft", group: "Local" },
  { value: "review", label: "Submit for review", group: "Remote" },
  { value: "locked", label: "Currently unavailable", disabled: true },
];

test("unthemed choices retain native form validation and caller labelling", () => {
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(
    <ChoiceSelect
      id="delivery"
      name="delivery"
      options={options}
      defaultValue="review"
      required
      aria-labelledby="delivery-label"
      aria-describedby="delivery-help"
    />,
  );
  expect(html).toContain('name="delivery"');
  expect(html).toContain('value="review" required');
  expect(html).toContain('aria-labelledby="delivery-label"');
  expect(html).toContain('aria-describedby="delivery-help delivery-value delivery-validation"');
  expect(html).toContain('id="delivery-validation" role="alert"');
  expect(html).toContain('<option value="locked" disabled>');
});

test("uncontrolled selection updates the form value while controlled selection remains caller-owned", () => {
  for (const controlled of [false, true]) {
    const runtime = createRuntime();
    const clicked = new Map<string, () => void>();
    let native: Props = {};
    const changes: string[] = [];
    runtime.use({
      render({ vnode }, next) {
        if (vnode.type === "select") native = vnode.props;
        if (vnode.props.role === "option")
          clicked.set(
            String(unwrap(vnode.props["data-choice-index"])),
            vnode.props.onClick as () => void,
          );
        return next(vnode);
      },
    });
    const value = signal("draft");
    createWebRenderer(runtime).renderToHtml(
      <ChoiceSelect
        options={options}
        defaultValue="draft"
        value={controlled ? value : undefined}
        onValueChange={(next) => changes.push(next)}
      />,
    );
    clicked.get("1")!();
    expect(changes).toEqual(["review"]);
    expect(unwrap(native.value)).toBe(controlled ? "draft" : "review");
    clicked.get("2")!();
    expect(changes).toEqual(["review"]);
  }
});

function mount(view: unknown, shadow = false) {
  const before = Object.getOwnPropertyDescriptors(globalThis);
  const dom = new Window();
  const opened = new WeakSet<Element>();
  const prototype = dom.HTMLElement.prototype;
  const originals = Object.getOwnPropertyDescriptors(prototype);
  const originalMatches = prototype.matches;
  Object.defineProperties(dom.HTMLElement.prototype, {
    showPopover: {
      configurable: true,
      value(this: Element) {
        opened.add(this);
      },
    },
    hidePopover: {
      configurable: true,
      value(this: Element) {
        opened.delete(this);
      },
    },
    matches: {
      configurable: true,
      value(this: Element, selector: string) {
        return selector === ":popover-open"
          ? opened.has(this)
          : originalMatches.call(this, selector);
      },
    },
  });
  for (const name of [
    "window",
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
  Object.defineProperty(globalThis, "getComputedStyle", {
    value: dom.getComputedStyle.bind(dom),
    configurable: true,
    writable: true,
  });
  const host = dom.document.createElement("div");
  dom.document.body.append(host);
  const root = dom.document.createElement("div");
  (shadow ? host.attachShadow({ mode: "open" }) : host).append(root);
  const mounted = createWebRenderer(createRuntime()).render(
    view as never,
    root as unknown as Element,
  );
  return {
    root: root as unknown as HTMLElement,
    active: () =>
      (shadow
        ? host.shadowRoot!.activeElement
        : dom.document.activeElement) as unknown as Element | null,
    key(target: Element, key: string, extra: KeyboardEventInit = {}) {
      const Keyboard = dom.KeyboardEvent as unknown as typeof KeyboardEvent;
      const event = new Keyboard("keydown", {
        key,
        bubbles: true,
        cancelable: true,
        composed: true,
        ...extra,
      });
      target.dispatchEvent(event as unknown as Event);
      return event;
    },
    async unmount() {
      mounted.unmount();
      await new Promise((resolve) => setTimeout(resolve, 0));
      for (const name of ["showPopover", "hidePopover", "matches"] as const) {
        const descriptor = originals[name];
        if (descriptor) Object.defineProperty(prototype, name, descriptor);
        else Reflect.deleteProperty(prototype, name);
      }
      host.remove();
      for (const name of Reflect.ownKeys(globalThis))
        if (!Object.hasOwn(before, name)) Reflect.deleteProperty(globalThis, name);
      for (const name of Reflect.ownKeys(before))
        Object.defineProperty(globalThis, name, before[name as keyof typeof before]!);
    },
  };
}

test("renders without browser globals or nondeterminism", () => {
  expect(
    checkSsrPurity(() =>
      createWebRenderer(createRuntime()).renderToHtml(
        <ChoiceSelect id="choices" options={options} />,
      ),
    ),
  ).toContain('role="listbox"');
});

for (const shadow of [false, true]) {
  test(`keeps a single open listbox tab stop in ${shadow ? "shadow root" : "document"}`, async () => {
    const view = mount(
      <ChoiceSelect id="choices" options={options} defaultValue="review" />,
      shadow,
    );
    try {
      const trigger = view.root.querySelector<HTMLButtonElement>("#choices")!;
      const buttons = [...view.root.querySelectorAll<HTMLButtonElement>('[role="option"]')];
      expect(buttons.map((button) => button.tabIndex)).toEqual([-1, -1, -1]);
      trigger.focus();
      view.key(trigger, "ArrowDown");
      await Promise.resolve();
      expect(view.active() === buttons[1]).toBe(true);
      expect(buttons.map((button) => button.tabIndex)).toEqual([-1, 0, -1]);
      const panel = view.root.querySelector('[role="listbox"]')!;
      expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
      for (const [key, index] of [
        ["ArrowDown", 0],
        ["ArrowUp", 1],
        ["Home", 0],
        ["End", 1],
      ] as const) {
        view.key(view.active()!, key);
        await Promise.resolve();
        expect(view.active() === buttons[index]).toBe(true);
        expect(panel.contains(view.active())).toBe(true);
        expect(buttons.findIndex((button) => button.tabIndex === 0)).toBe(index);
        expect(buttons.filter((button) => button.tabIndex === 0)).toHaveLength(1);
      }
      view.key(view.active()!, " ");
      await Promise.resolve();
      expect(view.active() === trigger).toBe(true);
      expect(buttons.every((button) => button.tabIndex === -1)).toBe(true);
    } finally {
      await view.unmount();
    }
  });
}

test("search input filters and enters the list without taking its tab stop", async () => {
  const view = mount(<ChoiceSelect id="search-choice" options={options} searchable />);
  try {
    const trigger = view.root.querySelector<HTMLButtonElement>("#search-choice")!;
    trigger.click();
    await Promise.resolve();
    const search = view.root.querySelector<HTMLInputElement>('input[type="search"]')!;
    expect(view.active() === search).toBe(true);
    search.value = "review";
    search.dispatchEvent(new search.ownerDocument.defaultView!.Event("input", { bubbles: true }));
    await Promise.resolve();
    const buttons = [...view.root.querySelectorAll<HTMLButtonElement>('[role="option"]')];
    expect(buttons.findIndex((button) => button.tabIndex === 0)).toBe(1);
    view.key(search, "ArrowDown");
    await Promise.resolve();
    expect(view.active() === buttons[1]).toBe(true);
  } finally {
    await view.unmount();
  }
});

test("typeahead opens at the first matching option and Shift-Tab closes", async () => {
  const view = mount(<ChoiceSelect id="typeahead" options={options} defaultValue="review" />);
  try {
    const trigger = view.root.querySelector<HTMLButtonElement>("#typeahead")!;
    trigger.focus();
    view.key(trigger, "k");
    await Promise.resolve();
    const buttons = [...view.root.querySelectorAll<HTMLButtonElement>('[role="option"]')];
    expect(view.active() === buttons[0]).toBe(true);
    view.key(buttons[0]!, "Tab", { shiftKey: true });
    await Promise.resolve();
    expect(buttons.every((button) => button.tabIndex === -1)).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  } finally {
    await view.unmount();
  }
});
