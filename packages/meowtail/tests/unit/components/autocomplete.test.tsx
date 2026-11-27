import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { checkPattern, checkSsrPurity } from "../pattern-kit";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { Autocomplete, Field, installMeowUI, meowUIComponents } from "../../../src/index";

function html(view: unknown) {
  const runtime = createRuntime();
  installMeowUI({ components: meowUIComponents }, runtime);
  return createWebRenderer(runtime).renderToHtml(view as never);
}

test("the input is a closed list combobox that keeps native form participation", () => {
  const output = html(
    <Autocomplete
      id="path"
      name="path"
      required
      defaultValue="src/"
      suggestions={[{ value: "src/index.ts" }]}
    />,
  );
  expect(output).toContain('id="path"');
  expect(output).toContain('role="combobox"');
  expect(output).toContain('aria-autocomplete="list"');
  expect(output).toContain('aria-expanded="false"');
  expect(output).toContain('aria-controls="path-list"');
  expect(output).toContain('name="path"');
  expect(output).toContain("required");
  expect(output).toContain('value="src/"');
  expect(output).not.toContain("aria-activedescendant");
  // Loading and empty text sit beside the listbox, never inside it.
  expect(output).toMatch(/<div id="path-list" role="listbox"[^>]*>.*<\/div><p role="status"/);
});

test("Field labels and describes the text input itself", () => {
  const output = html(
    <Field label="Path" description="Any path is valid">
      <Autocomplete suggestions={[]} />
    </Field>,
  );
  const id = /<label for="([^"]+)"/.exec(output)![1]!;
  const input = /<input [^>]*>/.exec(output)![0];
  expect(input).toContain(`id="${id}"`);
  expect(input).toContain(`aria-describedby="${id}-description"`);
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
    checkSsrPurity(() => html(<Autocomplete id="paths" suggestions={[{ value: "one" }]} />)),
  ).toContain('role="combobox"');
});

for (const shadow of [false, true]) {
  test(`checks combobox navigation and references in ${shadow ? "shadow root" : "document"}`, async () => {
    const suggestions = signal([{ value: "one" }, { value: "two" }, { value: "three" }]);
    const accepted: string[] = [];
    const view = mount(
      <Autocomplete
        id="paths"
        suggestions={suggestions}
        onAccept={(item) => accepted.push(item.value)}
      />,
      shadow,
    );
    try {
      const input = view.root.querySelector<HTMLInputElement>('input[role="combobox"]')!;
      input.focus();
      expect(view.key(input, "Enter").defaultPrevented).toBe(false);
      view.key(input, "ArrowDown", { altKey: true });
      await Promise.resolve();
      expect(input.getAttribute("aria-expanded")).toBe("true");
      expect(input.hasAttribute("aria-activedescendant")).toBe(false);
      view.key(input, "ArrowDown");
      await Promise.resolve();
      expect(input.getAttribute("aria-activedescendant")).toBe("paths-option-one");
      await checkPattern(view.root, "combobox");
      expect(view.active() === input).toBe(true);
      suggestions.value = [{ value: "one" }, { value: "two" }];
      await Promise.resolve();
      expect(input.hasAttribute("aria-activedescendant")).toBe(false);
      suggestions.value = [{ value: "one" }, { value: "two" }, { value: "three" }];
      await Promise.resolve();
      expect(input.hasAttribute("aria-activedescendant")).toBe(false);
      view.key(input, "ArrowDown");
      view.key(input, "Enter");
      await Promise.resolve();
      expect(accepted).toEqual(["one"]);
      expect(input.getAttribute("aria-expanded")).toBe("false");
    } finally {
      await view.unmount();
    }
  });
}

test("opening arrows highlight, typing clears, and unhighlighted Home and Enter remain native", async () => {
  const view = mount(
    <Autocomplete id="keyboard" suggestions={[{ value: "one" }, { value: "two" }]} />,
  );
  try {
    const input = view.root.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    input.focus();
    expect(view.key(input, "Home").defaultPrevented).toBe(false);
    view.key(input, "ArrowUp");
    await Promise.resolve();
    await Promise.resolve();
    expect(input.getAttribute("aria-activedescendant")).toBe("keyboard-option-two");
    input.value = "draft";
    input.dispatchEvent(new input.ownerDocument.defaultView!.Event("input", { bubbles: true }));
    await Promise.resolve();
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    expect(view.key(input, "Home").defaultPrevented).toBe(false);
    expect(view.key(input, "Enter").defaultPrevented).toBe(false);
    view.key(input, "ArrowDown");
    await Promise.resolve();
    expect(input.getAttribute("aria-activedescendant")).toBe("keyboard-option-one");
    view.key(input, "Escape");
    await Promise.resolve();
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  } finally {
    await view.unmount();
  }
});
