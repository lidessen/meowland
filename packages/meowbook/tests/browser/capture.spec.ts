import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PNG } from "pngjs";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { capturePage } from "../../src/playwright";

test("Inspector captures short dialog ownership and retains drafts, focus and scroll", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/inspector");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "Open short dialog", exact: true }).click();
  const draft = page.getByRole("textbox", { name: "Inspector draft", exact: true });
  await draft.fill("Private draft excluded from DOM facts");
  const body = page.locator('dialog [data-meowui-part="page-frame/body"]');
  const before = await body.evaluate((element) => ({
    top: element.scrollTop,
    height: element.clientHeight,
    extent: element.scrollHeight,
  }));
  const result = await capturePage(page, {
    out: info.outputPath("inspector-shots"),
    name: "short-dialog",
    depth: "all",
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  expect(scene.activeFocus).toMatchObject({ status: "observed", part: "page-frame/body" });
  const owner = scene.scrollViews!.find(
    (viewport) => viewport.part === "page-frame/body" && viewport.declaredOwner === "layout",
  )!;
  expect(owner).toMatchObject({
    status: "observed",
    clientHeight: before.height,
    scrollHeight: before.extent,
    scrollTop: before.top,
    overflowY: "auto",
  });
  expect(owner.scrollHeight).toBeGreaterThan(owner.clientHeight);
  expect(scene.nodes.find((node) => node.id === owner.instanceId)?.name).toBe("page-frame");
  expect(
    JSON.stringify({ activeFocus: scene.activeFocus, scrollViews: scene.scrollViews }),
  ).not.toContain("Private draft");
  await expect(draft).toHaveValue("Private draft excluded from DOM facts");
  await expect(draft).toBeFocused();
  expect(await body.evaluate((element) => element.scrollTop)).toBe(before.top);
  const report = await page.context().newPage();
  try {
    await report.goto(pathToFileURL(result.reportPath).href);
    const facts = report.getByText("DOM focus and scroll facts", { exact: true });
    await facts.click();
    await facts.scrollIntoViewIfNeeded();
    await expect(report.locator("#scene-0")).toContainText('"declaredOwner": "layout"');
    await expect(report.locator("#scene-0")).toContainText(`"scrollTop": ${before.top}`);
    await report.screenshot({ path: info.outputPath("inspector-report.png") });
  } finally {
    await report.close();
  }
  await page.keyboard.press("Escape");
  const closed = await page.evaluate(() => window.__MEOWBOOK_CAPTURE__!.snapshot());
  expect(closed.activeFocus).toMatchObject({ status: "observed" });
  expect(closed.activeFocus).not.toEqual(scene.activeFocus);
  await page.goto("/canvas.html?story=capture/dynamic");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const next = await page.evaluate(() => window.__MEOWBOOK_CAPTURE__!.snapshot());
  expect(next.scrollViews!.some((viewport) => viewport.declaredOwner)).toBe(false);
});

test("Inspector reads open shadow regions and marks opaque iframe focus as unknown", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/inspector");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const draft = page.getByRole("textbox", { name: "Shadow draft", exact: true });
  await draft.fill("Shadow input remains intact");
  const viewport = page.locator('[data-region-content="reader"]');
  await viewport.evaluate((element) => {
    element.scrollTop = 25;
  });
  const before = await viewport.evaluate((element) => ({
    top: element.scrollTop,
    extent: element.scrollHeight,
  }));
  const result = await capturePage(page, {
    out: info.outputPath("inspector-shots"),
    name: "shadow-region",
    depth: "all",
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  expect(scene.activeFocus).toEqual({
    status: "unknown",
    reason: "unmapped-node",
    part: "region-layout/content",
  });
  expect(
    scene.scrollViews!.find(
      (view) => view.region === "reader" && view.part === "region-layout/content",
    ),
  ).toMatchObject({
    declaredOwner: "layout",
    scrollTop: before.top,
    scrollHeight: before.extent,
  });
  expect(
    scene.scrollViews!.some(
      (view) =>
        view.region === "reader" && !view.declaredOwner && view.scrollHeight > view.clientHeight,
    ),
  ).toBe(true);
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue("Shadow input remains intact");
  expect(await viewport.evaluate((element) => element.scrollTop)).toBe(before.top);
  await page.frameLocator("iframe").getByRole("textbox", { name: "Frame draft" }).focus();
  const opaque = await page.evaluate(() => window.__MEOWBOOK_CAPTURE__!.snapshot());
  expect(opaque.activeFocus).toEqual({ status: "unknown", reason: "iframe-content-unobserved" });
});

test("Inspector records rapid End focus with the menu's actual scroll offset", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/inspector");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "Open long menu", exact: true }).press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Action 1", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("menuitem", { name: "Action 40", exact: true })).toBeFocused();
  const result = await capturePage(page, {
    out: info.outputPath("inspector-shots"),
    name: "rapid-end",
    depth: "all",
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  expect(scene.activeFocus).toMatchObject({ status: "observed", part: "menu/item" });
  expect(
    scene.scrollViews!.some(
      (viewport) => viewport.scrollTop > 0 && viewport.scrollHeight > viewport.clientHeight,
    ),
  ).toBe(true);
  await expect(page.getByRole("menuitem", { name: "Action 40", exact: true })).toBeFocused();
});

test("Inspector preserves known select focus and distinguishes unmapped and ambiguous ownership", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=capture/inspector");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("combobox", { name: "Native inspector choice" }).focus();
  const native = await page.evaluate(() => window.__MEOWBOOK_CAPTURE__!.snapshot());
  expect(native.activeFocus).toMatchObject({ status: "observed" });
  expect(native.nodes.find((node) => node.id === native.activeFocus?.instanceId)?.name).toBe(
    "InspectorApp",
  );
  const ambiguous = await page
    .locator("#story-root")
    .evaluate((root) => JSON.parse((root as HTMLElement).dataset.ambiguousFacts!));
  expect(
    ambiguous.scrollViews.find((view: { region?: string }) => view.region === "reader"),
  ).toMatchObject({ status: "unknown", reason: "ambiguous-owner", declaredOwner: "layout" });
  await page.evaluate(() => {
    const control = document.createElement("input");
    document.body.append(control);
    control.focus();
  });
  expect((await page.evaluate(() => window.__MEOWBOOK_CAPTURE__!.snapshot())).activeFocus).toEqual({
    status: "unknown",
    reason: "unmapped-node",
  });
  await page.evaluate(() => {
    const host = document.createElement("inspector-opaque-control");
    document.body.append(host);
    const hidden = host.attachShadow({ mode: "closed" });
    const control = document.createElement("input");
    hidden.append(control);
    control.focus();
  });
  expect((await page.evaluate(() => window.__MEOWBOOK_CAPTURE__!.snapshot())).activeFocus).toEqual({
    status: "unknown",
    reason: "shadow-content-unobserved",
  });
});

test("live pages retain their host and opaque iframe pixels without a story observer", async ({
  page,
}, info) => {
  await page.route("**/live-photo?*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><body style="margin:0"><h1 id="live-ready">Application</h1><iframe title="Embedded widget" sandbox="allow-scripts allow-forms" style="width:300px;height:150px;border:0" srcdoc="&lt;input aria-label=&quot;Draft&quot;&gt;"></iframe></body>',
    }),
  );
  await page.goto("/live-photo?token=fixture-only#state");
  const draft = page.frameLocator("iframe").getByRole("textbox", { name: "Draft" });
  await draft.fill("Retained draft");
  const result = await capturePage(page, {
    out: info.outputPath("live-shots"),
    target: { id: "actual-page", title: "Application", ready: "#live-ready" },
    guides: { selectors: ["#live-ready"], lines: ["left"] },
    fullPage: true,
  });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  expect(scene.source).toMatchObject({ kind: "page", root: "body" });
  expect(scene.source!.url).not.toContain("token");
  expect(scene.source!.url).not.toContain("#");
  expect(scene.boundaries!.join(" ")).toContain("not observed MeowJSX components");
  const embedded = scene.nodes.find((node) => node.name === "iframe: Embedded widget")!;
  expect(embedded.approximate).toContain("iframe-content-unobserved");
  const crop = PNG.sync.read(await readFile(join(result.directory, embedded.image!)));
  expect(embedded.contentRect).toMatchObject({ width: 300, height: 150 });
  // Local photographs include surrounding context and are clipped to the host viewport.
  expect(crop.width).toBeGreaterThanOrEqual(300);
  expect(crop.width).toBeLessThanOrEqual(308);
  expect(crop.height).toBeGreaterThanOrEqual(150);
  expect(crop.height).toBeLessThanOrEqual(159);
  expect(scene.guides!.frame).toBeDefined();
  expect(scene.fullPage).toBeDefined();
  await expect(draft).toHaveValue("Retained draft");
  await expect(draft).toBeFocused();
  expect(await page.evaluate(() => window.__MEOWBOOK_CAPTURE__)).toBeUndefined();
});

test("live readiness failures remain diagnostic and do not count as successful photos", async ({
  page,
}, info) => {
  await page.goto("/");
  const result = await capturePage(page, {
    out: info.outputPath("live-shots"),
    target: { id: "not-ready", title: "Not ready", ready: "#missing-live-ready" },
    timeout: 300,
  });
  const scene = result.manifest.scenes[0]!;
  expect(result.manifest.status).toBe("partial");
  expect(scene.status).toBe("failed");
  expect(scene.frame).toBeUndefined();
  expect(scene.diagnostic).toBeDefined();
});

test("capture traverses transparent providers and keeps repeated instances and text output", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/tree");
  const result = await capturePage(page, { out: info.outputPath("shots") });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  expect(scene.nodes.filter((node) => node.name === "CaptureButton")).toHaveLength(3);
  const buttons = scene.nodes.filter((node) => node.name === "CaptureButton");
  expect(buttons.filter((node) => node.image)).toHaveLength(2);
  const nestedParent = scene.nodes.find((node) => node.name === "VisibleLayout")!.id;
  expect(buttons.find((node) => node.parentId === nestedParent)!.selection).toBe("depth");
  expect(scene.nodes.find((node) => node.name === "TransparentLayout")).toMatchObject({
    transparent: true,
    selection: "transparent",
  });
  expect(scene.nodes.find((node) => node.transparentReason === "context-provider")).toBeDefined();
  expect(scene.nodes.find((node) => node.name === "TextOutput")?.image).toBeDefined();
  expect(
    scene.nodes.find((node) => node.name === "MultiRoot")!.rects.length,
  ).toBeGreaterThanOrEqual(2);
  expect(scene.nodes.find((node) => node.name === "EmptyOutput")!.visibility).toBe(
    "no-visual-output",
  );
  expect(scene.nodes.some((node) => node.name === "PreviewContainer")).toBe(false);
  await expect(page.getByRole("button", { name: "Inherited label" })).toBeVisible();
  await expect(page.locator("#story-state")).toBeHidden();
  const all = await capturePage(page, {
    out: info.outputPath("shots"),
    select: "CaptureButton",
    depth: 0,
  });
  expect(all.manifest.scenes[0]!.matched).toBe(3);
  expect(all.manifest.scenes[0]!.nodes.filter((node) => node.image)).toHaveLength(3);
});

test("replacement identity controls transparency and explicit transparent selection remains possible", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/replaced");
  const result = await capturePage(page, {
    out: info.outputPath("shots"),
    select: "TransparentLayout",
    depth: 0,
  });
  const scene = result.manifest.scenes[0]!;
  const node = scene.nodes.find((node) => node.originalName === "TransparentLayout")!;
  expect(node).toMatchObject({
    name: "ErrorPanel",
    transparent: false,
    matched: true,
    captureDepth: 0,
  });
  expect(node.image).toBeDefined();
  expect(scene.replacements?.[0]).toMatchObject({ hits: 1 });
  await page.goto("/canvas.html?story=capture/tree");
  const transparent = await capturePage(page, {
    out: info.outputPath("shots"),
    select: "TransparentLayout",
    depth: 0,
  });
  expect(
    transparent.manifest.scenes[0]!.nodes.find((node) => node.name === "TransparentLayout"),
  ).toMatchObject({ transparent: true, selection: "selected", captureDepth: 0 });
});

test("capture preserves input and observes deferred replacement without stale instances", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/dynamic");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("textbox", { name: "Draft" }).fill("Keep this draft");
  await page.getByRole("button", { name: "Replace", exact: true }).click();
  await expect(page.getByRole("button", { name: "Deferred", exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Draft" }).focus();
  await page.locator("#story-root").evaluate((root) => {
    (root as HTMLElement).style.minHeight = "1800px";
    (root as HTMLElement).style.position = "relative";
    const footer = document.createElement("div");
    footer.textContent = "Below the viewport";
    footer.style.cssText =
      "position:absolute;top:1720px;width:100px;height:40px;background:#123456";
    root.append(footer);
  });
  const result = await capturePage(page, {
    out: info.outputPath("shots"),
    name: "focused",
    testLocation: "capture.spec.ts",
    depth: "all",
    fullPage: true,
  });
  expect(
    result.manifest.scenes[0]!.nodes.filter((node) => node.name === "CaptureButton"),
  ).toHaveLength(1);
  expect(result.manifest.scenes[0]!.testLocation).toBe("capture.spec.ts");
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("success");
  const frame = PNG.sync.read(await readFile(join(result.directory, scene.frame!)));
  const documentImage = PNG.sync.read(await readFile(join(result.directory, scene.fullPage!)));
  expect(frame.height).toBe(page.viewportSize()!.height);
  expect(documentImage.height).toBeGreaterThanOrEqual(1800);
  const footerPixels = documentImage.data.subarray(frame.height * documentImage.width * 4);
  expect(
    footerPixels.some(
      (_value, offset) =>
        offset % 4 === 0 &&
        footerPixels[offset] === 0x12 &&
        footerPixels[offset + 1] === 0x34 &&
        footerPixels[offset + 2] === 0x56,
    ),
  ).toBe(true);
  expect(scene.environment?.fullPageSize).toEqual({
    width: documentImage.width,
    height: documentImage.height,
  });
  await expect(page.getByRole("textbox", { name: "Draft" })).toHaveValue("Keep this draft");
  await expect(page.getByRole("textbox", { name: "Draft" })).toBeFocused();
});

test("full-page settling accepts a matching viewport and document pair", async ({ page }, info) => {
  await page.goto("/canvas.html?story=capture/tree");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const button = page.getByRole("button", { name: "Inherited label" });
  await button.evaluate((element) => {
    (element as HTMLElement).style.cssText =
      "width:120px;height:40px;background:#123456;border:0;border-radius:0";
  });
  const originalScreenshot = page.screenshot;
  let changed = false;
  page.screenshot = async (options) => {
    const image = await originalScreenshot.call(page, options);
    if (options?.fullPage && !changed) {
      changed = true;
      // Inject the observed late-layout failure after a real full-page paint.
      await button.evaluate((element) => {
        (element as HTMLElement).style.cssText =
          "width:200px;height:40px;margin-left:31px;background:#654321;border:0;border-radius:0";
      });
    }
    return image;
  };
  try {
    const result = await capturePage(page, { out: info.outputPath("shots"), fullPage: true });
    const scene = result.manifest.scenes[0]!;
    expect(scene.status, scene.error).toBe("success");
    expect(changed).toBe(true);
    const rect = (await button.boundingBox())!;
    expect(
      scene.nodes.some((node) => node.rects.some((box) => box.width === 200 && box.x === rect.x)),
    ).toBe(true);
    for (const path of [scene.frame!, scene.fullPage!]) {
      const png = PNG.sync.read(await readFile(join(result.directory, path)));
      const offset = (Math.floor(rect.y + 5) * png.width + Math.floor(rect.x + rect.width - 5)) * 4;
      expect([...png.data.subarray(offset, offset + 3)]).toEqual([0x65, 0x43, 0x21]);
    }
  } finally {
    page.screenshot = originalScreenshot;
  }
});

test("full-page capture rejects oversized documents without accepting a partial photo", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/tree");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.locator("#story-root").evaluate((root) => {
    (root as HTMLElement).style.minHeight = "100000px";
  });
  const result = await capturePage(page, { out: info.outputPath("shots"), fullPage: true });
  const scene = result.manifest.scenes[0]!;
  expect(scene.status).toBe("failed");
  expect(scene.error).toContain("32 megapixel");
  expect(scene.frame).toBeUndefined();
  expect(scene.fullPage).toBeUndefined();
  expect(scene.diagnostic).toBeDefined();
  expect(page.isClosed()).toBe(false);
});

test("geometry distinguishes hidden, offscreen and ancestor clipping", async ({ page }, info) => {
  await page.goto("/canvas.html?story=capture/geometry");
  const result = await capturePage(page, { out: info.outputPath("shots"), depth: "all" });
  const nodes = result.manifest.scenes[0]!.nodes;
  expect(nodes.find((node) => node.name === "HiddenOutput")).toMatchObject({
    visibility: "hidden",
  });
  expect(nodes.find((node) => node.name === "OffscreenOutput")).toMatchObject({
    visibility: "offscreen",
  });
  expect(nodes.find((node) => node.name === "ClippedOutput")).toMatchObject({
    visibility: "clipped",
  });
  expect(nodes.filter((node) => node.name === "CaptureButton" && node.image)).toHaveLength(2);
  expect(nodes.find((node) => node.name === "GeometryApp")!.image).toBeDefined();
});

test("DPR two crops contain exactly the accepted frame pixels", async ({ browser }, info) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  try {
    await page.goto("http://127.0.0.1:13006/canvas.html?story=capture/tree");
    const result = await capturePage(page, {
      out: info.outputPath("shots"),
      select: "CaptureButton",
      depth: 0,
    });
    const scene = result.manifest.scenes[0]!;
    const frame = PNG.sync.read(await readFile(join(result.directory, scene.frame!)));
    expect(frame.width).toBe(780);
    expect(frame.height).toBe(1688);
    for (const node of scene.nodes.filter((node) => node.image)) {
      const crop = PNG.sync.read(await readFile(join(result.directory, node.image!)));
      const region = node.pixelRect!;
      expect(crop.width).toBe(region.width);
      for (let y = 0; y < crop.height; y++) {
        const offset = ((region.y + y) * frame.width + region.x) * 4;
        expect(
          crop.data
            .subarray(y * crop.width * 4, (y + 1) * crop.width * 4)
            .equals(frame.data.subarray(offset, offset + crop.width * 4)),
        ).toBe(true);
      }
    }
  } finally {
    await context.close();
  }
});

test("ready timeout and rendering error produce diagnostic failure without closing caller page", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/timeout");
  const timeout = await capturePage(page, { out: info.outputPath("shots"), timeout: 300 });
  expect(timeout.manifest.scenes[0]!.status).toBe("failed");
  expect(timeout.manifest.scenes[0]!.story.id).toBe("capture/timeout");
  expect(timeout.manifest.scenes[0]!.frame).toBeUndefined();
  expect(timeout.manifest.scenes[0]!.diagnostic).toBeDefined();
  expect(page.isClosed()).toBe(false);
  await page.goto("/canvas.html?story=runtime/render-error");
  const failed = await capturePage(page, { out: info.outputPath("shots") });
  expect(failed.manifest.scenes[0]!.error).toContain("fixture render error");
  expect(failed.manifest.scenes[0]!.story.id).toBe("runtime/render-error");
});
test("hidden failed and closed-dialog lazy images do not block current viewport capture", async ({
  page,
}, info) => {
  await page.goto("/canvas.html?story=capture/hidden-images");
  const result = await capturePage(page, { out: info.outputPath("shots"), timeout: 1000 });
  expect(result.manifest.scenes[0]!.status).toBe("success");
});

test("CLI cancellation preserves completed scenes and marks the remainder unexecuted", async ({
  browserName: _browserName,
}, info) => {
  const child = spawn(
    "bun",
    [
      "packages/meowbook/src/cli.ts",
      "capture",
      "--config",
      "packages/meowbook/tests/fixtures/story.config.ts",
      "--all",
      "--out",
      info.outputPath("batch"),
      "--json",
    ],
    { cwd: fileURLToPath(new URL("../../../../", import.meta.url)) },
  );
  let stdout = "",
    stderr = "",
    stopped = false;
  child.stdout.on("data", (chunk) => {
    stdout += String(chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk);
    if (!stopped && /Capturing \d+\/\d+: capture\/timeout/.test(stderr)) {
      stopped = true;
      child.kill("SIGINT");
    }
  });
  const timeout = setTimeout(() => child.kill("SIGKILL"), 15000);
  try {
    const code = await new Promise<number | null>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    });
    expect(code, stderr).toBe(130);
    const result = JSON.parse(stdout.trim());
    expect(result.status).toBe("cancelled");
    expect(result.successful).toBeGreaterThan(0);
    expect(result.unexecuted).toBeGreaterThan(0);
    const manifest = JSON.parse(await readFile(result.manifestPath, "utf8"));
    const completed = manifest.scenes.find(
      (scene: { status: string }) => scene.status === "success",
    );
    expect(completed).toBeDefined();
    expect(PNG.sync.read(await readFile(join(result.directory, completed.frame))).width).toBe(1100);
    expect(manifest.scenes.some((scene: { status: string }) => scene.status === "unexecuted")).toBe(
      true,
    );
  } finally {
    clearTimeout(timeout);
  }
});

test("CLI temporary component capture keeps typed props and static source identity", async ({
  browserName: _browserName,
}, info) => {
  const { stdout } = await promisify(execFile)(
    "bun",
    [
      "packages/meowbook/src/cli.ts",
      "capture",
      "--config",
      "packages/meowbook/tests/fixtures/story.config.ts",
      "--component",
      "packages/meowbook/tests/fixtures/components.tsx",
      "--export",
      "FixtureButton",
      "--props-file",
      "packages/meowbook/tests/fixtures/capture.props.json",
      "--out",
      info.outputPath("temporary"),
      "--json",
    ],
    { cwd: fileURLToPath(new URL("../../../../", import.meta.url)), timeout: 15000 },
  );
  const result = JSON.parse(stdout);
  expect(result.status).toBe("complete");
  expect(result.requested).toBe(1);
  const manifest = JSON.parse(await readFile(result.manifestPath, "utf8"));
  const scene = manifest.scenes[0];
  expect(scene.story.id).toBe("temporary/component");
  expect(scene.nodes[0].name).toBe("FixtureButton");
  expect(scene.story.file.endsWith("components.tsx")).toBe(true);
  expect(await readFile(join(result.directory, scene.aria), "utf8")).toContain(
    'button "Temporary fixture" [disabled]',
  );
  expect(manifest.references.props.sha256).toMatch(/^[a-f0-9]{64}$/);
});
