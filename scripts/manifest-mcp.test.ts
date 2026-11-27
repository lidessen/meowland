import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { buildComponentManifest } from "./manifest";
import { createDocsMcpServer } from "./mcp";

const root = resolve(import.meta.dir, "..");
const server = createDocsMcpServer(root);

async function rpc(method: string, params: unknown = {}) {
  return (await server.handleJsonRpc({ jsonrpc: "2.0", id: 1, method, params })) as {
    result?: {
      tools?: { name: string }[];
      content?: { text: string }[];
      isError?: boolean;
      protocolVersion?: string;
    };
    error?: { code: number };
  };
}
async function tool(name: string, args: object) {
  return (await rpc("tools/call", { name, arguments: args })).result!;
}

describe("component manifest", () => {
  test("covers the registered catalog and matches the generated file", async () => {
    const entries = await buildComponentManifest(root);
    const registry = await readFile(join(root, "packages/meowtail/src/registry/index.ts"), "utf8");
    const catalog = /export const meowUIComponents\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(
      registry,
    )![1]!;
    const symbols = catalog
      .split(",")
      .map((item) => item.trim().split(".").pop()!)
      .filter(Boolean)
      .sort();
    expect(entries.map((entry) => entry.symbol).sort()).toEqual(symbols);
    expect(new Set(entries.map((entry) => entry.name)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.status).toBeTruthy();
      expect(entry.parts.length).toBeGreaterThan(0);
      expect(Array.isArray(entry.props)).toBe(true);
      expect(Array.isArray(entry.behaviors)).toBe(true);
      for (const prop of entry.props) {
        expect(prop.type).toBeTruthy();
        expect(["signal", "fixed", "unknown"]).toContain(prop.liveness);
      }
    }
    const markdown = entries.find((entry) => entry.name === "assistant-markdown")!;
    expect(markdown.props.find((prop) => prop.name === "text")?.liveness).toBe("signal");
    const web = entries.find((entry) => entry.name === "web-block")!;
    expect(web.props.find((prop) => prop.name === "kind")?.type).toBe('"search" | "fetch"');
    expect(web.props.find((prop) => prop.name === "url")?.optional).toBe(true);
    const choice = entries.find((entry) => entry.name === "choice-select")!;
    expect(choice.behaviors).toContain("createListbox");
    expect(choice.props.find((prop) => prop.name === "value")?.liveness).toBe("signal");
    expect(choice.examples).toContain("choice-select-grouped");
    expect(entries.find((entry) => entry.name === "button")?.options.variant).toEqual({
      values: ["primary", "quiet", "danger", "outline", "accent", "stop"],
      default: "primary",
    });
    const generated = JSON.parse(
      await readFile(join(root, "packages/meowtail/registry/components-manifest.json"), "utf8"),
    );
    expect(generated).toEqual(entries);
  });
});

describe("docs MCP", () => {
  test("negotiates and lists the three tools", async () => {
    expect(
      (await rpc("initialize", { protocolVersion: "2024-11-05" })).result?.protocolVersion,
    ).toBe("2024-11-05");
    expect((await rpc("tools/list")).result?.tools?.map((item) => item.name)).toEqual([
      "find_component",
      "get_component_api",
      "get_registry_item",
    ]);
    expect(
      await server.handleJsonRpc({ jsonrpc: "2.0", method: "notifications/initialized" }),
    ).toBeUndefined();
  });
  test("searches, returns the API and reads block and theme files", async () => {
    const matches = JSON.parse(
      (await tool("find_component", { query: "createListbox" })).content![0]!.text,
    );
    expect(matches.some((entry: { name: string }) => entry.name === "choice-select")).toBe(true);
    const component = JSON.parse(
      (await tool("get_component_api", { name: "ChoiceSelect" })).content![0]!.text,
    );
    expect(component.parts).toContain("trigger");
    expect(component.props.find((prop: { name: string }) => prop.name === "value").liveness).toBe(
      "signal",
    );
    for (const name of ["docs-shell", "ottr"]) {
      const item = JSON.parse((await tool("get_registry_item", { name })).content![0]!.text);
      expect(item.name).toBe(name);
      expect(item.files[0].content.length).toBeGreaterThan(10);
    }
  });
  test("reports invalid requests and tool errors", async () => {
    expect((await rpc("unknown")).error?.code).toBe(-32601);
    expect((await tool("get_component_api", { name: "missing" })).isError).toBe(true);
    expect((await tool("get_registry_item", { name: "../secret" })).isError).toBe(true);
    expect((await tool("find_component", { query: "" })).isError).toBe(true);
  });
  test("serves newline-delimited JSON-RPC on stdio", async () => {
    const child = Bun.spawn([process.execPath, join(root, "scripts/mcp.ts")], {
      cwd: root,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    child.stdin.write('{"jsonrpc":"2.0","id":7,"method":"tools/list"}\n');
    child.stdin.end();
    const output = await new Response(child.stdout).text();
    expect(await child.exited).toBe(0);
    expect(JSON.parse(output).result.tools).toHaveLength(3);
  });
});
