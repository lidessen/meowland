import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildSlides, serveSlides } from "../../src/build";
import { parseCLI } from "../../src/cli";

describe("browser slides build and command line", () => {
  test("parses author commands from arbitrary working directories", () => {
    expect(parseCLI(["dev", "slides.mdx", "--", "--port", "13029"]).port).toBe(13029);
    expect(parseCLI(["build", "slides.mdx", "--outdir", "output"]).outdir).toEndWith("/output");
    expect(() => parseCLI(["dev", "slides.mdx", "--port", "0"])).toThrow("Port");
    expect(() => parseCLI(["build", "slides.mdx", "--port", "13029"])).toThrow("Unknown");
    expect(() => parseCLI(["dev", "slides.mdx", "--port", "3030", "--port", "3031"])).toThrow(
      "duplicate",
    );
  });

  test("builds Markdown resources and imported media into an independent static directory", async () => {
    const directory = await mkdtemp(join(import.meta.dir, ".build-"));
    try {
      await mkdir(join(directory, "assets"));
      await writeFile(
        join(directory, "forest.svg"),
        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20" fill="green"/></svg>',
      );
      await writeFile(join(directory, "tone.wav"), "local-media-fixture");
      await writeFile(
        join(directory, "QuickCheck.tsx"),
        'import { h } from "meowjsx"; import { signal } from "meowjsx/signal"; export const createSession=()=>({answer:signal(0)}); export function QuickCheck({session}){return <button onClick={()=>session.answer.value++}>{session.answer}</button>}',
      );
      await writeFile(join(directory, "SOURCES.md"), "Local test fixture.");
      await writeFile(join(directory, "assets/NOTICES.md"), "Fixture author.");
      await writeFile(
        join(directory, "slides.mdx"),
        'import tone from "./tone.wav"\nimport {QuickCheck} from "./QuickCheck"\nexport {createSession} from "./QuickCheck"\n\n# Local assets\n\n![Forest][forest]\n\n<QuickCheck session={props.session} />\n\n<PresentationAudio src={tone} label="Test tone" />\n\n[forest]: ./forest.svg',
      );
      const result = await buildSlides({
        entry: join(directory, "slides.mdx"),
        outdir: join(directory, "dist"),
      });
      expect(result.slides.map((slide) => slide.id)).toEqual(["local-assets"]);
      expect(result.files).toContain("SOURCES.md");
      expect(result.files).toContain("assets/NOTICES.md");
      expect(result.dependencies).toContain(join(directory, "QuickCheck.tsx"));
      const svg = result.files.find((file) => file.endsWith(".svg"));
      const audio = result.files.find((file) => file.endsWith(".wav"));
      expect(svg).toBeDefined();
      expect(audio).toBeDefined();
      expect(await readFile(join(result.outdir, audio!), "utf8")).toBe("local-media-fixture");
      expect(await readFile(join(result.outdir, "index.html"), "utf8")).toContain("./app.js");
      const server = serveSlides({ outdir: result.outdir, port: 0 });
      try {
        expect((await fetch(server.url)).status).toBe(200);
        expect((await fetch(new URL(svg!, server.url))).status).toBe(200);
        expect((await fetch(new URL("missing.png", server.url))).status).toBe(404);
      } finally {
        server.stop(true);
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test("does not overwrite a valid output on malformed source and rejects source-containing outputs", async () => {
    const directory = await mkdtemp(join(import.meta.dir, ".build-"));
    try {
      const entry = join(directory, "slides.mdx");
      const outdir = join(directory, "dist");
      await writeFile(entry, "# Good");
      await buildSlides({ entry, outdir });
      const before = await readFile(join(outdir, "app.js"), "utf8");
      await writeFile(entry, "# Good\n\n---");
      await expect(buildSlides({ entry, outdir })).rejects.toThrow("empty");
      expect(await readFile(join(outdir, "app.js"), "utf8")).toBe(before);
      await expect(buildSlides({ entry, outdir: directory })).rejects.toThrow("must not contain");
      await writeFile(
        entry,
        'import {Missing} from "./missing-component"\n\n# Missing\n\n<Missing />',
      );
      await expect(buildSlides({ entry, outdir })).rejects.toThrow("missing-component");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
