import { expect, test, type Page } from "@playwright/test";

const slide = '[data-meowui-part="presentation/slide"]';
const frame = '[data-meowui-part="presentation/stage"]';
const first = (page: Page) => page.getByRole("region", { name: "First test deck", exact: true });
const animations = (page: Page) =>
  first(page)
    .locator(slide)
    .evaluate((element) => element.getAnimations().length);
const jump = (page: Page, slideId: string, step = 0) =>
  page.evaluate((position) => window.presentationTest.jump(0, position), { slideId, step });

for (const effect of ["fade", "slide", "zoom"]) {
  test(`${effect} decorates new pages, keeps fit scaling and releases its animation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/?chrome=single&transition=${effect}`);
    expect(await animations(page)).toBe(0);
    await jump(page, "discussion");
    await expect.poll(() => animations(page)).toBe(1);
    const state = await first(page)
      .locator(slide)
      .evaluate((element) => {
        const animation = element.getAnimations()[0]!;
        return {
          opacity: getComputedStyle(element).opacity,
          transform: element.style.transform,
          duration: animation.effect!.getTiming().duration,
          overflow: element.parentElement!.style.overflow,
        };
      });
    expect(Number(state.opacity)).toBeLessThan(1);
    expect(state.transform).toContain("scale(");
    expect(state.duration).toBe(420);
    expect(state.overflow).toBe("clip");
    await expect.poll(() => animations(page)).toBe(0);
    await expect(first(page).locator(frame)).toHaveCSS("overflow", "visible");
    await expect(first(page).locator(slide)).toHaveCSS("opacity", "1");
  });
}

test("rapid navigation cancels decoration, immediately unmounts old media and keeps only the latest page", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?chrome=single&transition=slide");
  await jump(page, "media");
  await expect.poll(() => animations(page)).toBe(1);
  const video = first(page).locator("video");
  await expect
    .poll(() => video.evaluate((element: HTMLMediaElement) => element.readyState))
    .toBeGreaterThan(0);
  const oldVideo = await video.elementHandle();
  await video.evaluate(async (element: HTMLMediaElement) => {
    element.muted = true;
    await element.play();
  });
  await first(page).getByRole("combobox", { name: "Choose slide" }).selectOption("discussion");
  await expect(video).toHaveCount(0);
  expect(await oldVideo!.evaluate((element: HTMLMediaElement) => element.paused)).toBe(true);
  await jump(page, "experiment", 3);
  await jump(page, "discussion");
  await expect(first(page).locator("[data-fixture-slide]")).toHaveCount(1);
  await expect(first(page).locator('[data-fixture-slide="discussion"]')).toBeVisible();
  await expect.poll(() => animations(page)).toBe(0);
  await expect(first(page).locator(frame)).toHaveCSS("overflow", "visible");
  expect(errors).toEqual([]);
});

test("Reveal animates only its own mounted threshold and hides focus immediately", async ({
  page,
}) => {
  await page.goto("/?chrome=single&transition=zoom&step=3");
  const reveals = first(page).locator('[data-meowui-part="presentation-reveal/root"]');
  expect(
    await reveals.evaluateAll(
      (elements) => elements.flatMap((element) => element.getAnimations()).length,
    ),
  ).toBe(0);
  await jump(page, "experiment", 0);
  await jump(page, "experiment", 2);
  const reveal = reveals.first();
  await expect.poll(() => reveal.evaluate((element) => element.getAnimations().length)).toBe(1);
  await first(page).getByRole("button", { name: "Revealed action", exact: true }).focus();
  await jump(page, "experiment", 0);
  await expect(reveal).toHaveAttribute("inert", "");
  await expect(reveal).toBeHidden();
  expect(await reveal.evaluate((element) => element.getAnimations().length)).toBe(0);
  await expect(
    first(page).getByRole("heading", { name: "First test deck", exact: true }),
  ).toBeFocused();
});

test("activity and reduced motion cancel current or pending entrances without replay", async ({
  page,
}) => {
  await page.goto("/?chrome=single&transition=slide");
  await jump(page, "discussion");
  await expect.poll(() => animations(page)).toBe(1);
  await page.evaluate(() => window.presentationTest.allow(0, false));
  await expect.poll(() => animations(page)).toBe(0);
  await page.evaluate(() => window.presentationTest.allow(0, true));
  expect(await animations(page)).toBe(0);
  await jump(page, "media");
  await expect.poll(() => animations(page)).toBe(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => animations(page)).toBe(0);
  await jump(page, "experiment", 2);
  expect(await animations(page)).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await animations(page)).toBe(0);
  await page.evaluate(async () => {
    window.presentationTest.jump(0, { slideId: "discussion", step: 0 });
    await Promise.resolve();
    window.presentationTest.allow(0, false);
    await Promise.resolve();
    window.presentationTest.allow(0, true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  expect(await animations(page)).toBe(0);
});

test("dynamic text waits for Reveal movement before diagnosing logical overflow", async ({
  page,
}) => {
  await page.goto("/?chrome=single&transition=slide");
  const diagnostic = first(page).locator('[data-meowui-part="presentation/diagnostic"]');
  const reveal = first(page).locator('[data-meowui-part="presentation-reveal/root"]').first();
  await reveal.evaluate((element: HTMLElement) => {
    // Fit at the logical bottom; entrance movement temporarily exceeds the canvas.
    Object.assign(element.style, {
      position: "absolute",
      bottom: "0",
      left: "0",
      height: "24px",
      fontSize: "14px",
      lineHeight: "20px",
    });
  });
  await jump(page, "experiment", 2);
  await expect.poll(() => reveal.evaluate((element) => element.getAnimations().length)).toBe(1);
  const samples = await reveal.evaluate(async (element) => {
    element.querySelector("button")!.firstChild!.textContent = "Dynamic short label";
    const diagnostic = element
      .closest("section[aria-label]")!
      .querySelector<HTMLElement>('[data-meowui-part="presentation/diagnostic"]')!;
    const hidden: boolean[] = [];
    for (let frame = 0; frame < 4; frame++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      hidden.push(diagnostic.hidden === true);
    }
    return hidden;
  });
  expect(samples.every(Boolean)).toBe(true);
  await expect.poll(() => reveal.evaluate((element) => element.getAnimations().length)).toBe(0);
  await expect(diagnostic).toBeHidden();
  await jump(page, "experiment", 0);
  await jump(page, "experiment", 2);
  await expect.poll(() => reveal.evaluate((element) => element.getAnimations().length)).toBe(1);
  await reveal.evaluate((element) => {
    const content = document.createElement("p");
    content.textContent = "Overflowing dynamic content. ".repeat(120);
    element.append(content);
  });
  await expect(diagnostic).toBeVisible();
  await jump(page, "discussion");
  await expect(diagnostic).toBeHidden();
});

test("a browser that rejects animation still navigates and restores the stage", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Element.prototype.animate = () => {
      throw new TypeError("Unsupported animation property");
    };
  });
  await page.goto("/?chrome=single&transition=slide");
  await jump(page, "discussion");
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await expect(first(page).locator('[data-fixture-slide="discussion"]')).toBeVisible();
  await expect(first(page).locator(frame)).toHaveCSS("overflow", "visible");
  expect(await animations(page)).toBe(0);
  expect(errors).toEqual([]);
});
