import { expect, test } from "@playwright/test";

test("inline composer centers the one-line input and actions on the writing row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/canvas.html?story=composer-inline");
  const composer = page.locator('[data-meowui-part="chat-composer/root"]');
  await expect(composer).toBeVisible();

  const geometry = await composer.evaluate((element) => {
    const measure = (target: Element) => {
      const bounds = target.getBoundingClientRect();
      return { center: bounds.y + bounds.height / 2, height: bounds.height };
    };
    const input = element.querySelector("textarea")!;
    const style = getComputedStyle(input);
    const inputBox = measure(input);
    return {
      surface: measure(element.querySelector('[data-meowui-part="chat-composer/surface"]')!),
      input: inputBox,
      submit: measure(element.querySelector('button[type="submit"]')!),
      attach: measure(element.querySelector('[aria-label="Add attachment"]')!),
      line: {
        paddingTop: parseFloat(style.paddingTop),
        paddingBottom: parseFloat(style.paddingBottom),
        lineHeight: parseFloat(style.lineHeight),
        inputHeight: inputBox.height,
      },
    };
  });

  expect(Math.abs(geometry.input.center - geometry.surface.center)).toBeLessThan(1);
  expect(Math.abs(geometry.submit.center - geometry.surface.center)).toBeLessThan(1);
  expect(Math.abs(geometry.attach.center - geometry.surface.center)).toBeLessThan(1);
  expect(Math.abs(geometry.input.center - geometry.submit.center)).toBeLessThan(1);
  expect(Math.abs(geometry.line.paddingTop - geometry.line.paddingBottom)).toBeLessThan(1);
  expect(
    Math.abs(
      geometry.line.paddingTop + geometry.line.lineHeight / 2 - geometry.line.inputHeight / 2,
    ),
  ).toBeLessThan(1);
});

test("inline focus exposes its hint after the writing surface without changing the writing row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/canvas.html?story=composer-inline");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const composer = page.locator('[data-meowui-part="chat-composer/root"]');
  const input = composer.getByRole("textbox");
  const surface = composer.locator('[data-meowui-part="chat-composer/surface"]');
  const before = await surface.boundingBox();
  await input.focus();
  const geometry = await composer.evaluate((element) => {
    const surface = element.querySelector('[data-meowui-part="chat-composer/surface"]')!;
    const hint = element.querySelector('[data-meowui-part="chat-composer/hint"]')!;
    const surfaceBox = surface.getBoundingClientRect();
    const hintBox = hint.getBoundingClientRect();
    return {
      externalHint: !surface.contains(hint) && hint.parentElement === element,
      surfaceBottom: surfaceBox.bottom,
      surfaceHeight: surfaceBox.height,
      hintTop: hintBox.top,
      hintHeight: hintBox.height,
      hintClip: getComputedStyle(hint).clipPath,
    };
  });
  expect(geometry.externalHint).toBe(true);
  expect(geometry.hintTop).toBeGreaterThanOrEqual(geometry.surfaceBottom);
  expect(geometry.hintHeight).toBeGreaterThan(1);
  expect(geometry.hintClip).toBe("none");
  expect(geometry.surfaceHeight).toBeCloseTo(before!.height, 1);
  await expect(composer).toHaveCSS("outline-style", "none");
  await expect(surface).toHaveCSS("outline-style", "solid");
});
