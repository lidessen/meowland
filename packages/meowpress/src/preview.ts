import { realpath, stat } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

async function statIfPresent(path: string) {
  try {
    return await stat(path);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") return undefined;
    throw error;
  }
}

export async function serveSite(outputDirectory: string, port = 4173) {
  if (!(await statIfPresent(outputDirectory))?.isDirectory()) {
    throw new Error(`Built site not found at ${outputDirectory}. Run meowpress build first.`);
  }
  const root = await realpath(outputDirectory);
  const isInside = (path: string) => path === root || path.startsWith(root + sep);

  async function fileResponse(path: string, method: string, status: number) {
    if (!(await statIfPresent(path))?.isFile()) return undefined;
    const target = await realpath(path);
    if (!isInside(target)) return undefined;
    const file = Bun.file(target);
    return new Response(method === "HEAD" ? null : file, {
      status,
      headers: { "Content-Type": file.type, "Cache-Control": "no-store" },
    });
  }

  return Bun.serve({
    hostname: "127.0.0.1",
    port,
    async fetch(request) {
      if (request.method !== "GET" && request.method !== "HEAD")
        return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
      const url = new URL(request.url);
      let pathname: string;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return new Response("Invalid path", { status: 400 });
      }
      if (pathname.includes("\0")) return new Response("Invalid path", { status: 400 });
      const target = resolve(root, `.${pathname}`);
      if (!isInside(target)) return new Response("Forbidden", { status: 403 });

      if (!pathname.endsWith("/") && (await statIfPresent(target))?.isDirectory()) {
        url.pathname += "/";
        return Response.redirect(url, 301);
      }
      const path = pathname.endsWith("/") ? join(target, "index.html") : target;
      return (
        (await fileResponse(path, request.method, 200)) ??
        (await fileResponse(join(root, "404.html"), request.method, 404)) ??
        new Response(request.method === "HEAD" ? null : "Page not found", { status: 404 })
      );
    },
  });
}
