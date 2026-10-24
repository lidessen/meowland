import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** One workspace package the site documents. */
export interface DocsPackage {
  /** The npm name. */
  name: string;
  /** The name as the site titles the page. */
  title: string;
  /** The version declared by the workspace manifest, which may be an unpublished candidate. */
  version: string;
  /** The one-line summary the site shows. */
  summary: string;
  /** Site path without a leading slash. */
  path: string;
}

/** The packages the site covers, in the order the site lists them. */
export const PACKAGE_NAMES = [
  "meowjsx",
  "meowcss",
  "meowtail",
  "meowslides",
  "meowbook",
  "meowpress",
] as const;

/** The one-line summary of each package. */
const SUMMARIES: Record<string, string> = {
  meowjsx:
    "The rendering runtime: a tree of nodes, signals bound to the DOM, and one isolated runtime per application.",
  meowcss:
    "Tokens, options and CSS generation: declared values, one stylesheet, and the style axes a component may vary along.",
  meowtail:
    "The component library: cross-application components, semantic layout, the standard theme and the complete Assistant.",
  meowslides:
    "The presentation engine: the player, pages and steps, reveals, media, presentation layouts and themes.",
  meowbook:
    "The component workbench: a story index, an isolated canvas and an ordinary browser test entry point.",
  meowpress:
    "The site generator: content reading, page rendering, themes, assets and the build pipeline for static sites.",
};

interface PackageManifest {
  name?: string;
  version?: string;
  description?: string;
}

/** Read the documented packages from the workspace manifests. */
export async function readPackages(root: string): Promise<DocsPackage[]> {
  const packages: DocsPackage[] = [];
  for (const name of PACKAGE_NAMES) {
    const file = join(root, "packages", name, "package.json");
    let manifest: PackageManifest = {};
    try {
      manifest = JSON.parse(await readFile(file, "utf8")) as PackageManifest;
    } catch {
      // A package that is not in the workspace yet still gets a page.
    }
    packages.push({
      name: manifest.name ?? name,
      title: name,
      version: manifest.version ?? "unpublished",
      summary: SUMMARIES[name] ?? manifest.description ?? "",
      path: `packages/${name}`,
    });
  }
  return packages;
}
