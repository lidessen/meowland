import { expect, test } from "bun:test";
import { createReactiveEffect, derived } from "../../src/reactive";
import {
  batch,
  createRuntime,
  defineComponent,
  defineShadow,
  isAsyncIterable,
  isPromiseLike,
  signal,
} from "../../src/runtime";
import type { RenderStrategy } from "../../src/renderer";

class TestNode {
  parentNode: TestNode | null = null;
  readonly childNodes: TestNode[] = [];

  insertBefore(node: TestNode, before: TestNode | null): TestNode {
    node.remove();
    const index = before === null ? -1 : this.childNodes.indexOf(before);
    if (index < 0) this.childNodes.push(node);
    else this.childNodes.splice(index, 0, node);
    node.parentNode = this;
    return node;
  }

  remove(): void {
    if (!this.parentNode) return;
    const index = this.parentNode.childNodes.indexOf(this);
    if (index >= 0) this.parentNode.childNodes.splice(index, 1);
    this.parentNode = null;
  }
}

class TestStyle {
  cssText = "";
  private readonly properties = new Map<string, string>();

  setProperty(name: string, value: string): void {
    this.properties.set(name, value);
  }
}

class TestHostNode extends TestNode {
  readonly attributes = new Map<string, string>();
  readonly style = new TestStyle();
  innerHTML = "";

  constructor(
    readonly tagName: string,
    readonly namespaceURI = "http://www.w3.org/1999/xhtml",
  ) {
    super();
  }

  get localName(): string {
    return this.tagName.toLowerCase();
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  toggleAttribute(name: string, force?: boolean): boolean {
    const next = force ?? !this.attributes.has(name);
    if (next) this.setAttribute(name, "");
    else this.removeAttribute(name);
    return next;
  }
}

class TestText extends TestNode {
  constructor(readonly data: string) {
    super();
  }
}

class TestComment extends TestNode {
  constructor(readonly data: string) {
    super();
  }
}

test("signal notifies subscribers on the next microtask", async () => {
  const count = signal(0);
  const values: number[] = [];

  count.subscribe((value) => values.push(value));
  count.value = 1;

  expect(values).toEqual([]);
  await Promise.resolve();
  expect(values).toEqual([1]);
});

test("batch merges multiple writes into one notification", () => {
  const count = signal(0);
  const values: number[] = [];

  count.subscribe((value) => values.push(value));
  batch(() => {
    count.value = 1;
    count.value = 2;
  });

  expect(values).toEqual([2]);
});

test("derived notifies on the next microtask and reads the current value immediately", async () => {
  const count = signal(1);
  const doubled = derived(() => count.value * 2);
  const values: number[] = [];

  doubled.subscribe((value) => values.push(value));
  expect(doubled.value).toBe(2);
  count.value = 4;
  expect(doubled.value).toBe(8);
  expect(values).toEqual([]);
  await Promise.resolve();
  expect(values).toEqual([8]);
});

test("derived skips notifications Object.is treats as the same value", async () => {
  const count = signal(1);
  const positive = derived(() => count.value > 0);
  const values: boolean[] = [];

  positive.subscribe((value) => values.push(value));
  count.value = 2;
  await Promise.resolve();
  expect(values).toEqual([]);
  count.value = 0;
  await Promise.resolve();
  expect(values).toEqual([false]);
});

test("derived tracks every signal a read touches and batch collapses those writes", () => {
  const left = signal(1);
  const right = signal(1);
  const sum = derived(() => left.value + right.value);
  const values: number[] = [];

  sum.subscribe((value) => values.push(value));
  batch(() => {
    left.value = 2;
    right.value = 3;
  });
  expect(values).toEqual([5]);
});

test("derived replaces dependencies that a later read no longer touches", async () => {
  const mode = signal<"a" | "b">("a");
  const alpha = signal(1);
  const beta = signal(2);
  const value = derived(() => (mode.value === "a" ? alpha.value : beta.value));
  const values: number[] = [];

  value.subscribe((next) => values.push(next));
  alpha.value = 3;
  await Promise.resolve();
  beta.value = 9;
  await Promise.resolve();
  expect(values).toEqual([3]);
  mode.value = "b";
  await Promise.resolve();
  beta.value = 8;
  await Promise.resolve();
  alpha.value = 1;
  await Promise.resolve();
  expect(values).toEqual([3, 9, 8]);
});

test("derived stops listening after its last subscriber leaves", async () => {
  const count = signal(0);
  const doubled = derived(() => count.value * 2);
  const values: number[] = [];
  const stop = doubled.subscribe((value) => values.push(value));

  count.value = 1;
  await Promise.resolve();
  stop();
  count.value = 2;
  await Promise.resolve();
  expect(values).toEqual([2]);
  expect(doubled.value).toBe(4);
});

test("an effect that reads a derived signal runs once per source change", async () => {
  const count = signal(1);
  const doubled = derived(() => count.value * 2);
  let runs = 0;
  const stop = createReactiveEffect(() => {
    void doubled.value;
    runs += 1;
  });

  expect(runs).toBe(1);
  count.value = 2;
  await Promise.resolve();
  expect(runs).toBe(2);
  expect(doubled.value).toBe(4);
  stop();
});

test("derived throws when a read calls itself", () => {
  const value = derived(() => value.value);
  expect(() => value.value).toThrow("derived read is cyclic");
});

test("runtime can bind its component and Signal semantics to a target renderer", async () => {
  const runtime = createRuntime();
  const root = new TestHostNode("main");
  const strategy: RenderStrategy<TestNode> = {
    createText: (value) => new TestText(value),
    createElement: (type) => new TestHostNode(type),
    createMarker: (kind) => new TestComment(`meowjsx:${kind}`),
    getNextSibling(node) {
      const parent = node.parentNode;
      if (!parent) return null;
      const index = parent.childNodes.indexOf(node);
      return index >= 0 ? (parent.childNodes[index + 1] ?? null) : null;
    },
    insert(parent, node, before) {
      parent.insertBefore(node, before ?? null);
    },
    remove(node) {
      node.remove();
    },
    setProperty(node, name, value) {
      if (node instanceof TestHostNode) {
        if (value === null || value === undefined || value === false) node.removeAttribute(name);
        else node.setAttribute(name, value === true ? "" : String(value));
      }
    },
  };
  const target = runtime.createRenderer(strategy);
  const label = signal("before");
  const view = target.mount(runtime.h("p", { title: label }, label), root);

  const paragraph = root.childNodes[0] as TestHostNode;
  expect(paragraph.getAttribute("title")).toBe("before");
  expect((paragraph.childNodes[1] as TestText).data).toBe("before");

  label.value = "after";
  await Promise.resolve();
  expect(paragraph.getAttribute("title")).toBe("after");
  expect((paragraph.childNodes[1] as TestText).data).toBe("after");

  view.unmount();
  expect(root.childNodes).toEqual([]);
});

test("target renderers preserve component parts and declare shadow mount capability", () => {
  const contract = { name: "target-card", parts: ["root"] } as const;
  const Card = defineComponent(contract, (_props, context) =>
    context.part("root", "article", null, "ready"),
  );
  const shadow = defineShadow(Card, "root", () => {});
  const runtime = createRuntime({ components: [contract], shadows: [shadow] });
  const strategy: RenderStrategy<TestNode> = {
    createText: (value) => new TestText(value),
    createElement: (type) => new TestHostNode(type),
    createMarker: (kind) => new TestComment(`meowjsx:${kind}`),
    getNextSibling(node) {
      const parent = node.parentNode;
      if (!parent) return null;
      const index = parent.childNodes.indexOf(node);
      return index >= 0 ? (parent.childNodes[index + 1] ?? null) : null;
    },
    insert(parent, node, before) {
      parent.insertBefore(node, before ?? null);
    },
    remove(node) {
      node.remove();
    },
    setProperty() {},
  };
  const root = new TestHostNode("main");

  expect(() => runtime.createRenderer(strategy).mount(runtime.h(Card, null), root)).toThrow(
    /onMount hook for shadow target-card\.root/,
  );

  let seenPart: string | undefined;
  let mountCount = 0;
  const target = runtime.createRenderer(strategy, {
    onMount(vnode) {
      seenPart = vnode.componentPart?.part;
      mountCount += 1;
      return () => {
        mountCount -= 1;
      };
    },
  });
  const view = target.mount(runtime.h(Card, null), root);
  expect(seenPart).toBe("root");
  expect(mountCount).toBe(1);
  view.unmount();
  expect(mountCount).toBe(0);
});

test("promise and async iterable values are renderable child values", async () => {
  async function* values(): AsyncIterable<string> {
    yield "first";
  }

  expect(isPromiseLike(Promise.resolve("ready"))).toBe(true);
  expect(isAsyncIterable(values())).toBe(true);
  expect(isPromiseLike("ready")).toBe(false);

  const iterator = values();
  expect(await iterator[Symbol.asyncIterator]().next()).toEqual({
    done: false,
    value: "first",
  });
});

test("runtime.use accepts nested presets and returns a grouped cleanup", () => {
  const events: string[] = [];
  const runtime = createRuntime();
  const dispose = runtime.use([
    false,
    [
      {
        create(context, next) {
          events.push("active");
          return next(context);
        },
      },
    ],
    null,
  ]);

  runtime.h("span", null, "before");
  dispose();
  runtime.h("span", null, "after");

  expect(events).toEqual(["active"]);
});

test("plugin setup receives registered contributions and owns cleanup", () => {
  const contract = { name: "plugin-card", parts: ["root"] } as const;
  const pluginShadow = defineShadow(contract, "root", () => {});
  const events: string[] = [];
  const runtime = createRuntime();
  const dispose = runtime.use({
    name: "lifecycle-plugin",
    components: [contract],
    shadows: [pluginShadow],
    setup({ runtime: setupRuntime, registry, shadowRegistry, onCleanup }) {
      events.push(
        `setup:${setupRuntime === runtime}:${registry.has(contract.name)}:${shadowRegistry.list().includes(pluginShadow)}`,
      );
      onCleanup(() => {
        events.push(
          `registered-cleanup:${registry.has(contract.name)}:${shadowRegistry.list().includes(pluginShadow)}`,
        );
      });
      return () => {
        events.push(
          `returned-cleanup:${registry.has(contract.name)}:${shadowRegistry.list().includes(pluginShadow)}`,
        );
      };
    },
  });

  expect(events).toEqual(["setup:true:true:true"]);
  dispose();
  dispose();

  expect(events).toEqual([
    "setup:true:true:true",
    "returned-cleanup:true:true",
    "registered-cleanup:true:true",
  ]);
  expect(runtime.registry.has(contract.name)).toBe(false);
  expect(runtime.shadowRegistry.list()).toEqual([]);
});
