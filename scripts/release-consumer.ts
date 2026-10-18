import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const supported = ["meowjsx", "meowcss", "meowtail", "meowbook", "meowslides", "meowpress"];
type Candidate = { name: string; version: string; file: string; sha256: string };
type Input = { repository: string; commit: string; packages: Candidate[] };
export type ConsumerOptions = {
  manifest: string;
  selected: string[];
  offline: boolean;
  out?: string;
};
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
export function consumerOptions(args: string[]): ConsumerOptions {
  const values = new Map<string, string>();
  let offline = false;
  for (let index = 0; index < args.length; index++) {
    const key = args[index]!;
    if (key === "--offline") {
      assert(!offline, "Duplicate --offline");
      offline = true;
    } else {
      assert(
        ["--manifest", "--packages", "--out"].includes(key) && !values.has(key),
        `Unknown or duplicate argument: ${key}`,
      );
      const value = args[++index];
      assert(value && !value.startsWith("--"), `Missing value: ${key}`);
      values.set(key, value);
    }
  }
  assert(
    values.has("--manifest") && values.has("--packages"),
    "Explicit --manifest and --packages are required",
  );
  const selected = values.get("--packages")!.split(",");
  assert(
    selected.length > 0 &&
      new Set(selected).size === selected.length &&
      selected.every((name) => supported.includes(name)),
    "Select unique supported package names explicitly",
  );
  return {
    manifest: resolve(values.get("--manifest")!),
    selected,
    offline,
    out: values.get("--out"),
  };
}
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
async function command(args: string[], cwd: string) {
  // Package consumption does not need publishing credentials or Node resolution overrides.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !/^(npm_config_|npm_token$|node_auth_token$|node_path$)/i.test(key),
    ),
  );
  const child = Bun.spawn(args, { cwd, env, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  assert(code === 0, `${args[1] ?? args[0]} failed (exit ${code})\n${stdout}\n${stderr}`);
  return stdout;
}
export async function consumerInput(options: ConsumerOptions) {
  const input = JSON.parse(await readFile(options.manifest, "utf8")) as Input;
  assert(
    /^[\w.-]+\/[\w.-]+$/.test(input.repository) && /^[a-f0-9]{40}$/.test(input.commit),
    "Invalid release repository or commit",
  );
  assert(
    Array.isArray(input.packages) &&
      new Set(input.packages.map((item) => item.name)).size === input.packages.length,
    "Invalid or duplicate release packages",
  );
  const candidates: Candidate[] = [];
  // Check every selected archive before any dependency installation or module execution.
  for (const name of options.selected) {
    const item = input.packages.find((candidate) => candidate.name === name);
    assert(item && /^[a-f0-9]{64}$/.test(item.sha256), `Missing candidate or SHA256: ${name}`);
    const file = await realpath(resolve(dirname(options.manifest), item.file));
    assert(
      basename(file) === `${name}-${item.version}.tgz`,
      `Unexpected tarball filename: ${name}`,
    );
    assert(hash(await readFile(file)) === item.sha256, `Tarball changed: ${name}`);
    const listing = (await command(["tar", "-tzf", file], tmpdir())).trim().split("\n");
    assert(
      listing.every((path) => path.startsWith("package/") && !path.split("/").includes("..")) &&
        new Set(listing).size === listing.length,
      `Unsafe archive: ${name}`,
    );
    const packed = JSON.parse(
      await command(["tar", "-xOf", file, "package/package.json"], tmpdir()),
    );
    assert(
      packed.name === name && packed.version === item.version && !packed.private,
      `Packed identity differs: ${name}`,
    );
    assert(
      !JSON.stringify([
        packed.dependencies,
        packed.peerDependencies,
        packed.optionalDependencies,
      ]).includes("workspace:"),
      `Unresolved workspace dependency: ${name}`,
    );
    candidates.push({ ...item, file });
  }
  return { input, candidates };
}
async function isolation(directory: string) {
  for (let parent = dirname(directory); ; parent = dirname(parent)) {
    assert(
      !existsSync(join(parent, "node_modules")),
      `Parent node_modules would contaminate consumer: ${parent}`,
    );
    if (dirname(parent) === parent) break;
  }
}
async function installedIdentity(directory: string, candidates: Candidate[]) {
  const root = await realpath(directory);
  const copies = new Map(candidates.map((item) => [item.name, 0]));
  const walk = async (path: string): Promise<void> => {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const file = join(path, entry.name);
      if ((await lstat(file)).isSymbolicLink())
        assert(
          (await realpath(file)).startsWith(`${root}/`),
          `Escaping installed symlink: ${file}`,
        );
      else if (entry.isDirectory()) await walk(file);
      else if (entry.name === "package.json") {
        const pkg = JSON.parse(await readFile(file, "utf8"));
        if (copies.has(pkg.name)) copies.set(pkg.name, copies.get(pkg.name)! + 1);
      }
    }
  };
  await walk(join(directory, "node_modules"));
  for (const item of candidates) {
    const installed = JSON.parse(
      await readFile(join(directory, "node_modules", item.name, "package.json"), "utf8"),
    );
    assert(
      installed.version === item.version && copies.get(item.name) === 1,
      `Expected one exact installed candidate: ${item.name}`,
    );
  }
}
/** One public-entry probe runs under both Bun and native Node; tools are imported only in Bun. */
export function publicImportProbe(selected: readonly string[]) {
  return `import {readFile,access} from "node:fs/promises";
const names=${JSON.stringify(selected)};
const imported=[];
const bunTools=new Set(["meowbook/bun","meowslides/build","meowpress/build"]);
const hasJsx=await access("node_modules/meowjsx/package.json").then(()=>true,()=>false);
for(const name of names){
 const pkg=JSON.parse(await readFile("node_modules/"+name+"/package.json","utf8"));
 for(const path of Object.keys(pkg.exports)){
  if(name==="meowcss"&&(path==="./meowjsx"||path==="./web")&&!hasJsx)continue;
  const entry=path==="."?name:name+path.slice(1);
  if(!process.versions.bun&&bunTools.has(entry))continue;
  await import(entry);imported.push(entry);
 }
}
console.log(JSON.stringify(imported));`;
}
function probes(selected: string[]) {
  const graph = new Set(selected);
  if (graph.has("meowslides"))
    for (const peer of ["meowjsx", "meowcss", "meowtail"]) graph.add(peer);
  if (graph.has("meowpress")) for (const peer of ["meowjsx", "meowcss"]) graph.add(peer);
  const has = (name: string) => graph.has(name);
  const code = [`import {strict as assert} from "node:assert";`];
  const core: string[] = [];
  const dom: string[] = [];
  const tool: string[] = [];
  if (has("meowjsx")) {
    code.push(
      `import * as jsx from "meowjsx"; import * as runtime from "meowjsx/runtime";import {jsx as automatic} from "meowjsx/jsx-runtime";import {jsxDEV} from "meowjsx/jsx-dev-runtime";import {renderToHtml} from "meowjsx/web";for(const name of ["signal","isSignal","createContext","useContext","defaultRuntime"])assert.equal(jsx[name],runtime[name]);const shared=jsx.signal("cross-entry");const Context=jsx.createContext(shared);const Read=()=>{const value=runtime.useContext(Context);assert.ok(runtime.isSignal(value));return value;};assert.equal(renderToHtml(jsxDEV(Context.Provider,{value:shared,children:automatic(Read,{})})),"cross-entry");shared.value="updated";assert.equal(renderToHtml(automatic(Context.Provider,{value:shared,children:automatic(Read,{})})),"updated");`,
    );
    core.push(
      `import {signal,createRuntime} from "meowjsx";import {isSignal} from "meowjsx/runtime";export const state=isSignal(signal(1));export const runtime=createRuntime();`,
    );
  }
  if (has("meowcss"))
    core.push(
      `import {defineTokens,defineOptions,defineTheme,css} from "meowcss";const tokens=defineTokens("consumer",{color:["black","white"]});export const theme=defineTheme({options:defineOptions("consumer",{}),defaults:{scheme:"auto"},tokens:[tokens],styles:css\`body{color:\${tokens.color}}\`});`,
    );
  if (has("meowcss") && has("meowjsx"))
    code.push(
      `import * as coreCss from "meowcss";import * as adapter from "meowcss/meowjsx";assert.equal(coreCss.defineTokens,adapter.defineTokens);`,
    );
  if (has("meowtail")) {
    code.push(
      `import * as tail from "meowtail";import * as chat from "meowtail/chat";import * as components from "meowtail/components";import * as registry from "meowtail/registry";import {standardTheme,standardOptions,standardThemeTokens,standardThemeStyles,uiTokens} from "meowtail/theme";import {defineTheme} from "meowcss/meowjsx";for(const name of ["ChatTask","ChatToolCall","AssistantView"])assert.equal(tail[name],chat[name]);assert.equal(tail.Button,components.Button);assert.equal(tail.createMeowUI,registry.createMeowUI);assert.ok(standardThemeTokens.includes(uiTokens));assert.equal(defineTheme({options:standardOptions,defaults:{scheme:"auto"},tokens:standardThemeTokens,styles:standardThemeStyles}).cssText,standardTheme.cssText);assert.ok(!("Presentation" in tail));`,
    );
    dom.push(
      `import {h,signal} from "meowjsx";import {Button,ChatTask,type ChatExecutionState} from "meowtail";export const view=<ChatTask title="Installed" state={signal<ChatExecutionState>("success")}><Button>Done</Button></ChatTask>;`,
    );
  }
  if (has("meowbook"))
    dom.push(
      `import {buildStories,serveStories} from "meowbook/bun";import {capturePage} from "meowbook/playwright";import {bootCanvas} from "meowbook/web";export const tools=[buildStories,serveStories,capturePage,bootCanvas];`,
    );
  if (has("meowslides")) {
    code.push(
      `import * as slides from "meowslides";import * as slideRegistry from "meowslides/registry";import * as slideTheme from "meowslides/theme";import {mdxComponents} from "meowslides/mdx";import {standardOptions as baseOptions,standardThemeTokens as baseTokens,standardThemeStyles as baseFragments} from "meowtail/theme";import * as slideCss from "meowcss/meowjsx";import {createRuntime as createSlideRuntime} from "meowjsx";assert.equal(slides.createMeowSlides,slideRegistry.createMeowSlides);assert.equal(slides.installMeowSlides,slideRegistry.installMeowSlides);assert.equal(slides.meowSlidesComponents,slideRegistry.meowSlidesComponents);assert.equal(mdxComponents.Reveal,slides.Reveal);assert.equal(slideTheme.presentationOptions,baseOptions);for(const token of baseTokens)assert.ok(slideTheme.presentationThemeTokens.includes(token));for(const fragment of baseFragments)assert.ok(slideTheme.presentationThemeStyles.includes(fragment));assert.equal(slideCss.defineTheme({options:baseOptions,defaults:{scheme:"auto"},tokens:slideTheme.presentationThemeTokens,styles:slideTheme.presentationThemeStyles}).cssText,slideTheme.presentationTheme.cssText);const slideRuntime=createSlideRuntime({plugins:[slideRegistry.createMeowSlides()]});assert.ok(slideRuntime.registry.has(slides.presentationContract.name));assert.ok(!slideRuntime.registry.has("button"));`,
    );
    if (!has("meowtail")) dom.push(`import {h} from "meowjsx";`);
    dom.push(
      `import {Presentation,Reveal,type SlideDefinition} from "meowslides";import {presentationTheme} from "meowslides/theme";import {mdxComponents} from "meowslides/mdx";import {createMeowSlides} from "meowslides/registry";const slides:readonly SlideDefinition[]=[{id:"typed",title:"Typed",steps:1,render:()=> <Reveal at={1}>Evidence</Reveal>}];export const slidesView=<Presentation title="Installed Slides" slides={slides}/>;export const slideValues=[presentationTheme,mdxComponents,createMeowSlides];`,
    );
    tool.push(
      `import {compileSlides,buildSlides,serveSlides,devSlides,type BuildSlidesOptions,type BuildSlidesResult} from "meowslides/build";export const tools=[compileSlides,buildSlides,serveSlides,devSlides];export const options:BuildSlidesOptions={entry:"slides.mdx",outdir:"dist"};export const slideMetadata=(result:BuildSlidesResult)=>result.slides;`,
    );
  }
  if (has("meowpress"))
    tool.push(
      `import {buildSite,meowSite,type SiteConfig,type ResolvedSiteConfig} from "meowpress/build";export const pressTools=[buildSite,meowSite];export const pressConfig:SiteConfig={content:"content",skillsDirectory:"skills",outputDirectory:"dist"};export const resolvedPress:ResolvedSiteConfig=meowSite(pressConfig);`,
    );
  return {
    code: code.join("\n"),
    core: core.join("\n"),
    dom: dom.join("\n"),
    tool: tool.join("\n"),
  };
}
async function slidesConsumption(directory: string, checks: string[]) {
  const files: Record<string, string> = {
    "slides.mdx":
      "# Observation\n\nDescribe one detail.\n\n---\n\n# Evidence\n\nExplain the evidence.\n",
    "Session.tsx": `import {h,signal} from "meowjsx";import {Button} from "meowtail";
export function createSession(){return {count:signal(0)}}
export function Counter({session}:{session:ReturnType<typeof createSession>}){return <section><p>Session: {session.count}</p><Button onClick={()=>session.count.value++}>Increment</Button></section>}`,
    "audit.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect x="8" y="8" width="784" height="434" fill="#eff8f2" stroke="#246b48" stroke-width="8"/></svg>`,
    "authored.mdx": `import { Counter } from "./Session.tsx";
export { createSession } from "./Session.tsx";

<Slide id="session" steps={1} notes="Consumer-owned finite fixture." />

# Trusted custom interaction

<Counter session={props.session} />

<Reveal at={1}>

One shared presentation step.

</Reveal>

---

# Local image

![Original consumer image](./audit.svg)

All four edges should remain within the finite canvas.

---

# Return to the session

<Counter session={props.session} />
`,
    "slides-host.tsx": `import {h,createRuntime} from "meowjsx";import {createWebRenderer} from "meowjsx/web";import {mountStyles,applyTheme} from "meowcss/web";import {createMeowUI} from "meowtail";import {Presentation,PresentationLayout,Reveal,createMeowSlides,type SlideDefinition} from "meowslides";import {presentationTheme} from "meowslides/theme";import {Counter,createSession} from "./Session.js";
const session=createSession();const slides:readonly SlideDefinition[]=[{id:"tsx",title:"Public TSX",steps:1,render:()=> <PresentationLayout header={<h1>Installed TSX host</h1>}><Counter session={session}/><Reveal at={1}>Shared step</Reveal></PresentationLayout>}];const runtime=createRuntime({plugins:[createMeowUI(),createMeowSlides()]});mountStyles(document,presentationTheme.cssText);applyTheme(document.documentElement,presentationTheme);createWebRenderer(runtime).render(<Presentation title="Installed TSX" slides={slides}/>,document.querySelector("#app")!);`,
    "slides-bundle.ts": `import {mkdir} from "node:fs/promises";await mkdir("slides-tsx-dist",{recursive:true});const result=await Bun.build({entrypoints:["slides-host.tsx"],outdir:"slides-tsx-dist",target:"browser",jsx:{runtime:"automatic",importSource:"meowjsx"}});if(!result.success)throw Error(result.logs.join("\\n"));await Bun.write("slides-tsx-dist/index.html",'<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0}#app{height:100dvh}</style></head><body><main id="app"></main><script type="module" src="./slides-host.js"></script></body></html>');`,
  };
  for (const [file, contents] of Object.entries(files))
    await writeFile(join(directory, file), contents);
  const cli = ["bun", "node_modules/.bin/meowslides", "build"];
  await command([...cli, "slides.mdx", "--outdir", "slides-minimal-dist"], directory);
  await command([...cli, "authored.mdx", "--outdir", "slides-authored-dist"], directory);
  const minimal = JSON.parse(
    await readFile(join(directory, "slides-minimal-dist/slides-manifest.json"), "utf8"),
  );
  const authored = JSON.parse(
    await readFile(join(directory, "slides-authored-dist/slides-manifest.json"), "utf8"),
  );
  assert(
    minimal.slides.length === 2 &&
      authored.slides.length === 3 &&
      authored.slides[0].steps === 1 &&
      authored.slides[0].id === "session",
    "Installed Slides CLI lost finite slide metadata",
  );
  const assets = await readdir(join(directory, "slides-authored-dist/assets"));
  const assetHashes = await Promise.all(
    assets.map(async (file) =>
      hash(await readFile(join(directory, "slides-authored-dist/assets", file))),
    ),
  );
  assert(
    assetHashes.includes(hash(new TextEncoder().encode(files["audit.svg"]!))),
    "Installed Slides CLI did not preserve the local original SVG",
  );
  await writeFile(
    join(directory, "tsconfig.slides-host.json"),
    JSON.stringify({ extends: "./tsconfig.dom.json", include: ["slides-host.tsx", "Session.tsx"] }),
  );
  await command(
    ["bun", "node_modules/typescript/bin/tsc", "-p", "tsconfig.slides-host.json"],
    directory,
  );
  await command(["bun", "slides-bundle.ts"], directory);
  assert(
    existsSync(join(directory, "slides-tsx-dist/slides-host.js")),
    "Public TSX browser bundle missing",
  );
  checks.push(
    "installed Slides CLI: minimal MDX and trusted custom TSX/session/Reveal/original SVG builds; finite metadata and resource bytes preserved",
  );
  checks.push(
    "strict public Slides TSX host types and independent browser bundle build; browser behavior not exercised",
  );
}
async function pressConsumption(directory: string, checks: string[]) {
  const site = join(directory, "press-site");
  for (const folder of ["content/posts/assets/_draft", "content/thoughts", "skills", "runner"])
    await mkdir(join(site, folder), { recursive: true });
  const document = (title: string, body: string) =>
    `---\ntitle: ${title}\ndate: 2026-10-18\n---\n\n${body}\n`;
  const files: Record<string, string> = {
    "content/posts/public.md": document("Public Markdown", "A **fixture statement**."),
    "content/posts/component.mdx": document("Public MDX", "<Callout>Trusted MDX content</Callout>"),
    "content/posts/_private.md": document("Private draft", "DO_NOT_PUBLISH_FIXTURE"),
    "content/thoughts/note.md": document("Thought", "A finite public thought."),
    "content/posts/assets/public.txt": "consumer-owned public asset",
    "content/posts/assets/_draft/private.txt": "DO_NOT_PUBLISH_FIXTURE_ASSET",
    "site.config.ts": `import {join} from "node:path";import {meowSite} from "meowpress/build";export default meowSite({content:join(import.meta.dir,"content"),skillsDirectory:join(import.meta.dir,"skills"),outputDirectory:join(import.meta.dir,"default-dist")});`,
    "custom.ts": `import {strict as assert} from "node:assert";import {realpath} from "node:fs/promises";import {join,dirname} from "node:path";import {fileURLToPath,pathToFileURL} from "node:url";import {css,defineOptions,defineTokens,defineTheme} from "meowcss";import {meowSite,buildSite} from "meowpress/build";
const pressCssPath=Bun.resolveSync("meowcss",dirname(fileURLToPath(import.meta.resolve("meowpress/build"))));const consumerCssPath=fileURLToPath(import.meta.resolve("meowcss"));assert.equal(await realpath(pressCssPath),await realpath(consumerCssPath));const pressCss=await import(pathToFileURL(pressCssPath).href);assert.equal(pressCss.defineTheme,defineTheme);
const tokens=defineTokens("consumer-press",{ink:["black","white"]});const theme=defineTheme({options:defineOptions("consumer-press",{}),defaults:{scheme:"dark"},tokens:[tokens],styles:css\`body{color:\${tokens.ink}}\`});const config=meowSite({content:join(import.meta.dir,"content"),skillsDirectory:join(import.meta.dir,"skills"),outputDirectory:join(import.meta.dir,"custom-dist"),theme});assert.equal(config.theme,theme);await buildSite(config);const html=await Bun.file(join(config.outputDirectory,"posts/public/index.html")).text();assert.ok(html.includes('data-meowui-theme-root="consumer-press"'));assert.ok(html.includes('data-meowui-color-scheme="dark"'));const href=html.match(/href="([^" ]+\\.css)"/)?.[1];assert.ok(href);const stylesheet=await Bun.file(join(config.outputDirectory,"posts/public",href)).text();assert.ok(stylesheet.includes(tokens.ink.name));await Bun.write(join(import.meta.dir,"custom-theme-proof.json"),JSON.stringify({samePublicCssModule:true,sameDefineTheme:true,sameThemeDefinitionIdentity:true,rootAndDarkOptions:true,tokenName:tokens.ink.name}));`,
  };
  for (const [file, contents] of Object.entries(files)) await writeFile(join(site, file), contents);
  // Running from a nested consumer directory catches package assets accidentally resolved from cwd.
  await command(
    ["bun", join(directory, "node_modules/.bin/meowpress"), "--config", "../site.config.ts"],
    join(site, "runner"),
  );
  const output = join(site, "default-dist");
  const markdown = await readFile(join(output, "posts/public/index.html"), "utf8");
  const mdx = await readFile(join(output, "posts/component/index.html"), "utf8");
  assert(
    markdown.includes("<strong>fixture statement</strong>") &&
      mdx.includes("Trusted MDX content") &&
      mdx.includes("mdx-callout"),
    "Installed Press CLI did not render Markdown/MDX",
  );
  assert(
    (await readFile(join(output, "thoughts/note/index.html"), "utf8")).includes(
      "A finite public thought.",
    ),
    "Installed Press CLI lost thought content",
  );
  assert(
    !existsSync(join(output, "posts/private/index.html")) &&
      !existsSync(join(output, "posts/_private/index.html")) &&
      !existsSync(join(output, "posts/assets/_draft/private.txt")),
    "Press published private fixture content/assets",
  );
  assert(
    (await readFile(join(output, "posts/assets/public.txt"), "utf8")) ===
      files["content/posts/assets/public.txt"],
    "Press lost its public local asset",
  );
  for (const file of ["index.html", "posts/index.html", "llms.txt", "agents.md"])
    assert(
      !(await readFile(join(output, file), "utf8")).includes("DO_NOT_PUBLISH_FIXTURE"),
      "Press index published a draft",
    );
  const home = await readFile(join(output, "index.html"), "utf8");
  const href = home.match(/href="([^" ]+\.css)"/)?.[1];
  assert(
    href && home.includes('data-meowui-theme-root="blog"'),
    "Press default theme/root missing",
  );
  const defaultCSS = await readFile(join(output, href), "utf8");
  assert(
    defaultCSS.includes("@font-face") &&
      defaultCSS.includes("data:font/woff2;base64,") &&
      !defaultCSS.includes("@import") &&
      !defaultCSS.includes("node_modules"),
    "Press default Geist font did not build from installed dependencies",
  );
  assert(
    (await readFile(join(output, "licenses/geist-OFL.txt"), "utf8")).includes(
      "SIL OPEN FONT LICENSE Version 1.1",
    ),
    "Press output omitted the Geist OFL license",
  );
  await command(["bun", "../custom.ts"], join(site, "runner"));
  checks.push(
    "installed Press CLI from nested external cwd: Markdown/MDX/thoughts, draft exclusion and public local assets",
  );
  checks.push(
    "Press default Geist font embedded with OFL; Press/consumer public CSS resolution and defineTheme identity match; custom ThemeDefinition/token/options round-trip preserved",
  );
}
export async function consume(options: ConsumerOptions) {
  const { input, candidates } = await consumerInput(options);
  const directory = await mkdtemp(join(tmpdir(), "meowland-release-consumer-"));
  await isolation(directory);
  const checks: string[] = [];
  await writeFile(
    join(directory, "package.json"),
    JSON.stringify(
      {
        name: "release-consumer",
        private: true,
        type: "module",
        dependencies: Object.fromEntries(candidates.map((item) => [item.name, item.file])),
        devDependencies: { typescript: "7.0.2" },
      },
      null,
      2,
    ),
  );
  await command(
    [
      "bun",
      "install",
      "--ignore-scripts",
      "--linker",
      "hoisted",
      ...(options.offline ? ["--offline"] : []),
    ],
    directory,
  );
  await installedIdentity(directory, candidates);
  checks.push("one exact installed candidate; no parent node_modules or escaping symlinks");
  if (
    options.selected.includes("meowcss") &&
    !existsSync(join(directory, "node_modules/meowjsx/package.json"))
  )
    checks.push(
      "optional meowcss/meowjsx and meowcss/web adapters skipped: its meowjsx peer is not installed",
    );
  await writeFile(join(directory, "public-imports.mjs"), publicImportProbe(options.selected));
  await command(["bun", "public-imports.mjs"], directory);
  checks.push("all selected public exports import under Bun");
  await command(["node", "public-imports.mjs"], directory);
  checks.push("selected runtime exports import under native Node; Bun-only tool entries excluded");
  if (options.selected.includes("meowslides"))
    checks.push("native Node imports the installed Slides theme (ESM specifier regression)");
  if (options.selected.includes("meowpress"))
    checks.push(
      "Press exposes only the Bun build tool; no Press root/runtime import or Node CLI execution",
    );
  const probe = probes(options.selected);
  await writeFile(join(directory, "identity.ts"), probe.code);
  await command(["bun", "identity.ts"], directory);
  checks.push("selected public exports and applicable shared Signal/Context/theme identities");
  for (const [name, source, lib] of [
    ["core", probe.core, ["ES2022"]],
    ["dom", probe.dom, ["ES2022", "DOM", "DOM.Iterable", "ESNext.Disposable"]],
    ["tool", probe.tool, ["ES2022"]],
  ] as const) {
    if (!source) continue;
    await writeFile(join(directory, `${name}.tsx`), source);
    for (const resolution of ["Bundler", "NodeNext"] as const) {
      const config =
        resolution === "Bundler" ? `tsconfig.${name}.json` : `tsconfig.${name}.nodenext.json`;
      await writeFile(
        join(directory, config),
        JSON.stringify({
          compilerOptions: {
            target: "ES2022",
            module: resolution === "Bundler" ? "ESNext" : "NodeNext",
            moduleResolution: resolution,
            lib,
            types: [],
            strict: true,
            skipLibCheck: false,
            noEmit: true,
            jsx: "react",
            jsxFactory: "h",
          },
          include: [`${name}.tsx`],
        }),
      );
      await command(["bun", "node_modules/typescript/bin/tsc", "-p", config], directory);
    }
    checks.push(`strict ${name} declarations under Bundler and NodeNext`);
  }
  if (options.selected.includes("meowbook")) {
    await writeFile(
      join(directory, "consumer.stories.tsx"),
      `import {h} from "meowjsx";import {defineStory} from "meowbook";import {Button} from "meowtail";export const Installed=defineStory({id:"release/installed",title:"Installed public Button",render:()=> <Button>Done</Button>});`,
    );
    await writeFile(
      join(directory, "preview.ts"),
      `import {createRuntime} from "meowjsx";import {createMeowUI} from "meowtail";export default ()=>createRuntime({plugins:[createMeowUI()]});`,
    );
    await writeFile(
      join(directory, "meowbook.config.ts"),
      `import {defineConfig} from "meowbook";export default defineConfig({root:import.meta.dir,stories:["consumer.stories.tsx"],preview:"preview.ts",tsconfig:"tsconfig.dom.json"});`,
    );
    const cli = ["bun", "node_modules/meowbook/dist/src/cli.js"];
    const listed = JSON.parse(
      await command([...cli, "list", "--config", "meowbook.config.ts", "--json"], directory),
    );
    assert(
      listed.length === 1 && listed[0].id === "release/installed",
      "Installed Book CLI did not discover its public story",
    );
    await command([...cli, "check", "--config", "meowbook.config.ts"], directory);
    checks.push("installed Meowbook CLI list/check with public consumer story");
  }
  if (options.selected.includes("meowslides")) await slidesConsumption(directory, checks);
  if (options.selected.includes("meowpress")) await pressConsumption(directory, checks);
  for (const item of candidates)
    assert(
      hash(await readFile(item.file)) === item.sha256,
      `Tarball changed during consumption: ${item.name}`,
    );
  const receipt = {
    status: "passed",
    repository: input.repository,
    commit: input.commit,
    manifest: options.manifest,
    directory,
    packages: candidates,
    checks,
    environment: {
      bun: Bun.version,
      node: (await command(["node", "--version"], directory)).trim(),
      platform: process.platform,
      arch: process.arch,
      offline: options.offline,
      lifecycleScripts: false,
    },
    boundary:
      "Local tgz installation only; no registry publication, browser or real product migration is implied.",
  };
  const output = options.out ? resolve(options.out) : join(directory, "receipt.json");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(receipt, null, 2) + "\n");
  return { ...receipt, receipt: output };
}
if (import.meta.main) {
  if (process.argv.slice(2).join(" ") === "--help")
    console.log(
      "Usage: bun scripts/release-consumer.ts --manifest <release.json> --packages <name,name> [--offline] [--out <receipt.json>]\nInstalls exact local tarballs outside the repository; never publishes. Supports meowjsx, meowcss, meowtail, meowbook, meowslides, meowpress. Node is required for native ESM runtime imports; Slides and Press build tools execute under Bun.",
    );
  else
    consume(consumerOptions(process.argv.slice(2)))
      .then((result) => console.log(JSON.stringify(result, null, 2)))
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
}
