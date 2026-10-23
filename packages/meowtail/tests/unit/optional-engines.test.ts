import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/*
 * Code highlighting (Shiki) and diagrams (Pele) are optional engines: only the component that
 * draws with one loads it, and only through a dynamic import. The theme, the registry and the
 * package root must never reach them through a static value import, or every host bundles them.
 */
const engines = /^(?:shiki|@shikijs\/|pele)(?:\/|$)/;
const source = resolve(import.meta.dir, "../../src");

function resolveLocal(from: string, specifier: string): string | undefined {
  const base = resolve(dirname(from), specifier);
  const candidates = [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`, base];
  return candidates.find((candidate) => /\.tsx?$/.test(candidate) && existsSync(candidate));
}

/** Every module a file reaches through static, non-type imports and re-exports. */
function staticGraph(entry: string): { files: Set<string>; engines: string[] } {
  const files = new Set<string>();
  const found: string[] = [];
  const queue = [entry];
  while (queue.length) {
    const file = queue.pop()!;
    if (files.has(file)) continue;
    files.add(file);
    const text = readFileSync(file, "utf8");
    const statements = text.matchAll(/^\s*(import|export)\s+(type\s+)?[^;]*?from\s+"([^"]+)"/gms);
    const bare = text.matchAll(/^\s*import\s+"([^"]+)"/gm);
    const specifiers = [
      ...[...statements].filter((match) => !match[2]).map((match) => match[3]!),
      ...[...bare].map((match) => match[1]!),
    ];
    for (const specifier of specifiers) {
      if (engines.test(specifier)) found.push(`${file.slice(source.length + 1)} -> ${specifier}`);
      if (!specifier.startsWith(".")) continue;
      const next = resolveLocal(file, specifier);
      if (next) queue.push(next);
    }
  }
  return { files, engines: found };
}

for (const entry of ["theme/index.ts", "registry/index.ts", "index.ts"]) {
  test(`${entry} reaches no optional engine through a static import`, () => {
    const graph = staticGraph(resolve(source, entry));
    expect(graph.files.size).toBeGreaterThan(5);
    expect(graph.engines).toEqual([]);
  });
}
