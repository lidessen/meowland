import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import {
  ChatComposer,
  composerQueryLimit,
  findComposerTrigger,
  insertComposerSuggestion,
  type ComposerTrigger,
} from "../../../src/chat";
import { checkSsrPurity } from "../pattern-kit";

const triggers = [{ char: "@" }, { char: "/", position: "start" as const }];

test("a trigger opens only at the start of the caret's word", () => {
  expect(findComposerTrigger("@ta", 3, triggers)).toEqual({ index: 0, char: "@", query: "ta" });
  expect(findComposerTrigger("Ship after @t-1", 15, triggers)).toEqual({
    index: 11,
    char: "@",
    query: "t-1",
  });
  expect(findComposerTrigger("line\n@", 6, triggers)).toEqual({ index: 5, char: "@", query: "" });
  // Mid-word characters are prose: an email address, a path.
  expect(findComposerTrigger("me@example", 10, triggers)).toBeNull();
  expect(findComposerTrigger("a/b", 3, triggers)).toBeNull();
  // The caret decides the word, not the end of the text.
  expect(findComposerTrigger("@one two", 4, triggers)?.query).toBe("one");
  expect(findComposerTrigger("@one two", 8, triggers)).toBeNull();
  expect(findComposerTrigger("@", 0, triggers)).toBeNull();
});

test("a start trigger needs only whitespace before it in the whole draft", () => {
  expect(findComposerTrigger("/mo", 3, triggers)).toEqual({ index: 0, char: "/", query: "mo" });
  expect(findComposerTrigger("  \n/mo", 6, triggers)?.index).toBe(3);
  expect(findComposerTrigger("Run /mo", 7, triggers)).toBeNull();
});

test("a query past the limit does not open a list", () => {
  const long = `@${"x".repeat(composerQueryLimit)}`;
  expect(findComposerTrigger(long, long.length, triggers)?.query.length).toBe(composerQueryLimit);
  expect(findComposerTrigger(`${long}x`, long.length + 1, triggers)).toBeNull();
});

test("accepting replaces the trigger text and places the caret after it", () => {
  const match = { index: 11, char: "@", query: "pag" };
  expect(
    insertComposerSuggestion(
      "Follow up @pag",
      { ...match, index: 10 },
      { id: "t-105", label: "Paginate" },
    ),
  ).toEqual({
    text: "Follow up @t-105 ",
    caret: 17,
  });
  // Existing whitespace after the query is reused, not doubled.
  expect(
    insertComposerSuggestion("Ship after @pag now", match, { id: "t-105", label: "x" }),
  ).toEqual({
    text: "Ship after @t-105 now",
    caret: 17,
  });
  // A custom insert and a path that keeps drilling.
  expect(
    insertComposerSuggestion(
      "#sr",
      { index: 0, char: "#", query: "sr" },
      { id: "src", label: "src", insert: "#src/", trailingSpace: false },
    ),
  ).toEqual({ text: "#src/", caret: 5 });
  // A command that acts removes its text and the space that followed it.
  expect(
    insertComposerSuggestion(
      "/cle rest",
      { index: 0, char: "/", query: "cle" },
      { id: "clear", label: "Clear", insert: "" },
    ),
  ).toEqual({ text: "rest", caret: 0 });
});

test("a composer with triggers wires list semantics only while the list is open", () => {
  const trigger: ComposerTrigger = { char: "@", label: "Tasks", suggest: () => [] };
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(<ChatComposer triggers={[trigger]} inputLabel="Task" />);
  expect(html).toContain('aria-autocomplete="list"');
  expect(html).toContain('aria-haspopup="listbox"');
  expect(html).not.toContain("aria-controls");
  expect(html).not.toContain("aria-activedescendant");
  expect(html).toMatch(/role="status" aria-live="polite"/);
  expect(html).toMatch(/<div id="chat-composer-\d+-surface"/);
  const plain = web.renderToHtml(<ChatComposer inputLabel="Plain" />);
  expect(plain).not.toContain("aria-autocomplete");
  expect(plain).not.toContain('role="listbox"');
  expect(plain).not.toContain("-surface");
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

test("renders trigger and plain composers without browser globals or nondeterminism", () => {
  const web = createWebRenderer(createRuntime());
  const trigger: ComposerTrigger = { char: "@", label: "Tasks", suggest: () => [] };
  expect(checkSsrPurity(() => web.renderToHtml(<ChatComposer triggers={[trigger]} />))).toContain(
    'aria-autocomplete="list"',
  );
  expect(checkSsrPurity(() => web.renderToHtml(<ChatComposer />))).not.toContain("-surface");
});

for (const shadow of [false, true]) {
  test(`navigates suggestions and resolves references in ${shadow ? "shadow root" : "document"}`, async () => {
    const trigger: ComposerTrigger = {
      char: "@",
      label: "Tasks",
      suggest: () => [
        { id: "first / item", label: "First" },
        { id: "disabled", label: "Disabled", disabled: true },
        { id: "last", label: "Last" },
      ],
    };
    const view = mount(<ChatComposer triggers={[trigger]} />, shadow);
    try {
      await Promise.resolve();
      const input = view.root.querySelector<HTMLTextAreaElement>("textarea")!;
      input.focus();
      input.value = "@";
      input.setSelectionRange(1, 1);
      input.dispatchEvent(
        new input.ownerDocument.defaultView!.Event("input", { bubbles: true, composed: true }),
      );
      await Promise.resolve();
      await Promise.resolve();
      const list = view.root.querySelector('[role="listbox"]')!;
      const options = list.querySelectorAll('[role="option"]');
      expect(input.getAttribute("aria-controls")).toBe(list.id);
      expect(input.getAttribute("aria-activedescendant")).toBe(options[0]!.id);
      expect(options[0]!.id).toContain("first%20%2F%20item");
      expect(options[1]!.getAttribute("aria-disabled")).toBe("true");
      view.key(input, "ArrowDown");
      await Promise.resolve();
      expect(input.getAttribute("aria-activedescendant")).toBe(options[2]!.id);
      expect(view.active()).toBe(input);
      view.key(input, "ArrowDown");
      await Promise.resolve();
      expect(input.getAttribute("aria-activedescendant")).toBe(options[0]!.id);
      expect(view.key(input, "Home").defaultPrevented).toBe(false);
      expect(view.key(input, "End").defaultPrevented).toBe(false);
      view.key(input, "Escape");
      await Promise.resolve();
      expect(input.hasAttribute("aria-activedescendant")).toBe(false);
      expect(view.key(input, "Home").defaultPrevented).toBe(false);
    } finally {
      await view.unmount();
    }
  });
}
