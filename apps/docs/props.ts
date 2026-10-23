import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { blockEnd, splitTopLevel } from "./code";

/** One prop a component declares, as its source spells it. */
export interface PropDoc {
  name: string;
  /** The declared type, on one line. */
  type: string;
  optional: boolean;
  /** The default its setup destructures, when it gives one. */
  default?: string;
  /** The JSDoc written on the member. */
  description?: string;
}

/** The props a component documents, and what its props interface extends. */
export interface ComponentProps {
  props: PropDoc[];
  /** The `extends` clause, one entry per extended type. */
  extends: string[];
}

interface InterfaceDoc {
  members: PropDoc[];
  extends: string[];
}

/** The text of a JSDoc block, without its markers. */
function commentText(comment: string): string {
  return comment
    .replace(/^\/\*\*|\*\/$/g, "")
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter(Boolean)
    .join(" ");
}

/** Read the members of an interface body: name, optional mark, type and JSDoc. */
export function interfaceMembers(body: string): PropDoc[] {
  const members: PropDoc[] = [];
  for (const part of splitTopLevel(body, ";")) {
    const docs = [...part.matchAll(/\/\*\*[\s\S]*?\*\//g)];
    const code = part
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\n]*/g, "")
      .trim();
    const match = /^(?:readonly\s+)?([\w$]+|"[^"]+")(\?)?\s*([:(])([\s\S]*)$/.exec(code);
    if (!match) continue;
    const [, name, optional, kind, rest] = match;
    const type = (kind === ":" ? rest! : `(${rest!}`).replace(/\s+/g, " ").trim();
    const description = docs.length ? commentText(docs[docs.length - 1]![0]) : undefined;
    members.push({
      name: name!.replace(/"/g, ""),
      type,
      optional: optional === "?",
      ...(description ? { description } : {}),
    });
  }
  return members;
}

/** The defaults an object destructuring pattern gives, by prop name. */
export function patternDefaults(pattern: string): Map<string, string> {
  const defaults = new Map<string, string>();
  for (const entry of splitTopLevel(pattern, ",")) {
    const match = /^([\w$]+)\s*(?::\s*[\w$]+\s*)?=\s*([\s\S]+)$/.exec(entry);
    if (match) defaults.set(match[1]!, match[2]!.replace(/\s+/g, " ").trim());
  }
  return defaults;
}

/** The destructuring pattern that opens at or after `from`, without its braces. */
function patternAfter(source: string, from: number): string | undefined {
  const open = /\(\s*\{/g;
  open.lastIndex = from;
  const match = open.exec(source);
  if (!match) return undefined;
  const brace = source.indexOf("{", match.index);
  return source.slice(brace + 1, blockEnd(source, brace) - 1);
}

/** Read the props interfaces and component defaults of one source file. */
export function readPropsSource(
  source: string,
  interfaces: Map<string, InterfaceDoc>,
  components: Map<string, { propsName: string; defaults: Map<string, string> }>,
): void {
  const declaration = /export interface ([\w$]+)(?:<[^{]*?>)?\s*(?:extends\s+([^{]+?))?\s*\{/g;
  for (const match of source.matchAll(declaration)) {
    const brace = match.index + match[0].length - 1;
    const body = source.slice(brace + 1, blockEnd(source, brace) - 1);
    interfaces.set(match[1]!, {
      members: interfaceMembers(body),
      extends: match[2]
        ? splitTopLevel(match[2], ",").map((entry) => entry.replace(/\s+/g, " "))
        : [],
    });
  }
  const defined = /export const ([\w$]+)\s*=\s*defineComponent<\s*([\w$]+)/g;
  for (const match of source.matchAll(defined)) {
    const pattern = patternAfter(source, match.index + match[0].length);
    components.set(match[1]!, {
      propsName: match[2]!,
      defaults: pattern ? patternDefaults(pattern) : new Map(),
    });
  }
  const declared = /export function ([A-Z][\w$]*)\s*\(\s*\{/g;
  for (const match of source.matchAll(declared)) {
    const brace = source.indexOf("{", match.index + match[0].length - 1);
    const end = blockEnd(source, brace);
    const propsName = /^\s*:\s*([\w$]+)/.exec(source.slice(end))?.[1];
    if (!propsName) continue;
    components.set(match[1]!, {
      propsName,
      defaults: patternDefaults(source.slice(brace + 1, end - 1)),
    });
  }
}

async function sourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) files.push(path);
  }
  return files;
}

/**
 * The props each component of a package documents, read from its source: the members of its
 * props interface with their JSDoc, and the defaults its setup destructures. Inherited element
 * props are not listed one by one; `extends` names where they come from.
 */
export async function readComponentProps(directory: string): Promise<Map<string, ComponentProps>> {
  const interfaces = new Map<string, InterfaceDoc>();
  const components = new Map<string, { propsName: string; defaults: Map<string, string> }>();
  for (const file of await sourceFiles(directory)) {
    readPropsSource(await readFile(file, "utf8"), interfaces, components);
  }
  /** Members of an interface with those of the local props interfaces it extends; own ones win. */
  const resolve = (name: string, seen: Set<string>): InterfaceDoc | undefined => {
    const declared = interfaces.get(name);
    if (!declared || seen.has(name)) return declared;
    seen.add(name);
    const members = new Map<string, PropDoc>();
    const outside: string[] = [];
    for (const entry of declared.extends) {
      const match = /^(?:Omit<\s*)?([\w$]+)(?:\s*,\s*([^>]+)>)?$/.exec(entry);
      const base = match && match[1] !== "Props" ? resolve(match[1]!, seen) : undefined;
      if (!base) {
        outside.push(entry);
        continue;
      }
      const omitted = new Set([...(match![2] ?? "").matchAll(/"([^"]+)"/g)].map((key) => key[1]));
      for (const member of base.members)
        if (!omitted.has(member.name)) members.set(member.name, member);
      outside.push(...base.extends.filter((inherited) => !outside.includes(inherited)));
    }
    for (const member of declared.members) members.set(member.name, member);
    return { members: [...members.values()], extends: outside };
  };
  const result = new Map<string, ComponentProps>();
  const names = new Set([
    ...components.keys(),
    ...[...interfaces.keys()]
      .filter((name) => name.endsWith("Props"))
      .map((name) => name.slice(0, -5)),
  ]);
  for (const name of names) {
    const component = components.get(name);
    const declared = resolve(component?.propsName ?? `${name}Props`, new Set());
    if (!declared) continue;
    result.set(name, {
      props: declared.members.map((member) => {
        const value = component?.defaults.get(member.name);
        return value === undefined ? member : { ...member, default: value };
      }),
      extends: declared.extends,
    });
  }
  return result;
}
