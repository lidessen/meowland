import { resolve, sep } from "node:path";
const root = resolve(import.meta.dir, "dist");
const port = Number(process.env.PORT ?? 13009);
if (!(await Bun.file(resolve(root, "index.html")).exists()))
  throw new Error("Build first: bun examples/presentation/build.ts");
const server = Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(request) {
    const path = decodeURIComponent(new URL(request.url).pathname);
    const file = resolve(root, `.${path === "/" ? "/index.html" : path}`);
    if (!file.startsWith(root + sep)) return new Response("Forbidden", { status: 403 });
    const body = Bun.file(file);
    if (!(await body.exists())) return new Response("Not found", { status: 404 });
    return new Response(body, { headers: { "Cache-Control": "no-store" } });
  },
});
console.log(`Presentation: ${server.url}`);
