import { copyFile } from "node:fs/promises";
import { join } from "node:path";

/** Copy the site icon for both documentation pages and the gallery's fallback request. */
export async function writeFavicon(outputDirectory: string): Promise<void> {
  await copyFile(join(import.meta.dir, "favicon.ico"), join(outputDirectory, "favicon.ico"));
}
