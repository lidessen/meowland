import { expect, test, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PNG } from "pngjs";
import { capturePage } from "../../src/playwright";
import { captureScene } from "../../src/capture/page";

async function image(directory: string, path: string) {
  return PNG.sync.read(await readFile(join(directory, path)));
}
function pixel(image: PNG, x: number, y: number) {
  const offset = (Math.floor(y) * image.width + Math.floor(x)) * 4;
  return [...image.data.subarray(offset, offset + 4)];
}
function expectFlatBar(image: PNG, xs: number[], y: number) {
  const pixels = xs.map((x) => pixel(image, x, y));
  // Chromium can quantize same-color glyph antialiasing by one channel level.
  for (let channel = 0; channel < 3; channel++) {
    const values = pixels.map((pixel) => pixel[channel]!);
    expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
  }
}
async function lines(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return Array.from(range.getClientRects(), ({ x, y, width, height }) => ({
      x,
      y,
      width,
      height,
    })).filter((line) => line.width > 1);
  });
}
async function state(page: Page) {
  return page.evaluate(() => ({
    html: document.body.innerHTML,
    head: document.head.innerHTML,
    highlights: Array.from(
      (CSS as typeof CSS & { highlights: Map<string, unknown> }).highlights.keys(),
    ),
    scroll: { x: scrollX, y: scrollY },
  }));
}
async function fixture(page: Page) {
  await page.goto("/canvas.html?story=capture/tree");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.locator("#story-root").evaluate((root) => {
    for (const [index, button] of Array.from(root.querySelectorAll("button")).entries()) {
      button.id = ["clear", "light-text", "dark-text"][index]!;
      button.style.cssText = `position:fixed;left:${80 + index * 220}px;top:300px;width:180px;height:90px;margin:0;padding:8px;border:0;border-radius:0;box-shadow:none;font:20px/32px monospace;text-align:left;white-space:pre;background:${index === 2 ? "#222" : "#fff"};color:${index === 2 ? "#eee" : "#111"}`;
      const text = document.createTreeWalker(button, NodeFilter.SHOW_TEXT).nextNode();
      if (!text) throw new Error("Expected an observed text node");
      text.textContent = index === 1 ? "MMMM\nMMMMMMMM" : "MMMMMMMM";
    }
    const second = root.querySelector("span")!;
    second.id = "second-clear";
    (second as HTMLElement).style.cssText =
      "position:fixed;left:80px;top:450px;background:#123456;color:white;padding:10px";
    const swatch = document.createElement("div");
    swatch.style.cssText =
      "position:fixed;left:300px;top:450px;width:100px;height:50px;background:#123456";
    const input = document.createElement("input");
    input.id = "draft";
    input.style.caretColor = "transparent";
    root.append(swatch, input);
  });
}

test("focus replaces peripheral glyphs with separate light and dark line bars while preserving pixels and state", async ({
  page,
}, info) => {
  await fixture(page);
  await page.locator("#draft").fill("Keep this draft");
  await page.locator("#draft").focus();
  await page.locator("#clear").evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const Highlight = (window as unknown as { Highlight: new (...ranges: Range[]) => unknown })
      .Highlight;
    (CSS as typeof CSS & { highlights: Map<string, unknown> }).highlights.set(
      "existing-review",
      new Highlight(range),
    );
  });
  const light = await lines(page, "#light-text");
  const dark = await lines(page, "#dark-text");
  expect(light).toHaveLength(2);
  expect(light[1]!.width).toBeGreaterThan(light[0]!.width);
  const before = await state(page);
  const result = await capturePage(page, {
    out: info.outputPath("focus"),
    depth: 0,
    focus: { selectors: ["#clear", "#second-clear"], padding: 0 },
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status, scene.error).toBe("success");
  const raw = await image(result.directory, scene.frame!);
  const focused = await image(result.directory, scene.focus!.frame);
  for (const line of [...light, ...dark]) {
    const y = Math.floor(line.y + line.height / 2);
    const xs = Array.from(
      { length: Math.floor(line.width) - 6 },
      (_, index) => Math.ceil(line.x) + 3 + index,
    );
    expectFlatBar(focused, xs, y);
    expect(new Set(xs.map((x) => pixel(raw, x, y).join(","))).size).toBeGreaterThan(1);
    expect(pixel(focused, line.x - 2, y)).toEqual(pixel(raw, line.x - 2, y));
    expect(pixel(focused, line.x + line.width + 2, y)).toEqual(
      pixel(raw, line.x + line.width + 2, y),
    );
  }
  const lightColor = pixel(focused, light[0]!.x + 4, light[0]!.y + light[0]!.height / 2)[0]!;
  const darkColor = pixel(focused, dark[0]!.x + 4, dark[0]!.y + dark[0]!.height / 2)[0]!;
  expect(lightColor).toBeGreaterThan(128);
  expect(lightColor).toBeLessThan(255);
  expect(darkColor).toBeGreaterThan(34);
  expect(darkColor).toBeLessThan(160);
  const gapY = (light[0]!.y + light[0]!.height + light[1]!.y) / 2;
  expect(pixel(focused, 320, gapY)).toEqual(pixel(raw, 320, gapY));
  for (const [x, y, width, height] of [
    [80, 300, 180, 90],
    [80, 450, 80, 20],
    [300, 450, 100, 50],
  ]) {
    for (let row = y!; row < y! + height!; row++) {
      const start = (row * raw.width + x!) * 4;
      expect(
        focused.data
          .subarray(start, start + width! * 4)
          .equals(raw.data.subarray(start, start + width! * 4)),
      ).toBe(true);
    }
  }
  expect(await state(page)).toEqual(before);
  await expect(page.locator("#draft")).toHaveValue("Keep this draft");
  await expect(page.locator("#draft")).toBeFocused();
});

test("DPR 2 full-page focus uses document coordinates and skeletonizes offscreen text", async ({
  page,
  browser,
}, info) => {
  await page.goto("/canvas.html?story=capture/tree");
  const context = await browser.newContext({
    baseURL: new URL(page.url()).origin,
    viewport: { width: 800, height: 600 },
    deviceScaleFactor: 2,
  });
  try {
    const target = await context.newPage();
    await fixture(target);
    await target.evaluate(() => {
      document.body.style.minHeight = "2300px";
      document.body.style.position = "static";
      for (const [index, id] of ["clear", "light-text", "dark-text"].entries()) {
        const element = document.getElementById(id)!;
        document.body.append(element);
        element.style.position = "absolute";
        element.style.top = `${index === 2 ? 1700 : 700}px`;
      }
      scrollTo(0, 500);
    });
    const lower = (await lines(target, "#dark-text"))[0]!;
    const result = await capturePage(target, {
      out: info.outputPath("scrolled"),
      depth: 0,
      fullPage: true,
      focus: { selectors: ["#clear"], padding: 0 },
    });
    const scene = result.manifest.scenes[0]!;
    expect(scene.status, scene.error).toBe("success");
    const raw = await image(result.directory, scene.fullPage!);
    const focused = await image(result.directory, scene.focus!.fullPage!);
    expect(focused.width).toBe(1600);
    expect(pixel(focused, 200, 1440)).toEqual(pixel(raw, 200, 1440));
    const y = Math.floor((lower.y + 500 + lower.height / 2) * 2);
    const xs = Array.from({ length: 100 }, (_, i) => Math.ceil(lower.x * 2) + 6 + i);
    expectFlatBar(focused, xs, y);
    expect(new Set(xs.map((x) => pixel(raw, x, y).join(","))).size).toBeGreaterThan(1);
    expect(await target.evaluate(() => scrollY)).toBe(500);
  } finally {
    await context.close();
  }
});

test("ancestor clipping restricts focus padding without leaking clear text into adjacent regions", async ({
  page,
}, info) => {
  await fixture(page);
  await page.evaluate(() => {
    const clip = document.createElement("div");
    clip.style.cssText =
      "position:fixed;left:300px;top:300px;width:45px;height:90px;overflow:hidden";
    const clear = document.getElementById("clear")!;
    clear.style.cssText =
      "position:absolute;left:10px;top:0;width:100px;height:90px;background:transparent;border:0;padding:0;color:transparent;box-shadow:none";
    document.body.append(clip);
    clip.append(clear);
  });
  const rect = (await lines(page, "#light-text"))[0]!;
  const result = await capturePage(page, {
    out: info.outputPath("clipped"),
    depth: 0,
    focus: { selectors: ["#clear"], padding: 24 },
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status, scene.error).toBe("success");
  const raw = await image(result.directory, scene.frame!);
  const focused = await image(result.directory, scene.focus!.frame);
  const y = Math.floor(rect.y + rect.height / 2);
  for (let x = 310; x < 345; x++) expect(pixel(focused, x, y)).toEqual(pixel(raw, x, y));
  expect(
    Array.from({ length: 8 }, (_, i) => 346 + i).some(
      (x) => pixel(focused, x, y).join() !== pixel(raw, x, y).join(),
    ),
  ).toBe(true);
});

test("guides outside the clear region remain visible without restoring their text", async ({
  page,
}, info) => {
  await fixture(page);
  const result = await capturePage(page, {
    out: info.outputPath("combined"),
    depth: 0,
    fullPage: true,
    focus: { selectors: ["#clear"], padding: 0 },
    guides: { selectors: ["#dark-text"], lines: ["bottom"] },
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status, scene.error).toBe("success");
  const focused = await image(result.directory, scene.focus!.frame);
  const combined = await image(result.directory, scene.focus!.guides!);
  expect(pixel(combined, 550, 343)).toEqual(pixel(focused, 550, 343));
  const row = 390 * focused.width * 4;
  expect(
    combined.data
      .subarray(row, row + focused.width * 4)
      .equals(focused.data.subarray(row, row + focused.width * 4)),
  ).toBe(false);
  expect(scene.focus!.fullPageGuides).toBeTruthy();
});

test("invalid, missing and hidden selections fail without leaking styles or highlight registrations", async ({
  page,
}, info) => {
  await fixture(page);
  await page.locator("#clear").evaluate((box) => {
    (box as HTMLElement).style.visibility = "hidden";
  });
  const before = await state(page);
  for (const [index, selector] of ["[", "#missing-focus", "#clear"].entries()) {
    const result = await capturePage(page, {
      out: info.outputPath(`failure-${index}`),
      depth: 0,
      focus: { selectors: [selector] },
    });
    const scene = result.manifest.scenes[0]!;
    expect(scene.status).toBe("failed");
    expect(scene.error).toBeTruthy();
    expect(scene.focus).toBeUndefined();
    expect(await state(page)).toEqual(before);
  }
  const directory = info.outputPath("occupied");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "focus.png"), "Keep the existing artifact");
  const scene = await captureScene(page, {
    directory,
    pathPrefix: "s001",
    focus: { selectors: ["#light-text"] },
    depth: 0,
  });
  expect(scene.status).toBe("failed");
  expect(scene.error).toContain("EEXIST");
  expect(await readFile(join(directory, "focus.png"), "utf8")).toBe("Keep the existing artifact");
  expect(await state(page)).toEqual(before);
});
