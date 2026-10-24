import { expect, test } from "bun:test";
import {
  createContext,
  createRuntime,
  Fragment,
  h,
  signal,
  useContext,
  type Child,
  type Component,
  type ObservedComponent,
  type RenderStrategy,
} from "../../src/index";

type Node = {
  value: string;
  kind: "element" | "text" | "marker";
  parent: Node | null;
  children: Node[];
};

function strategy(): RenderStrategy<Node> {
  const make = (kind: Node["kind"], value: string): Node => ({
    kind,
    value,
    parent: null,
    children: [],
  });
  return {
    createElement: (value) => make("element", value),
    createText: (value) => make("text", value),
    createMarker: (value) => make("marker", value),
    getNextSibling: (node) => {
      const siblings = node.parent?.children ?? [];
      return siblings[siblings.indexOf(node) + 1] ?? null;
    },
    insert(parent, node, before) {
      parent.children.splice(
        before ? parent.children.indexOf(before) : parent.children.length,
        0,
        node,
      );
      node.parent = parent;
    },
    remove(node) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      node.parent = null;
    },
    setProperty() {},
  };
}

test("observation retains semantic and replacement identities without adding host nodes", () => {
  const Context = createContext("default");
  const Replacement = () => h("button", {}, useContext(Context));
  const Original = () => "must not execute";
  const App = () => h(Context.Provider, { value: "provided" }, h(Fragment, {}, h(Original, {})));
  const instances = new Map<number, ObservedComponent<Node>>();
  const runtime = createRuntime({
    plugins: [
      { resolveComponent: ({ component }) => (component === Original ? Replacement : undefined) },
    ],
  });
  const renderer = runtime.createRenderer(strategy(), {
    observer: {
      onComponent: (instance) => {
        instances.set(instance.id, instance);
      },
      onUnmount: (instance) => {
        instances.delete(instance.id);
      },
    },
  });
  const root = renderer.createElement("root");
  const mounted = renderer.render(h(App, {}), root);
  const [app, provider, fragment, replacement] = [...instances.values()];
  expect(provider!.parent).toBe(app!);
  expect(provider!.semantic).toBe("context-provider");
  expect(fragment!.parent).toBe(provider!);
  expect(fragment!.semantic).toBe("fragment");
  expect(replacement!.parent).toBe(fragment!);
  expect(replacement!.originalComponent).toBe(Original);
  expect(replacement!.component).toBe(Replacement);
  expect(replacement!.semantic).toBeUndefined();
  expect(root.children.map((node) => node.value)).toEqual(["button"]);
  expect([...app!.nodes].map((node) => node.value).sort()).toEqual(["button", "provided"]);
  mounted.unmount();
  mounted.unmount();
  expect(instances.size).toBe(0);
  expect(app!.nodes.size).toBe(0);
  expect(root.children).toEqual([]);
});

test("delayed owners retain live text and multi-root output through replacement and unmount", async () => {
  let resolve!: (value: Child) => void;
  const promise = new Promise<Child>((done) => {
    resolve = done;
  });
  let next!: (result: IteratorResult<Child>) => void;
  let returns = 0;
  const stream: AsyncIterable<Child> = {
    [Symbol.asyncIterator]: () => ({
      next: () =>
        new Promise((done) => {
          next = done;
        }),
      return: async () => {
        returns++;
        return { done: true, value: undefined };
      },
    }),
  };
  const Text = ({ text }: { text: string }) => text;
  const Pair = () => [h("b", {}, "one"), h("i", {}, "two")];
  const changing = signal<Child>(h(Text, { text: "initial" }));
  const App = () => [changing, promise, stream];
  const instances = new Map<number, ObservedComponent<Node>>();
  const renderer = createRuntime().createRenderer(strategy(), {
    observer: {
      onComponent: (instance) => {
        instances.set(instance.id, instance);
      },
      onUnmount: (instance) => {
        instances.delete(instance.id);
      },
    },
  });
  const root = renderer.createElement("root");
  const mounted = renderer.render(h(App, {}), root);
  const app = [...instances.values()].find((instance) => instance.component === App)!;
  const initial = [...instances.values()].find((instance) => instance.component === Text)!;
  const liveNodes = app.nodes;
  changing.value = h(Pair, {});
  await Promise.resolve();
  expect(instances.has(initial.id)).toBe(false);
  expect(initial.nodes.size).toBe(0);
  resolve(h(Text, { text: "promised" }));
  next({ done: false, value: h(Text, { text: "streamed" }) });
  await new Promise((done) => setTimeout(done, 0));
  expect(
    [...instances.values()]
      .filter((instance) => instance !== app)
      .every((instance) => instance.parent === app),
  ).toBe(true);
  expect([...liveNodes].map((node) => node.value).sort()).toEqual([
    "b",
    "i",
    "one",
    "promised",
    "streamed",
    "two",
  ]);
  next({ done: false, value: h(Text, { text: "second" }) });
  await new Promise((done) => setTimeout(done, 0));
  expect([...liveNodes].map((node) => node.value)).not.toContain("streamed");
  mounted.unmount();
  expect(returns).toBe(1);
  expect(instances.size).toBe(0);
  expect(liveNodes.size).toBe(0);
  next({ done: false, value: h(Text, { text: "after unmount" }) });
  await new Promise((done) => setTimeout(done, 0));
  expect(instances.size).toBe(0);
  expect(root.children).toEqual([]);
});

test("unmounted promises and failed subtrees cannot leave observed instances", async () => {
  let resolve!: (value: Child) => void;
  const Pending = () =>
    new Promise<Child>((done) => {
      resolve = done;
    });
  const instances = new Map<number, ObservedComponent<Node>>();
  const renderer = createRuntime().createRenderer(strategy(), {
    observer: {
      onComponent: (instance) => {
        instances.set(instance.id, instance);
      },
      onUnmount: (instance) => {
        instances.delete(instance.id);
      },
    },
  });
  const root = renderer.createElement("root");
  const pending = renderer.render(h(Pending, {}), root);
  pending.unmount();
  const Visible = () => h("span", {}, "late");
  resolve(h(Visible, {}));
  await new Promise((done) => setTimeout(done, 0));
  expect(instances.size).toBe(0);
  const Broken: Component = () => [() => null, h(Visible, {})] as unknown as Child;
  expect(() => renderer.render(h(Broken, {}), root)).toThrow("invalid child");
  expect(instances.size).toBe(0);
  expect(root.children).toEqual([]);
});

test("observation roots exclude containers without adding component calls and retain deferred scope", async () => {
  const Context = createContext("default");
  const Leaf = () => h("button", {}, useContext(Context));
  const changing = signal<Child>(null);
  let resolve!: (child: Child) => void;
  const promised = new Promise<Child>((done) => {
    resolve = done;
  });
  async function* stream() {
    await Promise.resolve();
    yield h(Leaf, {});
  }
  const streamed = stream();
  const Container = () =>
    h(Context.Provider, { value: "scoped" }, h("section", {}, changing, promised, streamed));
  const invoked: Function[] = [];
  const instances = new Map<number, ObservedComponent<Node>>();
  const runtime = createRuntime({
    plugins: [
      {
        resolveComponent({ component }) {
          invoked.push(component);
          return component;
        },
      },
    ],
  });
  const renderer = runtime.createRenderer(strategy(), {
    observer: {
      roots: [changing, promised, streamed],
      onComponent: (instance) => {
        instances.set(instance.id, instance);
      },
      onUnmount: (instance) => {
        instances.delete(instance.id);
      },
    },
  });
  const root = renderer.createElement("root");
  const mounted = renderer.render(h(Container, {}), root);
  expect(instances.size).toBe(0);
  changing.value = h(Leaf, {});
  resolve(h(Leaf, {}));
  await new Promise((done) => setTimeout(done, 0));
  expect([...instances.values()].map((instance) => instance.component)).toEqual([Leaf, Leaf, Leaf]);
  expect([...instances.values()].every((instance) => instance.parent === null)).toBe(true);
  expect(
    [...instances.values()].map((instance) => [...instance.nodes].map((node) => node.value).sort()),
  ).toEqual([
    ["button", "scoped"],
    ["button", "scoped"],
    ["button", "scoped"],
  ]);
  expect(invoked).toHaveLength(5);
  expect(invoked.filter((component) => component !== Leaf)).toEqual([Container, Context.Provider]);
  expect(root.children.map((node) => node.value)).toEqual(["section"]);
  mounted.unmount();
  expect(instances.size).toBe(0);
  expect(root.children).toEqual([]);
});
