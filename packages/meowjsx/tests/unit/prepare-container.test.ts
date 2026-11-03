import { expect, test } from "bun:test";
import { Window } from "happy-dom";
import { createRuntime, h, type RuntimePlugin } from "../../src/index";
import { createWebRenderer, renderToHtml } from "../../web/index";

/** A plugin that records when it prepares and releases a container. */
function recorder(log: string[], name: string, extra: Partial<RuntimePlugin> = {}): RuntimePlugin {
  return {
    name,
    prepareContainer: ({ target }) => {
      log.push(`${name}:mount:${target}`);
      return () => log.push(`${name}:release`);
    },
    ...extra,
  };
}

function withDOM<T>(run: (document: Document) => T): T {
  const dom = new Window() as unknown as Record<string, unknown>;
  const globals = globalThis as Record<string, unknown>;
  const keys = ["document", "HTMLElement", "Element", "Node"];
  const previous = keys.map((key) => globals[key]);
  for (const key of keys)
    Object.defineProperty(globalThis, key, { value: dom[key], configurable: true, writable: true });
  try {
    return run(dom.document as Document);
  } finally {
    keys.forEach((key, index) =>
      Object.defineProperty(globalThis, key, {
        value: previous[index],
        configurable: true,
        writable: true,
      }),
    );
  }
}

test("mount hooks run in plugin order and release in reverse", () => {
  const log: string[] = [];
  const runtime = createRuntime({
    plugins: [
      recorder(log, "a"),
      recorder(log, "pre", { enforce: "pre" }),
      { name: "none" },
      recorder(log, "b"),
    ],
  });
  const release = runtime.targetHooks.prepareContainer({}, "test");
  expect(log).toEqual(["pre:mount:test", "a:mount:test", "b:mount:test"]);
  release();
  release();
  expect(log.slice(3)).toEqual(["b:release", "a:release", "pre:release"]);
});

test("a failing mount hook releases what earlier hooks acquired and rethrows", () => {
  const log: string[] = [];
  const runtime = createRuntime({
    plugins: [
      recorder(log, "a"),
      {
        prepareContainer: () => {
          throw new Error("no document");
        },
      },
      recorder(log, "late"),
    ],
  });
  expect(() => runtime.targetHooks.prepareContainer({}, "test")).toThrow("no document");
  expect(log).toEqual(["a:mount:test", "a:release"]);
});

test("uninstalling a plugin releases the mounts it prepared, once", () => {
  const log: string[] = [];
  const runtime = createRuntime();
  const uninstall = runtime.use(recorder(log, "a"));
  const release = runtime.targetHooks.prepareContainer({}, "test");
  uninstall();
  expect(log).toEqual(["a:mount:test", "a:release"]);
  release();
  expect(log).toEqual(["a:mount:test", "a:release"]);
  // A removed plugin no longer prepares later mounts.
  runtime.targetHooks.prepareContainer({}, "test")();
  expect(log).toHaveLength(2);
});

test("the Web renderer prepares the container before the tree and releases it after", () =>
  withDOM((document) => {
    const log: string[] = [];
    const container = document.createElement("main");
    const runtime = createRuntime({
      plugins: [
        {
          prepareContainer: ({ container: node, target }) => {
            expect(node).toBe(container);
            expect(target).toBe("web");
            (node as Element).setAttribute("data-prepared", "");
            log.push("mount");
            return () => {
              log.push(`release:${(node as Element).childNodes.length}`);
              (node as Element).removeAttribute("data-prepared");
            };
          },
        },
      ],
    });
    const Probe = () => {
      log.push(`setup:${container.hasAttribute("data-prepared")}`);
      return h("p", {}, "hello");
    };
    const mounted = createWebRenderer(runtime).render(h(Probe, {}), container);
    expect(container.textContent).toBe("hello");
    mounted.unmount();
    expect(log).toEqual(["mount", "setup:true", "release:0"]);
    expect(container.hasAttribute("data-prepared")).toBe(false);
  }));

test("a render that throws releases the container", () =>
  withDOM((document) => {
    const log: string[] = [];
    const runtime = createRuntime({ plugins: [recorder(log, "a")] });
    const Broken = () => {
      throw new Error("setup failed");
    };
    expect(() =>
      createWebRenderer(runtime).render(h(Broken, {}), document.createElement("div")),
    ).toThrow("setup failed");
    expect(log).toEqual(["a:mount:web", "a:release"]);
  }));

test("static HTML runs no mount hook", () => {
  const log: string[] = [];
  const runtime = createRuntime({ plugins: [recorder(log, "a")] });
  expect(createWebRenderer(runtime).renderToHtml(h("p", {}, "static"))).toBe("<p>static</p>");
  expect(renderToHtml(h("p", {}, "default"))).toBe("<p>default</p>");
  expect(log).toEqual([]);
});
