import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/canvas.html?story=presentation-audio");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("a real root soundtrack preserves its element and playback across pages, then pauses without automatic resume", async ({
  page,
}) => {
  const deck = page.getByRole("region", { name: "One soundtrack across slides", exact: true });
  const audio = deck.locator("audio");
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.readyState))
    .toBeGreaterThan(0);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  const original = await audio.elementHandle();
  await page.getByRole("button", { name: "Allow media playback", exact: true }).click();
  await deck.getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime))
    .toBeGreaterThan(0);
  const timeBeforeNavigation = await audio.evaluate(
    (element: HTMLAudioElement) => element.currentTime,
  );
  await deck.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    deck.getByRole("heading", { name: "One track. Two pages.", exact: true }),
  ).toBeVisible();
  expect(await audio.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  expect(
    await audio.evaluate((element: HTMLAudioElement) => element.currentTime),
  ).toBeGreaterThanOrEqual(timeBeforeNavigation);
  await deck.getByRole("button", { name: "Presentation options", exact: true }).click();
  await deck.getByRole("button", { name: "Pause effects", exact: true }).click();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await deck.getByRole("button", { name: "Resume effects", exact: true }).click();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await page.keyboard.press("Escape");
  await deck.getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused))
    .toBe(false);
  await deck.getByRole("button", { name: "Previous", exact: true }).click();
  expect(await audio.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
});

test("host permission stops the same soundtrack and reopening permission requires deliberate playback", async ({
  page,
}) => {
  const deck = page.getByRole("region", { name: "One soundtrack across slides", exact: true });
  const audio = deck.locator("audio");
  const permission = page.getByRole("button", { name: "Allow media playback", exact: true });
  await expect(permission).toHaveAttribute("aria-pressed", "false");
  await permission.click();
  await deck.getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime))
    .toBeGreaterThan(0);
  const original = await audio.elementHandle();
  await permission.click();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await permission.click();
  await expect(permission).toHaveAttribute("aria-pressed", "true");
  expect(await audio.evaluate((element, previous) => element === previous, original)).toBe(true);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await deck.getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused))
    .toBe(false);
});
