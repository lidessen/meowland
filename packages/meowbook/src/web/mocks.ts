import type { MockAnswer, MockContext } from "../types";

const methods = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
/** Distinct unmocked requests kept per story; later ones still pass through uncounted. */
const unmockedLimit = 50;

export interface MockRoute {
  /** The route as written, for messages and reports. */
  readonly route: string;
  readonly method?: string;
  readonly origin?: string;
  readonly segments: readonly string[];
  /** A final `*` matches the remaining segments, none included. */
  readonly rest: boolean;
}

export interface MockRequests {
  mocks: { route: string; hits: number }[];
  unmocked: { method: string; url: string; count: number }[];
}

function malformed(route: string, reason: string): never {
  throw new Error(`Malformed mock route ${JSON.stringify(route)}: ${reason}`);
}

/** Parses `"<METHOD> <path>"` or `"<path>"`; a malformed route throws before any request. */
export function parseRoute(route: string): MockRoute {
  let method: string | undefined;
  let target = route;
  const space = route.indexOf(" ");
  if (space >= 0) {
    method = route.slice(0, space);
    target = route.slice(space + 1);
    if (!methods.includes(method)) malformed(route, `unknown method ${JSON.stringify(method)}`);
  }
  if (/\s/.test(target)) malformed(route, "a route must not contain whitespace");
  let origin: string | undefined;
  const absolute = /^(https?:\/\/[^/?#]+)(.*)$/i.exec(target);
  if (absolute) {
    origin = absolute[1]!.toLowerCase();
    target = absolute[2] || "/";
  }
  if (!target.startsWith("/")) malformed(route, 'the path must start with "/"');
  if (/[?#]/.test(target)) malformed(route, "the query string and fragment are not matched");
  const segments = target.slice(1).split("/");
  const names = new Set<string>();
  let rest = false;
  for (const [index, segment] of segments.entries()) {
    if (segment === "*") {
      if (index !== segments.length - 1)
        malformed(route, '"*" is only allowed as the last segment');
      rest = true;
    } else if (segment.startsWith(":")) {
      const name = segment.slice(1);
      if (!/^[A-Za-z_$][\w$]*$/.test(name)) malformed(route, `invalid parameter ${segment}`);
      if (names.has(name)) malformed(route, `duplicate parameter ${segment}`);
      names.add(name);
    } else if (segment.includes("*") || segment.includes(":"))
      malformed(route, `"*" and ":" must start a whole segment: ${segment}`);
  }
  return {
    route,
    ...(method ? { method } : {}),
    ...(origin ? { origin } : {}),
    segments: rest ? segments.slice(0, -1) : segments,
    rest,
  };
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** The decoded `:name` params when the request matches the route, else undefined. */
export function matchRoute(
  route: MockRoute,
  method: string,
  url: URL,
): Record<string, string> | undefined {
  if (route.method && route.method !== method.toUpperCase()) return undefined;
  if (route.origin && route.origin !== url.origin.toLowerCase()) return undefined;
  const actual = url.pathname.slice(1).split("/");
  if (
    route.rest ? actual.length < route.segments.length + 1 : actual.length !== route.segments.length
  )
    return undefined;
  const params: Record<string, string> = Object.create(null);
  for (const [index, expected] of route.segments.entries()) {
    const value = decode(actual[index]!);
    if (expected.startsWith(":")) {
      if (!value) return undefined;
      params[expected.slice(1)] = value;
    } else if (expected !== value) return undefined;
  }
  return params;
}

async function answer(route: MockRoute, value: unknown, context: MockContext): Promise<Response> {
  let result = value;
  if (typeof value === "function") {
    try {
      result = await value(context);
    } catch (cause) {
      throw new TypeError(`Mock for ${route.route} threw`, { cause });
    }
  }
  if (result instanceof Response) return result;
  if (result === undefined) return new Response(null, { status: 204 });
  return Response.json(result);
}

export interface InstalledMocks {
  /** Puts the original `fetch` back. */
  restore(): void;
  /** Hits per route and the requests that matched none, counted since install. */
  requests(): MockRequests;
}

/**
 * Wraps `target.fetch` so requests matching `mocks` are answered and the rest reach the original.
 * The first matching route in declaration order wins. Throws on a malformed route before changing
 * anything.
 */
export function installMocks(
  mocks: Readonly<Record<string, MockAnswer>>,
  target: { fetch: typeof fetch } = globalThis,
): InstalledMocks {
  const routes = Object.entries(mocks).map(([route, value]) => ({
    route: parseRoute(route),
    value,
    hits: 0,
  }));
  const unmocked = new Map<string, { method: string; url: string; count: number }>();
  const original = target.fetch;
  const intercepted = (async (input: RequestInfo | URL, init?: RequestInit) => {
    let request: Request;
    try {
      request = new Request(input instanceof Request ? input.clone() : input, init);
    } catch {
      // Not a request the platform can parse; its own fetch reports the error.
      return original.call(globalThis, input, init);
    }
    const url = new URL(request.url);
    for (const entry of routes) {
      const params = matchRoute(entry.route, request.method, url);
      if (!params) continue;
      entry.hits++;
      return answer(entry.route, entry.value, { request, url, params });
    }
    const method = request.method.toUpperCase();
    const key = `${method} ${url.origin}${url.pathname}`;
    const known = unmocked.get(key);
    if (known) known.count++;
    else if (unmocked.size < unmockedLimit)
      unmocked.set(key, { method, url: `${url.origin}${url.pathname}`, count: 1 });
    return original.call(globalThis, input, init);
  }) as typeof fetch;
  target.fetch = intercepted;
  return {
    restore() {
      target.fetch = original;
    },
    requests: () => ({
      mocks: routes.map(({ route, hits }) => ({ route: route.route, hits })),
      unmocked: [...unmocked.values()].map((entry) => ({ ...entry })),
    }),
  };
}
