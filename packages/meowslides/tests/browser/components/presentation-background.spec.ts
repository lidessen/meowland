import { expect, test } from "@playwright/test";

const slideSelector = '[data-meowui-part="presentation/slide"]';
const backgroundSelector = '[data-meowui-part="presentation/background"]';
const imageSelector = '[data-meowui-part="presentation/background-image"]';
const overlaySelector = '[data-meowui-part="presentation/background-overlay"]';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/canvas.html?story=presentation-backgrounds");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("backgrounds inherit, replace and reset while decorative images fill the whole canvas", async ({
  page,
}) => {
  const picker = page.getByRole("combobox", { name: "Choose slide" });
  const slide = page.locator(slideSelector);
  const background = page.locator(backgroundSelector);
  await expect(background).toHaveCSS("background-image", /linear-gradient/);
  await expect(slide).toHaveAttribute("data-background-foreground", "dark");
  await picker.selectOption("cover");
  const image = page.locator(imageSelector);
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(image).toHaveCSS("object-fit", "cover");
  await expect(image).toHaveCSS("object-position", "100% 0%");
  await expect(image).toHaveAttribute("alt", "");
  await expect(background).toHaveAttribute("aria-hidden", "true");
  await expect(background).toHaveAttribute("inert", "");
  await expect(background).toHaveCSS("pointer-events", "none");
  expect(
    await background.evaluate((element) => {
      const decoration = element.getBoundingClientRect();
      const canvas = element
        .closest('[data-meowui-part="presentation/slide"]')!
        .getBoundingClientRect();
      return (
        Math.abs(decoration.x - canvas.x) < 1 &&
        Math.abs(decoration.y - canvas.y) < 1 &&
        Math.abs(decoration.width - canvas.width) < 1 &&
        Math.abs(decoration.height - canvas.height) < 1
      );
    }),
  ).toBe(true);
  await expect(slide).toHaveAttribute("data-background-foreground", "light");
  await picker.selectOption("contain");
  await expect(page.locator(imageSelector)).toHaveCSS("object-fit", "contain");
  await expect(page.locator(imageSelector)).toHaveCSS("object-position", "100% 50%");
  await expect(slide).toHaveAttribute("data-background-foreground", "dark");
  await picker.selectOption("theme");
  await expect(page.locator(imageSelector)).toHaveCount(0);
  await expect(page.locator(overlaySelector)).toHaveCount(0);
  await expect(slide).toHaveAttribute("data-background-foreground", "theme");
  const lightThemeInk = await slide.evaluate((element) => getComputedStyle(element).color);
  await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption("dark");
  const darkThemeInk = await slide.evaluate((element) => getComputedStyle(element).color);
  expect(darkThemeInk).not.toBe(lightThemeInk);
  await picker.selectOption("contain");
  await expect(slide).toHaveCSS("color", lightThemeInk);
  await picker.selectOption("dark");
  await expect(slide).toHaveAttribute("data-background-foreground", "light");
  await expect(slide).toHaveCSS("color", darkThemeInk);
  await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
});

test("failed decorative images retain the authored fallback, overlay and foreground", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("fallback");
  await expect(page.locator(imageSelector)).toBeHidden();
  await expect(page.locator(backgroundSelector)).toHaveCSS("background-color", "rgb(21, 58, 52)");
  await expect(page.locator(overlaySelector)).toHaveCSS("background-image", /linear-gradient/);
  await expect(page.locator(slideSelector)).toHaveAttribute("data-background-foreground", "light");
  await expect(
    page.getByRole("heading", { name: "Without the image, this page should still read clearly" }),
  ).toBeVisible();
  await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
});

test("background signals preserve content identity, draft and focus, and discard stale image events", async ({
  page,
}) => {
  const picker = page.getByRole("combobox", { name: "Choose slide" });
  await picker.selectOption("dynamic");
  const input = page.getByRole("textbox", { name: "Background draft" });
  await input.fill("A draft survives background updates");
  const original = await input.elementHandle();
  const oldImage = await page.locator(imageSelector).elementHandle();
  await expect
    .poll(() => oldImage!.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await page
    .locator("[data-background-cycle]")
    .evaluate((element) => (element as HTMLButtonElement).click());
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("A draft survives background updates");
  expect(await original!.evaluate((element) => element.isConnected)).toBe(true);
  await expect(page.locator("[data-background-content-mount]")).toHaveAttribute(
    "data-background-content-mount",
    "1",
  );
  await expect(page.locator(slideSelector)).toHaveAttribute("data-background-foreground", "light");
  await expect(page.locator(imageSelector)).toHaveAttribute("src", /variant=dark/);
  expect(await oldImage!.evaluate((element) => element.isConnected)).toBe(false);
  await oldImage!.evaluate((element) => element.dispatchEvent(new Event("error")));
  await expect(page.locator(imageSelector)).toBeVisible();
  await page
    .locator("[data-background-deck]")
    .evaluate((element) => (element as HTMLButtonElement).click());
  await expect(page.locator(slideSelector)).toHaveAttribute("data-background-foreground", "light");
  await page
    .locator("[data-background-inherit]")
    .evaluate((element) => (element as HTMLButtonElement).click());
  await expect(input).toBeFocused();
  await expect(page.locator(imageSelector)).toHaveCount(0);
  await expect(page.locator(backgroundSelector)).toHaveCSS(
    "background-color",
    "rgb(227, 237, 242)",
  );
  await expect(page.locator(slideSelector)).toHaveAttribute("data-background-foreground", "dark");
  await page.locator("[data-background-cycle]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-background-cycle]")).toBeFocused();
  await expect(input).toHaveValue("A draft survives background updates");
  await page.setViewportSize({ width: 390, height: 330 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
});
