/**
 * The message format parser shared by `meowjsx/i18n` (run time) and `meowjsx/i18n/audit`
 * (build time), so the two cannot disagree about what a template contains. Internal: it is
 * not a package export. DOM-free, IO-free and independent of the renderer.
 */

export const PLURAL_CATEGORIES: ReadonlySet<string> = new Set([
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
]);

export type MessageNode =
  | { readonly type: "text"; readonly value: string }
  | { readonly type: "arg"; readonly name: string }
  | { readonly type: "pound" }
  | {
      readonly type: "plural";
      readonly name: string;
      /** `selectordinal` selects with ordinal rules. */
      readonly ordinal: boolean;
      readonly exact: ReadonlyMap<number, readonly MessageNode[]>;
      readonly categories: ReadonlyMap<string, readonly MessageNode[]>;
    }
  | {
      readonly type: "select";
      readonly name: string;
      readonly branches: ReadonlyMap<string, readonly MessageNode[]>;
    }
  | { readonly type: "tag"; readonly name: string; readonly children: readonly MessageNode[] };

export class ParseFailure extends Error {}

export interface ParseOptions {
  /** Interpret `<name>...</name>` as a rich tag. Without it `<` is ordinary text. */
  readonly rich?: boolean;
}

const TAG_NAME = /^[A-Za-z_][A-Za-z0-9_-]*/;

export function parseTemplate(
  template: string,
  options: ParseOptions = {},
): readonly MessageNode[] {
  const rich = options.rich === true;
  let index = 0;

  const fail = (reason: string): never => {
    throw new ParseFailure(`${reason} at position ${index}`);
  };
  const skipSpace = (): void => {
    while (index < template.length && /\s/.test(template[index]!)) index += 1;
  };
  const readToken = (stop: RegExp): string => {
    const start = index;
    while (index < template.length && !stop.test(template[index]!)) index += 1;
    return template.slice(start, index);
  };
  /** The tag name when `<name>` or `</name>` starts at `index`; `undefined` for plain text. */
  const tagAt = (): { closing: boolean; name: string; length: number } | undefined => {
    if (template[index] !== "<") return undefined;
    const closing = template[index + 1] === "/";
    const start = index + (closing ? 2 : 1);
    const name = TAG_NAME.exec(template.slice(start))?.[0];
    if (name === undefined || template[start + name.length] !== ">") return undefined;
    return { closing, name, length: start + name.length + 1 - index };
  };

  function parseNodes(inPlural: boolean, nested: boolean, closing?: string): MessageNode[] {
    const nodes: MessageNode[] = [];
    let text = "";
    const flush = (): void => {
      if (text) nodes.push({ type: "text", value: text });
      text = "";
    };
    while (index < template.length) {
      const char = template[index]!;
      if (char === "'") {
        const next = template[index + 1];
        if (next === "'") {
          text += "'";
          index += 2;
        } else if (next === "{" || next === "}" || next === "#") {
          index += 1;
          // A quoted section runs to the next apostrophe, or to the end of the text.
          while (index < template.length) {
            if (template[index] === "'") {
              if (template[index + 1] === "'") {
                text += "'";
                index += 2;
                continue;
              }
              index += 1;
              break;
            }
            text += template[index];
            index += 1;
          }
        } else {
          text += "'";
          index += 1;
        }
      } else if (char === "{") {
        flush();
        index += 1;
        nodes.push(parseArgument(inPlural));
      } else if (char === "}") {
        if (!nested) fail("Unmatched }");
        break;
      } else if (char === "#" && inPlural) {
        flush();
        nodes.push({ type: "pound" });
        index += 1;
      } else if (rich && char === "<" && tagAt()) {
        const tag = tagAt()!;
        if (tag.closing) {
          if (tag.name !== closing) {
            fail(
              closing === undefined
                ? `Unexpected closing tag </${tag.name}>`
                : `Closing tag </${tag.name}> does not match <${closing}>`,
            );
          }
          break;
        }
        flush();
        index += tag.length;
        const children = parseNodes(inPlural, nested, tag.name);
        const end = tagAt();
        if (!end || !end.closing || end.name !== tag.name) fail(`Unclosed tag <${tag.name}>`);
        index += end!.length;
        nodes.push({ type: "tag", name: tag.name, children });
      } else {
        text += char;
        index += 1;
      }
    }
    flush();
    return nodes;
  }

  function parseArgument(inPlural: boolean): MessageNode {
    skipSpace();
    const name = readToken(/[\s,{}]/);
    if (!name) fail("Missing argument name");
    skipSpace();
    if (template[index] === "}") {
      index += 1;
      return { type: "arg", name };
    }
    if (template[index] !== ",") return fail("Expected , or }");
    index += 1;
    skipSpace();
    const kind = readToken(/[\s,{}]/);
    if (kind !== "plural" && kind !== "selectordinal" && kind !== "select") {
      return fail(`Unsupported argument type "${kind}"`);
    }
    skipSpace();
    if (template[index] !== ",") return fail(`Expected , after ${kind}`);
    index += 1;
    return kind === "select"
      ? parseSelectBranches(name, inPlural)
      : parsePluralBranches(name, kind === "selectordinal");
  }

  function parseBranchBody(inPlural: boolean, kind: string): MessageNode[] {
    index += 1;
    const body = parseNodes(inPlural, true);
    if (template[index] !== "}") return fail(`Unclosed ${kind} branch`);
    index += 1;
    return body;
  }

  function parsePluralBranches(name: string, ordinal: boolean): MessageNode {
    const kind = ordinal ? "selectordinal" : "plural";
    const exact = new Map<number, readonly MessageNode[]>();
    const categories = new Map<string, readonly MessageNode[]>();
    for (;;) {
      skipSpace();
      if (index >= template.length) return fail(`Unclosed ${kind} argument`);
      if (template[index] === "}") {
        index += 1;
        break;
      }
      const selector = readToken(/[\s{}]/);
      skipSpace();
      if (!selector || template[index] !== "{") return fail("Expected a selector and {");
      const body = parseBranchBody(true, kind);
      if (selector.startsWith("=")) {
        if (!/^=\d+$/.test(selector)) return fail(`Invalid selector "${selector}"`);
        const value = Number(selector.slice(1));
        if (exact.has(value)) return fail(`Duplicate selector "${selector}"`);
        exact.set(value, body);
      } else {
        if (!PLURAL_CATEGORIES.has(selector)) return fail(`Invalid selector "${selector}"`);
        if (categories.has(selector)) return fail(`Duplicate selector "${selector}"`);
        categories.set(selector, body);
      }
    }
    if (!categories.has("other")) return fail(`A ${kind} needs an "other" branch`);
    return { type: "plural", name, ordinal, exact, categories };
  }

  function parseSelectBranches(name: string, inPlural: boolean): MessageNode {
    const branches = new Map<string, readonly MessageNode[]>();
    for (;;) {
      skipSpace();
      if (index >= template.length) return fail("Unclosed select argument");
      if (template[index] === "}") {
        index += 1;
        break;
      }
      const selector = readToken(/[\s{}]/);
      skipSpace();
      if (!selector || template[index] !== "{") return fail("Expected a selector and {");
      // A # in a select branch inside a plural still means the outer plural's number.
      const body = parseBranchBody(inPlural, "select");
      if (branches.has(selector)) return fail(`Duplicate selector "${selector}"`);
      branches.set(selector, body);
    }
    if (!branches.has("other")) return fail('A select needs an "other" branch');
    return { type: "select", name, branches };
  }

  const nodes = parseNodes(false, false);
  if (index < template.length) fail("Unexpected text");
  return nodes;
}

/** Argument names and rich tag names a parsed template uses, each sorted and unique. */
export function describeNodes(nodes: readonly MessageNode[]): {
  names: string[];
  tags: string[];
} {
  const names = new Set<string>();
  const tags = new Set<string>();
  const visit = (list: readonly MessageNode[]): void => {
    for (const node of list) {
      if (node.type === "arg") names.add(node.name);
      else if (node.type === "plural") {
        names.add(node.name);
        for (const branch of node.exact.values()) visit(branch);
        for (const branch of node.categories.values()) visit(branch);
      } else if (node.type === "select") {
        names.add(node.name);
        for (const branch of node.branches.values()) visit(branch);
      } else if (node.type === "tag") {
        tags.add(node.name);
        visit(node.children);
      }
    }
  };
  visit(nodes);
  return { names: [...names].sort(), tags: [...tags].sort() };
}
