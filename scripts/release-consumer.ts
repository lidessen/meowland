import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";

const supported = ["meowjsx", "meowcss", "meowtail", "meowbook"];
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
function probes(selected: string[]) {
  const has = (name: string) => selected.includes(name);
  const code = [
    `import {strict as assert} from "node:assert";`,
    `const names=${JSON.stringify(selected)};`,
    `for(const name of names){const pkg=await Bun.file("node_modules/"+name+"/package.json").json();for(const path of Object.keys(pkg.exports)){if(name==="meowcss"&&(path==="./meowjsx"||path==="./web")&&!(await Bun.file("node_modules/meowjsx/package.json").exists()))continue;await import(path==="."?name:name+path.slice(1));}}`,
  ];
  const core: string[] = [];
  const dom: string[] = [];
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
  return { code: code.join("\n"), core: core.join("\n"), dom: dom.join("\n") };
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
  const probe = probes(options.selected);
  await writeFile(join(directory, "identity.ts"), probe.code);
  await command(["bun", "identity.ts"], directory);
  checks.push("selected public exports and applicable shared Signal/Context/theme identities");
  for (const [name, source, lib] of [
    ["core", probe.core, ["ES2022"]],
    ["dom", probe.dom, ["ES2022", "DOM", "DOM.Iterable", "ESNext.Disposable"]],
  ] as const) {
    if (!source) continue;
    await writeFile(join(directory, `${name}.tsx`), source);
    await writeFile(
      join(directory, `tsconfig.${name}.json`),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          lib,
          types: [],
          strict: true,
          noEmit: true,
          jsx: "react",
          jsxFactory: "h",
        },
        include: [`${name}.tsx`],
      }),
    );
    await command(
      ["bun", "node_modules/typescript/bin/tsc", "-p", `tsconfig.${name}.json`],
      directory,
    );
    checks.push(`strict ${name} declarations`);
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
      "Usage: bun scripts/release-consumer.ts --manifest <release.json> --packages <name,name> [--offline] [--out <receipt.json>]\nInstalls exact local tarballs outside the repository; never publishes. Supports meowjsx, meowcss, meowtail, meowbook.",
    );
  else
    consume(consumerOptions(process.argv.slice(2)))
      .then((result) => console.log(JSON.stringify(result, null, 2)))
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
}
