import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type {} from "../fixtures/dom-properties";

const fixture = fileURLToPath(new URL("../fixtures/dom-properties.ts", import.meta.url));

function svgValues(node: Element) {
  if (!(node instanceof SVGSVGElement)) throw new Error("Expected a real SVG root");
  return {
    width: node.viewBox.baseVal.width,
    height: node.viewBox.baseVal.height,
    length: node.width.baseVal.value,
  };
}

for (const mode of ["sloppy-iife", "strict-iife", "esm"] as const) {
  test(`${mode} preserves SVG attributes and ordinary HTML property lifecycles`, async ({
    page,
  }) => {
    const output = mkdtempSync(join(tmpdir(), "meowjsx-dom-properties-"));
    let script: string;
    try {
      const bundle = join(output, "fixture.js");
      execFileSync("bun", [
        "build",
        fixture,
        "--target=browser",
        "--minify",
        `--format=${mode === "esm" ? "esm" : "iife"}`,
        `--outfile=${bundle}`,
        ...(mode === "strict-iife" ? ['--banner="use strict";'] : []),
      ]);
      script = readFileSync(bundle, "utf8");
    } finally {
      rmSync(output, { recursive: true, force: true });
    }
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(
      `<main id="app"></main><script ${mode === "esm" ? 'type="module"' : ""}>${script}</script>`,
    );
    await page.waitForFunction(() => Boolean(window.domPropertyFixture));
    expect(await page.evaluate(() => window.domPropertyFixture.executionStrict)).toBe(
      mode !== "sloppy-iife",
    );
    const svg = page.locator("svg");
    await expect(svg).toHaveAttribute("viewBox", "0 0 100 100");
    await expect(svg).toHaveAttribute("width", "24");
    await expect(svg).toHaveAttribute("height", "24");
    await expect(svg).toHaveAttribute("fill", "navy");
    await expect(svg).toHaveClass("vector initial-class");
    await expect(page.locator("#text")).toHaveClass("field initial-class");
    expect(await svg.evaluate(svgValues)).toEqual({ width: 100, height: 100, length: 24 });
    await expect(page.locator("#text")).toHaveValue("initial");
    await expect(page.locator("#check")).not.toBeChecked();
    await page.getByRole("button", { name: "Action" }).click();
    await page.locator("#text").fill("typed");
    await page.evaluate(() => window.domPropertyFixture.update());
    await expect(svg).toHaveAttribute("viewBox", "0 0 200 150");
    await expect(svg).toHaveAttribute("width", "48");
    await expect(svg).toHaveAttribute("fill", "teal");
    await expect(svg).toHaveClass("vector updated-class");
    await expect(page.locator("#text")).toHaveClass("field updated-class");
    expect(await svg.evaluate(svgValues)).toEqual({ width: 200, height: 150, length: 48 });
    await expect(page.locator("#text")).toHaveValue("updated");
    await expect(page.locator("#check")).toBeChecked();
    expect(await page.evaluate(() => window.domPropertyFixture.counts())).toEqual({
      mounted: 1,
      cleaned: 0,
      clicks: 1,
      inputs: 1,
    });
    await page.evaluate(() => {
      window.domPropertyFixture.unmount();
      window.domPropertyFixture.clickDetached();
    });
    await expect(page.locator("#app")).toBeEmpty();
    expect(await page.evaluate(() => window.domPropertyFixture.counts())).toEqual({
      mounted: 1,
      cleaned: 1,
      clicks: 1,
      inputs: 1,
    });
    expect(errors).toEqual([]);
  });
}
