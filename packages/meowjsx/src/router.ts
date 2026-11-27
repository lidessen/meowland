import { createContext, useContext } from "./context";
import { mapSignal, signal } from "./signal";
import type { Child, Component, ComponentRenderContext, Props, ReadableSignal } from "./types";

/** The standard URLSearchParams interface available in browsers and modern server runtimes. */
export interface RouterQuery {
  readonly size: number;
  append(name: string, value: string): void;
  delete(name: string, value?: string): void;
  set(name: string, value: string): void;
  sort(): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string, value?: string): boolean;
  toString(): string;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  forEach(callback: (value: string, key: string, parent: RouterQuery) => void): void;
  [Symbol.iterator](): IterableIterator<[string, string]>;
}

interface ParsedURL {
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  searchParams: RouterQuery;
}
const URLConstructor = (
  globalThis as unknown as {
    URL: new (input: string, base?: string) => ParsedURL;
  }
).URL;
const memoryOrigin = "http://meowjsx.invalid";

export interface RouterLocation {
  pathname: string;
  search: string;
  query: RouterQuery;
  hash: string;
}
export interface RouterAdapter {
  getLocation(): { pathname: string; search: string; hash: string };
  push(url: string, state?: unknown): void;
  replace(url: string, state?: unknown): void;
  back(): void;
  subscribe(listener: () => void): () => void;
}
export interface RouteDefinition {
  path: string;
  component: Component<any>;
}
export interface RouteMatch {
  route: RouteDefinition;
  params: Record<string, string>;
  pattern: string;
}
export interface Router {
  readonly location: ReadableSignal<RouterLocation>;
  readonly route: ReadableSignal<RouteMatch | null>;
  resolve(to: string): string;
  navigate(to: string, options?: { replace?: boolean; state?: unknown }): void;
  back(): void;
  dispose(): void;
}
export interface RouterOptions {
  routes?: RouteDefinition[];
  base?: string;
  initialPath?: string;
  adapter?: RouterAdapter;
}

/** Match whole path segments; a final wildcard also matches an empty suffix. */
export function matchPath(
  pattern: string,
  pathname: string,
): { params: Record<string, string>; pattern: string } | null {
  if (pattern === "*") return { params: {}, pattern };
  const parts = pattern.split("/").filter(Boolean);
  const path = pathname.split("/").filter(Boolean);
  const params: Record<string, string> = {};
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (part === "*" && i === parts.length - 1) return { params, pattern };
    const value = path[i];
    if (value === undefined) return null;
    if (part.startsWith(":")) {
      if (part.length === 1) return null;
      try {
        params[part.slice(1)] = decodeURIComponent(value);
      } catch {
        return null;
      }
    } else if (part !== value) return null;
  }
  return path.length === parts.length ? { params, pattern } : null;
}

type BrowserWindow = {
  location: { pathname: string; search: string; hash: string; origin: string };
  history: {
    pushState(state: unknown, unused: string, url: string): void;
    replaceState(state: unknown, unused: string, url: string): void;
    back(): void;
  };
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
};
function browserWindow(): BrowserWindow | undefined {
  return (globalThis as unknown as { window?: BrowserWindow }).window;
}
function browserAdapter(win: BrowserWindow): RouterAdapter {
  return {
    getLocation: () => win.location,
    push: (url, state) => win.history.pushState(state ?? null, "", url),
    replace: (url, state) => win.history.replaceState(state ?? null, "", url),
    back: () => win.history.back(),
    subscribe: (listener) => {
      win.addEventListener("popstate", listener);
      return () => win.removeEventListener("popstate", listener);
    },
  };
}

/** In-memory history for server rendering and non-browser hosts. */
export function createMemoryRouterAdapter(initialPath = "/"): RouterAdapter {
  const initial = new URLConstructor(initialPath, memoryOrigin);
  let entries = [initial.pathname + initial.search + initial.hash];
  let index = 0;
  const listeners = new Set<() => void>();
  return {
    getLocation: () => new URLConstructor(entries[index]!, memoryOrigin),
    push: (url) => {
      entries = entries.slice(0, index + 1);
      entries.push(url);
      index++;
    },
    replace: (url) => {
      entries[index] = url;
    },
    back: () => {
      if (index > 0) {
        index--;
        for (const listener of Array.from(listeners)) listener();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function createRouter(options: RouterOptions = {}): Router {
  const win = browserWindow();
  const adapter =
    options.adapter ??
    (win && options.initialPath === undefined
      ? browserAdapter(win)
      : createMemoryRouterAdapter(options.initialPath));
  const base =
    options.base && options.base !== "/"
      ? "/" + options.base.split("/").filter(Boolean).join("/")
      : "";
  const read = (): RouterLocation => {
    const location = adapter.getLocation();
    const parsed = new URLConstructor(
      location.pathname + location.search + location.hash,
      memoryOrigin,
    );
    return {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      query: parsed.searchParams,
    };
  };
  const location = signal(read());
  const route = mapSignal(location, (current): RouteMatch | null => {
    if (base && current.pathname !== base && !current.pathname.startsWith(base + "/")) return null;
    const path = current.pathname.slice(base.length) || "/";
    for (const definition of options.routes ?? []) {
      const match = matchPath(definition.path, path);
      if (match) return { route: definition, ...match };
    }
    return null;
  });
  const resolve = (to: string): string => {
    const current = location.value;
    const origin = win?.location.origin ?? memoryOrigin;
    const currentURL = origin + current.pathname + current.search + current.hash;
    const absolute = /^[a-z][a-z\d+.-]*:/i.test(to) || to.startsWith("//");
    const target = new URLConstructor(to, currentURL);
    if (target.origin !== origin) throw new Error("Cannot navigate to an external URL");
    if (
      !absolute &&
      to.startsWith("/") &&
      base &&
      target.pathname !== base &&
      !target.pathname.startsWith(base + "/")
    )
      target.pathname = base + target.pathname;
    const hash = to.includes("#") ? target.hash : current.hash;
    return target.pathname + target.search + hash;
  };
  let disposed = false;
  const unsubscribe = adapter.subscribe(() => {
    if (!disposed) location.value = read();
  });
  return {
    location,
    route,
    resolve,
    navigate(to, navigation = {}) {
      if (disposed) return;
      const url = resolve(to);
      if (navigation.replace) adapter.replace(url, navigation.state);
      else adapter.push(url, navigation.state);
      location.value = read();
    },
    back() {
      if (!disposed) adapter.back();
    },
    dispose() {
      if (!disposed) {
        disposed = true;
        unsubscribe();
      }
    },
  };
}

const RouterContext = createContext<Router | undefined>(undefined);
export const RouterProvider = RouterContext.Provider;
export function useRouter(): Router {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useRouter requires a RouterProvider");
  return router;
}

export interface LinkClickEvent {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
  preventDefault(): void;
}
export interface LinkProps extends Props {
  href: string;
  replace?: boolean;
  target?: string;
  download?: unknown;
  onClick?: (event: LinkClickEvent) => void;
}
export function Link(
  { href, replace, target, download, onClick, children, ...props }: LinkProps,
  context: ComponentRenderContext,
): Child {
  const router = useRouter();
  const click = (event: LinkClickEvent): void => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      (target && target.toLowerCase() !== "_self") ||
      download !== undefined
    )
      return;
    const win = browserWindow();
    const origin = win?.location.origin ?? memoryOrigin;
    let url: ParsedURL;
    try {
      url = new URLConstructor(href, origin + router.location.value.pathname);
    } catch {
      return;
    }
    if (url.origin !== origin) return;
    event.preventDefault();
    router.navigate(href, { replace });
  };
  const linkHref = mapSignal(router.location, () => {
    try {
      return router.resolve(href);
    } catch {
      return href;
    }
  });
  return context.runtime.h(
    "a",
    { ...props, href: linkHref, target, download, onClick: click },
    children,
  );
}
export function RouterView(
  { fallback = null }: { fallback?: Child },
  context: ComponentRenderContext,
): Child {
  const router = useRouter();
  return mapSignal(router.route, (match) =>
    match ? context.runtime.h(match.route.component, { params: match.params }) : fallback,
  );
}
