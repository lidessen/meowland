import { stat } from "node:fs/promises";
import { resolve, sep } from "node:path";

/** The directory the site is served from. */
export const siteDirectory = resolve(import.meta.dir, "dist");

/** The port the local server listens on. */
export const port = Number(process.env["PORT"] ?? 13004);

function resolveInsideSite(pathname: string): string | undefined {
  const target = resolve(siteDirectory, `.${pathname}`);
  if (target !== siteDirectory && !target.startsWith(siteDirectory + sep)) return undefined;
  return target;
}

/** Serve the built site over loopback. */
export function serve(): void {
  const server = Bun.serve({
    port,
    hostname: "127.0.0.1",
    async fetch(request) {
      const url = new URL(request.url);
      const pathname = decodeURIComponent(url.pathname);
      // A directory is served at its trailing-slash form: the gallery resolves
      // its canvas and its manifest relative to the document, and a document
      // at "/gallery" would resolve them against the site root.
      if (!pathname.endsWith("/")) {
        const target = resolveInsideSite(pathname);
        if (target) {
          const info = await stat(target).catch(() => undefined);
          if (info?.isDirectory()) {
            return Response.redirect(new URL(`${pathname}/`, url), 301);
          }
        }
      }
      const candidates = pathname.endsWith("/")
        ? [`${pathname}index.html`]
        : [pathname, `${pathname}/index.html`];
      for (const candidate of candidates) {
        const target = resolveInsideSite(candidate);
        if (!target) break;
        const file = Bun.file(target);
        if (await file.exists()) return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },
  });
  console.log(`Meowland documentation is at http://${server.hostname}:${server.port}/`);
}

if (import.meta.main) {
  serve();
}
