import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { blockEnd, splitTopLevel, statementEnd } from "./code";

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
  /** The JSDoc written on the component's declaration: what it is, in a sentence or two. */
  summary?: string;
}

interface ComponentDoc {
  propsName: string;
  defaults: Map<string, string>;
  summary?: string;
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

/** The JSDoc block that ends right before `index`, when one does. */
function docBefore(source: string, index: number): string | undefined {
  const comment = /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*$/.exec(source.slice(0, index));
  return comment ? commentText(comment[0].trim()) : undefined;
}

/** The first sentence of a JSDoc text, and what follows it. */
export function splitSummary(text: string): { summary: string; rest?: string } {
  const match = /^([\s\S]+?[.!?])(?:\s+([\s\S]+))?$/.exec(text.trim());
  if (!match) return { summary: text.trim() };
  return match[2] ? { summary: match[1]!, rest: match[2] } : { summary: match[1]! };
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

/** Read the props interfaces and component defaults of one source file. */
export function readPropsSource(
  source: string,
  interfaces: Map<string, InterfaceDoc>,
  components: Map<string, ComponentDoc>,
): void {
  const declaration = /(?:export )?interface ([\w$]+)(?:<[^{]*?>)?\s*(?:extends\s+([^{]+?))?\s*\{/g;
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
  // `type XProps = Props & { … }`: the object literal holds the members, the rest is inherited.
  for (const match of source.matchAll(/export type ([\w$]+Props)(?:<[^=]*?>)?\s*=/g)) {
    const start = match.index + match[0].length;
    const parts = splitTopLevel(source.slice(start, statementEnd(source, start) - 1), "&");
    const literal = parts.find((part) => part.startsWith("{"));
    interfaces.set(match[1]!, {
      members: literal ? interfaceMembers(literal.slice(1, -1)) : [],
      extends: parts
        .filter((part) => !part.startsWith("{"))
        .map((part) => part.replace(/\s+/g, " ")),
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
      summary: docBefore(source, match.index),
    });
  }
  // Any other exported component still has its JSDoc, even when its props are not destructured.
  for (const match of source.matchAll(/^export (?:const|function) ([A-Z][\w$]*)\b/gm)) {
    const summary = docBefore(source, match.index);
    const known = components.get(match[1]!);
    if (known) known.summary ??= summary;
    else if (summary)
      components.set(match[1]!, { propsName: `${match[1]}Props`, defaults: new Map(), summary });
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
 * props are not listed one by one; `extends` names where they come from. The JSDoc on the
 * component's own declaration becomes its summary.
 */
export async function readComponentProps(directory: string): Promise<Map<string, ComponentProps>> {
  const interfaces = new Map<string, InterfaceDoc>();
  const components = new Map<string, ComponentDoc>();
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
    const declared = resolve(component?.propsName ?? `${name}Props`, new Set()) ?? {
      members: [],
      extends: [],
    };
    if (!declared.members.length && !declared.extends.length && !component?.summary) continue;
    result.set(name, {
      props: declared.members.map((member) => {
        const value = component?.defaults.get(member.name);
        return value === undefined ? member : { ...member, default: value };
      }),
      extends: declared.extends,
      ...(component?.summary ? { summary: component.summary } : {}),
    });
  }
  return result;
}
