import { expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const sourceRoot = path.resolve(import.meta.dir, "../../../src");

interface Binding {
  file: string;
  name: string;
}

interface ModuleInfo {
  /** Value imports evaluated when this module itself is included. */
  imports: { file: string; names: string[] | "*" }[];
  /** `export { name } from "./other"`. */
  reexports: Map<string, Binding>;
  /** `export { local as exported }` of a name declared or imported in this file. */
  aliases: Map<string, string>;
  stars: string[];
  locals: Set<string>;
  imported: Map<string, Binding>;
}

const cache = new Map<string, ModuleInfo>();

function stripComments(source: string): string {
  let out = "";
  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1];
    if (current === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") index += 1;
      out += "\n";
      continue;
    }
    if (current === "/" && next === "*") {
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/"))
        index += 1;
      index += 1;
      out += " ";
      continue;
    }
    if (current === "'" || current === '"' || current === "`") {
      out += current;
      index += 1;
      while (index < source.length) {
        out += source[index];
        if (source[index] === "\\") {
          index += 1;
          out += source[index] ?? "";
          index += 1;
          continue;
        }
        if (source[index] === current) break;
        index += 1;
      }
      continue;
    }
    out += current;
  }
  return out;
}

function resolveSpecifier(fromFile: string, specifier: string): string | undefined {
  if (!specifier.startsWith(".")) return undefined;
  const base = path.resolve(path.dirname(fromFile), specifier);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`Cannot resolve ${specifier} from ${fromFile}`);
}

function parseSpecifiers(list: string): { exported: string; local: string; typeOnly: boolean }[] {
  return list
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const typeOnly = part.startsWith("type ");
      const body = typeOnly ? part.slice(5).trim() : part;
      const [from, alias] = body.split(/\s+as\s+/);
      return { exported: from!.trim(), local: (alias ?? from)!.trim(), typeOnly };
    });
}

function moduleInfo(file: string): ModuleInfo {
  const cached = cache.get(file);
  if (cached) return cached;
  const source = stripComments(readFileSync(file, "utf8"));
  const info: ModuleInfo = {
    imports: [],
    reexports: new Map(),
    aliases: new Map(),
    stars: [],
    locals: new Set(),
    imported: new Map(),
  };
  const record = (match: RegExpMatchArray) => {
    const resolved = resolveSpecifier(file, match[2] ?? match[1]!);
    return resolved;
  };
  for (const match of source.matchAll(
    /(?:^|\n)\s*import\s+type\s+(?:[^'"\n]+?\s+from\s+)?["']([^"']+)["']/g,
  )) {
    void match;
  }
  for (const match of source.matchAll(
    /(?:^|\n)\s*import\s+(?!type\b)([\s\S]*?)\s+from\s+["']([^"']+)["']/g,
  )) {
    const resolved = record(match);
    if (!resolved) continue;
    const clause = match[1]!.trim();
    if (clause.startsWith("*")) {
      info.imports.push({ file: resolved, names: "*" });
      continue;
    }
    const brace = clause.match(/\{([\s\S]*)\}/);
    const names: string[] = [];
    const defaultName = clause.split(",")[0]?.trim();
    if (defaultName && !defaultName.startsWith("{") && !defaultName.startsWith("type ")) {
      const local = defaultName.replace(/\{[\s\S]*$/, "").trim();
      if (local && local !== "type") {
        info.imported.set(local, { file: resolved, name: "default" });
        names.push("default");
      }
    }
    if (brace) {
      for (const specifier of parseSpecifiers(brace[1]!)) {
        if (specifier.typeOnly) continue;
        info.imported.set(specifier.local, { file: resolved, name: specifier.exported });
        names.push(specifier.exported);
      }
    }
    if (names.length) info.imports.push({ file: resolved, names });
  }
  for (const match of source.matchAll(/(?:^|\n)\s*import\s+["']([^"']+)["']/g)) {
    const resolved = resolveSpecifier(file, match[1]!);
    if (resolved) info.imports.push({ file: resolved, names: "*" });
  }
  for (const match of source.matchAll(
    /(?:^|\n)\s*export\s+(?!type\b)\{([\s\S]*?)\}\s+from\s+["']([^"']+)["']/g,
  )) {
    const resolved = resolveSpecifier(file, match[2]!);
    if (!resolved) continue;
    for (const specifier of parseSpecifiers(match[1]!)) {
      if (specifier.typeOnly) continue;
      info.reexports.set(specifier.local, { file: resolved, name: specifier.exported });
    }
  }
  for (const match of source.matchAll(/(?:^|\n)\s*export\s+\*\s+from\s+["']([^"']+)["']/g)) {
    const resolved = resolveSpecifier(file, match[1]!);
    if (resolved) info.stars.push(resolved);
  }
  for (const match of source.matchAll(/(?:^|\n)\s*export\s+(?!type\b)\{([\s\S]*?)\}\s*;/g)) {
    if (/^\s*export\s+\{[\s\S]*?\}\s+from\s+/.test(match[0])) continue;
    for (const specifier of parseSpecifiers(match[1]!)) {
      if (specifier.typeOnly) continue;
      info.aliases.set(specifier.local, specifier.exported);
    }
  }
  for (const match of source.matchAll(
    /(?:^|\n)\s*export\s+(?:declare\s+)?(?:async\s+)?(?:const|function|class)\s+([A-Za-z_$][\w$]*)/g,
  )) {
    info.locals.add(match[1]!);
  }
  cache.set(file, info);
  return info;
}

const exportCache = new Map<string, Set<string>>();

function exportsOf(file: string, stack = new Set<string>()): Set<string> {
  const cached = exportCache.get(file);
  if (cached) return cached;
  if (stack.has(file)) return new Set();
  stack.add(file);
  const info = moduleInfo(file);
  const names = new Set<string>([...info.locals, ...info.reexports.keys(), ...info.aliases.keys()]);
  for (const star of info.stars) for (const name of exportsOf(star, stack)) names.add(name);
  exportCache.set(file, names);
  return names;
}

/** Modules a bundler keeps when the host imports only these bindings. */
function reach(entry: string, bindings: readonly string[]): Set<string> {
  const included = new Set<string>();
  const requested = new Set<string>();

  function include(file: string) {
    if (included.has(file)) return;
    included.add(file);
    for (const imported of moduleInfo(file).imports) {
      if (imported.names === "*") include(imported.file);
      else for (const name of imported.names) request(imported.file, name);
    }
  }

  function request(file: string, name: string) {
    const key = `${file}#${name}`;
    if (requested.has(key)) return;
    requested.add(key);
    const info = moduleInfo(file);
    const reexport = info.reexports.get(name);
    if (reexport) {
      request(reexport.file, reexport.name);
      return;
    }
    const alias = info.aliases.get(name);
    if (alias) {
      const imported = info.imported.get(alias);
      if (imported) request(imported.file, imported.name);
      else if (info.locals.has(alias)) include(file);
      else throw new Error(`${file} exports ${name} from unknown local ${alias}`);
      return;
    }
    if (info.locals.has(name)) {
      include(file);
      return;
    }
    for (const star of info.stars) {
      if (exportsOf(star).has(name)) {
        request(star, name);
        return;
      }
    }
    throw new Error(`${path.relative(sourceRoot, file)} does not export ${name}`);
  }

  for (const binding of bindings) request(entry, binding);
  return included;
}

const entry = path.join(sourceRoot, "index.ts");
const theme = path.join(sourceRoot, "theme/index.ts");
const highlighter = path.join(sourceRoot, "syntax-highlight.ts");

test("theme and registry imports do not reach the syntax highlighter", () => {
  const reached = new Set<string>([
    ...reach(theme, ["standardTheme"]),
    ...reach(entry, ["Button", "createMeowUI"]),
  ]);
  expect(reached.has(highlighter)).toBe(false);
  expect([...reached].some((file) => file.endsWith(`${path.sep}code-block.tsx`))).toBe(false);
  expect([...reached].some((file) => file.endsWith(`${path.sep}read-block.tsx`))).toBe(false);
  expect(reached.has(path.join(sourceRoot, "registry/index.ts"))).toBe(true);
});

test("code surfaces still reach the syntax highlighter", () => {
  for (const binding of ["CodeBlock", "ReadBlock", "JsonBlock", "AssistantView"]) {
    expect(reach(entry, [binding]).has(highlighter)).toBe(true);
  }
});
