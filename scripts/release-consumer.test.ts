import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { consumerInput, consumerOptions, publicImportProbe } from "./release-consumer";

test("consumer requires explicit unique supported selection and rejects execution flags", () => {
  expect(() => consumerOptions([])).toThrow("Explicit");
  expect(() =>
    consumerOptions(["--manifest", "input.json", "--packages", "meowjsx,meowjsx"]),
  ).toThrow("unique");
  expect(
    consumerOptions(["--manifest", "input.json", "--packages", "meowslides"]).selected,
  ).toEqual(["meowslides"]);
  expect(consumerOptions(["--manifest", "input.json", "--packages", "meowpress"]).selected).toEqual(
    ["meowpress"],
  );
  for (const name of ["unknown", "meowui"])
    expect(() => consumerOptions(["--manifest", "input.json", "--packages", name])).toThrow(
      "supported",
    );
  expect(() =>
    consumerOptions(["--manifest", "input.json", "--packages", "meowjsx", "--execute"]),
  ).toThrow("Unknown");
  expect(
    consumerOptions(["--manifest", "input.json", "--packages", "meowjsx,meowcss", "--offline"])
      .offline,
  ).toBe(true);
});

test("consumer checks actual tarball identity and hash before installation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "release-consumer-input-test-"));
  try {
    await mkdir(join(directory, "package"));
    await writeFile(
      join(directory, "package/package.json"),
      JSON.stringify({ name: "meowjsx", version: "0.1.1-alpha.0" }),
    );
    const filename = "meowjsx-0.1.1-alpha.0.tgz";
    const packed = Bun.spawn(["tar", "-czf", filename, "package"], { cwd: directory });
    expect(await packed.exited).toBe(0);
    const file = Bun.file(join(directory, filename));
    const sha256 = createHash("sha256")
      .update(new Uint8Array(await file.arrayBuffer()))
      .digest("hex");
    const manifest = join(directory, "release.json");
    const input = {
      repository: "lidessen/meowland",
      commit: "a".repeat(40),
      packages: [{ name: "meowjsx", version: "0.1.1-alpha.0", file: filename, sha256 }],
    };
    await writeFile(manifest, JSON.stringify(input));
    const options = { manifest, selected: ["meowjsx"], offline: true };
    expect((await consumerInput(options)).candidates[0]!.file).toBe(
      await realpath(join(directory, filename)),
    );
    await expect(consumerInput({ ...options, selected: ["meowbook"] })).rejects.toThrow(
      "Missing candidate",
    );
    input.packages[0]!.sha256 = "0".repeat(64);
    await writeFile(manifest, JSON.stringify(input));
    await expect(consumerInput(options)).rejects.toThrow("Tarball changed");
    input.packages[0]!.sha256 = sha256;
    input.packages[0]!.version = "0.1.2-alpha.0";
    input.packages[0]!.file = "meowjsx-0.1.2-alpha.0.tgz";
    await Bun.write(join(directory, input.packages[0]!.file), file);
    await writeFile(manifest, JSON.stringify(input));
    await expect(consumerInput(options)).rejects.toThrow("Packed identity");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

// Each probe starts cold `node` processes; a busy CI runner can exceed the 5s default per test.
const nodeProbeTimeout = 30_000;

test(
  "the standard native Node public probe catches a broken Slides theme specifier",
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "release-consumer-node-test-"));
    try {
      const packageDirectory = join(directory, "node_modules/meowslides");
      await mkdir(packageDirectory, { recursive: true });
      await writeFile(
        join(packageDirectory, "package.json"),
        JSON.stringify({
          name: "meowslides",
          type: "module",
          exports: { ".": "./index.js", "./theme": "./theme.js", "./build": "./build.js" },
        }),
      );
      await writeFile(join(packageDirectory, "index.js"), "export const runtime = true;");
      await writeFile(join(packageDirectory, "theme.styles.js"), "export const theme = true;");
      await writeFile(join(packageDirectory, "theme.js"), 'export {theme} from "./theme.styles";');
      await writeFile(
        join(packageDirectory, "build.js"),
        'throw Error("Bun-only tooling must not execute under Node");',
      );
      await writeFile(join(directory, "public-imports.mjs"), publicImportProbe(["meowslides"]));
      const run = async () => {
        const child = Bun.spawn(["node", "public-imports.mjs"], {
          cwd: directory,
          stdout: "pipe",
          stderr: "pipe",
        });
        const [code, stdout, stderr] = await Promise.all([
          child.exited,
          new Response(child.stdout).text(),
          new Response(child.stderr).text(),
        ]);
        return { code, stdout, stderr };
      };
      const broken = await run();
      expect(broken.code).not.toBe(0);
      expect(broken.stderr).toContain("ERR_MODULE_NOT_FOUND");
      expect(broken.stderr).toContain("theme.styles");
      await writeFile(
        join(packageDirectory, "theme.js"),
        'export {theme} from "./theme.styles.js";',
      );
      const repaired = await run();
      expect(repaired.code).toBe(0);
      expect(JSON.parse(repaired.stdout)).toEqual(["meowslides", "meowslides/theme"]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
  nodeProbeTimeout,
);

test(
  "the native Node public probe excludes the Press-only Bun tool",
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "release-consumer-press-node-test-"));
    try {
      const packageDirectory = join(directory, "node_modules/meowpress");
      await mkdir(packageDirectory, { recursive: true });
      await writeFile(
        join(packageDirectory, "package.json"),
        JSON.stringify({ name: "meowpress", type: "module", exports: { "./build": "./build.js" } }),
      );
      await writeFile(
        join(packageDirectory, "build.js"),
        'throw Error("Press tooling was executed under Node");',
      );
      await writeFile(join(directory, "public-imports.mjs"), publicImportProbe(["meowpress"]));
      const child = Bun.spawn(["node", "public-imports.mjs"], {
        cwd: directory,
        stdout: "pipe",
        stderr: "pipe",
      });
      const [code, stdout, stderr] = await Promise.all([
        child.exited,
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
      ]);
      expect(code).toBe(0);
      expect(stderr).toBe("");
      expect(JSON.parse(stdout)).toEqual([]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
  nodeProbeTimeout,
);
