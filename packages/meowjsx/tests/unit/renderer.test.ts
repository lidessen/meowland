import { describe, expect, test } from "bun:test";
import { createContext, createRuntime, h, signal, useContext } from "../../src/runtime";
import {
  createRenderer,
  type RenderableChild,
  type RenderableProps,
  type RenderStrategy,
  type SignalLike,
} from "../../src/renderer";

type FakeNode = {
  kind: "text" | "element" | "marker";
  value: string;
  parent: FakeNode | null;
  children: FakeNode[];
  properties: Record<string, unknown>;
};

test("context follows the tree through host wrappers, sibling providers and delayed regions", async () => {
  const Value = createContext("default");
  const Reader = () => useContext(Value);
  const prebuilt = h(Reader, {});
  const late = signal(prebuilt);
  let resolve!: (value: typeof prebuilt) => void;
  const promised = new Promise<typeof prebuilt>((done) => {
    resolve = done;
  });
  const runtime = createRuntime();
  const renderer = runtime.createRenderer(fakeStrategy());
  const root = renderer.createElement("root");
  const mounted = renderer.render(
    [
      h(
        Value.Provider,
        { value: "outer" },
        h("section", {}, [
          prebuilt,
          h(Value.Provider, { value: "inner" }, late, promised),
          prebuilt,
        ]),
      ),
      prebuilt,
    ],
    root,
  );
  const text = (node: FakeNode): string =>
    node.kind === "text" ? node.value : node.children.map(text).join("|");
  expect(text(root).replaceAll("||", "|")).toContain("outer|inner");
  late.value = h(Reader, {});
  resolve(prebuilt);
  await Promise.resolve();
  await Promise.resolve();
  const words = text(root).split("|").filter(Boolean);
  expect(words).toEqual(["outer", "inner", "inner", "outer", "default"]);
  const other = createRuntime().createRenderer(fakeStrategy());
  const otherRoot = other.createElement("root");
  other.render(prebuilt, otherRoot);
  expect(text(otherRoot)).toBe("default");
  mounted.unmount();
  expect(root.children).toHaveLength(0);
  expect(useContext(Value)).toBe("default");
});

test("async iterable replacements retain their provider scope after other roots render", async () => {
  const Value = createContext("default");
  const Reader = () => useContext(Value);
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  async function* values() {
    await ready;
    yield h(Reader, {});
    yield h(Reader, {});
  }
  const renderer = createRuntime().createRenderer(fakeStrategy());
  const root = renderer.createElement("root");
  const mounted = renderer.render(h(Value.Provider, { value: "stream" }, values()), root);
  const sibling = renderer.createElement("root");
  renderer.render(h(Value.Provider, { value: "other" }, h(Reader, {})), sibling);
  release();
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(root.children.filter((node) => node.kind === "text").map((node) => node.value)).toEqual([
    "stream",
  ]);
  mounted.unmount();
});

function fakeStrategy(): RenderStrategy<FakeNode> {
  const node = (kind: FakeNode["kind"], value: string): FakeNode => ({
    kind,
    value,
    parent: null,
    children: [],
    properties: {},
  });

  return {
    createText: (value) => node("text", value),
    createElement: (type) => node("element", type),
    createMarker: (kind) => node("marker", kind),
    getNextSibling(target) {
      if (!target.parent) return null;
      const index = target.parent.children.indexOf(target);
      return index >= 0 ? (target.parent.children[index + 1] ?? null) : null;
    },
    insert(parent, child, before) {
      if (child.parent) {
        const previousIndex = child.parent.children.indexOf(child);
        if (previousIndex >= 0) child.parent.children.splice(previousIndex, 1);
      }
      if (before === undefined || before === null) {
        parent.children.push(child);
      } else {
        const index = parent.children.indexOf(before);
        if (index < 0) throw new Error("before node is not a child");
        parent.children.splice(index, 0, child);
      }
      child.parent = parent;
    },
    remove(target) {
      if (target.parent) {
        const index = target.parent.children.indexOf(target);
        if (index >= 0) target.parent.children.splice(index, 1);
        target.parent = null;
      }
      target.properties.removed = true;
    },
    setProperty(target, name, value) {
      target.properties[name] = value;
      return () => {
        delete target.properties[name];
      };
    },
  };
}

describe("createRenderer", () => {
  test("forwards target-neutral node operations and preserves node identity", () => {
    const strategy = fakeStrategy();
    const renderer = createRenderer(strategy);
    const root = renderer.createElement("root");
    const first = renderer.createText("first");
    const marker = renderer.createMarker("signal");
    const second = renderer.createText("second");

    renderer.insert(root, first);
    renderer.insert(root, second);
    renderer.insert(root, marker, second);

    expect(root.children).toEqual([first, marker, second]);
    expect(renderer.strategy).toBe(strategy);
    expect(renderer.createText("same").kind).toBe("text");
  });

  test("leaves property semantics and cleanup to the target strategy", () => {
    const renderer = createRenderer(fakeStrategy());
    const element = renderer.createElement("input");

    const cleanup = renderer.setProperty(element, "value", "draft");
    expect(element.properties).toEqual({ value: "draft" });
    cleanup?.();
    expect(element.properties).toEqual({});

    renderer.remove(element);
    expect(element.properties).toEqual({ removed: true });
  });

  test("mounts host nodes and replaces signal regions in the target tree", () => {
    const strategy = fakeStrategy();
    const renderer = createRuntime().createRenderer(strategy);
    const root = renderer.createElement("root");
    expect("mount" in renderer).toBe(false);
    let current = "before";
    const listeners = new Set<(value: string) => void>();
    const label: SignalLike<string> = {
      get value() {
        return current;
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
    const view = renderer.render(
      {
        type: "panel",
        props: { children: ["prefix", label, "suffix"] },
      },
      root,
    );

    expect(root.children.map((child) => child.value)).toEqual(["panel"]);
    const panel = root.children[0]!;
    expect(panel.children.map((child) => child.value)).toEqual([
      "prefix",
      "signal",
      "before",
      "suffix",
    ]);

    current = "after";
    for (const listener of listeners) listener(current);
    expect(panel.children.map((child) => child.value)).toEqual([
      "prefix",
      "signal",
      "after",
      "suffix",
    ]);

    view.unmount();
    expect(listeners.size).toBe(0);
    expect(root.children).toEqual([]);
  });

  test("invokes component nodes without running the host transform hook", () => {
    const strategy = fakeStrategy();
    const transformed: unknown[] = [];
    const renderer = createRenderer(strategy, {
      transformVNode(vnode) {
        transformed.push(vnode.type);
        return vnode;
      },
      invokeComponent(component, props) {
        return {
          child: (component as unknown as (props: RenderableProps) => RenderableChild)(props),
          dispose() {},
        };
      },
    });
    const root = renderer.createElement("root");
    const component = (props: { children?: RenderableChild }): RenderableChild => ({
      type: "label",
      props: { children: props.children },
    });

    const view = renderer.render({ type: component, props: { children: "ready" } }, root);
    expect(root.children[0]?.value).toBe("label");
    expect(transformed).toEqual(["label"]);

    view.unmount();
  });

  test("invokes components through the runtime callback and disposes them on unmount", () => {
    const strategy = fakeStrategy();
    let disposed = 0;
    const renderer = createRenderer(strategy, {
      invokeComponent(component, props) {
        return {
          child: (component as unknown as (props: RenderableProps) => RenderableChild)(props),
          dispose() {
            disposed += 1;
          },
        };
      },
    });
    const root = renderer.createElement("root");
    const component = (props: { children?: RenderableChild }): RenderableChild => ({
      type: "label",
      props: { children: props.children },
    });

    const view = renderer.render({ type: component, props: { children: "ready" } }, root);
    expect(root.children[0]?.value).toBe("label");
    expect(root.children[0]?.children[0]?.value).toBe("ready");

    view.unmount();
    expect(disposed).toBe(1);
    expect(root.children).toEqual([]);
  });

  test("keeps a Signal region mounted when replacement mounting fails", () => {
    const strategy = fakeStrategy();
    const renderer = createRenderer(strategy);
    const root = renderer.createElement("root");
    let current: RenderableChild = "before";
    const listeners = new Set<(value: RenderableChild) => void>();
    const source: SignalLike<RenderableChild> = {
      get value() {
        return current;
      },
      subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };

    const view = renderer.render(source, root);
    const listener = [...listeners][0]!;
    const invalid = { type: 42, props: {} } as unknown as RenderableChild;

    expect(() => listener(invalid)).toThrow("invalid child");
    expect(root.children.map((child) => child.value)).toEqual(["signal", "before"]);

    listener("after");
    expect(root.children.map((child) => child.value)).toEqual(["signal", "after"]);
    view.unmount();
  });

  test("attempts every Signal cleanup and preserves the first error", () => {
    const strategy = fakeStrategy();
    const removed: string[] = [];
    const remove = strategy.remove;
    strategy.remove = (target) => {
      removed.push(target.value);
      remove(target);
      if (target.value === "value") throw new Error("remove value");
      if (target.value === "signal") throw new Error("remove marker");
    };
    const renderer = createRenderer(strategy);
    const root = renderer.createElement("root");
    const source: SignalLike<string> = {
      value: "value",
      subscribe() {
        return () => {
          throw new Error("unsubscribe first");
        };
      },
    };
    const view = renderer.render(source, root);

    expect(() => view.unmount()).toThrow("unsubscribe first");
    expect(removed).toEqual(["value", "signal"]);
  });

  test("attempts every array cleanup and preserves the first error", () => {
    const strategy = fakeStrategy();
    const removed: string[] = [];
    const remove = strategy.remove;
    strategy.remove = (target) => {
      removed.push(target.value);
      remove(target);
      if (target.value === "first") throw new Error("remove first");
    };
    const renderer = createRenderer(strategy);
    const root = renderer.createElement("root");
    const view = renderer.render(["first", "second"], root);

    expect(() => view.unmount()).toThrow("remove first");
    expect(removed).toEqual(["first", "second"]);
  });

  test("attempts host mount cleanup, child removal, property cleanup, and node removal", () => {
    const strategy = fakeStrategy();
    const events: string[] = [];
    const remove = strategy.remove;
    strategy.remove = (target) => {
      events.push(`remove:${target.value}`);
      remove(target);
      if (target.value === "child") throw new Error("remove child");
      if (target.value === "panel") throw new Error("remove panel");
    };
    strategy.setProperty = (target, name, value) => {
      target.properties[name] = value;
      return () => {
        events.push(`property:${name}`);
        throw new Error("property cleanup");
      };
    };
    const renderer = createRenderer(strategy, {
      onMount() {
        return () => {
          events.push("mount");
          throw new Error("mount cleanup");
        };
      },
    });
    const root = renderer.createElement("root");
    const view = renderer.render(
      { type: "panel", props: { title: "value", children: "child" } },
      root,
    );

    expect(() => view.unmount()).toThrow("mount cleanup");
    expect(events).toEqual(["mount", "remove:child", "property:title", "remove:panel"]);
  });

  test("renders resolved and rejected Promises, and ignores them after unmount", async () => {
    const errors: unknown[] = [];
    const strategy = fakeStrategy();
    const renderer = createRenderer(strategy, {
      onError(error) {
        errors.push(error);
      },
    });
    const root = renderer.createElement("root");
    const resolved = renderer.render(Promise.resolve("ready"), root);
    await Promise.resolve();
    await Promise.resolve();
    expect(root.children.map((child) => child.value)).toEqual(["async", "ready"]);
    resolved.unmount();
    expect(root.children).toEqual([]);

    const rejectedError = new Error("promise failed");
    const rejected = renderer.render(Promise.reject(rejectedError), root);
    await Promise.resolve();
    await Promise.resolve();
    expect(errors).toEqual([rejectedError]);
    rejected.unmount();

    const lateError = new Error("late promise failed");
    const late = renderer.render(
      new Promise<never>((_, reject) => queueMicrotask(() => reject(lateError))),
      root,
    );
    late.unmount();
    await Promise.resolve();
    await Promise.resolve();
    expect(errors).toEqual([rejectedError]);
  });

  test("renders async iterable values and calls iterator return on unmount", async () => {
    const strategy = fakeStrategy();
    const renderer = createRenderer(strategy);
    const root = renderer.createElement("root");
    let nextCalls = 0;
    let returnCalls = 0;
    let resolveNext!: (result: IteratorResult<RenderableChild>) => void;
    const iterable: AsyncIterable<RenderableChild> = {
      [Symbol.asyncIterator]() {
        return {
          next() {
            nextCalls += 1;
            return new Promise<IteratorResult<RenderableChild>>((resolve) => {
              resolveNext = resolve;
            });
          },
          return() {
            returnCalls += 1;
            return Promise.resolve({ done: true, value: undefined });
          },
        };
      },
    };

    const view = renderer.render(iterable, root);
    expect(nextCalls).toBe(1);
    resolveNext({ done: false, value: "streamed" });
    await Promise.resolve();
    await Promise.resolve();
    expect(root.children.map((child) => child.value)).toEqual(["async", "streamed"]);
    view.unmount();
    expect(returnCalls).toBe(1);
    expect(root.children).toEqual([]);
  });

  test("reports an async iterable rejection while it is mounted", async () => {
    const errors: unknown[] = [];
    const strategy = fakeStrategy();
    const renderer = createRenderer(strategy, {
      onError(error) {
        errors.push(error);
      },
    });
    const root = renderer.createElement("root");
    const rejectedError = new Error("iterator failed");
    const iterable: AsyncIterable<string> = {
      [Symbol.asyncIterator]() {
        return {
          next: () => Promise.reject(rejectedError),
        };
      },
    };

    const view = renderer.render(iterable, root);
    await Promise.resolve();
    await Promise.resolve();
    expect(errors).toEqual([rejectedError]);
    view.unmount();
    expect(root.children).toEqual([]);
  });

  test("attempts async iterator return, region cleanup, and marker removal", () => {
    const strategy = fakeStrategy();
    const removed: string[] = [];
    const remove = strategy.remove;
    strategy.remove = (target) => {
      removed.push(target.value);
      remove(target);
      if (target.value === "async") throw new Error("remove marker");
    };
    let returnCalls = 0;
    const iterable: AsyncIterable<string> = {
      [Symbol.asyncIterator]() {
        return {
          next: () => new Promise<IteratorResult<string>>(() => {}),
          return: () => {
            returnCalls += 1;
            throw new Error("iterator return");
          },
        };
      },
    };
    const renderer = createRenderer(strategy);
    const root = renderer.createElement("root");
    const view = renderer.render(iterable, root);

    expect(() => view.unmount()).toThrow("iterator return");
    expect(returnCalls).toBe(1);
    expect(removed).toEqual(["async"]);
  });
});
