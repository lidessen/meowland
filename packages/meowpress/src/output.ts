import { lstat, mkdtemp, readdir, realpath, rename, rm } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import type { ResolvedSiteConfig } from "./build";
import { normalizeContentSources } from "./content";

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === "ENOENT";
}

async function existingPath(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    if (!isMissing(error)) throw error;
    return undefined;
  }
}

/** Resolve symlinked ancestors even if the output directory has not been created yet. */
async function filesystemPath(path: string): Promise<string> {
  try {
    return await realpath(path);
  } catch (error) {
    if (!isMissing(error)) throw error;
    return join(await filesystemPath(dirname(path)), basename(path));
  }
}

function containsPath(directory: string, path: string): boolean {
  const fromDirectory = relative(directory, path);
  return (
    !isAbsolute(fromDirectory) && fromDirectory !== ".." && !fromDirectory.startsWith(`..${sep}`)
  );
}

export async function validateOutputDirectory(config: ResolvedSiteConfig): Promise<void> {
  const project = process.cwd();
  const sources = normalizeContentSources(config.content);
  const sourceRoots = [
    project,
    config.skillsDirectory,
    ...sources.map((source) => source.directory),
  ];
  if (config.projectRootDirectory) sourceRoots.push(config.projectRootDirectory);
  const inputs = sources.flatMap((source) => [
    resolve(source.directory, source.postsDirectory ?? "posts"),
    resolve(source.directory, source.thoughtsDirectory ?? "thoughts"),
    resolve(source.directory, source.assetsDirectory ?? "assets"),
    resolve(source.directory, source.postAssetsDirectory ?? "posts/assets"),
  ]);
  inputs.push(
    join(config.skillsDirectory, "skills"),
    join(project, ".agents"),
    join(project, ".git"),
  );
  if (config.includeProjectSkills)
    inputs.push(join(config.projectRootDirectory ?? config.skillsDirectory, ".agents/skills"));

  const [output, roots, directories] = await Promise.all([
    filesystemPath(config.outputDirectory),
    Promise.all(sourceRoots.map(filesystemPath)),
    Promise.all(inputs.map(filesystemPath)),
  ]);
  if (
    roots.some((root) => containsPath(output, root)) ||
    directories.some((input) => containsPath(output, input) || containsPath(input, output))
  ) {
    throw new Error(`Output directory overlaps project files: ${config.outputDirectory}`);
  }
  const info = await existingPath(config.outputDirectory);
  if (info && !info.isDirectory())
    throw new Error(`Site output must be a directory: ${config.outputDirectory}`);
}

/** Both agent indexes have been emitted by Meowpress since before the conventional CLI. */
export async function hasBuiltSite(directory: string): Promise<boolean> {
  const markers = await Promise.all(
    ["agents.md", "llms.txt"].map((name) => existingPath(join(directory, name))),
  );
  return markers.every((marker) => marker?.isFile());
}

export async function validateBuildDestination(directory: string): Promise<void> {
  if (
    directory === resolve("dist") &&
    (await existingPath(directory)) &&
    (await readdir(directory)).length &&
    !(await hasBuiltSite(directory))
  ) {
    throw new Error(
      `Refusing to replace existing files in ${directory}. Move them or choose another outputDirectory.`,
    );
  }
}

/** Move a complete build into place and preserve any previous build if that move fails. */
export async function publishSite(staged: string, destination: string): Promise<void> {
  const existing = await existingPath(destination);
  if (!existing) {
    await rename(staged, destination);
    return;
  }
  if (!existing.isDirectory()) throw new Error(`Site output must be a directory: ${destination}`);

  const backupDirectory = await mkdtemp(join(dirname(destination), ".meowpress-previous-"));
  const backup = join(backupDirectory, basename(destination));
  let restoreFailed = false;
  try {
    await rename(destination, backup);
    try {
      await rename(staged, destination);
    } catch (error) {
      try {
        await rename(backup, destination);
      } catch {
        restoreFailed = true;
        throw new Error(`Could not replace ${destination}. Previous output remains in ${backup}.`, {
          cause: error,
        });
      }
      throw error;
    }
  } finally {
    if (!restoreFailed) await rm(backupDirectory, { recursive: true, force: true });
  }
}
