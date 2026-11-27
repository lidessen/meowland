import { expect, test } from "bun:test";
import { createRuntime } from "../../src/runtime";
import { createWebRenderer } from "../../web/index";
import {
  createMemoryRouterAdapter,
  createRouter,
  Link,
  matchPath,
  RouterProvider,
  RouterView,
  type LinkClickEvent,
  type RouterAdapter,
} from "../../src/router";

test("matches static, parameter, wildcard and unmatched paths", () => {
  expect(matchPath("/tasks", "/tasks")).toEqual({ pattern: "/tasks", params: {} });
  expect(matchPath("/runs/:id", "/runs/a%20b")).toEqual({
    pattern: "/runs/:id",
    params: { id: "a b" },
  });
  expect(matchPath("/files/*", "/files/a/b")).not.toBeNull();
  expect(matchPath("/files/*", "/files")).not.toBeNull();
  expect(matchPath("*", "/anything")).not.toBeNull();
  expect(matchPath("/tasks/:id", "/tasks")).toBeNull();
  expect(matchPath("/tasks", "/tasks/extra")).toBeNull();
  expect(matchPath("/runs/:id", "/runs/%FF")).toBeNull();
});

test("tracks history, query, replacement, popstate and fragment preservation", () => {
  const memory = createMemoryRouterAdapter("/app/tasks?old=1#secret");
  let listener = () => {};
  let unsubscribed = false;
  let state: unknown;
  const adapter: RouterAdapter = {
    ...memory,
    push(url, next) {
      state = next;
      memory.push(url, next);
    },
    subscribe(callback) {
      listener = callback;
      const unsubscribe = memory.subscribe(callback);
      return () => {
        unsubscribed = true;
        unsubscribe();
      };
    },
  };
  const routes = [
    { path: "/tasks", component: () => "Tasks" },
    { path: "/runs/:id", component: () => "Run" },
  ];
  const router = createRouter({ adapter, routes, base: "/app" });
  expect(router.route.value?.route).toBe(routes[0]);
  const runtime = createRuntime();
  expect(
    createWebRenderer(runtime).renderToHtml(
      runtime.h(RouterProvider, { value: router }, runtime.h(Link, { href: "/runs/42" }, "Run")),
    ),
  ).toContain('href="/app/runs/42#secret"');
  router.navigate("/runs/42?q=hello", { state: { from: "tasks" } });
  expect(state).toEqual({ from: "tasks" });
  expect(router.location.value).toMatchObject({
    pathname: "/app/runs/42",
    search: "?q=hello",
    hash: "#secret",
  });
  expect(router.location.value.query.get("q")).toBe("hello");
  expect(router.route.value?.params).toEqual({ id: "42" });
  router.navigate("/runs/43#new", { replace: true });
  expect(router.location.value.hash).toBe("#new");
  router.back();
  expect(router.location.value.pathname).toBe("/app/tasks");
  expect(router.location.value.hash).toBe("#secret");
  memory.push("/app/runs/9#pop");
  listener();
  expect(router.route.value?.params.id).toBe("9");
  router.navigate("/tasks#");
  expect(router.location.value.hash).toBe("");
  router.dispose();
  expect(unsubscribed).toBe(true);
  memory.push("/app/runs/10");
  listener();
  expect(router.location.value.pathname).toBe("/app/tasks");
});

test("provider, view and link use shared context and respect browser click behavior", () => {
  const router = createRouter({
    initialPath: "/tasks#secret",
    routes: [
      { path: "/tasks", component: () => "Tasks" },
      { path: "/runs/:id", component: ({ params }) => `Run ${params.id}` },
    ],
  });
  let anchor: Record<string, any> = {};
  const runtime = createRuntime({
    plugins: [
      {
        create(context, next) {
          if (context.type === "a") anchor = context.props;
          return next(context);
        },
      },
    ],
  });
  const web = createWebRenderer(runtime);
  const render = (href: string, target?: string) =>
    web.renderToHtml(
      runtime.h(RouterProvider, { value: router }, [
        runtime.h(Link, { href, target }, "Go"),
        runtime.h(RouterView, { fallback: "Missing" }),
      ]),
    );
  expect(render("/runs/1")).toContain("Tasks");
  const event = (extra: Partial<LinkClickEvent> = {}) => ({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    ...extra,
  });
  const plain = event();
  anchor.onClick(plain);
  expect(plain.defaultPrevented).toBe(true);
  expect(router.location.value.hash).toBe("#secret");
  expect(render("/tasks")).toContain("Run 1");
  for (const extra of [{ ctrlKey: true }, { metaKey: true }, { button: 1 }]) {
    const modified = event(extra);
    anchor.onClick(modified);
    expect(modified.defaultPrevented).toBe(false);
  }
  render("https://example.com/");
  const external = event();
  anchor.onClick(external);
  expect(external.defaultPrevented).toBe(false);
  render("/tasks", "_blank");
  const blank = event();
  anchor.onClick(blank);
  expect(blank.defaultPrevented).toBe(false);
  expect(router.location.value.pathname).toBe("/runs/1");
});

test("browser adapter subscribes and removes popstate", () => {
  const old = Object.getOwnPropertyDescriptor(globalThis, "window");
  const listeners = new Set<() => void>();
  const location = {
    pathname: "/one",
    search: "",
    hash: "#secret",
    origin: "https://example.test",
  };
  const update = (url: string) => {
    const parsed = new URL(url, location.origin);
    Object.assign(location, {
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
    });
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location,
      history: {
        pushState: (_state: unknown, _unused: string, url: string) => update(url),
        replaceState: (_state: unknown, _unused: string, url: string) => update(url),
        back() {},
      },
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    },
  });
  try {
    const router = createRouter();
    router.navigate("/two?x=1");
    expect(location.hash).toBe("#secret");
    update("/one#back");
    for (const listener of listeners) listener();
    expect(router.location.value.hash).toBe("#back");
    router.dispose();
    expect(listeners.size).toBe(0);
  } finally {
    if (old) Object.defineProperty(globalThis, "window", old);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
