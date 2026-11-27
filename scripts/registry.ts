import { copyFile, lstat, mkdir, readFile, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

export interface RegistryFile {
  path: string;
  type: string;
  target?: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

export interface RegistryManifest {
  $schema?: string;
  name: string;
  homepage: string;
  items: RegistryItem[];
}

const publicPackages = [
  "meowjsx",
  "meowjsx/runtime",
  "meowjsx/signal",
  "meowjsx/router",
  "meowjsx/i18n",
  "meowjsx/i18n/audit",
  "meowjsx/renderer",
  "meowjsx/jsx-runtime",
  "meowjsx/jsx-dev-runtime",
  "meowjsx/web",
  "meowjsx/json",
  "meowtail",
  "meowtail/components",
  "meowtail/chat",
  "meowtail/icons",
  "meowtail/icons/lucide",
  "meowtail/theme",
  "meowtail/web",
  "meowtail/registry",
  "meowtail/json",
  "meowcss",
  "meowcss/meowjsx",
  "meowcss/web",
  "meowcss/bundle",
];

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function string(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function strings(value: unknown): boolean {
  return Array.isArray(value) && value.every(string);
}

function inside(root: string, path: string): boolean {
  const rel = relative(root, path);
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

function safePath(root: string, path: string): string {
  if (isAbsolute(path) || path.split(/[\\/]/).some((part) => part === "..") || path.includes("\\"))
    throw new Error(`Invalid path: ${path}`);
  const result = resolve(root, path);
  if (!inside(root, result)) throw new Error(`Invalid path: ${path}`);
  return result;
}

function checkImports(file: string, source: string, allowed: Set<string>): void {
  // Scan declarations without stripping type-only imports, which Bun's import scanner omits.
  const tokens =
    source.match(
      /(?:\/\*[\s\S]*?\*\/|\/\/[^\n\r]*|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|[A-Za-z_$][\w$]*|[^\s])/g,
    ) ?? [];
  const filtered = tokens.filter((token) => !token.startsWith("//") && !token.startsWith("/*"));
  const check = (literal: string) => {
    const specifier = literal.slice(1, -1);
    const local = /^\.\/[^/\\]+$/.test(specifier) && specifier !== "./..";
    if (specifier.includes("\\") || (!local && !allowed.has(specifier)))
      throw new Error(`Disallowed import ${specifier} in ${file}`);
  };
  for (let index = 0; index < filtered.length; index++) {
    const token = filtered[index];
    if (token !== "import" && token !== "export") continue;
    const next = filtered[index + 1];
    if (token === "import" && next && (next.startsWith('"') || next.startsWith("'"))) {
      check(next);
      continue;
    }
    if (
      token === "import" &&
      next === "(" &&
      filtered[index + 2] &&
      /^["']/.test(filtered[index + 2]!)
    ) {
      check(filtered[index + 2]!);
      continue;
    }
    for (let cursor = index + 1; cursor < filtered.length; cursor++) {
      const current = filtered[cursor];
      if (current === ";" || current === "import" || current === "export") break;
      if (current === "from" && filtered[cursor + 1] && /^["']/.test(filtered[cursor + 1]!)) {
        check(filtered[cursor + 1]!);
        break;
      }
    }
  }
}

export async function validateRegistry(
  registryPath: string,
  allowedPublicPackages: readonly string[] = publicPackages,
): Promise<RegistryManifest> {
  const data: unknown = JSON.parse(await readFile(registryPath, "utf8"));
  if (
    !object(data) ||
    !string(data.name) ||
    !string(data.homepage) ||
    !Array.isArray(data.items) ||
    (data.$schema !== undefined && !string(data.$schema))
  )
    throw new Error("Invalid registry manifest");
  const root = await realpath(dirname(resolve(registryPath)));
  const names = new Set<string>();
  for (const item of data.items) {
    if (
      !object(item) ||
      !string(item.name) ||
      !string(item.type) ||
      !Array.isArray(item.files) ||
      item.files.length === 0
    )
      throw new Error("Invalid registry item");
    if (names.has(item.name)) throw new Error(`Duplicate item: ${item.name}`);
    names.add(item.name);
    for (const key of ["title", "description"])
      if (item[key] !== undefined && !string(item[key]))
        throw new Error(`Invalid ${key} in ${item.name}`);
    for (const key of ["dependencies", "devDependencies", "registryDependencies"])
      if (item[key] !== undefined && !strings(item[key]))
        throw new Error(`Invalid ${key} in ${item.name}`);
    for (const file of item.files) {
      if (
        !object(file) ||
        !string(file.path) ||
        !string(file.type) ||
        (file.target !== undefined && !string(file.target))
      )
        throw new Error(`Invalid file in ${item.name}`);
      if (file.target !== undefined) safePath(root, file.target as string);
      const path = safePath(root, file.path);
      const actual = await realpath(path);
      if (!inside(root, actual) || !(await stat(actual)).isFile())
        throw new Error(`Invalid registry file: ${file.path}`);
      if (/\.tsx?$/.test(path))
        checkImports(path, await readFile(path, "utf8"), new Set(allowedPublicPackages));
    }
  }
  return data as unknown as RegistryManifest;
}

export async function listRegistryItems(
  registryPath: string,
): Promise<Pick<RegistryItem, "name" | "type" | "title" | "description">[]> {
  const registry = await validateRegistry(registryPath);
  return registry.items.map(({ name, type, title, description }) => ({
    name,
    type,
    title,
    description,
  }));
}

export async function installRegistryItem({
  itemName,
  targetDir,
  registryPath,
}: {
  itemName: string;
  targetDir: string;
  registryPath: string;
}): Promise<{ installed: string[]; files: string[] }> {
  const registry = await validateRegistry(registryPath);
  const items = new Map(registry.items.map((item) => [item.name, item]));
  const installed: string[] = [];
  const visiting = new Set<string>();
  const ordered: RegistryItem[] = [];
  const visit = (name: string) => {
    if (installed.includes(name)) return;
    if (visiting.has(name)) throw new Error(`Circular registry dependency: ${name}`);
    const item = items.get(name);
    if (!item) throw new Error(`Unknown registry item: ${name}`);
    visiting.add(name);
    for (const dependency of item.registryDependencies ?? []) visit(dependency);
    visiting.delete(name);
    installed.push(name);
    ordered.push(item);
  };
  visit(itemName);
  const targetRoot = resolve(targetDir);
  const root = dirname(resolve(registryPath));
  const copies = ordered.flatMap((item) =>
    item.files.map((file) => ({
      source: safePath(root, file.path),
      target: safePath(targetRoot, file.target ?? file.path),
    })),
  );
  const targets = new Set<string>();
  for (const { target } of copies) {
    if (targets.has(target)) throw new Error(`Duplicate target: ${target}`);
    targets.add(target);
    let current = target;
    while (inside(targetRoot, current)) {
      try {
        const info = await lstat(current);
        if (current === target || info.isSymbolicLink() || !info.isDirectory())
          throw new Error(`Target already exists or is unsafe: ${current}`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      current = dirname(current);
    }
  }
  for (const { source, target } of copies) {
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target, 1);
  }
  return { installed, files: copies.map(({ target }) => target) };
}
