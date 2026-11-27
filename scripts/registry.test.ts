import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  installRegistryItem,
  listRegistryItems,
  validateRegistry,
  type RegistryManifest,
} from "./registry";

const repo = resolve(import.meta.dir, "..");

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "meowland-registry-"));
  const registryPath = join(directory, "registry.json");
  const registry: RegistryManifest = {
    name: "test",
    homepage: "https://example.com",
    items: [
      {
        name: "shared",
        type: "registry:lib",
        files: [{ path: "shared.ts", type: "registry:lib", target: "src/shared.ts" }],
      },
      {
        name: "block",
        type: "registry:block",
        registryDependencies: ["shared"],
        files: [{ path: "block.ts", type: "registry:block", target: "src/block.ts" }],
      },
    ],
  };
  await writeFile(registryPath, JSON.stringify(registry));
  await writeFile(join(directory, "shared.ts"), 'export { signal } from "meowjsx/signal";');
  await writeFile(
    join(directory, "block.ts"),
    'import { signal } from "./shared"; import type { Signal } from "meowjsx/signal"; export const value: Signal<number> = signal(1);',
  );
  return { directory, registryPath, registry };
}

test("validates public imports and rejects private imports and missing files", async () => {
  const { directory, registryPath, registry } = await fixture();
  try {
    expect((await validateRegistry(registryPath)).items).toHaveLength(2);
    expect((await listRegistryItems(registryPath)).map((item) => item.name)).toEqual([
      "shared",
      "block",
    ]);
    for (const source of ['import "../../src/private";', 'export * from "meowtail/src/private";']) {
      await writeFile(join(directory, "block.ts"), source);
      await expect(validateRegistry(registryPath)).rejects.toThrow("Disallowed import");
    }
    await writeFile(join(directory, "block.ts"), "export {};");
    registry.items[1]!.files[0]!.path = "missing.ts";
    await writeFile(registryPath, JSON.stringify(registry));
    await expect(validateRegistry(registryPath)).rejects.toThrow();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("installs dependencies in a fresh app and typechecks public package imports", async () => {
  const { directory, registryPath } = await fixture();
  const app = await mkdtemp(join(tmpdir(), "meowland-app-"));
  try {
    const result = await installRegistryItem({ itemName: "block", targetDir: app, registryPath });
    expect(result.installed).toEqual(["shared", "block"]);
    expect(result.files).toEqual([join(app, "src/shared.ts"), join(app, "src/block.ts")]);
    expect(await readFile(join(app, "src/block.ts"), "utf8")).toContain('"meowjsx/signal"');
    await expect(
      installRegistryItem({ itemName: "block", targetDir: app, registryPath }),
    ).rejects.toThrow("Target already exists");
    await mkdir(join(app, "node_modules"));
    const packageRoot = resolve(repo, "node_modules/meowjsx");
    await symlink(packageRoot, join(app, "node_modules/meowjsx"), "dir");
    await writeFile(
      join(app, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["src"],
      }),
    );
    const process = Bun.spawn(
      ["bun", join(repo, "node_modules/typescript/bin/tsc"), "-p", join(app, "tsconfig.json")],
      { stdout: "pipe", stderr: "pipe" },
    );
    const output =
      (await new Response(process.stdout).text()) + (await new Response(process.stderr).text());
    expect({ code: await process.exited, output }).toEqual({ code: 0, output: "" });
  } finally {
    await rm(directory, { recursive: true, force: true });
    await rm(app, { recursive: true, force: true });
  }
});

test("CLI lists, validates and adds an item", async () => {
  const { directory, registryPath } = await fixture();
  const app = join(directory, "app");
  try {
    for (const args of [["list"], ["validate"], ["add", "block", "--target", app]]) {
      const process = Bun.spawn(
        ["bun", join(repo, "scripts/meowland.ts"), ...args, "--registry", registryPath],
        { stdout: "pipe", stderr: "pipe" },
      );
      const output = await new Response(process.stdout).text();
      const error = await new Response(process.stderr).text();
      expect({ code: await process.exited, error }).toEqual({ code: 0, error: "" });
      expect(output).toContain(args[0] === "validate" ? "Valid registry" : "block");
    }
    await access(join(app, "src/block.ts"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects duplicate items, unsafe paths and invalid dependency graphs", async () => {
  const { directory, registryPath, registry } = await fixture();
  const save = () => writeFile(registryPath, JSON.stringify(registry));
  try {
    registry.items.push(registry.items[0]!);
    await save();
    await expect(validateRegistry(registryPath)).rejects.toThrow("Duplicate item");
    registry.items.pop();
    registry.items[1]!.files[0]!.target = "../outside.ts";
    await save();
    await expect(validateRegistry(registryPath)).rejects.toThrow("Invalid path");
    registry.items[1]!.files[0]!.target = "src/block.ts";
    registry.items[0]!.registryDependencies = ["block"];
    await save();
    await expect(
      installRegistryItem({ itemName: "block", targetDir: join(directory, "app"), registryPath }),
    ).rejects.toThrow("Circular registry dependency");
    registry.items[0]!.registryDependencies = ["missing"];
    await save();
    await expect(
      installRegistryItem({ itemName: "block", targetDir: join(directory, "app"), registryPath }),
    ).rejects.toThrow("Unknown registry item");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

const repositoryRegistry = join(repo, "packages/meowtail/registry/registry.json");
test.skipIf(!existsSync(repositoryRegistry))("validates the repository registry", async () => {
  expect((await validateRegistry(repositoryRegistry)).items.length).toBeGreaterThan(0);
});
