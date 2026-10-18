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
      composer: measure(element),
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

  expect(Math.abs(geometry.input.center - geometry.composer.center)).toBeLessThan(1);
  expect(Math.abs(geometry.submit.center - geometry.composer.center)).toBeLessThan(1);
  expect(Math.abs(geometry.attach.center - geometry.composer.center)).toBeLessThan(1);
  expect(Math.abs(geometry.input.center - geometry.submit.center)).toBeLessThan(1);
  expect(Math.abs(geometry.line.paddingTop - geometry.line.paddingBottom)).toBeLessThan(1);
  expect(
    Math.abs(
      geometry.line.paddingTop + geometry.line.lineHeight / 2 - geometry.line.inputHeight / 2,
    ),
  ).toBeLessThan(1);
});
