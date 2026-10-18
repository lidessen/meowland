/// <reference types="bun" preserve="true" />
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { compileSlides } from "./compiler";

export { compileSlides, type CompiledSlides, type SlideMetadata } from "./compiler";

export interface BuildSlidesOptions {
  entry: string;
  outdir: string;
}

export interface BuildSlidesResult {
  entry: string;
  outdir: string;
  slides: readonly { id: string; title: string; steps: number; notes?: string }[];
  files: readonly string[];
  /** All resolved local modules/assets; used by development rebuilds. */
  dependencies: readonly string[];
}

const host = `import { h, createRuntime } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { createMeowUI } from "meowtail";
import { applyTheme, mountStyles } from "meowcss/web";
import { Presentation, createMeowSlides } from "meowslides";
import { presentationTheme } from "meowslides/theme";
import { createDeck } from "meowslides:deck";
const runtime = createRuntime();
const uninstallUI = runtime.use(createMeowUI());
const uninstallSlides = runtime.use(createMeowSlides());
const root = document.getElementById("app");
const removeStyles = mountStyles(document, presentationTheme.cssText);
const restoreTheme = applyTheme(document.documentElement, presentationTheme);
const mounted = createWebRenderer(runtime).render(h(Presentation, createDeck()), root);
window.addEventListener("pagehide", (event) => { if (event.persisted) return; mounted.unmount(); restoreTheme(); removeStyles(); uninstallSlides(); uninstallUI(); });
`;

function html(title: string, script: string): string {
  const safeTitle = title
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${safeTitle}</title><style>html,body{margin:0}#app{height:100dvh}</style></head><body><main id="app"></main><script type="module" src="./${script}"></script></body></html>`;
}

function outputGuard(entry: string, outdir: string): void {
  const source = dirname(entry);
  if (outdir === source || source.startsWith(outdir + sep))
    throw new Error("Slides output must not contain the source directory");
  if (outdir === entry)
    throw new Error("Slides output must be a directory separate from the entry");
}

function bundleDiagnostic(error: unknown): string {
  if (error && typeof error === "object" && "errors" in error && Array.isArray(error.errors))
    return error.errors.map(bundleDiagnostic).join("\n");
  if (error && typeof error === "object" && "message" in error) {
    const position =
      "position" in error
        ? (error.position as { file?: string; line?: number; column?: number } | undefined)
        : undefined;
    return `${position?.file ? `${position.file}:${position.line ?? 0}:${position.column ?? 0}: ` : ""}${String(error.message)}`;
  }
  return String(error);
}

/** Build a trusted local MDX deck into a standalone static browser directory. */
export async function buildSlides(options: BuildSlidesOptions): Promise<BuildSlidesResult> {
  const entry = resolve(options.entry);
  const outdir = resolve(options.outdir);
  outputGuard(entry, outdir);
  if (!/\.mdx?$/i.test(entry)) throw new Error("Slides entry must be a .md or .mdx file");
  const compiled = await compileSlides(await readFile(entry, "utf8"), entry);
  const dependencies = new Set([entry]);
  const staging = await mkdtemp(join(tmpdir(), "meowslides-build-"));
  try {
    const result = await Bun.build({
      entrypoints: ["meowslides:host"],
      outdir: staging,
      naming: {
        entry: "app.[ext]",
        asset: "assets/[name]-[hash].[ext]",
        chunk: "chunks/[name]-[hash].[ext]",
      },
      target: "browser",
      jsx: { runtime: "automatic", importSource: "meowjsx", development: false },
      plugins: [
        {
          name: "meowslides-mdx",
          setup(build) {
            build.onResolve({ filter: /^meowslides:(host|deck)$/ }, ({ path }) => ({
              path,
              namespace: "meowslides",
            }));
            build.onLoad({ filter: /.*/, namespace: "meowslides" }, ({ path }) => ({
              contents: path.endsWith("host") ? host : compiled.code,
              loader: "js",
              resolveDir: dirname(entry),
            }));
            build.onResolve({ filter: /^meowslides-asset:/ }, ({ path }) => ({
              path: path.slice("meowslides-asset:".length),
              namespace: "meowslides-asset",
            }));
            build.onLoad({ filter: /.*/, namespace: "meowslides-asset" }, async ({ path }) => {
              dependencies.add(path);
              return { contents: new Uint8Array(await readFile(path)), loader: "file" };
            });
            build.onResolve(
              { filter: /\.(?:png|jpe?g|gif|webp|svg|mp4|webm|mp3|wav|ogg|vtt|pdf)$/i },
              ({ path, importer }) => {
                if (/^[a-z][a-z\d+.-]*:/i.test(path)) return undefined;
                const absolute = resolve(
                  importer && isAbsolute(importer) ? dirname(importer) : dirname(entry),
                  path,
                );
                return { path: absolute, namespace: "meowslides-asset" };
              },
            );
            build.onResolve({ filter: /^\./ }, ({ path, importer }) => {
              const base = importer && isAbsolute(importer) ? dirname(importer) : dirname(entry);
              try {
                const resolved = Bun.resolveSync(path, base);
                dependencies.add(resolved);
                return { path: resolved };
              } catch (error) {
                throw new Error(
                  `${importer || entry}: unable to resolve ${path}: ${bundleDiagnostic(error)}`,
                );
              }
            });
          },
        },
      ],
    });
    if (!result.success) throw new Error(result.logs.map(String).join("\n"));
    await writeFile(join(staging, "index.html"), html(compiled.slides[0]!.title, "app.js"));
    await writeFile(
      join(staging, "slides-manifest.json"),
      JSON.stringify({ title: compiled.slides[0]!.title, slides: compiled.slides }, null, 2),
    );
    await mkdir(outdir, { recursive: true });
    const files = [
      ...result.outputs.map((output) => relative(staging, output.path)),
      "index.html",
      "slides-manifest.json",
    ];
    for (const file of files) {
      await mkdir(dirname(join(outdir, file)), { recursive: true });
      await cp(join(staging, file), join(outdir, file));
    }
    for (const name of ["SOURCES.md", "NOTICES.md", "assets/NOTICES.md"]) {
      const source = join(dirname(entry), name);
      if (await Bun.file(source).exists()) {
        await mkdir(dirname(join(outdir, name)), { recursive: true });
        await cp(source, join(outdir, name));
        dependencies.add(source);
        files.push(name);
      }
    }
    return { entry, outdir, slides: compiled.slides, files, dependencies: [...dependencies] };
  } catch (error) {
    throw new Error(`Unable to build ${entry}:\n${bundleDiagnostic(error)}`);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

export interface ServeSlidesOptions {
  outdir: string;
  port?: number;
  hostname?: "127.0.0.1" | "localhost";
}

/** Serve a previously built directory over loopback HTTP. */
export function serveSlides(options: ServeSlidesOptions) {
  const root = resolve(options.outdir);
  return Bun.serve({
    hostname: options.hostname ?? "127.0.0.1",
    port: options.port ?? 3030,
    async fetch(request) {
      let pathname: string;
      try {
        pathname = decodeURIComponent(new URL(request.url).pathname);
      } catch {
        return new Response("Bad URL", { status: 400 });
      }
      const path = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
      if (!path.startsWith(root + sep)) return new Response("Forbidden", { status: 403 });
      const file = Bun.file(path);
      if (!(await file.exists())) return new Response("Not found", { status: 404 });
      return new Response(file, { headers: { "Cache-Control": "no-store" } });
    },
  });
}

export interface DevSlidesOptions {
  entry: string;
  outdir?: string;
  port?: number;
  onError?: (error: Error) => void;
}

/** Watch local source changes and reload connected browsers after successful rebuilds. */
export async function devSlides(options: DevSlidesOptions) {
  const outdir = options.outdir
    ? resolve(options.outdir)
    : await mkdtemp(join(tmpdir(), "meowslides-dev-"));
  let result = await buildSlides({ entry: options.entry, outdir });
  let revision = 0;
  let busy = false;
  let pending = false;
  let stopped = false;
  const root = dirname(resolve(options.entry));
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: options.port ?? 3030,
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === "/__meowslides_revision")
        return Response.json({ revision }, { headers: { "Cache-Control": "no-store" } });
      let pathname: string;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return new Response("Bad URL", { status: 400 });
      }
      const path = resolve(outdir, `.${pathname === "/" ? "/index.html" : pathname}`);
      if (!path.startsWith(outdir + sep)) return new Response("Forbidden", { status: 403 });
      const file = Bun.file(path);
      if (!(await file.exists())) return new Response("Not found", { status: 404 });
      if (basename(path) === "index.html")
        return new Response(
          (await file.text()).replace(
            "</body>",
            `<script>let revision=${revision};setInterval(async()=>{try{const next=(await(await fetch('/__meowslides_revision')).json()).revision;if(next!==revision)location.reload();revision=next}catch{}},500)</script></body>`,
          ),
          { headers: { "Content-Type": "text/html", "Cache-Control": "no-store" } },
        );
      return new Response(file, { headers: { "Cache-Control": "no-store" } });
    },
  });
  async function rebuild() {
    if (stopped) return;
    if (busy) {
      pending = true;
      return;
    }
    busy = true;
    try {
      result = await buildSlides({ entry: options.entry, outdir });
      if (!stopped) {
        watchDependencies();
        revision++;
      }
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      busy = false;
      if (pending) {
        pending = false;
        void rebuild();
      }
    }
  }
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const watchers = new Map<string, ReturnType<typeof watch>>();
  function changedFile(directory: string, filename: string | Buffer | null) {
    if (!filename) return;
    const changed = resolve(directory, String(filename));
    if (
      changed === outdir ||
      changed.startsWith(outdir + sep) ||
      /(?:^|\/)node_modules(?:\/|$)/.test(String(filename))
    )
      return;
    if (
      !/\.(?:mdx?|[cm]?[jt]sx?|css|json|svg|png|jpe?g|webp|gif|mp4|webm|vtt|mp3|wav)$/i.test(
        extname(changed),
      )
    )
      return;
    clearTimeout(timeout);
    timeout = setTimeout(() => void rebuild(), 80);
  }
  watchers.set(
    root,
    watch(root, { recursive: true }, (_event, filename) => changedFile(root, filename)),
  );
  function watchDependencies() {
    for (const dependency of result.dependencies) {
      const directory = dirname(dependency);
      if (
        directory === root ||
        directory.startsWith(root + sep) ||
        directory.includes(`${sep}node_modules${sep}`) ||
        watchers.has(directory)
      )
        continue;
      try {
        watchers.set(
          directory,
          watch(directory, (_event, filename) => changedFile(directory, filename)),
        );
      } catch {
        /* A missing dependency already has a build diagnostic. */
      }
    }
  }
  watchDependencies();
  return {
    server,
    get result() {
      return result;
    },
    stop() {
      stopped = true;
      for (const watcher of watchers.values()) watcher.close();
      clearTimeout(timeout);
      server.stop(true);
      if (!options.outdir) void rm(outdir, { recursive: true, force: true });
    },
  };
}
