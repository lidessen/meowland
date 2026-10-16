import { describe, expect, test } from "bun:test";
import { parseCLI } from "../../src/cli";
import { captureEnvironment } from "../../src/bun/capture";

describe("capture command inputs", () => {
  test("live URL capture bypasses story configuration and preserves only valid page options", () => {
    const parsed = parseCLI([
      "capture",
      "--url",
      "http://127.0.0.1:13001/?token=private",
      "--ready",
      "#ready",
      "--root",
      "main",
      "--channel",
      "chrome",
      "--guide",
      ".panel",
    ]);
    expect(parsed.url).toBe("http://127.0.0.1:13001/?token=private");
    expect(parsed.live).toMatchObject({
      ready: "#ready",
      root: "main",
      channel: "chrome",
      guides: { selectors: [".panel"] },
    });
    expect(
      parseCLI([
        "capture",
        "--url",
        "https://example.test/",
        "--pages",
        "/tmp/pages.ts",
        "--scene",
        "settings",
      ]).live?.scene,
    ).toBe("settings");
    expect(
      parseCLI(["capture", "--url", "http://[::1]:13001/", "--pages", "/tmp/pages.ts", "--all"])
        .live?.all,
    ).toBe(true);
    expect(
      parseCLI([
        "capture",
        "--url",
        "https://example.test/",
        "--ready",
        "main",
        "--cdp",
        "http://127.0.0.1:13131/",
      ]).live?.cdp,
    ).toBe("http://127.0.0.1:13131/");
  });

  test("live capture rejects unsafe URLs and incompatible selections before importing code", () => {
    expect(
      parseCLI(["capture", "--url", "http://127.0.0.1:13001/", "--pages", "relative.ts", "--all"])
        .live?.planFile,
    ).toBe(`${process.cwd()}/relative.ts`);
    for (const url of [
      "file:///tmp/page.html",
      "javascript:alert(1)",
      "http://example.test/",
      "https://user:secret@example.test/",
      "invalid",
    ])
      expect(() => parseCLI(["capture", "--url", url, "--ready", "main"])).toThrow();
    for (const extra of [
      [],
      ["--all"],
      ["--scene", "settings"],
      ["--ready", " "],
      ["--ready", "main", "--config", "story.config.ts"],
      ["--ready", "main", "--story", "settings"],
      ["--ready", "main", "--component", "page.tsx", "--export", "Page"],
      ["--ready", "main", "--select", "Button"],
      ["--ready", "main", "--guides"],
      ["--ready", "main", "--channel", "firefox"],
      ["--ready", "main", "--channel", "chrome", "--cdp", "http://127.0.0.1:13131/"],
      ["--ready", "main", "--cdp", "https://example.test/"],
      ["--ready", "main", "--cdp", "http://127.0.0.1:13131/?token=secret"],
      ["--ready", "main", "--cdp", "http://127.0.0.1:13131/#endpoint"],
      ["--pages", "/tmp/pages.ts"],
      ["--pages", "/tmp/pages.ts", "--all", "--scene", "settings"],
      ["--pages", "/tmp/pages.ts", "--all", "--ready", "main"],
    ])
      expect(() => parseCLI(["capture", "--url", "http://127.0.0.1:13001/", ...extra])).toThrow();
    expect(() => parseCLI(["capture", "--scene", "settings"])).toThrow("require --url");
  });
  test("list query narrows discovered stories without losing their source identity", async () => {
    expect(parseCLI(["list", "--query", "  CAPTURE/GEOMETRY  "]).query).toBe("CAPTURE/GEOMETRY");
    for (const args of [
      ["list", "--query", " "],
      ["list", "--query", "x".repeat(257)],
      ["capture", "--all", "--query", "geometry"],
    ])
      expect(() => parseCLI(args)).toThrow();
    const run = async (query: string) => {
      const child = Bun.spawn(
        [
          process.execPath,
          new URL("../../src/cli.ts", import.meta.url).pathname,
          "list",
          "--config",
          new URL("../fixtures/story.config.ts", import.meta.url).pathname,
          "--query",
          query,
          "--json",
        ],
        { stdout: "pipe", stderr: "pipe" },
      );
      const output = await new Response(child.stdout).text();
      const error = await new Response(child.stderr).text();
      expect(await child.exited, error).toBe(0);
      return JSON.parse(output);
    };
    const entries = await run("CAPTURE/GEOMETRY");
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe("capture/geometry");
    expect(entries[0].file).toContain("capture.story.tsx");
    expect(entries[0].line).toBeGreaterThan(0);
    expect(await run("no-such-story-query")).toEqual([]);
  });
  test("focus retains independent targets and rejects incomplete or unbounded options", () => {
    const capture = parseCLI([
      "capture",
      "--all",
      "--focus",
      ".field",
      "--focus",
      ".composer",
      "--focus-padding",
      "0",
      "--guide",
      ".actions",
    ]).capture;
    expect(capture.focus).toEqual({ selectors: [".field", ".composer"], padding: 0 });
    expect(capture.guides).toEqual({ selectors: [".actions"] });
    for (const args of [
      ["serve", "--focus", ".field"],
      ["capture", "--all", "--focus"],
      ["capture", "--all", "--focus", " "],
      ["capture", "--all", "--focus-mode", "dim"],
      ["capture", "--all", "--focus-padding", "12"],
      ["capture", "--all", "--focus", ".field", "--focus-mode", "hide"],
      ["capture", "--all", "--focus", ".field", "--focus-padding", "-1"],
      ["capture", "--all", "--focus", ".field", "--focus-padding", "129"],
      ["capture", "--all", "--focus", ".field", "--focus-padding", "Infinity"],
      ["capture", "--all", "--focus", "x".repeat(513)],
      ["capture", "--all", ...Array.from({ length: 13 }, () => ["--focus", ".field"]).flat()],
    ])
      expect(() => parseCLI(args)).toThrow();
  });
  test("guide selectors are repeatable, bounded, and capture-only", () => {
    expect(parseCLI(["capture", "--all", "--guides"]).capture.guides).toEqual({});
    expect(
      parseCLI(["capture", "--all", "--guides", "--guide-lines", "left,center-x"]).capture.guides,
    ).toEqual({ lines: ["left", "center-x"] });
    expect(
      parseCLI(["capture", "--all", "--guide", ".card", "--guide", ".actions"]).capture.guides,
    ).toEqual({ selectors: [".card", ".actions"] });
    for (const args of [
      ["serve", "--guides"],
      ["capture", "--all", "--guide"],
      ["capture", "--all", "--guide", " "],
      ["capture", "--all", "--guide-lines", "bottom"],
      ["capture", "--all", "--guides", "--guide-lines", "baseline"],
      ["capture", "--all", "--guides", "--guide-lines", "left,left"],
      ["capture", "--all", "--guides", "--guide", ".card"],
      ["capture", "--all", "--guide", "x".repeat(513)],
      ["capture", "--all", ...Array.from({ length: 13 }, () => ["--guide", ".card"]).flat()],
    ])
      expect(() => parseCLI(args)).toThrow();
  });
  test("requires one selector and keeps temporary component input together", () => {
    for (const args of [
      ["capture"],
      ["capture", "--all", "--story", "button/default"],
      ["capture", "--all", "--component", "Button.tsx", "--export", "Button"],
      ["capture", "--component", "Button.tsx"],
      ["capture", "--props-file", "props.json"],
    ])
      expect(() => parseCLI(args)).toThrow();
    expect(
      parseCLI(["capture", "--component", "Button.tsx", "--export", "Button"]).temporary,
    ).toEqual({
      component: "Button.tsx",
      exportName: "Button",
      propsFile: undefined,
    });
  });

  test("rejects unbounded images and invalid numeric options before importing config", () => {
    for (const extra of [
      ["--viewport", "390"],
      ["--viewport", "-1x900"],
      ["--viewport", "999999x900"],
      ["--dpr", "Infinity"],
      ["--dpr", "0"],
      ["--depth", "-1"],
      ["--depth", "1.5"],
      ["--timeout", "NaN"],
      ["--timeout", "120001"],
      ["--viewport", "4096x4096", "--dpr", "4"],
    ])
      expect(() => parseCLI(["capture", "--all", ...extra])).toThrow();
    expect(parseCLI(["capture", "--all", "--depth", "all"]).capture.depth).toBe("all");
  });

  test("device presets retain input simulation and only explicit options override dimensions", () => {
    const preset = captureEnvironment(
      parseCLI(["capture", "--all", "--device", "iPhone 13"]).capture,
    );
    expect(preset.viewport).toEqual({ width: 390, height: 664 });
    expect(preset.deviceScaleFactor).toBe(3);
    expect(preset.isMobile).toBe(true);
    expect(preset.hasTouch).toBe(true);
    const explicit = captureEnvironment(
      parseCLI([
        "capture",
        "--all",
        "--device",
        "iPhone 13",
        "--viewport",
        "768x900",
        "--dpr",
        "2",
        "--color-scheme",
        "dark",
      ]).capture,
    );
    expect(explicit.viewport).toEqual({ width: 768, height: 900 });
    expect(explicit.deviceScaleFactor).toBe(2);
    expect(explicit.colorScheme).toBe("dark");
    expect(explicit.hasTouch).toBe(true);
  });

  test("rejects misspelled and duplicated options while allowing observed serve", () => {
    expect(() => parseCLI(["capture", "--all", "--depth", "0", "--depth", "all"])).toThrow(
      "Duplicate",
    );
    expect(() => parseCLI(["capture", "--all", "--color-scheme", "blue"])).toThrow("Color scheme");
    expect(() => parseCLI(["capture", "--all", "--device", "unknown"])).toThrow("Unknown device");
    expect(() => parseCLI(["list", "--all"])).toThrow("Unknown option");
    expect(parseCLI(["serve", "--capture", "--port", "0"]).observeCapture).toBe(true);
    expect(parseCLI(["capture", "--all", "--full-page"]).capture.fullPage).toBe(true);
    expect(() => parseCLI(["serve", "--full-page"])).toThrow("Unknown option");
  });
});
