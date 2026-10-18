import { expect, test } from "@playwright/test";

const textRoot = '[data-meowui-part="presentation-text/root"]';
const textContent = '[data-meowui-part="presentation-text/content"]';

for (const viewport of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 900, height: 360 },
])
  test(`presentation typography preserves readable text and scaled geometry at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/canvas.html?story=presentation-art-text");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const title = page.locator(textRoot);
    await expect(title).toHaveRole("heading");
    await expect(title).toHaveText("Explain the complex clearly. Make the idea clear.");
    await expect(title.locator(textContent)).toHaveCount(1);
    const choose = page.getByRole("combobox", { name: "Choose slide" });
    await choose.selectOption("long-title");
    const roots = page.locator(textRoot);
    await expect(roots).toHaveCount(3);
    expect(
      await roots.evaluateAll((nodes) =>
        nodes.every((node) => node.scrollWidth <= node.clientWidth + 1),
      ),
    ).toBe(true);
    expect(
      await roots.last().evaluate((node) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getClientRects().length;
      }),
    ).toBeGreaterThan(1);
    const stage = page.locator('[data-meowui-part="presentation/stage"]');
    const bounds = await stage.boundingBox();
    for (const root of await roots.all()) {
      const box = (await root.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(bounds!.x);
      expect(box.x + box.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
    }
    await roots.first().evaluate((node) => {
      const selection = getSelection()!;
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    });
    expect(await page.evaluate(() => getSelection()?.toString())).toBe(
      await roots.first().textContent(),
    );
  });

test("native editable title retains local keys and never duplicates text", async ({ page }) => {
  await page.goto("/canvas.html?story=presentation-art-text");
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("editable");
  const editor = page.getByRole("textbox", { name: "Editable presentation title" });
  await editor.fill("Fresh title / Revised live");
  await editor.press("Home");
  await editor.press("ArrowRight");
  await editor.press("End");
  await editor.press("Space");
  await expect(editor).toBeFocused();
  await expect(page.getByRole("combobox", { name: "Choose slide" })).toHaveValue("editable");
  await expect(page.locator(textRoot)).toHaveCount(1);
  await expect(editor).toContainText("Fresh title / Revised live");
});

test("marker treatment falls back to ordinary text in print and forced colors", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=presentation-art-text");
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("marker");
  const title = page.locator(textContent);
  await expect(title).toHaveCSS("background-image", /linear-gradient/);
  for (const mode of ["print", "forced"] as const) {
    await page.emulateMedia(
      mode === "print"
        ? { media: "print", forcedColors: "none" }
        : { media: "screen", forcedColors: "active" },
    );
    await expect(title).toHaveCSS("background-image", "none");
    expect(await title.evaluate((node) => getComputedStyle(node).color)).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(page.locator(textRoot)).toHaveText(
      "Explain the complex clearly. Make the idea clear.",
    );
  }
});
