import { expect, test } from "bun:test";
import {
  createRuntime,
  defineComponent,
  h,
  raw,
  signal,
  type Component,
  type RuntimePlugin,
  type WritableSignal,
} from "../../src/index";
import { createWebRenderer, defineShadow, renderToHtml } from "../../web/index";

test("replacement covers prebuilt, repeated, Signal and Promise children with its own lifecycle", async () => {
  await withTestDOM(async () => {
    let originals = 0;
    let mounts = 0;
    let cleanups = 0;
    let shadowMounts = 0;
    let shadowCleanups = 0;
    const Original: Component = () => {
      originals++;
      return "original";
    };
    const Replacement = defineComponent(
      { name: "replacement", parts: ["root"] } as const,
      (_props, context) => {
        mounts++;
        context.onCleanup(() => {
          cleanups++;
        });
        return context.part("root", "aside", null, "placeholder");
      },
    );
    const prebuilt = h(Original, {});
    const changing = signal(prebuilt);
    const runtime = createRuntime({
      components: [Replacement.contract!],
      shadows: [
        defineShadow(Replacement, "root", (_props, context) => {
          shadowMounts++;
          context.onCleanup(() => {
            shadowCleanups++;
          });
        }),
      ],
      plugins: [
        {
          render({ vnode }, next) {
            if (vnode.componentPart?.component === "replacement") {
              return next({ ...vnode, props: { ...vnode.props, "data-theme": "replacement" } });
            }
            return next(vnode);
          },
        },
      ],
    });
    const remove = runtime.use({
      resolveComponent: ({ component }) => (component === Original ? Replacement : undefined),
    });
    const web = createWebRenderer(runtime);
    const html = web.renderToHtml(prebuilt);
    expect(html).toContain("placeholder");
    expect(mounts).toBe(1);
    expect(cleanups).toBe(1);
    expect(shadowMounts).toBe(0);
    expect(html).toContain('data-theme="replacement"');
    const root = new TestElement("main");
    const mounted = web.mount(
      [prebuilt, prebuilt, changing, Promise.resolve(prebuilt)],
      root as unknown as Element,
    );
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(originals).toBe(0);
    expect(mounts).toBe(5);
    expect((root.childNodes[0] as TestElement).tagName).toBe("aside");
    expect((root.childNodes[0] as TestElement).getAttribute("data-theme")).toBe("replacement");
    expect(shadowMounts).toBe(4);
    remove();
    changing.value = h(Original, {});
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(originals).toBe(1);
    expect(cleanups).toBe(2);
    mounted.unmount();
    expect(cleanups).toBe(5);
    expect(shadowCleanups).toBe(4);
    expect(root.childNodes).toHaveLength(0);
  });
});

test("Web onError receives asynchronous rejection and component mount errors", async () => {
  await withTestDOM(async () => {
    const errors: unknown[] = [];
    const runtime = createRuntime();
    const web = createWebRenderer(runtime, {
      onError(error, phase) {
        expect(phase).toBe("async");
        errors.push(error);
      },
    });
    const rejection = new Error("rejected child");
    const failure = new Error("failed resolved component");
    const Broken: Component = () => {
      throw failure;
    };
    const mounted = web.mount(
      [Promise.reject(rejection), Promise.resolve(h(Broken, {}))],
      new TestElement("main") as unknown as Element,
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    expect(errors).toContain(rejection);
    expect(errors).toContain(failure);
    mounted.unmount();
  });
});

test("events without handler properties support signal replacement and unmount cleanup", async () => {
  await withTestDOM(async () => {
    const events: string[] = [];
    const handler = signal(() => {
      events.push("initial");
    });
    const host = new TestElement("main");
    const mounted = createWebRenderer(createRuntime()).mount(
      h("span", { onFocusIn: handler }),
      host as unknown as Element,
    );
    const element = host.childNodes.find((node) => node instanceof TestElement)! as TestElement;
    element.dispatchEvent(new Event("focusin"));
    handler.value = () => {
      events.push("updated");
    };
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    element.dispatchEvent(new Event("focusin"));
    mounted.unmount();
    element.dispatchEvent(new Event("focusin"));
    expect(events).toEqual(["initial", "updated"]);
  });
});

class TestNode extends EventTarget {
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

class TestElement extends TestNode {
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

/**
 * A writable global definition. Another test file in the suite may have left a
 * non-writable `document` behind, so the harness defines the property instead of
 * assigning to it.
 */
function defineGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}

async function withTestDOM<T>(run: () => T | Promise<T>): Promise<T> {
  const globals = globalThis as unknown as Record<string, unknown>;
  const previousDocument = globals.document;
  const previousHTMLElement = globals.HTMLElement;
  defineGlobal("document", {
    createElement: (tagName: string) => new TestElement(tagName),
    createElementNS: (namespace: string, tagName: string) => new TestElement(tagName, namespace),
    createTextNode: (data: string) => new TestText(data),
    createComment: (data: string) => new TestComment(data),
  });
  defineGlobal("HTMLElement", TestElement);

  try {
    return await run();
  } finally {
    if (previousDocument === undefined) delete globals.document;
    else defineGlobal("document", previousDocument);
    if (previousHTMLElement === undefined) delete globals.HTMLElement;
    else defineGlobal("HTMLElement", previousHTMLElement);
  }
}

test("DOM ref receives the host element before insertion and cleans up once on removal", async () => {
  await withTestDOM(async () => {
    const root = new TestElement("main");
    let received: Element | undefined;
    let cleanups = 0;
    const child = signal(
      h(
        "button",
        {
          ref: (element: Element) => {
            received = element;
            expect(element.parentNode).toBeNull();
            return () => {
              cleanups++;
            };
          },
        },
        "Open",
      ),
    );
    const mounted = createWebRenderer(createRuntime()).render(child, root as unknown as Element);
    expect(received).toBe(
      root.childNodes.find((node) => node instanceof TestElement) as unknown as Element,
    );
    expect((received as unknown as TestElement).tagName).toBe("button");
    expect((received as unknown as TestElement).hasAttribute("ref")).toBe(false);
    child.value = h("span", null, "Removed");
    await Promise.resolve();
    await Promise.resolve();
    expect(cleanups).toBe(1);
    mounted.unmount();
    mounted.unmount();
    expect(cleanups).toBe(1);
  });
});

test("static HTML neither invokes nor serializes ref", () => {
  let calls = 0;
  const ref = (_element: Element) => {
    calls++;
  };
  expect(renderToHtml(h("button", { ref }, "Open"))).toBe("<button>Open</button>");
  expect(calls).toBe(0);
});

test("renderToHtml unwraps signals in children and attributes", () => {
  const title = signal("before");
  const label = signal("Hello");

  expect(renderToHtml(h("p", { title }, label))).toBe('<p title="before">Hello</p>');
  title.value = "after";
  label.value = "World";

  expect(renderToHtml(h("p", { title }, label))).toBe('<p title="after">World</p>');
});

test("browser rendering preserves SVG namespaces for nested vector elements", async () => {
  await withTestDOM(async () => {
    const runtime = createRuntime();
    const web = createWebRenderer(runtime);
    const root = new TestElement("main");
    web.render(
      runtime.h("svg", { viewBox: "0 0 10 10" }, runtime.h("path", { d: "M0 0h10v10Z" })),
      root as unknown as Element,
    );

    const svg = root.childNodes[0] as TestElement;
    const path = svg.childNodes[0] as TestElement;
    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(path.namespaceURI).toBe("http://www.w3.org/2000/svg");

    const foreignRoot = new TestElement("main");
    web.render(
      runtime.h(
        "svg",
        null,
        runtime.h("foreignObject", null, runtime.h("div", null, "HTML content")),
      ),
      foreignRoot as unknown as Element,
    );
    const foreignObject = (foreignRoot.childNodes[0] as TestElement).childNodes[0] as TestElement;
    const htmlChild = foreignObject.childNodes[0] as TestElement;
    expect(foreignObject.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(htmlChild.namespaceURI).toBe("http://www.w3.org/1999/xhtml");
  });
});

test("select value is applied after options mount and stays reactive", async () => {
  await withTestDOM(async () => {
    // Oxlint marks the overloaded method deprecated because of its legacy tag overload.
    // This fixture wraps the standard createElement API, not that overload.
    // oxlint-disable-next-line typescript/no-deprecated
    const original = document.createElement;
    let writes: { value: unknown; children: number }[] = [];
    // oxlint-disable-next-line typescript/no-deprecated
    document.createElement = ((tag: string) => {
      const node = original(tag);
      if (tag === "select")
        Object.defineProperty(node, "value", {
          configurable: true,
          set(value: unknown) {
            writes.push({ value, children: node.childNodes.length });
          },
        });
      return node;
      // oxlint-disable-next-line typescript/no-deprecated
    }) as typeof document.createElement;
    const value = signal("review");
    const runtime = createRuntime();
    const mounted = createWebRenderer(runtime).render(
      h(
        "select",
        { value },
        h("option", { value: "draft" }, "Draft"),
        h("option", { value: "review" }, "Review"),
      ),
      new TestElement("main") as unknown as Element,
    );
    expect(writes.at(-1)).toEqual({ value: "review", children: 2 });
    value.value = "draft";
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(writes.at(-1)).toEqual({ value: "draft", children: 2 });
    mounted.unmount();
    writes = [];
    value.value = "review";
    await new Promise<void>((resolve) => queueMicrotask(resolve));
    expect(writes).toEqual([]);
  });
});

test("raw HTML content replaces mounted children on the Web target", async () => {
  await withTestDOM(async () => {
    const runtime = createRuntime();
    const web = createWebRenderer(runtime);
    const root = new TestElement("main");
    web.render(
      runtime.h(
        "div",
        { dangerouslySetInnerHTML: { __html: "<b>raw</b>" } },
        runtime.h("span", null, "child"),
      ),
      root as unknown as Element,
    );

    const div = root.childNodes[0] as TestElement;
    expect(div.innerHTML).toBe("<b>raw</b>");
    expect(div.childNodes).toEqual([]);
    expect(
      renderToHtml(runtime.h("div", { dangerouslySetInnerHTML: { __html: "<b>raw</b>" } })),
    ).toBe("<div><b>raw</b></div>");
  });
});

test("a component can return a signal as its render result", () => {
  const label = signal("before");
  const Label: Component = () => label;

  expect(renderToHtml(h(Label, null))).toBe("before");
  label.value = "after";
  expect(renderToHtml(h(Label, null))).toBe("after");
});

test("runtime plugins can transform creation, rendering, and native element overrides", () => {
  const runtime = createRuntime();
  const web = createWebRenderer(runtime);
  const StandardButton: Component = ({ children, ...props }) =>
    runtime.raw("button", { ...props, className: "standard-button" }, children);
  const dispose = runtime.use({
    create(context, next) {
      return next({
        ...context,
        props: { ...context.props, "data-created": "yes" },
      });
    },
    render(context, next) {
      return next({
        ...context.vnode,
        props: { ...context.vnode.props, "data-rendered": "yes" },
      });
    },
    overrides: { button: StandardButton },
  });

  expect(web.renderToHtml(runtime.h("button", { type: "button" }, "Go"))).toBe(
    '<button type="button" data-created="yes" class="standard-button" data-rendered="yes">Go</button>',
  );

  dispose();
  expect(web.renderToHtml(runtime.h("button", { type: "button" }, "Go"))).toBe(
    '<button type="button">Go</button>',
  );
  expect(renderToHtml(raw("button", null, "Raw"))).toBe("<button>Raw</button>");
});

test("runtime plugins support presets, falsy entries, and enforce ordering", () => {
  const events: string[] = [];
  const plugin = (label: string, enforce?: "pre" | "post"): RuntimePlugin => ({
    name: `order-${label}`,
    enforce,
    create(context, next) {
      events.push(`create:${label}`);
      return next(context);
    },
    render(context, next) {
      events.push(`render:${label}`);
      return next(context.vnode);
    },
  });

  const runtime = createRuntime({
    plugins: [
      false,
      plugin("default"),
      [null, plugin("pre", "pre"), undefined],
      plugin("post", "post"),
    ],
  });
  const web = createWebRenderer(runtime);

  expect(web.renderToHtml(runtime.h("div", null, "ready"))).toBe("<div>ready</div>");
  expect(events).toEqual([
    "create:pre",
    "create:default",
    "create:post",
    "render:pre",
    "render:default",
    "render:post",
  ]);
});

test("components and shadows share scoped lifecycle primitives", async () => {
  await withTestDOM(async () => {
    type CardProps = { title: string; active: boolean };
    const contract = { name: "lifecycle-card", parts: ["root"] } as const;
    const events: string[] = [];
    let componentValue: WritableSignal<string> | undefined;
    let shadowValue: WritableSignal<boolean> | undefined;

    const Card = defineComponent<CardProps, typeof contract.name, (typeof contract.parts)[number]>(
      contract,
      (props, context) => {
        componentValue = context.signal(props.title);
        context.effect(() => {
          events.push(`component:${componentValue?.value}`);
          return () => events.push("component cleanup");
        });
        context.onCleanup(() => events.push("component scope cleanup"));
        return context.part("root", "article", null, props.title);
      },
    );

    const CardRootShadow = defineShadow(Card, "root", (props, context) => {
      shadowValue = context.signal(props.active);
      context.effect(() => {
        context.element.toggleAttribute("data-active", shadowValue?.value);
        events.push(`shadow:${shadowValue?.value}`);
        return () => events.push("shadow effect cleanup");
      });
      context.onCleanup(() => events.push("shadow scope cleanup"));
    });

    const runtime = createRuntime({ components: [contract] });
    runtime.registerShadow(CardRootShadow);
    const web = createWebRenderer(runtime);
    const root = new TestElement("main");
    const mounted = web.render(
      runtime.h(Card, { title: "hello", active: false }),
      root as unknown as Element,
    );
    const element = root.childNodes[0] as TestElement;

    expect(element.tagName).toBe("article");
    expect(element.getAttribute("data-active")).toBe(null);
    expect(events).toEqual(["component:hello", "shadow:false"]);

    shadowValue!.value = true;
    await Promise.resolve();
    await Promise.resolve();
    expect(element.hasAttribute("data-active")).toBe(true);

    componentValue!.value = "updated";
    await Promise.resolve();
    await Promise.resolve();
    expect(events).toContain("component:updated");

    mounted.unmount();
    mounted.unmount();
    expect(root.childNodes).toEqual([]);
    expect(events).toEqual([
      "component:hello",
      "shadow:false",
      "shadow effect cleanup",
      "shadow:true",
      "component cleanup",
      "component:updated",
      "component scope cleanup",
      "component cleanup",
      "shadow scope cleanup",
      "shadow effect cleanup",
    ]);
  });
});

test("shadows are mount-only and do not affect static HTML rendering", () => {
  const contract = { name: "static-card", parts: ["root"] } as const;
  const events: string[] = [];
  const Card = defineComponent<
    { title: string },
    typeof contract.name,
    (typeof contract.parts)[number]
  >(contract, (props, context) => context.part("root", "article", null, props.title));
  const CardRootShadow = defineShadow(Card, "root", () => {
    events.push("shadow mounted");
  });
  const runtime = createRuntime({ components: [contract], shadows: [CardRootShadow] });
  expect(typeof CardRootShadow).toBe("object");
  expect(runtime.shadowRegistry.list()).toEqual([CardRootShadow]);

  const secondShadow = defineShadow(Card, "root", () => {});
  const disposeShadows = runtime.registerShadows([secondShadow]);
  expect(runtime.shadowRegistry.list()).toEqual([CardRootShadow, secondShadow]);
  disposeShadows();
  expect(runtime.shadowRegistry.list()).toEqual([CardRootShadow]);

  expect(createWebRenderer(runtime).renderToHtml(runtime.h(Card, { title: "hello" }))).toBe(
    "<article>hello</article>",
  );
  expect(events).toEqual([]);
});
