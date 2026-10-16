import { expect, test } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PNG } from "pngjs";
import { capturePage } from "../../src/playwright";
import { captureScene } from "../../src/capture/page";

test("guides paint over nested native modal and popover layers without changing their state", async ({
  page,
}, info) => {
  await page.route("**/modal-guide-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><style>
        html { transform:translate(13px, 17px); overflow:hidden; }
        body { margin:0; min-height:1800px; }
        dialog { padding:30px; background:white; border:0; overflow:hidden; }
        #outer { width:650px; height:450px; transform:translate(11px, 9px); }
        #inner { width:400px; height:260px; transform:translate(-19px, 23px); }
        #floating { margin:0; inset:auto; left:450px; top:300px; padding:0; border:0;
          width:160px; height:60px; background:white; }
        .guide-target { width:120px; height:40px; background:white; }
        input { caret-color:transparent; }
      </style><dialog id="outer"><dialog id="inner">
        <input aria-label="Modal draft"><div class="guide-target"></div>
        <div id="floating" popover="auto"><div class="guide-target"></div></div>
      </dialog></dialog>`,
    }),
  );
  await page.goto("/modal-guide-fixture");
  await page.evaluate(() => {
    (document.querySelector("#outer") as HTMLDialogElement).showModal();
    (document.querySelector("#inner") as HTMLDialogElement).showModal();
    (document.querySelector("#floating") as HTMLElement).showPopover();
  });
  const draft = page.getByRole("textbox", { name: "Modal draft" });
  await draft.fill("Retained modal draft");
  await draft.focus();
  await page.evaluate(() => scrollTo(0, 500));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(500);
  const state = () =>
    page.evaluate(() => ({
      openDialogs: [...document.querySelectorAll("dialog")].map((item) => item.open),
      popover: document.querySelector("#floating")!.matches(":popover-open"),
      count: document.querySelectorAll("*").length,
      scroll: { x: scrollX, y: scrollY },
      boxes: [...document.querySelectorAll(".guide-target")].map((item) => {
        const { x, y, width, height } = item.getBoundingClientRect();
        return { x, y, width, height };
      }),
    }));
  const before = await state();
  expect(before.openDialogs).toEqual([true, true]);
  expect(before.popover).toBe(true);
  const result = await capturePage(page, {
    out: info.outputPath("modal-guides"),
    target: { id: "modal", title: "Modal layers", ready: "#inner", root: "body" },
    guides: { selectors: [".guide-target"], lines: ["left"] },
    fullPage: true,
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  expect(scene.guides!.targets.map((item) => item.viewportRect)).toEqual(before.boxes);
  expect(scene.guides!.targets.map((item) => item.documentRect.y)).toEqual(
    before.boxes.map((box) => box.y + 500),
  );
  const raw = PNG.sync.read(await readFile(join(result.directory, scene.frame!)));
  const annotated = PNG.sync.read(await readFile(join(result.directory, scene.guides!.frame)));
  const rawFull = PNG.sync.read(await readFile(join(result.directory, scene.fullPage!)));
  const annotatedFull = PNG.sync.read(
    await readFile(join(result.directory, scene.guides!.fullPage!)),
  );
  // Inspect the known white interior of both top-layer targets, not an unrelated page pixel.
  for (const [original, marked, boxes] of [
    [raw, annotated, before.boxes],
    [rawFull, annotatedFull, scene.guides!.targets.map((item) => item.documentRect)],
  ] as const) {
    expect(marked.width).toBe(original.width);
    expect(marked.height).toBe(original.height);
    for (const box of boxes) {
      let changed = 0;
      for (let y = Math.ceil(box.y) + 5; y < box.y + box.height - 5; y++) {
        for (let x = Math.floor(box.x) - 1; x <= Math.ceil(box.x) + 1; x++) {
          const offset = (y * original.width + x) * 4;
          if (
            !original.data
              .subarray(offset, offset + 4)
              .equals(marked.data.subarray(offset, offset + 4))
          )
            changed++;
        }
      }
      expect(changed).toBeGreaterThan(10);
    }
  }
  expect(await state()).toEqual(before);
  await expect(page.locator("[data-meowbook-guides]")).toHaveCount(0);
  await expect(draft).toHaveValue("Retained modal draft");
  await expect(draft).toBeFocused();
  await draft.fill("Still editable");
  await expect(draft).toHaveValue("Still editable");
});

test("guides measure actual boxes without changing the raw image or interaction state", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/dynamic");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const draft = page.getByRole("textbox", { name: "Draft" });
  await draft.fill("Keep this draft");
  await draft.focus();
  await page.locator("#story-root").evaluate((root) => {
    const style = document.createElement("style");
    style.textContent = "input { caret-color: transparent; }";
    root.append(style);
    for (const [index, top] of [300, 321].entries()) {
      const box = document.createElement("div");
      box.className = "guide-box";
      box.id = `guide-box-${index}`;
      box.style.cssText = `position:fixed;left:${80 + index * 180}px;top:${top}px;width:120px;height:40px;background:#123456`;
      root.append(box);
    }
  });
  const before = await page.evaluate(() => ({
    children: document.body.childElementCount,
    descendants: document.querySelectorAll("*").length,
    scroll: { x: scrollX, y: scrollY },
  }));
  const plain = await capturePage(page, { out: info.outputPath("plain"), depth: 0 });
  const marked = await capturePage(page, {
    out: info.outputPath("marked"),
    depth: 0,
    guides: { selectors: [".guide-box"] },
  });
  const scene = marked.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  const guides = scene.guides!;
  expect(guides.targets).toHaveLength(2);
  expect(guides.targets[0]!.viewportRect).toEqual({ x: 80, y: 300, width: 120, height: 40 });
  expect(guides.targets[1]!.viewportRect).toEqual({ x: 260, y: 321, width: 120, height: 40 });
  expect(guides.targets[1]!.delta).toMatchObject({
    left: 180,
    top: 21,
    bottom: 21,
    width: 0,
    height: 0,
  });
  const measurements = JSON.parse(
    await readFile(join(marked.directory, guides.measurements), "utf8"),
  );
  expect(measurements.targets).toEqual(guides.targets);
  const original = PNG.sync.read(
    await readFile(join(plain.directory, plain.manifest.scenes[0]!.frame!)),
  );
  const raw = PNG.sync.read(await readFile(join(marked.directory, scene.frame!)));
  const annotated = PNG.sync.read(await readFile(join(marked.directory, guides.frame)));
  expect(raw.data.equals(original.data)).toBe(true);
  expect(annotated.width).toBe(raw.width);
  expect(annotated.height).toBe(raw.height);
  expect(annotated.data.equals(raw.data)).toBe(false);
  expect(
    await page.evaluate(() => ({
      children: document.body.childElementCount,
      descendants: document.querySelectorAll("*").length,
      scroll: { x: scrollX, y: scrollY },
    })),
  ).toEqual(before);
  await expect(draft).toHaveValue("Keep this draft");
  await expect(draft).toBeFocused();
});

test("scrolled guides retain viewport and document coordinates including offscreen targets", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/tree");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.locator("#story-root").evaluate((root) => {
    (root as HTMLElement).style.minHeight = "2200px";
    document.body.style.position = "static";
    (root as HTMLElement).style.position = "static";
    for (const top of [700, 1700]) {
      const box = document.createElement("div");
      box.className = "document-guide";
      box.style.cssText = `position:absolute;left:80px;top:${top}px;width:120px;height:40px;background:#123456`;
      document.body.append(box);
    }
    scrollTo(0, 500);
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(500);
  const result = await capturePage(page, {
    out: info.outputPath("shots"),
    fullPage: true,
    guides: { selectors: [".document-guide"] },
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  const guides = scene.guides!;
  expect(guides.targets.map((target) => target.viewportRect.y)).toEqual([200, 1200]);
  expect(guides.targets.map((target) => target.documentRect.y)).toEqual([700, 1700]);
  const raw = PNG.sync.read(await readFile(join(result.directory, scene.fullPage!)));
  const annotated = PNG.sync.read(await readFile(join(result.directory, guides.fullPage!)));
  expect(annotated.height).toBe(raw.height);
  expect(annotated.width).toBe(raw.width);
  const lowerRow = 1695 * raw.width * 4;
  expect(annotated.data.subarray(lowerRow).equals(raw.data.subarray(lowerRow))).toBe(false);
  expect(await page.evaluate(() => scrollY)).toBe(500);
});

test("default guides use the selected components and treat selector labels as text", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/tree");
  const result = await capturePage(page, {
    out: info.outputPath("default"),
    select: "CaptureButton",
    depth: 0,
    guides: {},
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  expect(scene.guides!.targets.length).toBeGreaterThan(0);
  expect(scene.guides!.targets.every((target) => target.component === "CaptureButton")).toBe(true);
  const dialogs: string[] = [];
  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Inherited label" }).evaluate((button) => {
    button.setAttribute("data-guide-label", "<img src=x onerror=alert(1)>");
  });
  const labeled = await capturePage(page, {
    out: info.outputPath("labels"),
    guides: { selectors: ['[data-guide-label="<img src=x onerror=alert(1)>"]'] },
  });
  expect(labeled.manifest.scenes[0]!.status).toBe("success");
  expect(dialogs).toEqual([]);
});

test("a failed annotation write cleans up its overlay and preserves existing artifacts", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/dynamic");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const draft = page.getByRole("textbox", { name: "Draft" });
  await draft.fill("Preserve after failure");
  await draft.focus();
  const directory = info.outputPath("existing-scene");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, "guides.png"), "Existing artifact");
  const scene = await captureScene(page, {
    directory,
    pathPrefix: "s001",
    guides: { selectors: ["input"] },
  });
  expect(scene.status).toBe("failed");
  expect(scene.error).toContain("EEXIST");
  expect(scene.guides).toBeUndefined();
  expect(await readFile(join(directory, "guides.png"), "utf8")).toBe("Existing artifact");
  await expect(page.locator("[data-meowbook-guides]")).toHaveCount(0);
  await expect(draft).toHaveValue("Preserve after failure");
  await expect(draft).toBeFocused();
  await draft.fill("Still editable");
  await expect(draft).toHaveValue("Still editable");
});

for (const selector of ["#missing-guide-target", "["]) {
  test(`guide selector failure is explicit and does not leave annotations: ${selector}`, async ({
    page,
  }, info) => {
    await page.goto("/canvas.html?story=capture/tree");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const count = await page.locator("*").count();
    const result = await capturePage(page, {
      out: info.outputPath("shots"),
      guides: { selectors: [selector] },
    });
    const scene = result.manifest.scenes[0]!;
    expect(scene.status).toBe("failed");
    expect(scene.error).toBeTruthy();
    expect(scene.guides).toBeUndefined();
    expect(await page.locator("*").count()).toBe(count);
    await expect(page.getByRole("button", { name: "Inherited label" })).toBeVisible();
  });
}
