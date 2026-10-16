import { parse } from "@babel/parser";
import { readFile, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import type { StoryConfig, StoryEntry } from "../types";

export interface GeneratedInput {
  props: Record<string, unknown>;
  component: string;
}
export interface DiscoveredStory extends StoryEntry {
  generated?: GeneratedInput;
}
export interface TemporaryStory {
  component: string;
  exportName: string;
  propsFile?: string;
}

export function insideRoot(root: string, path: string): string {
  const result = resolve(root, path);
  const rel = relative(resolve(root), result);
  if (rel === ".." || rel.startsWith("../") || isAbsolute(rel)) {
    throw new Error(`Path is outside configured root: ${path}`);
  }
  return result;
}

export async function sourcePath(root: string, path: string): Promise<string> {
  return insideRoot(await realpath(root), await realpath(insideRoot(root, path)));
}

function fail(file: string, line: number, message: string): never {
  throw new Error(`${file}:${line}: ${message}`);
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function annotation(
  value: string,
  file: string,
  line: number,
): {
  id: string;
  title: string;
  component?: string;
  variant?: string;
  groupOrder?: number;
  props: Record<string, unknown>;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    fail(file, line, "@story must contain a JSON object");
  }
  if (
    !object(parsed) ||
    Object.keys(parsed).some(
      (key) => !["id", "title", "component", "variant", "groupOrder", "props"].includes(key),
    )
  ) {
    fail(file, line, "@story only supports id, title, component, variant, groupOrder and props");
  }
  if (typeof parsed.id !== "string" || !parsed.id.trim())
    fail(file, line, "@story requires a nonempty id");
  if (parsed.title !== undefined && typeof parsed.title !== "string")
    fail(file, line, "title must be a string");
  for (const key of ["component", "variant"] as const)
    if (parsed[key] !== undefined && typeof parsed[key] !== "string")
      fail(file, line, `${key} must be a string`);
  if (
    parsed.groupOrder !== undefined &&
    (typeof parsed.groupOrder !== "number" || !Number.isFinite(parsed.groupOrder))
  )
    fail(file, line, "groupOrder must be a finite number");
  if (parsed.props !== undefined && !object(parsed.props))
    fail(file, line, "props must be a JSON object");
  return {
    id: parsed.id,
    title: (parsed.title as string | undefined) ?? parsed.id,
    ...(parsed.component !== undefined ? { component: parsed.component as string } : {}),
    ...(parsed.variant !== undefined ? { variant: parsed.variant as string } : {}),
    ...(parsed.groupOrder !== undefined ? { groupOrder: parsed.groupOrder as number } : {}),
    props: (parsed.props as Record<string, unknown> | undefined) ?? {},
  };
}

export function discoverSource(file: string, text: string): DiscoveredStory[] {
  const ast = parse(text, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
    attachComment: true,
  });
  const names = new Set<string>();
  for (const item of ast.program.body) {
    if (item.type !== "ImportDeclaration" || item.source.value !== "meowbook") continue;
    for (const specifier of item.specifiers) {
      if (
        specifier.type === "ImportSpecifier" &&
        specifier.imported.type === "Identifier" &&
        specifier.imported.name === "defineStory"
      )
        names.add(specifier.local.name);
    }
  }
  const result: DiscoveredStory[] = [];
  const handledComments = new Set<object>();
  const acceptedCalls = new Set<object>();
  for (const item of ast.program.body) {
    if (item.type !== "ExportNamedDeclaration" && item.type !== "ExportDefaultDeclaration")
      continue;
    const declaration = item.declaration;
    const comments = [...(item.leadingComments ?? []), ...(declaration?.leadingComments ?? [])];
    for (const comment of comments) {
      if (handledComments.has(comment)) continue;
      handledComments.add(comment);
      if (comment.type !== "CommentBlock" || !comment.value.startsWith("*")) continue;
      const cleaned = comment.value
        .split("\n")
        .map((line) => line.replace(/^\s*\*?\s?/, ""))
        .join("\n");
      const tags = [...cleaned.matchAll(/(?:^|\n)\s*@story\s+([\s\S]*?)(?=\n\s*@\w+|$)/g)];
      if (!tags.length && /(?:^|\n)\s*@story(?:\s|$)/.test(cleaned))
        fail(file, comment.loc?.start.line ?? 1, "@story requires a JSON object");
      if (!tags.length) continue;
      let exportName: string | undefined;
      if (item.type === "ExportNamedDeclaration" && declaration?.type === "FunctionDeclaration")
        exportName = declaration.id?.name;
      if (
        item.type === "ExportNamedDeclaration" &&
        declaration?.type === "VariableDeclaration" &&
        declaration.declarations.length === 1
      ) {
        const name = declaration.declarations[0]?.id;
        if (name?.type === "Identifier") exportName = name.name;
      }
      const line = comment.loc?.start.line ?? 1;
      if (!exportName) fail(file, line, "@story requires one named exported function or variable");
      for (const tag of tags) {
        const offset = (tag.index ?? 0) + tag[0].indexOf("@story");
        const sourceLine = line + cleaned.slice(0, offset).split("\n").length - 1;
        const parsed = annotation(tag[1]!.trim(), file, sourceLine);
        result.push({
          id: parsed.id,
          title: parsed.title,
          ...(parsed.component !== undefined ? { component: parsed.component } : {}),
          ...(parsed.variant !== undefined ? { variant: parsed.variant } : {}),
          ...(parsed.groupOrder !== undefined ? { groupOrder: parsed.groupOrder } : {}),
          file,
          line: sourceLine,
          exportName,
          generated: { component: exportName, props: parsed.props },
        });
      }
    }
    if (item.type !== "ExportNamedDeclaration" || declaration?.type !== "VariableDeclaration")
      continue;
    for (const variable of declaration.declarations) {
      const init = variable.init;
      if (
        init?.type !== "CallExpression" ||
        init.callee.type !== "Identifier" ||
        !names.has(init.callee.name)
      )
        continue;
      acceptedCalls.add(init);
      const line = variable.loc?.start.line ?? 1;
      if (variable.id.type !== "Identifier" || declaration.kind !== "const")
        fail(file, line, "Stories require a named exported const");
      const value = init.arguments[0];
      if (init.arguments.length !== 1 || value?.type !== "ObjectExpression")
        fail(file, line, "defineStory requires a literal object");
      let id: string | undefined;
      let title: string | undefined;
      let group: string | undefined;
      let groupOrder: number | undefined;
      let component: string | undefined;
      let variant: string | undefined;
      let description: string | undefined;
      let covers: string[] | undefined;
      const seen = new Set<string>();
      for (const prop of value.properties) {
        if (prop.type === "SpreadElement")
          fail(file, line, "Story metadata cannot contain spreads");
        if (prop.computed) fail(file, line, "Story metadata cannot contain computed keys");
        const key =
          prop.key.type === "Identifier"
            ? prop.key.name
            : prop.key.type === "StringLiteral"
              ? prop.key.value
              : undefined;
        if (key === "groupOrder") {
          if (seen.has(key)) fail(file, line, "Duplicate groupOrder");
          seen.add(key);
          const expression = prop.type === "ObjectProperty" ? prop.value : undefined;
          const number =
            expression?.type === "NumericLiteral"
              ? expression.value
              : expression?.type === "UnaryExpression" &&
                  ["-", "+"].includes(expression.operator) &&
                  expression.argument.type === "NumericLiteral"
                ? (expression.operator === "-" ? -1 : 1) * expression.argument.value
                : undefined;
          if (number === undefined || !Number.isFinite(number))
            fail(file, line, "groupOrder must be a finite number literal");
          groupOrder = number;
          continue;
        }
        if (key === "description" || key === "covers") {
          // Optional search metadata must not make a valid dynamic story invalid.
          // Only complete literals are indexed; never evaluate identifiers or calls.
          let metadata = prop.type === "ObjectProperty" ? prop.value : undefined;
          while (metadata?.type === "TSAsExpression" || metadata?.type === "TSSatisfiesExpression")
            metadata = metadata.expression;
          if (key === "description")
            description = metadata?.type === "StringLiteral" ? metadata.value : undefined;
          if (key === "covers")
            covers =
              metadata?.type === "ArrayExpression" &&
              metadata.elements.every((item) => item?.type === "StringLiteral")
                ? metadata.elements.map((item) => (item as { value: string }).value)
                : undefined;
          continue;
        }
        if (
          key !== "id" &&
          key !== "title" &&
          key !== "group" &&
          key !== "component" &&
          key !== "variant"
        )
          continue;
        if (seen.has(key)) fail(file, line, `Duplicate ${key}`);
        seen.add(key);
        if (prop.type !== "ObjectProperty" || prop.value.type !== "StringLiteral")
          fail(file, line, `${key} must be a string literal`);
        if (key === "id") id = prop.value.value;
        if (key === "title") title = prop.value.value;
        if (key === "group") group = prop.value.value;
        if (key === "component") component = prop.value.value;
        if (key === "variant") variant = prop.value.value;
      }
      if (!id?.trim()) fail(file, line, "Story requires a nonempty literal id");
      result.push({
        id,
        title: title ?? id,
        group,
        ...(groupOrder !== undefined ? { groupOrder } : {}),
        ...(component !== undefined ? { component } : {}),
        ...(variant !== undefined ? { variant } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(covers !== undefined ? { covers } : {}),
        file,
        exportName: variable.id.name,
        line,
      });
    }
  }
  for (const comment of ast.comments ?? []) {
    if (
      comment.type === "CommentBlock" &&
      /(?:^|\n)\s*\*?\s*@story(?:\s|$)/.test(comment.value) &&
      !handledComments.has(comment)
    ) {
      fail(
        file,
        comment.loc?.start.line ?? 1,
        "@story is not attached to a supported named export",
      );
    }
  }
  // Reject recognized calls that would otherwise disappear from a successful index.
  function inspect(value: unknown): void {
    if (Array.isArray(value)) {
      for (const child of value) inspect(child);
      return;
    }
    if (!object(value)) return;
    if (
      value.type === "CallExpression" &&
      object(value.callee) &&
      value.callee.type === "Identifier" &&
      typeof value.callee.name === "string" &&
      names.has(value.callee.name) &&
      !acceptedCalls.has(value)
    ) {
      const location = value.loc;
      const line =
        object(location) && object(location.start) && typeof location.start.line === "number"
          ? location.start.line
          : 1;
      fail(file, line, "defineStory must initialize a top-level named exported const directly");
    }
    for (const [key, child] of Object.entries(value))
      if (key !== "loc" && key !== "comments" && !key.endsWith("Comments")) inspect(child);
  }
  inspect(ast.program);
  return result;
}

export async function discoverStories(
  config: StoryConfig,
  temporary?: TemporaryStory,
): Promise<DiscoveredStory[]> {
  const files = new Set<string>();
  for (const pattern of config.stories) {
    if (isAbsolute(pattern) || pattern.split("/").includes(".."))
      throw new Error(`Story glob must stay within root: ${pattern}`);
    for await (const path of new Bun.Glob(pattern).scan({ cwd: config.root, onlyFiles: true }))
      files.add(await sourcePath(config.root, path));
  }
  const result: DiscoveredStory[] = [];
  for (const file of [...files].sort())
    result.push(...discoverSource(file, await readFile(file, "utf8")));
  if (temporary) {
    const file = await sourcePath(config.root, temporary.component);
    if (!/^[$A-Z_a-z][$\w]*$/.test(temporary.exportName))
      throw new Error("Temporary component requires a named export");
    const props: unknown = temporary.propsFile
      ? JSON.parse(await readFile(await sourcePath(config.root, temporary.propsFile), "utf8"))
      : {};
    if (!object(props)) throw new Error("Temporary props must be a JSON object");
    result.push({
      id: "temporary/component",
      title: temporary.exportName,
      file,
      exportName: temporary.exportName,
      line: 1,
      generated: { component: temporary.exportName, props },
    });
  }
  const ids = new Set<string>();
  for (const story of result) {
    if (ids.has(story.id)) fail(story.file, story.line, `Duplicate story id: ${story.id}`);
    ids.add(story.id);
  }
  return result;
}
