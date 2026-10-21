import { rm, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const SCRIPT_PATTERN = /<script type="module"[^>]*\ssrc="([^"]+)"[^>]*><\/script>/g;

/**
 * Remove the empty module chunks Bun's HTML bundler writes for every HTML
 * entry. A page without a script still gets one empty chunk and a script tag
 * pointing at it; the site has no client runtime, so both are dead weight.
 */
export async function removeEmptyScriptChunks(directory: string): Promise<number> {
  const glob = new Bun.Glob("**/*.html");
  const removed = new Set<string>();
  let touched = 0;
  for await (const entry of glob.scan({ cwd: directory })) {
    const file = resolve(directory, entry);
    const html = await Bun.file(file).text();
    if (!html.includes('type="module"')) continue;
    const empty = new Set<string>();
    for (const match of html.matchAll(SCRIPT_PATTERN)) {
      const target = resolve(dirname(file), match[1]);
      try {
        const info = await stat(target);
        if (info.isFile() && info.size === 0) empty.add(target);
      } catch {
        // A script that is already gone is not a reason to stop.
      }
    }
    if (!empty.size) continue;
    const updated = html.replace(SCRIPT_PATTERN, (whole, src: string) =>
      empty.has(resolve(dirname(file), src)) ? "" : whole,
    );
    await Bun.write(file, updated);
    for (const target of empty) removed.add(target);
    touched += 1;
  }
  for (const target of removed) await rm(target, { force: true });
  return touched;
}
