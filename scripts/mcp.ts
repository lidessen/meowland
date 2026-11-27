import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { ComponentEntry } from "./manifest";
import { validateRegistry } from "./registry";

interface Request {
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: unknown;
}

type ObjectValue = Record<string, unknown>;
function object(value: unknown): value is ObjectValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const definitions = [
  {
    name: "find_component",
    description: "Search components by name, description, parts or behaviors.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Search terms" } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_component_api",
    description: "Get the full API of a registered component.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Component name or symbol" } },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "get_registry_item",
    description: "Get a block or theme and its source files.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Registry item name" } },
      required: ["name"],
      additionalProperties: false,
    },
  },
];

export function createDocsMcpServer(rootDir: string) {
  const root = resolve(rootDir);
  const manifestPath = join(root, "packages/meowtail/registry/components-manifest.json");
  const registryPath = join(root, "packages/meowtail/registry/registry.json");
  async function call(name: string, args: unknown): Promise<unknown> {
    if (!object(args)) throw new Error("Arguments must be an object");
    const field = name === "find_component" ? "query" : "name";
    const input = args[field];
    if (
      typeof input !== "string" ||
      !input.trim() ||
      Object.keys(args).some((key) => key !== field)
    )
      throw new Error(`Expected a nonempty ${field}`);
    if (name === "get_registry_item") {
      const registry = await validateRegistry(registryPath);
      const item = registry.items.find((entry) => entry.name === input);
      if (!item) throw new Error(`Unknown registry item: ${input}`);
      return {
        ...item,
        files: await Promise.all(
          item.files.map(async (file) => ({
            ...file,
            content: await readFile(join(dirname(registryPath), file.path), "utf8"),
          })),
        ),
      };
    }
    if (name !== "find_component" && name !== "get_component_api")
      throw new Error(`Unknown tool: ${name}`);
    const entries = JSON.parse(await readFile(manifestPath, "utf8")) as ComponentEntry[];
    if (name === "get_component_api") {
      const item = entries.find(
        (entry) =>
          entry.name.toLowerCase() === input.toLowerCase() ||
          entry.symbol.toLowerCase() === input.toLowerCase(),
      );
      if (!item) throw new Error(`Unknown component: ${input}`);
      return item;
    }
    const terms = input.toLowerCase().split(/\s+/).filter(Boolean);
    return entries.filter((entry) => {
      const haystack = [
        entry.name,
        entry.symbol,
        entry.description,
        ...entry.parts,
        ...entry.behaviors,
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }
  async function handleJsonRpc(request: unknown): Promise<ObjectValue | undefined> {
    if (
      !object(request) ||
      request.jsonrpc !== "2.0" ||
      typeof request.method !== "string" ||
      ("id" in request &&
        request.id !== null &&
        typeof request.id !== "string" &&
        typeof request.id !== "number")
    )
      return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } };
    const { id, method, params } = request as Request;
    if (!("id" in request)) return undefined;
    const reply = (result: unknown): ObjectValue => ({ jsonrpc: "2.0", id, result });
    if (method === "initialize") {
      const requested =
        object(params) && typeof params.protocolVersion === "string" ? params.protocolVersion : "";
      const protocolVersion = ["2024-11-05", "2025-03-26", "2025-06-18"].includes(requested)
        ? requested
        : "2025-06-18";
      return reply({
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: "meowtail-docs", version: "1.0.0" },
      });
    }
    if (method === "tools/list") return reply({ tools: definitions });
    if (method === "tools/call") {
      if (!object(params) || typeof params.name !== "string")
        return { jsonrpc: "2.0", id, error: { code: -32602, message: "Invalid params" } };
      try {
        const result = await call(params.name, params.arguments ?? {});
        return reply({ content: [{ type: "text", text: JSON.stringify(result) }] });
      } catch (error) {
        return reply({
          isError: true,
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
        });
      }
    }
    return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
  }
  return { handleJsonRpc };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = createDocsMcpServer(process.cwd());
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of lines) {
    try {
      const result = await server.handleJsonRpc(JSON.parse(line));
      if (result) process.stdout.write(`${JSON.stringify(result)}\n`);
    } catch {
      process.stdout.write(
        `${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } })}\n`,
      );
    }
  }
}
