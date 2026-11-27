import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { format } from "oxfmt";
import { blockEnd, splitTopLevel } from "../apps/docs/code";
import { interfaceMembers, readComponentProps } from "../apps/docs/props";

export interface ManifestProp {
  name: string;
  type: string;
  optional: boolean;
  default?: string;
  description?: string;
  liveness: "signal" | "fixed" | "unknown";
}

export interface ComponentEntry {
  name: string;
  symbol: string;
  description: string;
  status: string;
  parts: string[];
  options: Record<string, { values: string[]; default?: string }>;
  props: ManifestProp[];
  extends: string[];
  behaviors: string[];
  examples: string[];
}

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? sourceFiles(path)
        : /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")
          ? [path]
          : [];
    }),
  );
  return files.flat().sort();
}

function objectAfter(source: string, start: number): string {
  const open = source.indexOf("{", start);
  if (open < 0) throw new Error("Missing object literal");
  return source.slice(open, blockEnd(source, open));
}

function strings(source: string): string[] {
  return [...source.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]!);
}

export async function buildComponentManifest(rootDir: string): Promise<ComponentEntry[]> {
  const root = resolve(rootDir);
  const sourceRoot = join(root, "packages/meowtail/src");
  const registry = await readFile(join(sourceRoot, "registry/index.ts"), "utf8");
  const catalog = /export const meowUIComponents\s*=\s*\[([\s\S]*?)\]\s*as const/.exec(registry);
  if (!catalog) throw new Error("Component catalog not found");
  const symbols = catalog[1]!
    .split(",")
    .map((item) => item.trim().split(".").pop()!)
    .filter(Boolean);
  const statuses = new Map<string, string>();
  const statusText = await readFile(join(root, "packages/meowtail/CONTRACT-STATUS.md"), "utf8");
  for (const match of statusText.matchAll(/^\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|/gm))
    statuses.set(match[1]!, match[2]!.trim());
  const docs = await readComponentProps(sourceRoot);
  const sources = await Promise.all(
    (await sourceFiles(sourceRoot)).map(async (file) => ({
      file,
      text: await readFile(file, "utf8"),
    })),
  );
  const metadata = new Map<string, { value: string; source: string }>();
  const optionDefs = new Map<string, string>();
  for (const { text } of sources) {
    for (const match of text.matchAll(/\b([\w$]+)\.meta\s*=\s*(\{|[\w$]+(?:\.meta)?\b)/g)) {
      const value = match[2]!;
      const constant =
        !value.includes(".") && value !== "{"
          ? new RegExp(`\\bconst\\s+${value}\\s*=\\s*\\{`).exec(text)
          : undefined;
      metadata.set(match[1]!, {
        value:
          value === "{"
            ? objectAfter(text, match.index + match[0].length - 1)
            : constant
              ? objectAfter(text, constant.index + constant[0].length - 1)
              : value,
        source: text,
      });
    }
    for (const match of text.matchAll(
      /\b(?:const|let)\s+([\w$]+)\s*=\s*defineOptions\s*\(\s*["'][^"']+["']\s*,\s*\{/g,
    )) {
      optionDefs.set(match[1]!, objectAfter(text, match.index + match[0].length - 1));
    }
  }
  const stories = new Map<string, string[]>();
  const storyDir = join(root, "packages/meowtail/stories");
  for (const file of (await readdir(storyDir))
    .filter((name) => name.endsWith(".stories.tsx"))
    .sort()) {
    const source = await readFile(join(storyDir, file), "utf8");
    for (const match of source.matchAll(/\bdefineStory\s*\(\s*\{/g)) {
      const object = objectAfter(source, match.index + match[0].length - 1);
      const id = /\bid\s*:\s*["']([^"']+)["']/.exec(object)?.[1];
      const component = /\bcomponent\s*:\s*["']([^"']+)["']/.exec(object)?.[1];
      if (component && id) stories.set(component, [...(stories.get(component) ?? []), id]);
    }
  }
  const entries: ComponentEntry[] = [];
  for (const symbol of symbols) {
    let meta = metadata.get(symbol);
    const visited = new Set<string>();
    while (meta && !meta.value.startsWith("{")) {
      const alias = meta.value.slice(0, -5);
      if (visited.has(alias)) throw new Error(`Cyclic metadata for ${symbol}`);
      visited.add(alias);
      meta = metadata.get(alias);
    }
    if (!meta) throw new Error(`Missing metadata for ${symbol}`);
    const name = /\bname\s*:\s*["']([^"']+)["']/.exec(meta.value)?.[1];
    const parts = /\bparts\s*:\s*\[([^\]]*)\]/.exec(meta.value)?.[1];
    if (!name || parts === undefined || !statuses.has(name))
      throw new Error(`Missing name, parts or status for ${symbol}`);
    const options: ComponentEntry["options"] = {};
    const style = /\bstyle\s*:\s*defineStyleProps\s*\(\s*([\w$]+)\s*,/.exec(meta.value);
    if (style) {
      const definition = optionDefs.get(style[1]!);
      if (!definition) throw new Error(`Missing options ${style[1]} for ${symbol}`);
      const defaultsMatch = /\bdefaults\s*:\s*\{/.exec(meta.value);
      const defaults = defaultsMatch
        ? objectAfter(meta.value, defaultsMatch.index + defaultsMatch[0].length - 1)
        : "";
      for (const axis of splitTopLevel(definition.slice(1, -1), ",")) {
        const clean = axis.replace(/\/\*[\s\S]*?\*\//g, "").trim();
        const match = /^(\w+)\s*:\s*\[([^\]]*)\]/.exec(clean);
        if (!match) continue;
        const defaultValue = new RegExp(`\\b${match[1]}\\s*:\\s*["']([^"']+)["']`).exec(
          defaults,
        )?.[1];
        options[match[1]!] = {
          values: strings(match[2]!),
          ...(defaultValue === undefined ? {} : { default: defaultValue }),
        };
      }
    }
    const source =
      sources.find(({ text }) => new RegExp(`\\b(?:function|const)\\s+${symbol}\\b`).test(text))
        ?.text ?? meta.source;
    const imported = new Map<string, string>();
    for (const match of source.matchAll(
      /import\s*\{([^}]+)\}\s*from\s*["'][^"']*\bbehaviors(?:\/[^"']*)?["']/g,
    )) {
      for (const item of match[1]!.split(",")) {
        const spec = /^(?!type\s)(\w+)(?:\s+as\s+(\w+))?$/.exec(item.trim());
        if (spec) imported.set(spec[2] ?? spec[1]!, spec[1]!);
      }
    }
    const declaration = new RegExp(`\\b(?:function|const)\\s+${symbol}\\b`).exec(source);
    const start = declaration?.index ?? 0;
    const rest = source.slice(start);
    const end = /\n(?:export\s+)?(?:function|const|interface|type|class)\s+[A-Z]/.exec(
      rest.slice(1),
    );
    const componentSource = end ? rest.slice(0, end.index + 1) : rest;
    const behaviors = [...imported]
      .filter(([local]) => new RegExp(`\\b${local}\\b`).test(componentSource))
      .map(([, original]) => original)
      .sort();
    const doc = docs.get(symbol);
    let props = doc?.props ?? [];
    if (!props.length && declaration) {
      const signature = source.slice(declaration.index);
      const param = /\bfunction\s+\w+\s*\(\s*\{/.exec(signature);
      if (param) {
        const open = param.index + param[0].length - 1;
        const afterPattern = blockEnd(signature, open);
        const annotation = /^\s*:\s*\{/.exec(signature.slice(afterPattern));
        if (annotation) {
          const typeStart = afterPattern + annotation[0].length - 1;
          props = interfaceMembers(
            signature.slice(typeStart + 1, blockEnd(signature, typeStart) - 1),
          );
        }
      }
      const union = new RegExp(
        `\\btype\\s+${symbol}Props\\s*=\\s*Props\\s*&\\s*\\(([\\s\\S]*?)\\)\\s*;`,
      ).exec(source);
      if (!props.length && union) {
        const variants = [...union[1]!.matchAll(/\{([^{}]*)\}/g)].map((match) =>
          interfaceMembers(match[1]!),
        );
        const members = new Map<string, (typeof props)[number]>();
        for (const variant of variants)
          for (const member of variant) {
            const existing = members.get(member.name);
            if (existing && existing.type !== member.type) existing.type += ` | ${member.type}`;
            else if (!existing) members.set(member.name, { ...member });
          }
        props = [...members.values()].map((member) => ({
          ...member,
          optional:
            member.optional ||
            variants.some((variant) => !variant.some((item) => item.name === member.name)),
        }));
      }
    }
    entries.push({
      name,
      symbol,
      description: doc?.summary ?? "",
      status: statuses.get(name)!,
      parts: strings(parts),
      options,
      props: props.map((prop) => ({
        ...prop,
        liveness: /\b(?:MaybeSignal|ReadableSignal|Signal)\s*</.test(prop.type)
          ? "signal"
          : /\bfixed\b.*\bmount\b/i.test(prop.description ?? "")
            ? "fixed"
            : "unknown",
      })),
      extends: doc?.extends ?? [],
      behaviors,
      examples: stories.get(symbol) ?? [],
    });
  }
  return entries.sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export async function writeComponentManifest(rootDir: string): Promise<ComponentEntry[]> {
  const entries = await buildComponentManifest(rootDir);
  const path = join(rootDir, "packages/meowtail/registry/components-manifest.json");
  const result = await format(path, JSON.stringify(entries, null, 2));
  if (result.errors.length)
    throw new Error(
      `Cannot format manifest: ${result.errors.map((error) => error.message).join(", ")}`,
    );
  await writeFile(path, result.code);
  return entries;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  await writeComponentManifest(process.cwd());
