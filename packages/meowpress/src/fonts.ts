import { mkdir, readFile, writeFile, cp } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * A web font a site loads, as a Fontsource variable package: `family` is the name the theme's
 * stacks use, `package` the npm package with its weight-axis files, and `styles` which of them to
 * load (`italic` loads `wght-italic.css`). The same shape as Meowtail's `ThemeFont`, so a theme's
 * manifest (such as `journalFonts`) can be passed as it is.
 */
export interface SiteFont {
  readonly family: string;
  readonly package: string;
  readonly styles: readonly ("normal" | "italic")[];
}

/** Font files are published here, next to the bundled stylesheet at the output root. */
export const FONT_DIRECTORY = "fonts";

/** The bundler leaves these references alone; the build copies the files itself. */
export const FONT_EXTERNAL = `./${FONT_DIRECTORY}/*`;

/**
 * Resolve a package file from the site first (where a host installs its theme's fonts), then from
 * this package (which carries the default Geist).
 */
function resolveFontFile(specifier: string): string {
  for (const from of [process.cwd(), dirname(fileURLToPath(import.meta.url))]) {
    try {
      return Bun.resolveSync(specifier, from);
    } catch {
      // Try the next root.
    }
  }
  throw new Error(`Cannot resolve the font file ${specifier}; install its package in the site`);
}

const contentHash = (bytes: Uint8Array) =>
  new Bun.CryptoHasher("sha256").update(bytes).digest("hex").slice(0, 8);

/**
 * Publish each font's files into `<output>/fonts/` with a content hash and its license into
 * `<output>/licenses/`, and return the `@font-face` rules that reference them. Each subset keeps
 * its `unicode-range`, so a browser fetches only the files a page's text and families use.
 */
export async function publishFonts(
  fonts: readonly SiteFont[],
  outputDirectory: string,
): Promise<string> {
  if (!fonts.length) return "";
  const fontDirectory = join(outputDirectory, FONT_DIRECTORY);
  const licenseDirectory = join(outputDirectory, "licenses");
  await mkdir(fontDirectory, { recursive: true });
  await mkdir(licenseDirectory, { recursive: true });
  const rules: string[] = [];
  for (const font of fonts) {
    for (const style of font.styles) {
      const sheet = resolveFontFile(
        `${font.package}/${style === "italic" ? "wght-italic" : "wght"}.css`,
      );
      const source = await readFile(sheet, "utf8");
      const files = new Map<string, string>();
      for (const [, path] of source.matchAll(/url\(\.\/(files\/[^)]+\.woff2)\)/g)) {
        if (files.has(path!)) continue;
        const bytes = await readFile(join(dirname(sheet), path!));
        const name = `${basename(path!, ".woff2")}-${contentHash(bytes)}.woff2`;
        await writeFile(join(fontDirectory, name), bytes);
        files.set(path!, name);
      }
      rules.push(
        source.replace(
          /url\(\.\/(files\/[^)]+\.woff2)\)/g,
          (_match, path: string) => `url(./${FONT_DIRECTORY}/${files.get(path)})`,
        ),
      );
    }
    const license = resolveFontFile(`${font.package}/LICENSE`);
    await cp(license, join(licenseDirectory, `${font.package.split("/").pop()}-OFL.txt`));
  }
  return rules.join("\n");
}
