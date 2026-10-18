import { expect, test } from "@playwright/test";

test("slide regions allocate the remaining canvas for every slot and logical column combination", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/canvas.html?story=presentation-layout-boundaries");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const picker = page.getByRole("combobox", { name: "Choose slide" });
  for (const combination of ["both", "header", "footer", "neither"]) {
    for (const columns of ["single", "equal", "wide-start", "wide-end"]) {
      await picker.selectOption(`${combination}-${columns}`);
      const layout = page.locator('[data-meowui-part="presentation-layout/root"]');
      const body = layout.locator('[data-meowui-part="presentation-layout/body"]');
      await expect(layout.locator('[data-meowui-part="presentation-layout/header"]')).toHaveCount(
        combination === "both" || combination === "header" ? 1 : 0,
      );
      await expect(layout.locator('[data-meowui-part="presentation-layout/footer"]')).toHaveCount(
        combination === "both" || combination === "footer" ? 1 : 0,
      );
      const geometry = await body.evaluate((element) => ({
        height: element.clientHeight,
        width: element.clientWidth,
        columns: getComputedStyle(element).gridTemplateColumns.split(" ").map(Number.parseFloat),
        overflow: element.scrollHeight > element.clientHeight + 1,
      }));
      expect(geometry.height).toBeGreaterThan(200);
      expect(geometry.overflow).toBe(false);
      if (columns !== "single") {
        expect(geometry.columns[0]! / geometry.columns[1]!).toBeCloseTo(
          columns === "wide-start" ? 2 : columns === "wide-end" ? 0.5 : 1,
          1,
        );
      }
      await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
    }
  }
  await picker.selectOption("both-wide-end");
  const body = page.locator('[data-meowui-part="presentation-layout/body"]');
  const logicalColumns = await body.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns,
  );
  await page.setViewportSize({ width: 390, height: 330 });
  expect(await body.evaluate((element) => getComputedStyle(element).gridTemplateColumns)).toBe(
    logicalColumns,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await body.locator("[data-layout-first]").evaluate((element) => {
    const content = document.createElement("p");
    content.textContent = "Long content remains diagnostic. ".repeat(250);
    element.append(content);
  });
  await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeVisible();
});

test("common slide recipes fit their canvas and preserve the numbered flow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/canvas.html?story=presentation-layouts");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const picker = page.getByRole("combobox", { name: "Choose slide" });
  for (const id of ["title", "media", "comparison", "metric", "process", "summary"]) {
    await picker.selectOption(id);
    await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
    expect(
      await page
        .locator('[data-meowui-part="presentation-layout/body"]')
        .evaluate((element) => element.scrollHeight <= element.clientHeight + 1),
    ).toBe(true);
    if (id === "media") {
      await expect
        .poll(() =>
          page
            .locator('img[alt="原创海岸示例插画"]')
            .evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
    }
    if (id === "process")
      await expect(
        page.locator('[data-meowui-part="presentation-layout/body"] ol > li'),
      ).toHaveCount(3);
  }
});
