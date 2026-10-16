import { expect, test } from "@playwright/test";

test.describe("touch button sizes", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test(`DeepSeek controls preserve three distinct sizes on touch screens`, async ({ page }) => {
    await page.goto("http://127.0.0.1:13007/canvas.html?story=design-language");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    const heights = [];
    for (const name of ["小尺寸", "默认", "大尺寸"]) {
      const bounds = await page.getByRole("button", { name, exact: true }).boundingBox();
      expect(bounds).not.toBeNull();
      heights.push(bounds!.height);
    }
    expect(heights[0]).toBeLessThan(heights[1]!);
    expect(heights[1]).toBeLessThan(heights[2]!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});

for (const scheme of ["light", "dark"]) {
  test(`DeepSeek ${scheme} disabled quiet actions preserve their unfilled hierarchy`, async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:13007/canvas.html?story=actions-matrix");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await page.getByRole("combobox", { name: "外观", exact: true }).selectOption(scheme);
    await page.mouse.move(0, 0);
    for (const selector of [
      '[data-meowui-part="button/root"][data-option-button-variant="quiet"]',
      '[data-meowui-part="icon-button/root"]',
    ]) {
      const enabled = page.locator(`${selector}:not(:disabled)`).first();
      const disabled = page.locator(`${selector}:disabled`).first();
      await expect(enabled).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(disabled).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(disabled).toHaveCSS("box-shadow", "none");
      const enabledOpacity = await enabled.evaluate((element) =>
        Number(getComputedStyle(element).opacity),
      );
      const disabledOpacity = await disabled.evaluate((element) =>
        Number(getComputedStyle(element).opacity),
      );
      expect(disabledOpacity).toBeGreaterThan(0);
      expect(disabledOpacity).toBeLessThan(enabledOpacity);
      await disabled.hover();
      await expect(disabled).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    }
    // Outline is a hairline-edged control on the raised surface: disabling dims it
    // (opacity) without changing which surface it sits on.
    const outline = '[data-meowui-part="button/root"][data-option-button-variant="outline"]';
    const outlineSurface = await page
      .locator(`${outline}:not(:disabled)`)
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(outlineSurface).not.toBe("rgba(0, 0, 0, 0)");
    await expect(page.locator(`${outline}:disabled`).first()).toHaveCSS(
      "background-color",
      outlineSurface,
    );
    const outlineOpacity = await page
      .locator(`${outline}:not(:disabled)`)
      .first()
      .evaluate((element) => Number(getComputedStyle(element).opacity));
    const disabledOutlineOpacity = await page
      .locator(`${outline}:disabled`)
      .first()
      .evaluate((element) => Number(getComputedStyle(element).opacity));
    expect(disabledOutlineOpacity).toBeGreaterThan(0);
    expect(disabledOutlineOpacity).toBeLessThan(outlineOpacity);
    for (const variant of ["primary", "danger"])
      await expect(
        page
          .locator(
            `[data-meowui-part="button/root"][data-option-button-variant="${variant}"]:disabled`,
          )
          .first(),
      ).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test(`DeepSeek ${scheme} composer distinguishes pointer interest from keyboard focus`, async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:13007/canvas.html?story=design-language");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await page.getByRole("combobox", { name: "外观", exact: true }).selectOption(scheme);

    const selected = page.locator('[data-meowui-part="nav-item/root"][aria-current="page"]');
    const selectedSurface = await selected.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await selected.hover();
    await expect(selected).toHaveAttribute("aria-current", "page");
    await expect(selected).toHaveCSS("background-color", selectedSurface);

    const input = page.getByRole("textbox", { name: "消息", exact: true });
    const surface = page.locator('[data-meowui-part="chat-composer/root"]');
    await input.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await surface.evaluate(async (element) => {
      await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
    });
    const restingShadow = await surface.evaluate((element) => getComputedStyle(element).boxShadow);
    await input.hover();
    await surface.evaluate(async (element) => {
      await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
    });
    await expect
      .poll(() => surface.evaluate((element) => getComputedStyle(element).boxShadow))
      .toBe(restingShadow);
    await expect(surface).toHaveCSS("outline-style", "none");
    // Approach the input through the keyboard, rather than relying on mouse
    // focus heuristics for text controls.
    await input.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.type("保留这次编辑");
    await expect(input).toBeFocused();
    await expect(surface).toHaveCSS("outline-style", "solid");
    expect(
      await surface.evaluate((element) => {
        const style = getComputedStyle(element);
        return (
          element.matches(":has(textarea:focus-visible)") &&
          style.outlineStyle !== "none" &&
          parseFloat(style.outlineWidth) > 0 &&
          style.outlineColor !== "rgba(0, 0, 0, 0)"
        );
      }),
    ).toBe(true);
    await page.mouse.move(0, 0);
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("保留这次编辑");
    await page.keyboard.press("Tab");
    await expect(input).not.toBeFocused();
    await expect(surface).toHaveCSS("outline-style", "none");
  });

  test(`Studio ${scheme} buttons expose keyboard focus and disabled controls remain inert`, async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:13007/canvas.html?story=buttons");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const appearance = page.getByRole("combobox", { name: "外观", exact: true });
    await appearance.selectOption(scheme);
    await appearance.focus();
    await page.keyboard.press("Tab");
    const save = page.getByRole("button", { name: "保存修改", exact: true });
    await expect(save).toBeFocused();
    expect(
      await save.evaluate((element) => {
        const style = getComputedStyle(element);
        return (
          element.matches(":focus-visible") &&
          style.outlineStyle !== "none" &&
          parseFloat(style.outlineWidth) > 0
        );
      }),
    ).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-feedback]")).toHaveText("已保存本地示例");
    await page.getByRole("button", { name: "继续编辑", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "丢弃本地草稿", exact: true })).toBeFocused();

    const disabled = page.locator("button:disabled");
    await expect(disabled).toHaveCount(4);
    await disabled.evaluateAll((elements) => {
      document.documentElement.dataset.disabledActivations = "0";
      for (const element of elements)
        element.addEventListener("click", () => {
          document.documentElement.dataset.disabledActivations = String(
            Number(document.documentElement.dataset.disabledActivations) + 1,
          );
        });
    });
    for (const button of await disabled.all()) {
      await page.mouse.move(0, 0);
      // Theme switching itself can animate the surface; compare settled states,
      // not a frame from the preceding appearance transition.
      await button.evaluate(async (element) => {
        await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
      });
      const initial = await button.evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.backgroundColor, style.color, style.boxShadow];
      });
      await button.hover();
      await button.evaluate(async (element) => {
        await Promise.allSettled(element.getAnimations().map((animation) => animation.finished));
      });
      expect(
        await button.evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.backgroundColor, style.color, style.boxShadow];
        }),
      ).toEqual(initial);
      const bounds = await button.boundingBox();
      expect(bounds).not.toBeNull();
      await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
      await expect(button).not.toBeFocused();
    }
    await expect(page.locator("html")).toHaveAttribute("data-disabled-activations", "0");
    await expect(page.locator("[data-feedback]")).toHaveText("已保存本地示例");
  });
}
