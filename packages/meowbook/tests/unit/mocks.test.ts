import { describe, expect, test } from "bun:test";
import { installMocks, matchRoute, parseRoute } from "../../src/web/mocks";

const match = (route: string, method: string, url: string) =>
  matchRoute(parseRoute(route), method, new URL(url));

describe("mock route matching", () => {
  test("matches method, pathname and decoded params whatever the origin, ignoring the query", () => {
    expect(match("GET /api/users", "GET", "http://a.test/api/users?page=2")).toEqual({});
    expect(match("GET /api/users", "POST", "http://a.test/api/users")).toBeUndefined();
    expect(match("/api/users", "DELETE", "https://b.test/api/users")).toEqual({});
    expect(match("GET /api/users/:id", "GET", "http://a.test/api/users/a%20b")).toEqual({
      id: "a b",
    });
    expect(match("GET /api/users/:id", "GET", "http://a.test/api/users/")).toBeUndefined();
    expect(match("GET /api/users/:id", "GET", "http://a.test/api/users/1/posts")).toBeUndefined();
    expect(match("/files/*", "GET", "http://a.test/files/a/b.txt")).toEqual({});
    expect(match("/files/*", "GET", "http://a.test/files/")).toEqual({});
    expect(match("/files/*", "GET", "http://a.test/files")).toBeUndefined();
  });

  test("an absolute route also has to match the origin", () => {
    expect(match("https://api.test/v1/x", "GET", "https://api.test/v1/x")).toEqual({});
    expect(match("https://api.test/v1/x", "GET", "https://other.test/v1/x")).toBeUndefined();
    expect(match("https://api.test/v1/x", "GET", "http://api.test/v1/x")).toBeUndefined();
  });

  test("malformed routes fail", () => {
    for (const route of [
      "",
      "api/users",
      "FETCH /x",
      "GET /a/*/b",
      "GET /a/:",
      "GET /a/:id/:id",
      "GET /a?x=1",
      "GET /a/b*",
      "GET /a b",
    ])
      expect(() => parseRoute(route)).toThrow("Malformed mock route");
  });
});

function sandbox() {
  const reached: string[] = [];
  const target = {
    fetch: (async (input: RequestInfo | URL) => {
      reached.push(String(input instanceof Request ? input.url : input));
      return new Response("real");
    }) as typeof fetch,
  };
  return { target, reached, real: target.fetch };
}

describe("fetch interception", () => {
  test("answers JSON, functions, responses and empty results; first match wins", async () => {
    const { target, reached } = sandbox();
    installMocks(
      {
        "GET /api/users/:id": ({ params, url }) => ({ id: Number(params.id), q: url.search }),
        "GET /api/users": [{ id: 1 }],
        "/api/users/*": { shadowed: true },
        "POST /api/users": () => Response.json({ id: 2 }, { status: 201 }),
        "GET /api/empty": () => undefined,
        "GET /api/late": async () => {
          await Promise.resolve();
          return { ok: true };
        },
      },
      target,
    );
    expect(await (await target.fetch("http://x.test/api/users")).json()).toEqual([{ id: 1 }]);
    expect(await (await target.fetch("http://x.test/api/users/7?a=1")).json()).toEqual({
      id: 7,
      q: "?a=1",
    });
    const created = await target.fetch("http://x.test/api/users", { method: "POST", body: "{}" });
    expect(created.status).toBe(201);
    expect((await target.fetch("http://x.test/api/empty")).status).toBe(204);
    expect(await (await target.fetch(new Request("http://x.test/api/late"))).json()).toEqual({
      ok: true,
    });
    expect(
      await (await target.fetch("http://x.test/api/users/9", { method: "PUT" })).json(),
    ).toEqual({
      shadowed: true,
    });
    expect(reached).toEqual([]);
  });

  test("a throwing answer rejects like a network failure, with the cause", async () => {
    const { target } = sandbox();
    const failure = new Error("boom");
    installMocks(
      {
        "GET /api/broken": () => {
          throw failure;
        },
      },
      target,
    );
    const error = await target.fetch("http://x.test/api/broken").catch((value) => value);
    expect(error).toBeInstanceOf(TypeError);
    expect(error.cause).toBe(failure);
  });

  test("unmatched requests reach the real fetch and are counted; counting starts at install", async () => {
    const { target, reached, real } = sandbox();
    await target.fetch("http://x.test/before");
    const installed = installMocks({ "GET /api/users": [], "GET /api/unused": 1 }, target);
    await target.fetch("http://x.test/api/users");
    await target.fetch("http://x.test/api/users");
    expect(await (await target.fetch("http://x.test/other?token=secret#h")).text()).toBe("real");
    await target.fetch("http://x.test/other", { method: "POST" });
    await target.fetch("http://x.test/other");
    expect(reached).toEqual([
      "http://x.test/before",
      "http://x.test/other?token=secret#h",
      "http://x.test/other",
      "http://x.test/other",
    ]);
    expect(installed.requests()).toEqual({
      mocks: [
        { route: "GET /api/users", hits: 2 },
        { route: "GET /api/unused", hits: 0 },
      ],
      unmocked: [
        { method: "GET", url: "http://x.test/other", count: 2 },
        { method: "POST", url: "http://x.test/other", count: 1 },
      ],
    });
    installed.restore();
    expect(target.fetch).toBe(real);
  });

  test("keeps at most 50 distinct unmocked requests", async () => {
    const { target } = sandbox();
    const installed = installMocks({}, target);
    for (let index = 0; index < 60; index++) await target.fetch(`http://x.test/p${index}`);
    expect(installed.requests().unmocked).toHaveLength(50);
  });

  test("a malformed route throws before fetch is touched", () => {
    const { target, real } = sandbox();
    expect(() => installMocks({ nope: 1 }, target)).toThrow("Malformed mock route");
    expect(target.fetch).toBe(real);
  });
});
