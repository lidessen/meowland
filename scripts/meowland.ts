import { resolve } from "node:path";
import { installRegistryItem, listRegistryItems, validateRegistry } from "./registry";

const defaultRegistry = resolve(import.meta.dir, "../packages/meowtail/registry/registry.json");

async function main(args: string[]): Promise<void> {
  const [command, ...rest] = args;
  let registryPath = defaultRegistry;
  let targetDir = process.cwd();
  let itemName: string | undefined;
  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index]!;
    if (arg === "--registry" || arg === "--target") {
      const value = rest[++index];
      if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      if (arg === "--registry") registryPath = resolve(value);
      else {
        if (command !== "add") throw new Error("--target is only valid for add");
        targetDir = resolve(value);
      }
    } else if (!arg.startsWith("-") && command === "add" && !itemName) itemName = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  if (command === "add" && itemName) {
    const result = await installRegistryItem({ itemName, targetDir, registryPath });
    console.log(`Installed: ${result.installed.join(", ")}`);
    for (const file of result.files) console.log(file);
  } else if (command === "list") {
    for (const item of await listRegistryItems(registryPath))
      console.log(`${item.name}\t${item.description ?? item.title ?? item.type}`);
  } else if (command === "validate") {
    const registry = await validateRegistry(registryPath);
    console.log(`Valid registry: ${registry.items.length} items`);
  } else
    throw new Error(
      "Usage: meowland add <item> [--target <dir>] [--registry <path>] | list [--registry <path>] | validate [--registry <path>]",
    );
}

if (import.meta.main)
  main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
