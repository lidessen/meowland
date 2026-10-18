import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/canvas.html?story=presentation-support");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("a controlled grid region keeps natural geometry, input identity and focus fallback", async ({
  page,
}) => {
  const region = page.locator("[data-support-controlled]");
  const input = page.locator("#presentation-support-draft");
  const original = await input.elementHandle();
  const geometry = () =>
    page.locator("[data-support-grid]").evaluate((node) =>
      [node, ...node.children].map((element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }),
    );
  const concealedGeometry = await geometry();
  expect(concealedGeometry[2]!.height).toBeGreaterThan(0);
  await expect(region).toHaveAttribute("inert", "");
  await expect(region).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("textbox", { name: "Supporting draft", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle supporting detail", exact: true }).click();
  expect(await geometry()).toEqual(concealedGeometry);
  await input.fill("Retained controlled draft");
  await expect(input).toHaveAttribute("data-support-mount", "1");
  await expect(region).not.toHaveAttribute("when");
  await page.locator("[data-support-toggle]").evaluate((node: HTMLButtonElement) => node.click());
  await expect(
    page.getByRole("heading", { name: "Controlled supporting detail", exact: true }),
  ).toBeFocused();
  await expect(region).toHaveAttribute("data-revealed", "false");
  expect(await geometry()).toEqual(concealedGeometry);
  await page.getByRole("button", { name: "Toggle supporting detail", exact: true }).click();
  await expect(input).toHaveValue("Retained controlled draft");
  await expect(input).toHaveAttribute("data-support-mount", "1");
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await page.setViewportSize({ width: 390, height: 330 });
  expect(
    await region.evaluate((node) =>
      [node, ...node.querySelectorAll("[data-meowui-part]")].every(
        (element) =>
          element.matches("input, textarea, select") ||
          element.scrollWidth <= element.clientWidth + 1,
      ),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("nested when and at share ancestor activity without replaying entrances on restoration", async ({
  page,
}) => {
  const region = page.locator("[data-support-controlled]");
  const nested = page.locator("[data-support-nested]");
  const activity = page.locator('[data-support-activity="nested"]');
  await expect(page.locator("[data-support-initial]")).toBeVisible();
  expect(
    await page.locator("[data-support-initial]").evaluate((node) => node.getAnimations().length),
  ).toBe(0);
  await page.getByRole("button", { name: "Toggle host activity", exact: true }).click();
  expect(
    await page.locator("[data-support-initial]").evaluate((node) => node.getAnimations().length),
  ).toBe(0);
  await expect(activity).toHaveAttribute("data-active", "false");
  await page.getByRole("button", { name: "Toggle supporting detail", exact: true }).click();
  await expect(activity).toHaveAttribute("data-active", "true");
  await expect.poll(() => region.evaluate((node) => node.getAnimations().length)).toBe(1);
  await expect.poll(() => region.evaluate((node) => node.getAnimations().length)).toBe(0);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("[data-support-step]")).toHaveAttribute("data-revealed", "true");
  await page.getByRole("button", { name: "Toggle supporting detail", exact: true }).click();
  await expect(activity).toHaveAttribute("data-active", "false");
  await expect(page.locator("[data-support-step-zero]")).toBeHidden();
  await expect(page.getByRole("button", { name: "Nested detail action", exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Toggle nested detail", exact: true }).click();
  await page.getByRole("button", { name: "Toggle nested detail", exact: true }).click();
  expect(await nested.evaluate((node) => node.getAnimations().length)).toBe(0);
  await page.getByRole("button", { name: "Toggle supporting detail", exact: true }).click();
  await expect(activity).toHaveAttribute("data-active", "true");
  expect(await nested.evaluate((node) => node.getAnimations().length)).toBe(0);
  await page.getByRole("button", { name: "Toggle host activity", exact: true }).click();
  expect(await region.evaluate((node) => node.getAnimations().length)).toBe(0);
  await page.getByRole("button", { name: "Toggle host activity", exact: true }).click();
  expect(await region.evaluate((node) => node.getAnimations().length)).toBe(0);
});

test("concealment cancels a local entrance and reduced motion does not queue a replay", async ({
  page,
}) => {
  const region = page.locator("[data-support-controlled]");
  await page.getByRole("button", { name: "Toggle host activity", exact: true }).click();
  await page.getByRole("button", { name: "Toggle supporting detail", exact: true }).click();
  await expect.poll(() => region.evaluate((node) => node.getAnimations().length)).toBe(1);
  await page.locator("[data-support-toggle]").evaluate((node: HTMLButtonElement) => node.click());
  await expect(region).toBeHidden();
  expect(await region.evaluate((node) => node.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Toggle supporting detail", exact: true }).click();
  await expect(region).toBeVisible();
  expect(await region.evaluate((node) => node.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await region.evaluate((node) => node.getAnimations().length)).toBe(0);
});

test("controlled concealment pauses native media without remounting or resuming it", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=presentation-reveal-media");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const audio = page.locator("audio");
  const original = await audio.elementHandle();
  await expect
    .poll(() => audio.evaluate((node: HTMLAudioElement) => node.readyState))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Toggle media permission", exact: true }).click();
  await audio.evaluate(async (node: HTMLAudioElement) => {
    node.muted = true;
    await node.play();
  });
  await expect.poll(() => audio.evaluate((node: HTMLAudioElement) => node.paused)).toBe(false);
  await page.getByRole("button", { name: "Toggle media region", exact: true }).click();
  await expect(audio).toBeHidden();
  await expect.poll(() => audio.evaluate((node: HTMLAudioElement) => node.paused)).toBe(true);
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await page.getByRole("button", { name: "Toggle media region", exact: true }).click();
  await expect(audio).toBeVisible();
  await expect(audio).toHaveAttribute("data-reveal-media-mount", "1");
  expect(await audio.evaluate((node: HTMLAudioElement) => node.paused)).toBe(true);
});
