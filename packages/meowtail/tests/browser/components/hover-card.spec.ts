import { expect, test } from "@playwright/test";

test("wide hover preview follows its host width and copies only activation, not text selection", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=reference-primitives");
  const trigger = page.getByRole("button", { name: "宽预览与复制", exact: true });
  await trigger.focus();
  const panel = page.locator("#wide-reference-preview");
  await expect(panel).toBeVisible();
  const card = panel.getByRole("button", {
    name: "复制: packages/meowtail/src/components/hover-card.tsx",
    exact: true,
  });
  await expect
    .poll(async () => {
      const [anchor, preview] = await Promise.all([
        page.locator("#wide-preview-anchor").boundingBox(),
        panel.boundingBox(),
      ]);
      return Boolean(
        anchor &&
        preview &&
        preview.width > anchor.width / 2 &&
        preview.width < anchor.width &&
        preview.x > anchor.x,
      );
    })
    .toBe(true);
  const originalWidth = (await panel.boundingBox())!.width;
  await page.locator("#wide-preview-anchor").evaluate((element) => {
    element.style.width = "340px";
  });
  await expect.poll(async () => (await panel.boundingBox())!.width).toBeLessThan(originalWidth);
  await card.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element.querySelector("p")!);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await expect(page.locator("#wide-preview-anchor")).not.toHaveAttribute("data-copied");
  await page.evaluate(() => window.getSelection()?.removeAllRanges());
  await card.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#wide-preview-anchor")).toHaveAttribute(
    "data-copied",
    "packages/meowtail/src/components/hover-card.tsx",
  );
  await expect(panel.getByRole("status")).toHaveText("已复制");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => {
      const bounds = await panel.boundingBox();
      return Boolean(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390);
    })
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});
