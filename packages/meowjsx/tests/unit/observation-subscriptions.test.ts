import { expect, test } from "bun:test";
import {
  createComponentObservation,
  createRuntime,
  h,
  signal,
  type Child,
  type Component,
  type RenderStrategy,
} from "../../src/index";

type Node = {
  value: string;
  parent: Node | null;
  children: Node[];
  properties: Map<string, unknown>;
};

function strategy(operations: string[] = []): RenderStrategy<Node> {
  const make = (kind: string, value: string): Node => {
    operations.push(`create:${kind}:${value}`);
    return { value, parent: null, children: [], properties: new Map() };
  };
  return {
    createElement: (value) => make("element", value),
    createText: (value) => make("text", value),
    createMarker: (value) => make("marker", value),
    getNextSibling(node) {
      const siblings = node.parent?.children ?? [];
      return siblings[siblings.indexOf(node) + 1] ?? null;
    },
    insert(parent, node, before) {
      operations.push(`insert:${node.value}`);
      parent.children.splice(
        before ? parent.children.indexOf(before) : parent.children.length,
        0,
        node,
      );
      node.parent = parent;
    },
    remove(node) {
      operations.push(`remove:${node.value}`);
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      node.parent = null;
    },
    setProperty(node, name, value) {
      operations.push(`property:${name}`);
      node.properties.set(name, value);
    },
  };
}

async function settled() {
  // Reactive delivery and observation each own a microtask boundary.
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

test("late subscriptions read current membership and scope reused VNodes by mounted instance", async () => {
  const observation = createComponentObservation<Node>();
  const Leaf = () => h("button", {}, "Current");
  const Parent = () => h(Leaf, {});
  const reused = h(Parent, {});
  const renderer = createRuntime().createRenderer(strategy(), { observer: observation.observer });
  const root = renderer.createElement("root");
  const first = renderer.render(reused, root);
  const second = renderer.render(reused, root);
  await settled();
  let allChanges = 0;
  observation.subscribe(() => allChanges++);
  const snapshot = observation.read();
  const parents = snapshot.filter((instance) => instance.component === Parent);
  expect(parents).toHaveLength(2);
  expect(parents[0]).not.toBe(parents[1]);
  expect(observation.read(parents[0])).toHaveLength(2);
  expect(observation.read(parents[1])).toHaveLength(2);
  expect(allChanges).toBe(0);
  let firstChanges = 0;
  let secondChanges = 0;
  observation.subscribe(() => firstChanges++, { root: parents[0] });
  observation.subscribe(() => secondChanges++, { root: parents[1] });
  first.unmount();
  await settled();
  expect(firstChanges).toBe(1);
  expect(secondChanges).toBe(0);
  expect(allChanges).toBe(1);
  expect(observation.read(parents[0])).toEqual([]);
  expect(observation.read()).toHaveLength(2);
  expect(snapshot).toHaveLength(4);
  expect(parents[0]!.nodes.size).toBe(0);
  second.unmount();
  observation.dispose();
});

test("unsubscribing during delivery prevents cancelled listeners from being called", async () => {
  const observation = createComponentObservation<Node>();
  const value = signal<Child>("First");
  const renderer = createRuntime().createRenderer(strategy(), { observer: observation.observer });
  const mounted = renderer.render(
    h(() => value, {}),
    renderer.createElement("root"),
  );
  await settled();
  const calls: string[] = [];
  let unsubscribeSecond = () => {};
  const unsubscribeFirst = observation.subscribe(() => {
    calls.push("first");
    unsubscribeSecond();
  });
  unsubscribeSecond = observation.subscribe(() => calls.push("second"));
  value.value = "Changed";
  await settled();
  expect(calls).toEqual(["first"]);
  unsubscribeFirst();
  unsubscribeFirst();
  value.value = "After unsubscribe";
  await settled();
  expect(calls).toEqual(["first"]);
  mounted.unmount();
  observation.dispose();
});

test("listener-triggered rendering is notified in a later round rather than recursively", async () => {
  const observation = createComponentObservation<Node>();
  const value = signal<Child>("Initial");
  const renderer = createRuntime().createRenderer(strategy(), { observer: observation.observer });
  const mounted = renderer.render(
    h(() => value, {}),
    renderer.createElement("root"),
  );
  await settled();
  const seen: string[][] = [];
  let delivering = false;
  observation.subscribe(() => {
    expect(delivering).toBe(false);
    delivering = true;
    seen.push([...observation.read()[0]!.nodes].map((node) => node.value));
    if (seen.length === 1) value.value = "From listener";
    delivering = false;
  });
  value.value = "From caller";
  await settled();
  await settled();
  expect(seen).toEqual([["From caller"], ["From listener"]]);
  mounted.unmount();
  observation.dispose();
});

test("subscriber exceptions reach the error handler without rolling back rendering or blocking peers", async () => {
  const errors: unknown[] = [];
  const failure = new Error("Observer failed");
  const observation = createComponentObservation<Node>({ onError: (error) => errors.push(error) });
  const renderer = createRuntime().createRenderer(strategy(), { observer: observation.observer });
  const root = renderer.createElement("root");
  let peerCalls = 0;
  observation.subscribe(() => {
    throw failure;
  });
  observation.subscribe(() => peerCalls++);
  const mounted = renderer.render(
    h(() => h("b", {}, "Keep rendered content"), {}),
    root,
  );
  await settled();
  expect(errors).toEqual([failure]);
  expect(peerCalls).toBe(1);
  expect(root.children[0]!.children[0]!.value).toBe("Keep rendered content");
  expect(observation.read()).toHaveLength(1);
  observation.dispose();
  mounted.unmount();
});

test("a partially mounted subtree rolls back before subscribers can read it", async () => {
  const observation = createComponentObservation<Node>();
  const Stable = () => h("b", {}, "Stable");
  const value = signal<Child>(h(Stable, {}));
  const App = () => value;
  const renderer = createRuntime().createRenderer(strategy(), { observer: observation.observer });
  const root = renderer.createElement("root");
  const mounted = renderer.render(h(App, {}), root);
  await settled();
  const original = observation.read();
  const states: string[][] = [];
  observation.subscribe(() =>
    states.push([...observation.read()[0]!.nodes].map((node) => node.value).sort()),
  );
  const Visible = () => h("i", {}, "Transient");
  const Broken: Component = () => [() => null, h(Visible, {})] as unknown as Child;
  expect(() => renderer.render(h(Broken, {}), root)).toThrow("invalid child");
  await settled();
  expect(observation.read()).toEqual(original);
  expect(states.every((state) => state.join() === ["Stable", "b"].sort().join())).toBe(true);
  expect(root.children.filter((node) => node.value !== "signal").map((node) => node.value)).toEqual(
    ["b"],
  );
  mounted.unmount();
  observation.dispose();
});

test("property-only updates invalidate observation without replacing host nodes", async () => {
  const value = signal("Before");
  const observation = createComponentObservation<Node>();
  const renderer = createRuntime().createRenderer(strategy(), { observer: observation.observer });
  const mounted = renderer.render(
    h(() => h("input", { value }), {}),
    renderer.createElement("root"),
  );
  await settled();
  const instance = observation.read()[0]!;
  const node = [...instance.nodes][0]!;
  let changes = 0;
  observation.subscribe(() => changes++, { root: instance });
  value.value = "After";
  await settled();
  expect(changes).toBe(1);
  expect(observation.read()[0]).toBe(instance);
  expect([...instance.nodes]).toEqual([node]);
  expect(node.properties.get("value")).toBe("After");
  mounted.unmount();
  observation.dispose();
});

test("cancelled async scopes and disposed subscriptions cannot be resurrected by late results", async () => {
  let resolve!: (value: Child) => void;
  const pending = new Promise<Child>((done) => {
    resolve = done;
  });
  const observation = createComponentObservation<Node>();
  const renderer = createRuntime().createRenderer(strategy(), { observer: observation.observer });
  const root = renderer.createElement("root");
  const mounted = renderer.render(
    h(() => pending, {}),
    root,
  );
  await settled();
  const scope = observation.read()[0]!;
  let calls = 0;
  observation.subscribe(() => calls++, { root: scope });
  mounted.unmount();
  await settled();
  expect(calls).toBe(1);
  expect(observation.read()).toEqual([]);
  observation.dispose();
  observation.dispose();
  resolve(h(() => h("span", {}, "Late"), {}));
  await settled();
  expect(calls).toBe(1);
  expect(root.children).toEqual([]);
  expect(scope.nodes.size).toBe(0);
});

test("observation and disposal do not introduce host operations into ordinary rendering", async () => {
  async function render(observed: boolean) {
    const operations: string[] = [];
    const observation = observed ? createComponentObservation<Node>() : undefined;
    const value = signal<Child>("Before");
    const renderer = createRuntime().createRenderer(strategy(operations), {
      observer: observation?.observer,
    });
    const root = renderer.createElement("root");
    const mounted = renderer.render(
      h(() => h("div", {}, value), {}),
      root,
    );
    await settled();
    observation?.dispose();
    value.value = "After";
    await settled();
    expect(root.children[0]!.children.some((node) => node.value === "After")).toBe(true);
    mounted.unmount();
    return operations;
  }
  expect(await render(true)).toEqual(await render(false));
});
