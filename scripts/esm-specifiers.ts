import { stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

async function existing(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

export async function rewriteRelativeImports(file: string, original: string): Promise<string> {
  const pattern = /((?:from\s*|import\s*|import\s*\(\s*)["'])(\.[^"']+)(["'])/g;
  let updated = original;
  for (const match of original.matchAll(pattern)) {
    const specifier = match[2]!;
    let replacement = specifier.replace(/\.(tsx?|jsx)$/, ".js");
    if (!replacement.endsWith(".js") && !(await existing(resolve(dirname(file), replacement)))) {
      if (await existing(resolve(dirname(file), replacement + ".js"))) replacement += ".js";
      else if (await existing(resolve(dirname(file), replacement, "index.js")))
        replacement += "/index.js";
    }
    if (replacement !== specifier)
      updated = updated.replace(match[0], match[1] + replacement + match[3]);
  }
  return updated;
}
