import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { CommandPalette, commandMatches } from "../../../src/index";
import { checkPattern, checkSsrPurity } from "../pattern-kit";

test("every query term must appear in the label, group or keywords", () => {
  const command = { id: "t", label: "Open terminal", group: "Workspace", keywords: ["shell"] };
  expect(commandMatches(command, "")).toBe(true);
  expect(commandMatches(command, "open")).toBe(true);
  expect(commandMatches(command, "  OPEN   work ")).toBe(true);
  expect(commandMatches(command, "shell term")).toBe(true);
  expect(commandMatches(command, "open file")).toBe(false);
  // Plain containment, not fuzzy ranking.
  expect(commandMatches(command, "otl")).toBe(false);
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

const commands = [
  { id: "first / item", label: "First" },
  { id: "disabled", label: "Disabled", disabled: true },
  { id: "last", label: "Last" },
];

test("renders without browser globals or nondeterminism", () => {
  const html = checkSsrPurity(() =>
    createWebRenderer(createRuntime()).renderToHtml(
      <CommandPalette open={false} commands={commands} onOpenChange={() => {}} onRun={() => {}} />,
    ),
  );
  expect(html).toContain('role="combobox"');
});

for (const shadow of [false, true]) {
  test(`navigates enabled commands and resolves references in ${shadow ? "shadow root" : "document"}`, async () => {
    const open = signal(true);
    const view = mount(
      <CommandPalette
        open={open}
        commands={commands}
        onOpenChange={(next) => {
          open.value = next;
        }}
        onRun={() => {}}
      />,
      shadow,
    );
    try {
      await Promise.resolve();
      await Promise.resolve();
      const input = view.root.querySelector<HTMLInputElement>('input[role="combobox"]')!;
      const options = view.root.querySelectorAll('[role="option"]');
      expect(input.getAttribute("aria-activedescendant")).toBe(options[0]!.id);
      expect(options[0]!.id).toContain("first%20%2F%20item");
      view.key(input, "ArrowDown");
      await Promise.resolve();
      expect(input.getAttribute("aria-activedescendant")).toBe(options[2]!.id);
      view.key(input, "ArrowDown");
      await Promise.resolve();
      expect(input.getAttribute("aria-activedescendant")).toBe(options[0]!.id);
      await checkPattern(view.root, "combobox");
      input.value = "Last";
      input.dispatchEvent(new input.ownerDocument.defaultView!.Event("input", { bubbles: true }));
      await Promise.resolve();
      await Promise.resolve();
      expect(input.getAttribute("aria-activedescendant")).toBe(options[2]!.id);
      expect(options[0]!.hasAttribute("hidden")).toBe(true);
    } finally {
      await view.unmount();
    }
  });
}
