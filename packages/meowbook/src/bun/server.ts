import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join, sep } from "node:path";
import type { StoryConfig } from "../types";
import type { TemporaryStory } from "./discover";
import { buildStories } from "./build";

export async function serveStories(
  config: StoryConfig,
  options: { port?: number; temporary?: TemporaryStory; capture?: boolean } = {},
) {
  const directory = await mkdtemp(join(tmpdir(), "meowbook-serve-"));
  try {
    const manifest = await buildStories(config, directory, options.temporary, options);
    const server = Bun.serve({
      hostname: "127.0.0.1",
      port: options.port ?? 13003,
      async fetch(request) {
        if (request.method !== "GET" && request.method !== "HEAD")
          return new Response("Method not allowed", { status: 405 });
        let path: string;
        try {
          path = decodeURIComponent(new URL(request.url).pathname);
        } catch {
          return new Response("Invalid path", { status: 400 });
        }
        const filePath = resolve(directory, `.${path === "/" ? "/index.html" : path}`);
        if (!filePath.startsWith(`${directory}${sep}`))
          return new Response("Forbidden", { status: 403 });
        const file = Bun.file(filePath);
        if (!(await file.exists())) return new Response("Not found", { status: 404 });
        return new Response(request.method === "HEAD" ? null : file, {
          headers: { "content-type": file.type, "cache-control": "no-store" },
        });
      },
    });
    let stopped = false;
    return {
      url: server.url.toString(),
      manifest,
      directory,
      async stop() {
        if (stopped) return;
        stopped = true;
        await server.stop(true);
        await rm(directory, { recursive: true, force: true });
      },
    };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}
