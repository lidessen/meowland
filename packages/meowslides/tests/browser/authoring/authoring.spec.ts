import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const directory = resolve(
  import.meta.dir,
  "../../../../../artifacts/meowslides-review/mdx-authoring",
);
const slide = (page: Page) => page.locator('[data-meowui-part="presentation/slide"]');
const picker = (page: Page) => page.getByRole("combobox", { name: "Choose slide" });
const diagnostic = (page: Page) => page.locator('[data-meowui-part="presentation/diagnostic"]');
const ids = ["opening", "compare", "image", "steps", "check", "media", "summary"];

async function ready(page: Page) {
  await expect(picker(page)).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((image) => image.decode()));
    await new Promise<void>((done) =>
      requestAnimationFrame(() => requestAnimationFrame(() => done())),
    );
  });
}

test("one MDX entry renders each authored title once, with real local assets and native lists", async ({
  page,
}) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1") return route.continue();
    external.push(url.href);
    return route.abort();
  });
  await page.goto("/");
  await ready(page);
  await expect(
    slide(page).getByRole("heading", { name: "Read a landscape", exact: true }),
  ).toHaveCount(1);
  expect(
    await picker(page)
      .locator("option")
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
  ).toEqual(ids);
  await picker(page).selectOption("summary");
  await expect(slide(page).getByRole("list")).toHaveCount(1);
  await expect(slide(page).getByRole("listitem")).toHaveCount(3);
  await expect(diagnostic(page)).toBeHidden();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("two explicit columns remain distinct finite regions and a Markdown image keeps every edge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await ready(page);
  await picker(page).selectOption("compare");
  const body = slide(page).locator('[data-meowui-part="presentation-layout/body"]');
  const geometry = await body.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return Array.from(element.children).map((child) => {
      const rect = child.getBoundingClientRect();
      return {
        x: rect.x,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        inside:
          rect.left >= bounds.left - 1 &&
          rect.right <= bounds.right + 1 &&
          rect.bottom <= bounds.bottom + 1,
      };
    });
  });
  expect(geometry).toHaveLength(2);
  expect(geometry.every((region) => region.inside)).toBe(true);
  expect(geometry[0]!.right).toBeLessThan(geometry[1]!.x);
  expect(geometry[0]!.width / geometry[1]!.width).toBeCloseTo(1, 1);
  await expect(slide(page).getByRole("heading", { name: "Forest", exact: true })).toBeVisible();
  await expect(slide(page).getByRole("heading", { name: "Open land", exact: true })).toBeVisible();
  await expect(diagnostic(page)).toBeHidden();
  await picker(page).selectOption("image");
  const image = slide(page).getByRole("img", {
    name: "Original illustration of a coast with mountains, water and a setting sun",
    exact: true,
  });
  await expect
    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBeGreaterThan(0);
  await expect(image).toHaveCSS("object-fit", "contain");
  await expect(slide(page).locator("p > figure")).toHaveCount(0);
  await expect(diagnostic(page)).toBeHidden();
});

test("declared Reveal steps exclude future answers from focus and accessibility until navigation", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await picker(page).selectOption("steps");
  const revealed = slide(page).locator(
    '[data-meowui-part="presentation-reveal/root"][data-revealed="true"]',
  );
  await expect(revealed).toHaveCount(0);
  await expect(slide(page).getByRole("listitem")).toHaveCount(0);
  const concealed = slide(page).locator('[data-meowui-part="presentation-reveal/root"]');
  for (const region of await concealed.all()) {
    await expect(region).toHaveAttribute("inert", "");
    await expect(region).toHaveAttribute("aria-hidden", "true");
  }
  await expect(slide(page).getByText("Describe the landscape.", { exact: true })).toBeHidden();
  const next = page.getByRole("button", { name: "Next", exact: true });
  for (let count = 1; count <= 3; count++) {
    await next.click();
    await expect(revealed).toHaveCount(count);
    await expect(slide(page).getByRole("listitem")).toHaveCount(count);
    await expect(picker(page)).toHaveValue("steps");
  }
  await expect(slide(page).getByText("Explain your evidence.", { exact: true })).toBeVisible();
  await next.click();
  await expect(picker(page)).toHaveValue("check");
});

test("a classroom component keeps session choices across visits and exposes deliberate reset", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await picker(page).selectOption("check");
  const forest = slide(page).getByRole("button", { name: "Forest", exact: true });
  const open = slide(page).getByRole("button", { name: "Open land", exact: true });
  await expect(slide(page).getByRole("status")).toHaveText(
    "Choose a habitat, then check your answer.",
  );
  await open.focus();
  await open.press("Space");
  await expect(open).toHaveAttribute("aria-pressed", "true");
  await slide(page).getByRole("button", { name: "Check", exact: true }).click();
  await expect(slide(page).getByRole("status")).toHaveText(
    "Look again: compare the number of trees.",
  );
  await forest.click();
  await slide(page).getByRole("button", { name: "Check", exact: true }).click();
  await expect(slide(page).getByRole("status")).toHaveText("Yes. Trees provide cover.");
  await picker(page).selectOption("summary");
  await picker(page).selectOption("check");
  await expect(forest).toHaveAttribute("aria-pressed", "true");
  await expect(slide(page).getByRole("status")).toHaveText("Yes. Trees provide cover.");
  await slide(page).getByRole("button", { name: "Reset check", exact: true }).click();
  await expect(forest).toHaveAttribute("aria-pressed", "false");
  await expect(open).toHaveAttribute("aria-pressed", "false");
  await expect(slide(page).getByRole("status")).toHaveText(
    "Choose a habitat, then check your answer.",
  );
});

test("MDX media uses the shared pause and cleanup lifecycle", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await picker(page).selectOption("media");
  const audio = slide(page).locator("audio");
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.readyState))
    .toBeGreaterThan(0);
  const previous = await audio.elementHandle();
  await slide(page).getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime))
    .toBeGreaterThan(0);
  await picker(page).selectOption("summary");
  await expect(audio).toHaveCount(0);
  expect(await previous!.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await picker(page).selectOption("media");
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.readyState))
    .toBeGreaterThan(0);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
});

test("a persisted pagehide preserves the interactive deck and final pagehide disposes it", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await picker(page).selectOption("check");
  const forest = slide(page).getByRole("button", { name: "Forest", exact: true });
  await forest.click();
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })),
  );
  await expect(forest).toHaveAttribute("aria-pressed", "true");
  await slide(page).getByRole("button", { name: "Check", exact: true }).click();
  await expect(slide(page).getByRole("status")).toHaveText("Yes. Trees provide cover.");
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false })),
  );
  await expect(page.locator("#app")).toBeEmpty();
  await expect(page.getByRole("region")).toHaveCount(0);
});

test("the same simple deck keeps controls reachable and content diagnostic-free in wide, narrow and short views", async ({
  page,
}) => {
  await mkdir(directory, { recursive: true });
  const measured = [];
  for (const size of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/");
    await ready(page);
    for (const id of ids) {
      await picker(page).selectOption(id);
      if (id === "steps")
        for (let count = 0; count < 3; count++)
          await page.getByRole("button", { name: "Next", exact: true }).click();
      await ready(page);
      await expect(diagnostic(page)).toBeHidden();
      const controls = page.getByRole("navigation", { name: "Presentation controls" });
      for (const control of [
        picker(page),
        controls.getByRole("button", { name: "Next", exact: true }),
        controls.getByRole("button", { name: "Presentation options", exact: true }),
      ]) {
        const bounds = await control.boundingBox();
        expect(bounds!.x).toBeGreaterThanOrEqual(-1);
        expect(bounds!.y).toBeGreaterThanOrEqual(-1);
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(size.width + 1);
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(size.height + 1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      measured.push({ size, id, canvas: await slide(page).boundingBox() });
      if (["opening", "compare", "image", "steps", "check"].includes(id))
        await page.screenshot({
          path: resolve(directory, `${id}-${size.width}x${size.height}.png`),
          animations: "disabled",
        });
    }
  }
  await writeFile(resolve(directory, "geometry.json"), JSON.stringify(measured, null, 2));
});
