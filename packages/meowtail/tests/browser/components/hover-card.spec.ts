import { expect, test } from "@playwright/test";

test("wide hover preview follows its host width and copies only activation, not text selection", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=hover-card");
  const trigger = page.getByRole("button", {
    name: "Wide preview and copy",
    exact: true,
  });
  await trigger.focus();
  const panel = page.locator("#wide-reference-preview");
  await expect(panel).toBeVisible();
  const card = panel.getByRole("button", {
    name: "Copy: packages/meowtail/src/components/hover-card.tsx",
    exact: true,
  });
  // A copyable card says so on sight; the cue stays out of its accessible name.
  await expect(card.getByText("Copy", { exact: true })).toBeVisible();
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
  await expect(panel.getByRole("status")).toHaveText("Copied");
  // The cue turns into the result in place; the copied text stays readable.
  const cue = card.locator('[data-meowui-part="hover-card/hint"]');
  await expect(cue).toHaveText("Copied");
  await expect(card.locator("p")).toBeVisible();
  await expect(cue).toHaveText("Copy", { timeout: 3000 });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => {
      const bounds = await panel.boundingBox();
      return Boolean(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390);
    })
    .toBe(true);
  // A narrow host gives no inset: the card lines up with its edges.
  await expect
    .poll(async () => {
      const [anchor, preview] = await Promise.all([
        page.locator("#wide-preview-anchor").boundingBox(),
        panel.boundingBox(),
      ]);
      return Boolean(
        anchor &&
        preview &&
        Math.abs(preview.x - anchor.x) < 1 &&
        Math.abs(preview.width - anchor.width) < 1,
      );
    })
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test.describe("touch preview", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test("a tap opens the card, it stays after the finger lifts, and a second tap closes it", async ({
    page,
  }) => {
    await page.goto("/canvas.html?story=hover-card");
    const trigger = page.getByRole("button", {
      name: "Component notes",
      exact: true,
    });
    const panel = page.locator("#reference-preview");
    // A tap that does not move focus, as on iOS Safari: the touch leaves before the click lands.
    await trigger.evaluate((element) => {
      const touch = { bubbles: true, pointerType: "touch", isPrimary: true };
      element.dispatchEvent(new PointerEvent("pointerdown", touch));
      element.dispatchEvent(new PointerEvent("pointerup", touch));
      element
        .closest('[data-meowui-part="hover-card/root"]')!
        .dispatchEvent(new PointerEvent("pointerleave", touch));
      element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await expect(panel).toBeVisible();
    await page.waitForTimeout(300);
    await expect(panel).toBeVisible();
    // A card without copy text shows no copy cue.
    await expect(panel.getByText("Copy", { exact: true })).toHaveCount(0);
    await trigger.tap();
    await expect(panel).toBeHidden();
    await trigger.tap();
    await expect(panel).toBeVisible();
    await page.mouse.click(4, 840);
    await expect(panel).toBeHidden();
  });
});

test("a failed copy keeps the content and explains on its own line until the card closes", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=hover-card");
  const trigger = page.getByRole("button", { name: "Copy that fails", exact: true });
  await trigger.focus();
  const panel = page.locator("#failing-copy-preview");
  const card = panel.getByRole("button", { name: /^Copy: / });
  await card.focus();
  await page.keyboard.press("Enter");
  const failure = panel.getByText("Copy failed; select the text and try again.", { exact: true });
  await expect(failure).toBeVisible();
  await expect(panel.locator("p")).toBeVisible();
  // It stays past the copied cue's timeout.
  await page.waitForTimeout(1800);
  await expect(failure).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(failure).toBeHidden();
});
