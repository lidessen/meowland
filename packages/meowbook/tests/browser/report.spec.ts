import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createCaptureReport } from "../../src/capture/report";
import type { CaptureManifest, CaptureScene } from "../../src/capture/types";

test("focus report exposes original and processed photos, rejects unsafe artifacts and stacks on mobile", async ({
  page,
}, info) => {
  const directory = info.outputPath("focus-report");
  await mkdir(join(directory, "s001"), { recursive: true });
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWioAAAAASUVORK5CYII=",
    "base64",
  );
  for (const file of [
    "frame.png",
    "full-page.png",
    "focus.png",
    "focus-full-page.png",
    "focus-guides.png",
    "focus-guides-full-page.png",
  ])
    await writeFile(join(directory, "s001", file), image);
  const metadata = { effect: { kind: "text-skeleton" }, targets: [] };
  await writeFile(join(directory, "s001/focus.json"), JSON.stringify(metadata));
  const scene: CaptureScene = {
    story: {
      id: "focus",
      title: "Focus example",
      file: "focus.story.tsx",
      exportName: "Focus",
      line: 1,
    },
    status: "success",
    matched: 0,
    nodes: [],
    activeFocus: { status: "unknown", reason: "iframe-content-unobserved" },
    scrollViews: [
      {
        status: "observed",
        instanceId: "n001",
        part: "page-frame/body",
        declaredOwner: "layout",
        overflowX: "auto",
        overflowY: "auto",
        clientWidth: 400,
        clientHeight: 200,
        scrollWidth: 400,
        scrollHeight: 800,
        scrollLeft: 0,
        scrollTop: 25,
      },
    ],
    frame: "s001/frame.png",
    fullPage: "s001/full-page.png",
    focus: {
      frame: "s001/focus.png",
      fullPage: "s001/focus-full-page.png",
      guides: "s001/focus-guides.png",
      fullPageGuides: "s001/focus-guides-full-page.png",
      metadata: "s001/focus.json",
      targets: [],
    },
  };
  const manifest: CaptureManifest = {
    version: 1,
    createdAt: "2026-10-10T00:00:00.000Z",
    status: "complete",
    input: {},
    environment: {},
    scenes: [
      scene,
      {
        ...scene,
        story: { ...scene.story, id: "unsafe" },
        frame: "../outside.png",
        fullPage: undefined,
        focus: {
          frame: "https://example.com/focus.png",
          fullPage: "s001/%2e%2e/outside.png",
          guides: "javascript:window.injected=true",
          fullPageGuides: "//example.com/image.png",
          metadata: "../focus.json",
          targets: [],
        },
      },
    ],
  };
  const report = join(directory, "index.html");
  await writeFile(report, createCaptureReport(manifest));
  await page.goto(pathToFileURL(report).href);
  await page.locator("#scene-0").getByText("DOM focus and scroll facts", { exact: true }).click();
  await expect(page.locator("#scene-0")).toContainText("iframe-content-unobserved");
  await expect(page.locator("#scene-0")).toContainText('"declaredOwner": "layout"');
  const comparison = page.locator("#scene-0 .focus-comparison").first();
  await expect(comparison).toBeVisible();
  await expect(comparison.getByRole("img")).toHaveCount(2);
  await expect(page.locator("#scene-0")).toContainText("Focus is a processed photo");
  const desktopBoxes = await comparison.locator("figure").evaluateAll((figures) =>
    figures.map((figure) => ({
      x: figure.getBoundingClientRect().x,
      y: figure.getBoundingClientRect().y,
    })),
  );
  expect(desktopBoxes[0]!.y).toBe(desktopBoxes[1]!.y);
  expect(desktopBoxes[1]!.x).toBeGreaterThan(desktopBoxes[0]!.x);
  await page
    .locator("#scene-0")
    .getByText("Original and focus · full page", { exact: true })
    .click();
  await page.locator("#scene-0").getByText("Focus with alignment guides", { exact: true }).click();
  for (const photo of await page.locator("#scene-0 img:visible").all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect
      .poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true);
  }
  await comparison
    .getByRole("img", { name: "Processed focus viewport focus", exact: true })
    .click();
  await expect(page.locator("#viewer img")).toHaveAttribute("src", "s001/focus.png");
  await page.getByRole("button", { name: "Close original-size image" }).click();
  const metadataLink = page.getByRole("link", { name: "Focus metadata JSON" });
  await expect(metadataLink).toHaveAttribute("href", "s001/focus.json");
  const dataPage = await page.context().newPage();
  try {
    const response = await dataPage.goto(
      await metadataLink.evaluate((link: HTMLAnchorElement) => link.href),
    );
    expect(JSON.parse(await response!.text())).toEqual(metadata);
  } finally {
    await dataPage.close();
  }
  await expect(
    page.locator(
      "#scene-1 img, #scene-1 a[href^='javascript:'], #scene-1 a[href^='https:'], #scene-1 a[href^='../'], #scene-1 a[href^='//']",
    ),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileBoxes = await comparison.locator("figure").evaluateAll((figures) =>
    figures.map((figure) => ({
      x: figure.getBoundingClientRect().x,
      y: figure.getBoundingClientRect().y,
    })),
  );
  expect(mobileBoxes[0]!.x).toBe(mobileBoxes[1]!.x);
  expect(mobileBoxes[1]!.y).toBeGreaterThan(mobileBoxes[0]!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("focus-report-mobile.png"), fullPage: true });
});

test("offline overview keeps viewport, full-page and diagnostic photos distinct and opens scene details", async ({
  page,
}, info) => {
  const directory = info.outputPath("offline");
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWioAAAAASUVORK5CYII=",
    "base64",
  );
  for (const name of ["s001", "s002"]) await mkdir(join(directory, name), { recursive: true });
  for (const path of [
    "s001/frame.png",
    "s001/full-page.png",
    "s001/guides.png",
    "s001/guides-full-page.png",
    "s002/diagnostic.png",
  ])
    await writeFile(join(directory, path), image);
  await writeFile(join(directory, "s001/aria.yml"), "- button: Save\n");
  const measurementData = { version: 1, units: "css-pixels", targets: [] };
  await writeFile(join(directory, "s001/measurements.json"), JSON.stringify(measurementData));
  const title = '</script><img src=x onerror="window.injected=true">';
  const scene: CaptureScene = {
    story: {
      id: "controls/save",
      title,
      group: "Controls",
      file: "controls.story.tsx",
      exportName: "Save",
      line: 1,
    },
    status: "success",
    matched: 0,
    nodes: [],
    frame: "s001/frame.png",
    fullPage: "s001/full-page.png",
    aria: "s001/aria.yml",
    guides: {
      frame: "s001/guides.png",
      fullPage: "s001/guides-full-page.png",
      measurements: "s001/measurements.json",
      targets: [],
    },
  };
  const manifest: CaptureManifest = {
    version: 1,
    createdAt: "2026-10-10T00:00:00.000Z",
    status: "partial",
    input: {},
    environment: {
      viewport: { width: 1100, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: "light",
    },
    scenes: [
      scene,
      {
        ...scene,
        story: { ...scene.story, id: "failed", title: "Failed scene" },
        status: "failed",
        frame: undefined,
        fullPage: undefined,
        aria: undefined,
        guides: undefined,
        diagnostic: "s002/diagnostic.png",
        environment: { viewport: { width: 390, height: 844 }, dpr: 1, colorScheme: "dark" },
        error: "Scene did not become ready",
      },
      {
        ...scene,
        story: { ...scene.story, id: "unexecuted", title: "Unexecuted scene" },
        status: "unexecuted",
        frame: "../outside.png",
        fullPage: "https://example.com/image.png",
        aria: undefined,
        guides: {
          frame: "../outside.png",
          fullPage: "https://example.com/image.png",
          measurements: "javascript:window.injected=true",
          targets: [],
        },
      },
    ],
  };
  const report = join(directory, "index.html");
  await writeFile(report, createCaptureReport(manifest));
  await page.goto(pathToFileURL(report).href);
  const previews = page.locator("#overview-grid .preview");
  await expect(previews).toHaveCount(3);
  await expect(previews.nth(0).getByRole("heading")).toHaveText(title);
  await expect(previews.nth(0)).toContainText("1100 × 900 · DPR 2 · light");
  await expect(previews.nth(1)).toContainText("390 × 844 · DPR 1 · dark");
  await expect(previews.nth(1)).toContainText("failed · diagnostic image");
  await expect(previews.nth(1).getByRole("img")).toHaveAttribute("src", "s002/diagnostic.png");
  for (const preview of [previews.nth(0), previews.nth(1)]) {
    await expect
      .poll(() =>
        preview
          .getByRole("img")
          .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
  }
  await expect(previews.nth(2)).toContainText("unexecuted");
  await expect(previews.nth(2)).toContainText("No viewport image saved");
  await expect(previews.nth(2).getByRole("img")).toHaveCount(0);
  await expect(previews.nth(2).getByRole("link", { name: "Full-page image" })).toHaveCount(0);
  await expect(previews.nth(0).getByRole("link", { name: "Full-page image" })).toHaveAttribute(
    "href",
    "s001/full-page.png",
  );
  await expect(previews.nth(0).getByRole("link", { name: "ARIA snapshot" })).toHaveAttribute(
    "href",
    "s001/aria.yml",
  );
  await expect(page.locator(".scene[open]")).toHaveCount(0);
  await previews.nth(0).getByRole("img").click();
  await expect(page.locator("#viewer")).toBeVisible();
  await expect(page.locator("#viewer img")).toHaveAttribute("src", "s001/frame.png");
  await page.getByRole("button", { name: "Close original-size image" }).click();
  await previews.nth(0).getByRole("link", { name: "Scene details" }).click();
  await expect(page.locator("#scene-0")).toHaveAttribute("open", "");
  await page
    .locator("#scene-0 > .scene-content > details > summary")
    .filter({ hasText: /^Full-page image$/ })
    .click();
  await page.getByRole("img", { name: "Full-page scene controls/save", exact: true }).click();
  await expect(page.locator("#viewer img")).toHaveAttribute("src", "s001/full-page.png");
  await page.getByRole("button", { name: "Close original-size image" }).click();
  await page
    .locator("#scene-0 summary")
    .filter({ hasText: /^Alignment guides/ })
    .click();
  for (const [name, source] of [
    ["Alignment guides controls/save", "s001/guides.png"],
    ["Full-page alignment guides controls/save", "s001/guides-full-page.png"],
  ] as const) {
    const annotated = page.getByRole("img", { name, exact: true });
    await expect
      .poll(() =>
        annotated.evaluate(
          (element: HTMLImageElement) => element.complete && element.naturalWidth > 0,
        ),
      )
      .toBe(true);
    await annotated.click();
    await expect(page.locator("#viewer img")).toHaveAttribute("src", source);
    await page.getByRole("button", { name: "Close original-size image" }).click();
  }
  const measurements = page.locator("#scene-0").getByRole("link", { name: "Measurements JSON" });
  await expect(measurements).toHaveAttribute("href", "s001/measurements.json");
  const dataPage = await page.context().newPage();
  try {
    const response = await dataPage.goto(
      await measurements.evaluate((link: HTMLAnchorElement) => link.href),
    );
    expect(JSON.parse(await response!.text())).toEqual(measurementData);
  } finally {
    await dataPage.close();
  }
  expect(await page.locator("#scene-2 img").count()).toBe(0);
  expect(
    await page
      .locator(
        "#scene-2 a[href^='javascript:'], #scene-2 a[href^='https:'], #scene-2 a[href^='../']",
      )
      .count(),
  ).toBe(0);
  expect(await page.evaluate(() => "injected" in window)).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.locator("#scene-0 .back").click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("overview-dark-mobile.png") });
});
