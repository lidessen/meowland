import { expect, test } from "bun:test";
import {
  createContext,
  createRuntime,
  defineComponent,
  h,
  keyed,
  mapSignal,
  signal,
  useContext,
  type ReadableSignal,
} from "../../src/index";
import type { ObservedComponent, RenderStrategy } from "../../src/renderer";
import { renderToHtml } from "../../web/index";

type Node = {
  kind: "text" | "element" | "marker";
  value: string;
  parent: Node | null;
  children: Node[];
  props: Record<string, unknown>;
};
function fixture() {
  const moved: Node[] = [];
  const node = (kind: Node["kind"], value: string): Node => ({
    kind,
    value,
    parent: null,
    children: [],
    props: {},
  });
  const remove = (child: Node) => {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = null;
  };
  const strategy: RenderStrategy<Node> = {
    createText: (value) => node("text", value),
    createElement: (value) => node("element", value),
    createMarker: (value) => node("marker", value),
    getNextSibling: (child) =>
      child.parent?.children[child.parent.children.indexOf(child) + 1] ?? null,
    insert(parent, child, before = null) {
      if (child.parent) moved.push(child);
      remove(child);
      parent.children.splice(
        before ? parent.children.indexOf(before) : parent.children.length,
        0,
        child,
      );
      child.parent = parent;
    },
    remove,
    setProperty(child, name, value) {
      child.props[name] = value;
    },
  };
  return { strategy, moved, root: node("element", "root") };
}
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
const text = (node: Node): string =>
  node.kind === "text" ? node.value : node.children.map(text).join("");
const elements = (node: Node) => node.children.filter((child) => child.kind === "element");

test("keyed rows retain their nodes, context, observation parents and local state", async () => {
  const { strategy, moved, root } = fixture();
  const Environment = createContext("outside");
  const items = signal([
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ]);
  const mounted: string[] = [],
    cleaned: string[] = [];
  const observed = new Set<ObservedComponent<Node>>();
  const Row = defineComponent<{ item: ReadableSignal<{ id: string; label: string }> }>(
    { name: "keyed-row", parts: [] },
    ({ item }, context) => {
      const id = item.value.id;
      mounted.push(id);
      context.onCleanup(() => {
        cleaned.push(id);
      });
      const environment = useContext(Environment);
      return h(
        "article",
        { id },
        mapSignal(item, (value) => environment + value.label),
      );
    },
  );
  const List = () =>
    keyed(
      items,
      (item) => item.id,
      (item) => h(Row, { item }),
    );
  const render = createRuntime().createRenderer(strategy, {
    observer: {
      onComponent: (item) => observed.add(item),
      onUnmount: (item) => observed.delete(item),
    },
  });
  const mount = render.mount(h(Environment.Provider, { value: "scope:" }, h(List, {})), root);
  const [a, b] = elements(root);
  a!.props.open = true;
  const rowInstances = [...observed].filter((item) => item.component === Row);
  expect(rowInstances.every((item) => item.parent?.component === List)).toBe(true);
  moved.length = 0;
  items.value = [...items.value, { id: "c", label: "C" }];
  await flush();
  expect(moved).toHaveLength(0);
  items.value = [{ id: "x", label: "X" }, ...items.value];
  await flush();
  expect(moved).toHaveLength(0);
  expect(elements(root)[1]).toBe(a);
  items.value = [
    { id: "b", label: "B2" },
    { id: "a", label: "A" },
  ];
  await flush();
  expect(elements(root)).toEqual([b!, a!]);
  expect(a!.props.open).toBe(true);
  expect(text(root)).toBe("scope:B2scope:A");
  expect(rowInstances.every((item) => observed.has(item))).toBe(true);
  expect(mounted.filter((id) => id === "a")).toHaveLength(1);
  expect(cleaned.sort()).toEqual(["c", "x"]);
  mount.unmount();
  expect(root.children).toHaveLength(0);
  expect(cleaned.sort()).toEqual(["a", "b", "c", "x"]);
  expect(observed.size).toBe(0);
});

test("moving a keyed range includes live Signal and Promise output", async () => {
  const { strategy, root } = fixture();
  const items = signal(["a", "b"]);
  const content = signal({ a: "A", b: "B" });
  const child = keyed(
    items,
    (id) => id,
    (item) => [
      mapSignal(content, (value) => value[item.value as "a" | "b"]),
      Promise.resolve(item.value + "!"),
    ],
  );
  const mount = createRuntime().createRenderer(strategy).mount(child, root);
  await flush();
  content.value = { a: "A2", b: "B2" };
  await flush();
  items.value = ["b", "a"];
  await flush();
  expect(text(root)).toBe("B2b!A2a!");
  mount.unmount();
  expect(root.children).toHaveLength(0);
});

test("duplicate keys and failed new mounts leave existing rows and values intact", async () => {
  const { strategy, root } = fixture();
  const items = signal([{ id: "a", label: "A" }]);
  const failures: unknown[] = [];
  const child = keyed(
    items,
    (item) => item.id,
    (item) => {
      if (item.value.id === "broken") throw new Error("new row failed");
      return h(
        "p",
        {},
        mapSignal(item, (value) => value.label),
      );
    },
  );
  const mount = createRuntime()
    .createRenderer(strategy, { onError: (error) => failures.push(error) })
    .mount(child, root);
  const original = elements(root)[0];
  items.value = [
    { id: "a", label: "changed" },
    { id: "a", label: "duplicate" },
  ];
  await flush();
  expect(text(root)).toBe("A");
  items.value = [
    { id: "a", label: "changed" },
    { id: "broken", label: "broken" },
  ];
  await flush();
  expect(text(root)).toBe("A");
  expect(elements(root)).toEqual([original!]);
  expect(failures).toHaveLength(2);
  items.value = [{ id: "a", label: "accepted" }];
  await flush();
  expect(elements(root)[0]).toBe(original);
  expect(text(root)).toBe("accepted");
  mount.unmount();
});

test("keyed cleanup releases every row and its source subscription when a row cleanup fails", () => {
  const { strategy, root } = fixture();
  let subscriptions = 0;
  const source: ReadableSignal<readonly string[]> = {
    value: ["a", "b"],
    subscribe() {
      subscriptions++;
      return () => {
        subscriptions--;
      };
    },
  };
  const cleaned: string[] = [];
  const Row = defineComponent<{ item: ReadableSignal<string> }>(
    { name: "cleanup-row", parts: [] },
    ({ item }, context) => {
      const id = item.value;
      context.onCleanup(() => {
        cleaned.push(id);
        if (id === "a") throw new Error("cleanup failed");
      });
      return h("p", {}, id);
    },
  );
  const mount = createRuntime()
    .createRenderer(strategy)
    .mount(
      keyed(
        source,
        (id) => id,
        (item) => h(Row, { item }),
      ),
      root,
    );
  expect(subscriptions).toBe(1);
  expect(() => mount.unmount()).toThrow("cleanup failed");
  expect(cleaned.sort()).toEqual(["a", "b"]);
  expect(subscriptions).toBe(0);
  expect(root.children).toHaveLength(0);
});

test("static keyed HTML uses the same context without subscribing and rejects invalid keys", () => {
  const Environment = createContext("outside");
  const Row = ({ item }: { item: ReadableSignal<string> }) => useContext(Environment) + item.value;
  const source: ReadableSignal<readonly string[]> = {
    value: ["a", "b"],
    subscribe() {
      throw new Error("HTML subscribed");
    },
  };
  expect(
    renderToHtml(
      h(
        Environment.Provider,
        { value: "inside:" },
        keyed(
          source,
          (id) => id,
          (item) => h(Row, { item }),
        ),
      ),
    ),
  ).toBe("inside:ainside:b");
  expect(() =>
    renderToHtml(
      keyed(
        [1, 2],
        () => Number.NaN,
        (item) => item.value,
      ),
    ),
  ).toThrow("finite number");
  const { strategy, root } = fixture();
  expect(() =>
    createRuntime()
      .createRenderer(strategy)
      .mount(
        keyed(
          [1, 1],
          (id) => id,
          (item) => item.value,
        ),
        root,
      ),
  ).toThrow("unique keys");
  expect(root.children).toHaveLength(0);
});
