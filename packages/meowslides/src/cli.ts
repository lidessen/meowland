#!/usr/bin/env bun
import { resolve } from "node:path";
import { buildSlides, devSlides } from "./build";

const usage =
  "Usage: meowslides dev <slides.mdx> [--port 3030] | build <slides.mdx> [--outdir dist]";

export function parseCLI(argv: readonly string[]) {
  const [command, entry, ...args] = argv.filter((argument) => argument !== "--");
  if ((command !== "dev" && command !== "build") || !entry || entry.startsWith("--"))
    throw new Error(usage);
  let outdir: string | undefined;
  let port: number | undefined;
  for (let index = 0; index < args.length; index += 2) {
    const option = args[index];
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${option}`);
    if (option === "--outdir" && !outdir) outdir = resolve(value);
    else if (option === "--port" && command === "dev" && port === undefined) {
      port = Number(value);
      if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new Error("Port must be an integer between 1 and 65535");
    } else throw new Error(`Unknown or duplicate option: ${option}`);
  }
  return { command, entry: resolve(entry), outdir, port };
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseCLI(argv);
  if (options.command === "build") {
    const result = await buildSlides({
      entry: options.entry,
      outdir: options.outdir ?? resolve("dist"),
    });
    console.log(`Built ${result.slides.length} slides in ${result.outdir}`);
    return;
  }
  const preview = await devSlides({ ...options, onError: (error) => console.error(error.message) });
  console.log(`Slides: ${preview.server.url}`);
  const stop = () => {
    preview.stop();
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

if (import.meta.main)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
