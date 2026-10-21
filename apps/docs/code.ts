import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import type { StoryEntry } from "meowbook";

/** The source of one story, ready to show under its preview. */
export interface StorySource {
  /** The statement that defines the story. */
  code: string;
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
      index += 1;
      continue;
    }
    if (character === ";" && depth === 0) return index + 1;
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
  return {
    code,
    file: relative(root, story.file).split("\\").join("/"),
    line: story.line,
  };
}
