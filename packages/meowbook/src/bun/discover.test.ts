import { describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { relative, resolve, join } from "node:path";
import { discoverSource, discoverStories } from "./discover";
import { buildStories, checkStories } from "./build";
import type { StoryConfig } from "../types";

describe("static story discovery", () => {
  test("reads finite group ordering literals without evaluating expressions", () => {
    for (const literal of ["0", "10", "-2", "+3", "1.5"]) {
      const [entry] = discoverSource(
        "order.story.tsx",
        `import {defineStory} from "meowbook"; export const Entry=defineStory({id:"order",groupOrder:${literal},render:()=>null});`,
      );
      expect(entry!.groupOrder).toBe(Number(literal));
    }
    for (const literal of ["Infinity", "NaN", "1e999", "getOrder()", '"10"', "10,groupOrder:20"]) {
      expect(() =>
        discoverSource(
          "order.story.tsx",
          `import {defineStory} from "meowbook"; export const Entry=defineStory({id:"order",groupOrder:${literal},render:()=>null});`,
        ),
      ).toThrow("groupOrder");
    }
    const [annotation] = discoverSource(
      "annotated.tsx",
      '/** @story {"id":"ordered","groupOrder":20} */\nexport const Ordered=()=>null;',
    );
    expect(annotation!.groupOrder).toBe(20);
    expect(() =>
      discoverSource(
        "annotated.tsx",
        '/** @story {"id":"ordered","groupOrder":1e999} */\nexport const Ordered=()=>null;',
      ),
    ).toThrow("finite number");
  });
  test("indexes component directories and short variants without executing stories", () => {
    const stories = discoverSource(
      "components.story.tsx",
      `
      import { defineStory } from "meowbook";
      throw new Error("must never execute");
      export const Normal = defineStory({id:"input/normal",title:"Full searchable title",group:"Form inputs",component:"Input",variant:"Default",render:()=>null});
      export const Error = defineStory({id:"input/error",component:"Input",variant:"Error",render:()=>null});
      export const Legacy = defineStory({id:"legacy",render:()=>null});
      /** @story {"id":"annotated","component":"Button","variant":"Compact"} */
      export const Button = () => null;
    `,
    );
    expect(stories[0]).toMatchObject({
      title: "Full searchable title",
      group: "Form inputs",
      component: "Input",
      variant: "Default",
    });
    expect(stories[1]).toMatchObject({ component: "Input", variant: "Error" });
    expect(stories[2]).not.toHaveProperty("component");
    expect(stories[2]).not.toHaveProperty("variant");
    expect(stories[3]).toMatchObject({ component: "Button", variant: "Compact" });
  });
  test("indexes literal search metadata without evaluating dynamic values", () => {
    const stories = discoverSource(
      "metadata.story.tsx",
      `
      import { defineStory } from "meowbook";
      throw new Error("must never execute");
      export const Literal = defineStory({id:"literal", description:"Description text", covers:["Input", "ChatProcess"] as const, render:()=>null});
      export const Dynamic = defineStory({id:"dynamic", description:makeDescription(), covers:["Input", ...getCovers()], render:()=>null});
      export const Empty = defineStory({id:"empty", description:"", covers:[], render:()=>null});
    `,
    );
    expect(stories[0]).toMatchObject({
      description: "Description text",
      covers: ["Input", "ChatProcess"],
    });
    expect(stories[1]).not.toHaveProperty("description");
    expect(stories[1]).not.toHaveProperty("covers");
    expect(stories[2]).toMatchObject({ description: "", covers: [] });
  });
  test("reads direct aliases without executing top-level code", () => {
    const stories = discoverSource(
      "probe.story.tsx",
      `
      import { defineStory as scene } from "meowbook";
      throw new Error("must never execute");
      export const Basic = scene({id: "ui/basic", title: "Basic", render: () => null});
    `,
    );
    expect(stories).toMatchObject([
      { id: "ui/basic", title: "Basic", exportName: "Basic", file: "probe.story.tsx" },
    ]);
  });
  test("rejects dynamic ids, metadata spreads and duplicate fields", () => {
    for (const body of [
      "id: name",
      'id: "one", ...other',
      'id: "one", id: "two"',
      '["id"]: "one"',
      'id: "one", component: chooseComponent()',
      'id: "one", variant: scenarioName',
      'id: "one", component: "Input", component: "Select"',
      'id: "one", variant: "Normal", variant: "Error"',
    ]) {
      expect(() =>
        discoverSource(
          "bad.story.tsx",
          `import {defineStory} from "meowbook"; export const Bad = defineStory({${body},render:()=>null});`,
        ),
      ).toThrow("bad.story.tsx:1");
    }
  });
  test("extracts multiline JSON and multiple attached stories", () => {
    const stories = discoverSource(
      "Button.tsx",
      `
      /**
       * @story {"id":"button/one","props":{"label":"One"}}
       * @story {
       *   "id":"button/two",
       *   "props":{"label":"Two"}
       * }
       */
      export function Button(props: {label:string}) { return props.label; }
    `,
    );
    expect(stories.map((story) => story.id)).toEqual(["button/one", "button/two"]);
    expect(stories[1]?.generated?.props).toEqual({ label: "Two" });
  });
  test("does not silently accept unattached or unsupported annotations", () => {
    for (const source of [
      '/** @story {"id":"x"} */ const Private = () => null;',
      '/** @story {"id":"x"} */ export default () => null;',
      '/** @story {"id":"x","render":"code"} */ export const C = () => null;',
      "/** @story */ export const C = () => null;",
    ])
      expect(() => discoverSource("bad.tsx", source)).toThrow();
  });
  test("does not omit recognized calls hidden behind unsupported declaration shapes", () => {
    for (const declaration of [
      'const X = defineStory({id:"x",render:()=>null});',
      'export default defineStory({id:"x",render:()=>null});',
      'export const X = wrap(defineStory({id:"x",render:()=>null}));',
    ]) {
      expect(() =>
        discoverSource(
          "unsupported.story.tsx",
          `import {defineStory} from "meowbook"; ${declaration}`,
        ),
      ).toThrow("top-level named exported const");
    }
  });
});

async function fixture(run: (config: StoryConfig, root: string) => Promise<void>) {
  const workspace = resolve(import.meta.dir, "../../../..");
  const root = await mkdtemp(join(workspace, ".meowbook-test-"));
  const config: StoryConfig = {
    root,
    stories: ["*.tsx"],
    preview: "preview.ts",
    tsconfig: "tsconfig.json",
  };
  try {
    await writeFile(
      join(root, "tsconfig.json"),
      JSON.stringify({ extends: join(workspace, "tsconfig.json"), include: ["*.tsx", "*.ts"] }),
    );
    await writeFile(
      join(root, "preview.ts"),
      'import { createRuntime } from "meowjsx"; export default () => createRuntime();',
    );
    await run(config, root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("glob discovery rejects duplicate ids across files", async () =>
  fixture(async (config, root) => {
    const source =
      'import {defineStory} from "meowbook"; export const S = defineStory({id:"duplicate",render:()=>null});';
    await writeFile(join(root, "a.tsx"), source);
    await writeFile(join(root, "b.tsx"), source);
    await expect(discoverStories(config)).rejects.toThrow("Duplicate story id");
  }));

test("generated JSON props undergo real TypeScript checking with original location", async () =>
  fixture(async (config, root) => {
    const file = join(root, "Button.tsx");
    await writeFile(
      file,
      '/** @story {"id":"typed/button","props":{"label":"Save"}} */\nexport const Button = (props: {label: string}) => props.label;',
    );
    expect((await checkStories(config))[0]?.id).toBe("typed/button");
    await writeFile(
      file,
      '/** @story {"id":"typed/button","props":{"label":42}} */\nexport const Button = (props: {label: string}) => props.label;',
    );
    await expect(checkStories(config)).rejects.toThrow(`${file}:1`);
    await writeFile(
      file,
      '/** @story {"id":"typed/button","props":{}} */\nexport const Button = (props: {label: string}) => props.label;',
    );
    await expect(checkStories(config)).rejects.toThrow("label");
  }));

test("temporary preview uses the same checker and accepts the actual open props contract", async () =>
  fixture(async (config, root) => {
    await mkdir(join(root, "components"));
    await writeFile(
      join(root, "components/Button.tsx"),
      "export const Button = (props: {label: string; [key:string]:unknown}) => props.label;",
    );
    await writeFile(join(root, "props.json"), '{"label":"Save","extra":true}');
    const temporary = {
      component: "components/Button.tsx",
      exportName: "Button",
      propsFile: "props.json",
    };
    expect((await checkStories(config, temporary))[0]?.id).toBe("temporary/component");
    await writeFile(join(root, "props.json"), '{"label":false}');
    await expect(checkStories(config, temporary)).rejects.toThrow("not assignable");
  }));

test("build emits a static gallery, independent canvas and manifest, then removes generation sources", async () =>
  fixture(async (config, root) => {
    await writeFile(
      join(root, "Button.tsx"),
      '/** @story {"id":"build/button","props":{"label":"Save"}} */\nexport const Button = (props: {label: string}) => props.label;',
    );
    const outdir = join(root, "dist");
    await writeFile(
      join(root, "metadata.tsx"),
      'import {defineStory} from "meowbook"; export const Metadata = defineStory({id:"build/search",title:"Story title",description:"Component description",covers:["Input"],render:()=>null});',
    );
    await writeFile(
      join(root, "tsconfig.json"),
      JSON.stringify({
        extends: resolve(root, "../tsconfig.json"),
        compilerOptions: {
          paths: { meowbook: [resolve(import.meta.dir, "../index.ts")] },
        },
        include: ["*.tsx", "*.ts"],
      }),
    );
    const entries = await buildStories(config, outdir);
    expect(entries[0]?.id).toBe("build/button");
    expect(await readFile(join(outdir, "index.html"), "utf8")).toContain("Meowbook");
    expect(await readFile(join(outdir, "canvas.html"), "utf8")).toContain("story-root");
    // Bun's legacy :-webkit-any()/:-moz-any() copies are gone; Safari misreads them.
    const stylesheets = (await readdir(outdir)).filter((name) => name.endsWith(".css"));
    expect(stylesheets.length).toBeGreaterThan(0);
    const bundled = await Promise.all(
      stylesheets.map((name) => readFile(join(outdir, name), "utf8")),
    );
    expect(bundled.some((css) => css.includes(":is("))).toBe(true);
    for (const css of bundled) expect(css).not.toMatch(/:-(webkit|moz)-any\(/);
    // The published manifest names story files from the config root, never the build machine.
    expect(JSON.parse(await readFile(join(outdir, "manifest.json"), "utf8"))).toEqual(
      entries.map((entry) => ({ ...entry, file: relative(config.root, entry.file) })),
    );
    expect(entries.find((entry) => entry.id === "build/search")).toMatchObject({
      description: "Component description",
      covers: ["Input"],
    });
    expect((await readdir(root)).some((path) => path.startsWith(".meowbook-"))).toBe(false);
    // Without a gallery config the gallery keeps its own chrome and no settings file is written.
    expect(await readdir(outdir)).not.toContain("gallery.json");
    await buildStories(
      {
        ...config,
        gallery: {
          brand: { name: "Site", tag: "" },
          appearance: { schemeStorageKey: "site-scheme" },
          docsLink: (story) =>
            story.id === "build/button" ? { label: "Docs", href: "/button/" } : undefined,
          componentLabel: (story) => (story.id === "build/button" ? "Push Button" : undefined),
        },
      },
      outdir,
    );
    expect(JSON.parse(await readFile(join(outdir, "gallery.json"), "utf8"))).toEqual({
      brand: { name: "Site", tag: "" },
      appearance: { schemeStorageKey: "site-scheme" },
      docsLinks: { "build/button": { label: "Docs", href: "/button/" } },
      componentLabels: { "build/button": "Push Button" },
    });
  }));

test("componentLabel gives every story of one catalog row the same name", async () =>
  fixture(async (config, root) => {
    await writeFile(
      join(root, "pair.tsx"),
      'import {defineStory} from "meowbook"; export const A = defineStory({id:"pair/a",group:"G",component:"Pair",render:()=>null}); export const B = defineStory({id:"pair/b",group:"G",component:"Pair",render:()=>null});',
    );
    const outdir = join(root, "out-labels");
    await expect(
      buildStories({ ...config, gallery: { componentLabel: (story) => story.id } }, outdir),
    ).rejects.toThrow("componentLabel gives Pair in G two names");
  }));

test("CLI list emits machine-readable metadata without importing a throwing story module", async () =>
  fixture(async (config, root) => {
    await writeFile(
      join(root, "probe.tsx"),
      'import {defineStory} from "meowbook"; throw new Error("executed source"); export const Probe = defineStory({id:"cli/probe",render:()=>null});',
    );
    const configFile = join(root, "story.config.ts");
    await writeFile(configFile, `export default ${JSON.stringify(config)};`);
    const child = Bun.spawn(
      ["bun", resolve(import.meta.dir, "../cli.ts"), "list", "--config", configFile, "--json"],
      { stdout: "pipe", stderr: "pipe" },
    );
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect(code).toBe(0);
    expect(stderr).toBe("");
    expect(JSON.parse(stdout)).toMatchObject([{ id: "cli/probe", exportName: "Probe" }]);
  }));

test("checking retains consumer ambient declarations from explicit files", async () =>
  fixture(async (config, root) => {
    await writeFile(join(root, "ambient.d.ts"), "declare const fixtureLabel: string;");
    await writeFile(
      join(root, "Button.tsx"),
      '/** @story {"id":"ambient/button"} */\nexport const Button = (_props: {}) => fixtureLabel;',
    );
    await writeFile(
      join(root, "tsconfig.json"),
      JSON.stringify({
        extends: resolve(root, "../tsconfig.json"),
        files: ["ambient.d.ts"],
        include: ["Button.tsx", "preview.ts"],
      }),
    );
    expect((await checkStories(config))[0]?.id).toBe("ambient/button");
  }));
