import { readdir, readFile } from "node:fs/promises";
import { extname, posix, relative, resolve, sep } from "node:path";
import { fromMarkdown } from "mdast-util-from-markdown";
import { parse as parseYaml } from "yaml";

export interface SkillFile {
  path: string;
  role: string;
  detail: string;
  content: string;
  reachable: boolean;
  depth?: number;
}

export type SkillReferenceKind = "external" | "asset" | "missing";

export interface SkillReferenceNode {
  path: string;
  role: string;
  detail: string;
  kind: SkillReferenceKind;
}

export interface SkillRelation {
  source: string;
  target: string;
  label: string;
  contexts: SkillLinkContext[];
}

export interface SkillLinkContext {
  section: string;
  line?: number;
  linkText: string;
}

export type SkillScope = "public" | "project";

export interface Skill {
  slug: string;
  name: string;
  description: string;
  scope: SkillScope;
  sourceBasePath: string;
  files: SkillFile[];
  externalNodes: SkillReferenceNode[];
  relations: SkillRelation[];
}

interface MarkdownNode {
  type?: string;
  value?: string;
  url?: string;
  identifier?: string;
  depth?: number;
  position?: { start?: { line?: number } };
  children?: MarkdownNode[];
}

interface MarkdownLink {
  label: string;
  url: string;
  section: string;
  line?: number;
}

interface ParsedSkillDocument {
  metadata: Record<string, unknown>;
  body: string;
}

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseDocument(source: string): ParsedSkillDocument {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return { metadata: {}, body: source };
  const parsed = parseYaml(match[1]);
  return {
    metadata: isRecord(parsed) ? parsed : {},
    body: source.slice(match[0].length),
  };
}

function nodeText(node: MarkdownNode): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(nodeText).join("");
}

function markdownLinks(source: string): MarkdownLink[] {
  const tree = fromMarkdown(source) as MarkdownNode;
  const definitions = new Map<string, string>();

  const collectDefinitions = (node: MarkdownNode): void => {
    if (node.type === "definition" && node.identifier && node.url) {
      definitions.set(node.identifier.toLowerCase(), node.url);
    }
    node.children?.forEach(collectDefinitions);
  };
  collectDefinitions(tree);

  const links: MarkdownLink[] = [];
  const collectLinks = (node: MarkdownNode, section: string): void => {
    let url: string | undefined;
    if (node.type === "link") url = node.url;
    if (node.type === "linkReference" && node.identifier) {
      url = definitions.get(node.identifier.toLowerCase());
    }
    if (url) {
      links.push({
        label: nodeText(node).replaceAll(/\s+/g, " ").trim() || "打开",
        url,
        section,
        line: node.position?.start?.line,
      });
      return;
    }
    node.children?.forEach((child) => collectLinks(child, section));
  };
  let section = "文档开头";
  for (const node of tree.children ?? []) {
    if (node.type === "heading") {
      section = nodeText(node).replaceAll(/\s+/g, " ").trim() || section;
      continue;
    }
    collectLinks(node, section);
  }
  return links;
}

function plainText(source: string): string {
  return source
    .replaceAll(/<!--[^]*?-->/g, "")
    .replaceAll(/^#{1,6}\s+/gm, "")
    .replaceAll(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replaceAll(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replaceAll(/[`*_~]/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

function inferredDescription(body: string): string {
  const withoutHeading = body.replace(/^\s*#\s+.+?(?:\r?\n|$)+/, "");
  const paragraph = withoutHeading
    .split(/\r?\n\s*\r?\n/)
    .map(plainText)
    .find(Boolean);
  return (paragraph ?? "一个可以交给 Agent 使用的 Skill。").slice(0, 180);
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    else files.push(path);
  }
  return files;
}

function portablePath(path: string, root: string): string {
  return relative(root, path).split(sep).join("/");
}

function withoutQueryOrHash(url: string): string {
  return url.split(/[?#]/, 1)[0] ?? "";
}

function isExternalUrl(url: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url);
}

function externalDetail(url: string): string {
  try {
    const parsed = new URL(url);
    return `Agent 会离开 Skill，继续读取 ${parsed.hostname}。`;
  } catch {
    return "指向 Skill 目录之外的输入或资料。";
  }
}

function relationLabel(label: string, target: string): string {
  const targetName = target.endsWith("/") ? target : (target.split("/").at(-1) ?? target);
  if (label === target || label === targetName) return "引用";
  return label.length > 16 ? `${label.slice(0, 15)}…` : label;
}

function compactGraphLabel(label: string): string {
  return label.length > 16 ? `${label.slice(0, 15)}…` : label;
}

function resolveLocalTarget(
  source: string,
  rawUrl: string,
  allFiles: Set<string>,
  markdownFiles: Set<string>,
): { path: string; kind: "markdown" | "asset" | "outside" | "missing" } | undefined {
  const cleanUrl = withoutQueryOrHash(rawUrl);
  if (!cleanUrl) return undefined;

  let decoded: string;
  try {
    decoded = decodeURIComponent(cleanUrl);
  } catch {
    decoded = cleanUrl;
  }

  const candidate = decoded.startsWith("/")
    ? posix.normalize(decoded)
    : posix.normalize(posix.join(posix.dirname(source), decoded));
  if (candidate === source) return undefined;
  if (candidate.startsWith("../") || candidate === ".." || candidate.startsWith("/")) {
    return { path: candidate, kind: "outside" };
  }

  const variants = [candidate];
  if (!posix.extname(candidate))
    variants.push(`${candidate}.md`, posix.join(candidate, "README.md"));
  if (candidate.endsWith("/")) variants.push(posix.join(candidate, "README.md"));

  const markdownTarget = variants.find((path) => markdownFiles.has(path));
  if (markdownTarget) return { path: markdownTarget, kind: "markdown" };
  const assetTarget = variants.find((path) => allFiles.has(path));
  if (assetTarget) return { path: assetTarget, kind: "asset" };
  return { path: candidate, kind: "missing" };
}

function readingDepths(files: string[], relations: SkillRelation[]): Map<string, number> {
  const fileSet = new Set(files);
  const next = new Map<string, string[]>();
  for (const relation of relations) {
    if (!fileSet.has(relation.source) || !fileSet.has(relation.target)) continue;
    const targets = next.get(relation.source) ?? [];
    targets.push(relation.target);
    next.set(relation.source, targets);
  }

  const depths = new Map<string, number>();
  if (!fileSet.has("SKILL.md")) return depths;
  depths.set("SKILL.md", 0);
  const queue = ["SKILL.md"];
  while (queue.length > 0) {
    const source = queue.shift()!;
    const depth = depths.get(source)!;
    for (const target of next.get(source) ?? []) {
      if (depths.has(target)) continue;
      depths.set(target, depth + 1);
      queue.push(target);
    }
  }
  return depths;
}

async function loadSkill(
  directory: string,
  sourceBasePath: string,
  scope: SkillScope,
): Promise<Skill | undefined> {
  const sourcePaths = await collectFiles(directory);
  const allFiles = new Set(sourcePaths.map((path) => portablePath(path, directory)));
  const markdownPaths = [...allFiles]
    .filter((path) => MARKDOWN_EXTENSIONS.has(extname(path).toLowerCase()))
    .sort((left, right) => {
      if (left === "SKILL.md") return -1;
      if (right === "SKILL.md") return 1;
      return left.localeCompare(right);
    });
  if (!markdownPaths.includes("SKILL.md")) return undefined;

  const documents = new Map<string, ParsedSkillDocument>();
  for (const path of markdownPaths) {
    documents.set(path, parseDocument(await readFile(resolve(directory, path), "utf8")));
  }

  const externalNodes = new Map<string, SkillReferenceNode>();
  const relationContexts = new Map<string, SkillLinkContext[]>();
  for (const source of markdownPaths) {
    const document = documents.get(source)!;
    for (const link of markdownLinks(document.body)) {
      let target: string;
      if (isExternalUrl(link.url)) {
        target = link.url;
        externalNodes.set(target, {
          path: target,
          role: "外部链接",
          detail: externalDetail(target),
          kind: "external",
        });
      } else {
        const resolved = resolveLocalTarget(source, link.url, allFiles, new Set(markdownPaths));
        if (!resolved) continue;
        target = resolved.path;
        if (resolved.kind !== "markdown") {
          externalNodes.set(target, {
            path: target,
            role:
              resolved.kind === "asset"
                ? "本地资源"
                : resolved.kind === "outside"
                  ? "Skill 外部"
                  : "缺失引用",
            detail:
              resolved.kind === "asset"
                ? "Markdown 明确链接到这个非文本资源。"
                : resolved.kind === "outside"
                  ? "链接指向 Skill 目录之外，Agent 会离开当前 Skill 继续读取。"
                  : "Markdown 中存在此链接，但 Skill 目录内没有对应文件。",
            kind: resolved.kind === "outside" ? "external" : resolved.kind,
          });
        }
      }
      const key = `${source}\u0000${target}`;
      const contexts = relationContexts.get(key) ?? [];
      if (
        !contexts.some(
          (context) =>
            context.section === link.section &&
            context.line === link.line &&
            context.linkText === link.label,
        )
      ) {
        contexts.push({ section: link.section, line: link.line, linkText: link.label });
      }
      relationContexts.set(key, contexts);
    }
  }

  const relations = [...relationContexts].map(([key, contexts]) => {
    const [source, target] = key.split("\u0000");
    const sections = [...new Set(contexts.map((context) => context.section))];
    const labels = [...new Set(contexts.map((context) => relationLabel(context.linkText, target)))];
    return {
      source,
      target,
      label: compactGraphLabel(
        sections[0] === "文档开头" ? labels.join(" / ") : sections.join(" / "),
      ),
      contexts,
    };
  });
  const depths = readingDepths(markdownPaths, relations);
  const entry = documents.get("SKILL.md")!;

  return {
    slug: directory.split(sep).at(-1)!,
    name: textValue(entry.metadata.name) ?? directory.split(sep).at(-1)!,
    description:
      textValue(entry.metadata["short-description"]) ??
      textValue(
        (entry.metadata.metadata as Record<string, unknown> | undefined)?.["short-description"],
      ) ??
      inferredDescription(entry.body),
    scope,
    sourceBasePath,
    files: markdownPaths.map((path) => {
      const depth = depths.get(path);
      const reachable = depth !== undefined;
      return {
        path,
        role: path === "SKILL.md" ? "入口" : reachable ? `${depth} 级引用` : "未被引用",
        detail:
          path === "SKILL.md"
            ? "Agent 从这里开始读取这个 Skill。"
            : reachable
              ? `从 SKILL.md 经过 ${depth} 次链接可以读到这里。`
              : "不在从 SKILL.md 出发的链接链路中，Agent 不会自然读到这里。",
        content: documents.get(path)!.body,
        reachable,
        depth,
      };
    }),
    externalNodes: [...externalNodes.values()],
    relations,
  };
}

export interface LoadSkillsOptions {
  projectRootDirectory?: string;
}

async function skillDirectories(
  rootDirectory: string,
  options: LoadSkillsOptions = {},
): Promise<{ root: string; base: string; scope: SkillScope }[]> {
  const projectRootDirectory = options.projectRootDirectory ?? rootDirectory;
  const candidates = [
    {
      root: resolve(rootDirectory, "skills"),
      base: "skills",
      scope: "public" as const,
    },
    {
      root: resolve(projectRootDirectory, ".agents/skills"),
      base: ".agents/skills",
      scope: "project" as const,
    },
  ];
  const directories: { root: string; base: string; scope: SkillScope }[] = [];
  for (const candidate of candidates) {
    try {
      const entries = await readdir(candidate.root, { withFileTypes: true });
      directories.push(
        ...entries
          .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
          .map((entry) => ({
            root: resolve(candidate.root, entry.name),
            base: candidate.base,
            scope: candidate.scope,
          })),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return directories;
}

export async function loadSkills(
  rootDirectory: string,
  options: LoadSkillsOptions = {},
): Promise<Skill[]> {
  const directories = await skillDirectories(rootDirectory, options);
  const skills = await Promise.all(
    directories.map(({ root, base, scope }) =>
      loadSkill(root, `${base}/${root.split(sep).at(-1)!}`, scope),
    ),
  );
  return skills
    .filter((skill): skill is Skill => skill !== undefined)
    .sort((a, b) => {
      if (a.scope !== b.scope) return a.scope === "public" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}
