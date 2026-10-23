import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import type { StoryEntry } from "meowbook";

/** The source of one story, ready to show under its preview. */
export interface StorySource {
  /** The statement that defines the story. */
  code: string;
  /**
   * The code that draws the example, when the story's `render` names a function declared in
   * the same file: that declaration and the line it starts on.
   */
  render?: { code: string; line: number };
  /** The repository-relative path of the file the story lives in. */
  file: string;
  /** The line the statement starts on. */
  line: number;
}

function skipQuoted(source: string, start: number, quote: string): number {
  let index = start + 1;
  while (index < source.length) {
    const character = source[index];
    if (character === "\\") {
      index += 2;
      continue;
    }
    if (character === quote) return index + 1;
    index += 1;
  }
  return source.length;
}

/** Skip a template literal, including the expressions it interpolates. */
function skipTemplate(source: string, start: number): number {
  let index = start + 1;
  while (index < source.length) {
    const character = source[index];
    if (character === "\\") {
      index += 2;
      continue;
    }
    if (character === "`") return index + 1;
    if (character === "$" && source[index + 1] === "{") {
      let depth = 1;
      index += 2;
      while (index < source.length && depth > 0) {
        const inner = source[index];
        if (inner === "`") {
          index = skipTemplate(source, index);
          continue;
        }
        if (inner === '"' || inner === "'") {
          index = skipQuoted(source, index, inner);
          continue;
        }
        if (inner === "{") depth += 1;
        else if (inner === "}") depth -= 1;
        index += 1;
      }
      continue;
    }
    index += 1;
  }
  return source.length;
}

/**
 * Find where the statement that starts at `start` ends. Brackets are matched
 * so the `;` that closes a call is not mistaken for the end of the statement,
 * and strings and comments are skipped so their contents cannot confuse it.
 */
export function statementEnd(source: string, start: number): number {
  return scan(source, start, (character, depth) => character === ";" && depth === 0);
}

/**
 * Find where the object property that starts at `start` ends: before the `,` that separates it
 * from the next property, or before the `}` that closes its object.
 */
export function propertyEnd(source: string, start: number): number {
  return scan(
    source,
    start,
    (character, depth) => (character === "," && depth === 0) || depth < 0,
    false,
  );
}

/** Walk code from `start`, skipping strings and comments, until `stop` holds. */
function scan(
  source: string,
  start: number,
  stop: (character: string, depth: number) => boolean,
  inclusive = true,
): number {
  let depth = 0;
  let index = start;
  while (index < source.length) {
    const character = source[index];
    if (character === "/" && source[index + 1] === "/") {
      const newline = source.indexOf("\n", index);
      if (newline < 0) return source.length;
      index = newline + 1;
      continue;
    }
    if (character === "/" && source[index + 1] === "*") {
      const close = source.indexOf("*/", index + 2);
      if (close < 0) return source.length;
      index = close + 2;
      continue;
    }
    if (character === '"' || character === "'") {
      index = skipQuoted(source, index, character);
      continue;
    }
    if (character === "`") {
      index = skipTemplate(source, index);
      continue;
    }
    if (character === "(" || character === "[" || character === "{") {
      depth += 1;
      index += 1;
      continue;
    }
    if (character === ")" || character === "]" || character === "}") {
      depth -= 1;
      if (stop(character, depth)) return inclusive ? index + 1 : index;
      index += 1;
      continue;
    }
    if (stop(character, depth)) return inclusive ? index + 1 : index;
    index += 1;
  }
  return source.length;
}

/**
 * Slice the statement that defines a story out of its file. The result is the
 * code that produced the preview, not a re-typed sample.
 */
export function extractStorySource(source: string, exportName: string): string | undefined {
  const marker = new RegExp(
    `export\\s+const\\s+${exportName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
  );
  const match = marker.exec(source);
  if (!match) return undefined;
  const code = source.slice(match.index, statementEnd(source, match.index)).trim();
  return code.length > 0 ? code : undefined;
}

/**
 * The story's `render` property alone, dedented: the code that draws the example, without the
 * story's id, title and coverage notes. `lineOffset` counts the lines before it in the statement.
 */
export function renderSourceOf(code: string): { code: string; lineOffset: number } | undefined {
  const match = /^([ \t]*)render\s*(?:\(|:)/m.exec(code);
  if (!match) return undefined;
  const end = propertyEnd(code, match.index + match[1]!.length);
  const indent = match[1]!.length;
  const lines = code
    .slice(match.index, end)
    .split("\n")
    .map((line) => (line.slice(0, indent).trim() === "" ? line.slice(indent) : line));
  const render = lines.join("\n").trim();
  if (!render) return undefined;
  return { code: render, lineOffset: code.slice(0, match.index).split("\n").length - 1 };
}

/** Where a function declaration that starts at `start` ends: the `}` closing its body. */
function functionEnd(source: string, start: number): number {
  const body = source.indexOf("{", source.indexOf(")", start));
  if (body < 0) return source.length;
  return scan(source, body, (character, depth) => character === "}" && depth === 0);
}

/**
 * When a story's render is only a name (`render: assistantDemo`), find that declaration in the
 * story's file, so the docs show the code that draws the example rather than its name.
 */
export function namedRenderSource(
  file: string,
  storyCode: string,
): { code: string; offset: number } | undefined {
  const name = /^render\s*:\s*([A-Za-z_$][\w$]*)$/.exec(renderSourceOf(storyCode)?.code ?? "")?.[1];
  if (!name) return undefined;
  const escaped = name.replace(/\$/g, "\\$");
  const declaration = new RegExp(
    `^(?:export\\s+)?(?:(function)\\s+${escaped}\\b|const\\s+${escaped}\\b)`,
    "m",
  ).exec(file);
  if (!declaration) return undefined;
  const end = declaration[1]
    ? functionEnd(file, declaration.index)
    : statementEnd(file, declaration.index);
  const code = file.slice(declaration.index, end).trim();
  return code ? { code, offset: declaration.index } : undefined;
}

/** The longest usage snippet worth showing; a longer first use is a scene, not a usage. */
const USAGE_LINE_LIMIT = 16;

/** Skip a `{…}` expression inside JSX, from its opening brace. */
function skipExpression(source: string, start: number): number {
  return scan(source, start, (character, depth) => character === "}" && depth === 0);
}

/** Read the opening tag that starts at `start`: where it ends and whether it closes itself. */
function openingTag(source: string, start: number): { end: number; selfClosing: boolean } {
  let index = start + 1;
  while (index < source.length) {
    const character = source[index];
    if (character === "{") {
      index = skipExpression(source, index);
      continue;
    }
    if (character === '"' || character === "'") {
      index = skipQuoted(source, index, character);
      continue;
    }
    if (character === ">") return { end: index + 1, selfClosing: source[index - 1] === "/" };
    index += 1;
  }
  return { end: source.length, selfClosing: true };
}

/** The element named `name` whose opening tag starts at `start`, through its closing tag. */
function elementAt(code: string, name: string, start: number): string | undefined {
  const first = openingTag(code, start);
  if (first.selfClosing) return code.slice(start, first.end);
  let depth = 1;
  let index = first.end;
  while (index < code.length && depth > 0) {
    const character = code[index];
    if (character === "{") {
      index = skipExpression(code, index);
      continue;
    }
    if (code.startsWith(`</${name}`, index) && /[\s>]/.test(code[index + name.length + 2] ?? "")) {
      index = code.indexOf(">", index) + 1;
      depth -= 1;
      continue;
    }
    if (character === "<" && /[A-Za-z]/.test(code[index + 1] ?? "")) {
      const tag = openingTag(code, index);
      const nested =
        code.startsWith(`<${name}`, index) && /[\s/>]/.test(code[index + name.length + 1] ?? "");
      if (nested && !tag.selfClosing) depth += 1;
      index = tag.end;
      continue;
    }
    index += 1;
  }
  return depth > 0 ? undefined : code.slice(start, index);
}

/** A `data-*` attribute: story wiring for feedback and tests, not part of a usage. */
const DATA_ATTRIBUTE = /\s+data-[\w-]+(?:="[^"]*"|=\{[^{}]*\})?(?=[\s/>])/g;

/** A value or child bound to a bare local name, such as `size={size}` or `{label}`. */
const LOCAL_BINDING = /(?:=|>\s*)\{(?!true\}|false\}|null\}|undefined\})[a-z_$][\w$.]*\}/;

/**
 * The first readable use of the JSX element named `name` in a story's code, dedented: a usage
 * snippet taken from the code that draws the preview rather than re-typed. Nested elements of
 * the same name are matched, and text between tags is read as text, so an apostrophe cannot
 * end the scan early. Story wiring (`data-*` attributes) is dropped. A use that reads a local variable, or runs longer than a few lines, shows
 * a scene rather than a usage, so the search moves on to the next use.
 */
export function firstElementOf(code: string, name: string): string | undefined {
  const opening = new RegExp(`<${name}(?=[\\s/>])`, "g");
  for (const match of code.matchAll(opening)) {
    const element = elementAt(code, name, match.index)?.replace(DATA_ATTRIBUTE, "");
    if (!element || LOCAL_BINDING.test(element)) continue;
    const lineStart = code.lastIndexOf("\n", match.index) + 1;
    const indent = match.index - lineStart;
    const lines = element
      .split("\n")
      .map((line, index) =>
        index > 0 && line.slice(0, indent).trim() === "" ? line.slice(indent) : line,
      );
    if (lines.length <= USAGE_LINE_LIMIT) return lines.join("\n");
  }
  return undefined;
}

/** Read the source of one story from the repository. */
export async function readStorySource(
  root: string,
  story: StoryEntry,
): Promise<StorySource | undefined> {
  let source: string;
  try {
    source = await readFile(story.file, "utf8");
  } catch {
    return undefined;
  }
  const code = extractStorySource(source, story.exportName);
  if (!code) return undefined;
  const named = namedRenderSource(source, code);
  return {
    code,
    render: named && {
      code: named.code,
      line: source.slice(0, named.offset).split("\n").length,
    },
    file: relative(root, story.file).split("\\").join("/"),
    line: story.line,
  };
}
