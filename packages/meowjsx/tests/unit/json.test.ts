import { expect, test } from "bun:test";
import {
  createContext,
  createRuntime,
  h,
  signal,
  useContext,
  type ReadableSignal,
} from "../../src/index";
import {
  createJsonView,
  defineJsonComponent,
  describeJsonCatalog,
  jsonSchema as s,
  parseJsonView,
  validateJsonValue,
} from "../../src/json/index";
import { renderToHtml } from "../../web/index";
import type { RenderStrategy } from "../../src/renderer";

test("parse validates descriptions without running components, actions, bindings or runtime hooks", () => {
  let effects = 0;
  const C = (_: { value: string | ReadableSignal<string>; onValue?: (v: string) => void }) => {
    effects++;
    return "mounted";
  };
  const catalog = new Map([
    [
      "C",
      defineJsonComponent(C, {
        value: { kind: "value", schema: s.string(), bindable: true, required: true },
        onValue: { kind: "action", args: [s.string()] },
      }),
    ],
  ]);
  const view = parseJsonView(
    { component: "C", props: { value: { $binding: "exact.name" }, onValue: { $action: "send" } } },
    catalog,
  );
  expect(effects).toBe(0);
  const runtime = createRuntime();
  let creates = 0;
  runtime.use({
    create: (ctx, next) => {
      creates++;
      return next(ctx);
    },
  });
  const child = createJsonView(view, {
    catalog,
    runtime,
    bindings: new Map([["exact.name", signal("A")]]),
    actions: new Map([
      [
        "send",
        () => {
          effects++;
        },
      ],
    ]),
  });
  expect(creates).toBe(1);
  expect(effects).toBe(0);
  expect(renderToHtml(child, { runtime })).toBe("mounted");
  expect(effects).toBe(1);
});

test("JSON uses the same Context, reactive props and explicit action arguments as JSX", () => {
  const Context = createContext("outside");
  let props: { value: ReadableSignal<string>; onValue: (value: string) => unknown } | undefined;
  const C = (input: { value: ReadableSignal<string>; onValue: (value: string) => unknown }) => {
    props = input;
    return h("span", null, useContext(Context), ":", input.value);
  };
  const catalog = new Map([
    [
      "C",
      defineJsonComponent(C, {
        value: { kind: "value", schema: s.string(), bindable: true, required: true },
        onValue: { kind: "action", args: [s.string()] },
      }),
    ],
  ]);
  const value = signal("first"),
    received: string[] = [];
  const view = parseJsonView(
    { component: "C", props: { value: { $binding: "value" }, onValue: { $action: "set" } } },
    catalog,
  );
  const child = createJsonView(view, {
    catalog,
    bindings: new Map([["value", value]]),
    actions: new Map([
      [
        "set",
        (next: string) => {
          received.push(next);
          return { accepted: true };
        },
      ],
    ]),
  });
  expect(renderToHtml(h(Context.Provider, { value: "inside" }, child))).toBe(
    "<span>inside:first</span>",
  );
  value.value = "second";
  expect(renderToHtml(child)).toBe("<span>outside:second</span>");
  expect(props!.onValue("sent")).toEqual({ accepted: true });
  expect(received).toEqual(["sent"]);
  expect(() => props!.onValue(42 as unknown as string)).toThrow("Expected string");
  expect(received).toEqual(["sent"]);
  expect(() =>
    createJsonView(view, { catalog, bindings: new Map([["value.path", value]]) }),
  ).toThrow("Host binding");
});

test("schema descriptions and finite union validation come from the same metadata", () => {
  const part = s.union(
    s.object({ kind: s.enum("text"), text: s.string() }),
    s.object({ kind: s.enum("code"), code: s.string() }),
  );
  expect(validateJsonValue(part, { kind: "text", text: "hello" })).toEqual({
    kind: "text",
    text: "hello",
  });
  expect(validateJsonValue(part, { kind: "code", code: "x" })).toEqual({ kind: "code", code: "x" });
  expect(() => validateJsonValue(part, { kind: "text", code: "wrong" })).toThrow("Expected union");
  const C = (_: { part: { kind: "text"; text: string } | { kind: "code"; code: string } }) => null;
  const catalog = new Map([
    ["C", defineJsonComponent(C, { part: { kind: "value", schema: part, required: true } })],
  ]);
  expect(JSON.stringify(describeJsonCatalog(catalog))).toContain('"anyOf"');
  expect(() => parseJsonView({ component: "C", props: {} }, catalog)).toThrow("required");
});

test("literal business objects remain data while control boundaries reject unsafe shapes", () => {
  const C = (_: { data: unknown }) => null;
  const catalog = new Map([
    ["C", defineJsonComponent(C, { data: { kind: "value", schema: s.data() } })],
  ]);
  const body = {
    constructor: "a normal field",
    child: { $action: "literal" },
    nested: { $binding: "literal" },
  };
  expect(() => parseJsonView({ component: "C", props: { data: body } }, catalog)).not.toThrow();
  for (const props of [{ missing: true }, { ref: "x" }, { data: { $binding: "a", extra: true } }])
    expect(() => parseJsonView({ component: "C", props }, catalog)).toThrow();
  expect(() => parseJsonView({ component: "script", props: {} }, catalog)).toThrow("catalog");
  let reads = 0;
  const accessor = Object.defineProperty({}, "component", {
    enumerable: true,
    get: () => {
      reads++;
      return "C";
    },
  });
  expect(() => parseJsonView(accessor, catalog)).toThrow("accessors");
  expect(reads).toBe(0);
  const cyclic: unknown[] = [];
  cyclic.push(cyclic);
  expect(() => parseJsonView(cyclic, catalog)).toThrow("Cyclic");
  expect(() => parseJsonView({ component: "C", props: { data: new Date() } }, catalog)).toThrow(
    "plain",
  );
});

test("trusted event projection validates before invoking the host and preserves exact reference names", () => {
  let callback: ((event: { value: string }) => unknown) | undefined;
  const C = (props: { onInput: (event: { value: string }) => unknown }) => {
    callback = props.onInput;
    return null;
  };
  const catalog = new Map([
    [
      "C",
      defineJsonComponent(C, {
        onInput: { kind: "action", args: [s.string()], mapArgs: (event) => [event.value] },
      }),
    ],
  ]);
  const calls: string[] = [];
  renderToHtml(
    createJsonView(
      parseJsonView({ component: "C", props: { onInput: { $action: "exact/name" } } }, catalog),
      { catalog, actions: new Map([["exact/name", (value: string) => calls.push(value)]]) },
    ),
  );
  callback!({ value: "safe" });
  expect(calls).toEqual(["safe"]);
  expect(() => callback!({ value: 1 as unknown as string })).toThrow();
  expect(calls).toEqual(["safe"]);
});

test("the existing renderer owns JSON binding subscriptions and removes them on unmount", async () => {
  type Node = { text: string; parent: Node | null; children: Node[] };
  const node = (text = ""): Node => ({ text, parent: null, children: [] });
  const remove = (child: Node) => {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = null;
  };
  const strategy: RenderStrategy<Node> = {
    createText: node,
    createElement: node,
    createMarker: () => node(),
    insert(parent, child, before = null) {
      remove(child);
      parent.children.splice(
        before ? parent.children.indexOf(before) : parent.children.length,
        0,
        child,
      );
      child.parent = parent;
    },
    remove,
    setProperty() {},
    getNextSibling: (child) =>
      child.parent?.children[child.parent.children.indexOf(child) + 1] ?? null,
  };
  const text = (value: Node): string => value.text + value.children.map(text).join("");
  const original = signal("first");
  let subscriptions = 0;
  const source: ReadableSignal<string> = {
    get value() {
      return original.value;
    },
    subscribe(listener) {
      subscriptions++;
      const unsubscribe = original.subscribe(listener);
      return () => {
        subscriptions--;
        unsubscribe();
      };
    },
  };
  const C = (props: { value: ReadableSignal<string> }) => props.value;
  const catalog = new Map([
    ["C", defineJsonComponent(C, { value: { kind: "value", schema: s.string(), bindable: true } })],
  ]);
  const child = createJsonView(
    parseJsonView({ component: "C", props: { value: { $binding: "source" } } }, catalog),
    { catalog, bindings: new Map([["source", source]]) },
  );
  expect(subscriptions).toBe(0);
  const root = node();
  const mounted = createRuntime().createRenderer(strategy).render(child, root);
  expect(subscriptions).toBe(1);
  expect(text(root)).toBe("first");
  original.value = "next";
  await Promise.resolve();
  await Promise.resolve();
  expect(text(root)).toBe("next");
  mounted.unmount();
  expect(subscriptions).toBe(0);
  expect(root.children).toHaveLength(0);
});

test("literal defaults are cloned, described and validated without executing a component", () => {
  let calls = 0;
  const C = (props: { enabled?: boolean; data?: { text: string } }) => {
    calls++;
    return `${props.enabled}:${props.data!.text}`;
  };
  const original = { text: "default" };
  const catalog = new Map([
    [
      "C",
      defineJsonComponent(C, {
        enabled: { kind: "value", schema: s.enum(false), default: false },
        data: { kind: "value", schema: s.object({ text: s.string() }), default: original },
      }),
    ],
  ]);
  original.text = "changed";
  const parsed = parseJsonView({ component: "C" }, catalog);
  expect(calls).toBe(0);
  expect(renderToHtml(createJsonView(parsed, { catalog }))).toBe("false:default");
  expect(JSON.stringify(describeJsonCatalog(catalog))).toContain('"default":false');
  expect(() => parseJsonView({ component: "C", props: { enabled: true } }, catalog)).toThrow(
    "enum",
  );
});
