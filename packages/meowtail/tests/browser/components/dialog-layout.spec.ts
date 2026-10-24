import { expect, test, type Locator } from "@playwright/test";

async function focusInkFits(control: Locator) {
  return control.evaluate((node) => {
    const style = getComputedStyle(node);
    const ink = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
    const box = node.getBoundingClientRect();
    for (let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const clip = getComputedStyle(ancestor);
      const bounds = ancestor.getBoundingClientRect();
      if (
        clip.overflowX !== "visible" &&
        (box.left - ink < bounds.left || box.right + ink > bounds.right)
      )
        return false;
      if (
        clip.overflowY !== "visible" &&
        (box.top - ink < bounds.top || box.bottom + ink > bounds.bottom)
      )
        return false;
      if (ancestor instanceof HTMLDialogElement) break;
    }
    return style.outlineStyle !== "none" && ink > 0;
  });
}

for (const viewport of [
  { width: 1100, height: 900 },
  { width: 390, height: 330 },
])
  test(`shared dialog header and body retain native form behavior at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/canvas.html?story=dialog-layout");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    for (const name of ["Short form", "Long body", "Limited height", "Full workspace"]) {
      const trigger = page.getByRole("button", { name: `Open ${name}`, exact: true });
      await trigger.focus();
      await trigger.press("Enter");
      const dialog = page.getByRole("dialog", {
        name: `${name} · Current item and close action`,
        exact: true,
      });
      const header = dialog.locator('[data-meowui-part="page-frame/header"]');
      const body = dialog.locator('[data-meowui-part="page-frame/body"]');
      const save = dialog.getByRole("button", { name: `Save ${name}`, exact: true });
      const minimum = await trigger.evaluate((node) => getComputedStyle(node).minHeight);
      expect(await save.evaluate((node) => getComputedStyle(node).minHeight)).toBe(minimum);
      expect(await save.evaluate((node) => getComputedStyle(node).flexGrow)).toBe("0");
      // Measure the resting layout, after the dialog's entrance motion settles.
      await dialog.evaluate((node) =>
        Promise.all(node.getAnimations().map((animation) => animation.finished)),
      );
      const originalHeader = await header.boundingBox();
      const close = dialog.getByRole("button", { name: `Close ${name}`, exact: true });
      await page.keyboard.press("Tab");
      await close.focus();
      expect(await focusInkFits(close)).toBe(true);
      const input = dialog.getByRole("textbox");
      const originalInput = await input.elementHandle();
      await body.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });
      expect((await header.boundingBox())!.y).toBe(originalHeader!.y);
      await expect(
        dialog.getByRole("button", { name: `Close ${name}`, exact: true }),
      ).toBeInViewport();
      expect(await dialog.evaluate((node) => node.scrollTop)).toBe(0);
      expect(await body.evaluate((node) => node.clientHeight)).toBeGreaterThan(0);
      if (name !== "Short form")
        expect(await body.evaluate((node) => node.scrollHeight > node.clientHeight)).toBe(true);
      await save.focus();
      expect(await focusInkFits(save)).toBe(true);
      await input.focus();
      await save.focus();
      expect(await focusInkFits(save)).toBe(true);
      expect((await header.boundingBox())!.y).toBe(originalHeader!.y);
      await input.fill("Retained draft");
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await trigger.press("Enter");
      await expect(input).toHaveValue("Retained draft");
      expect(await originalInput!.evaluate((node) => node.isConnected)).toBe(true);
      await input.fill("");
      await dialog.getByRole("button", { name: `Save ${name}`, exact: true }).click();
      await expect(dialog).toBeVisible();
      await expect(input).toBeFocused();
      await input.fill("Validated draft");
      await dialog.getByRole("button", { name: `Save ${name}`, exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  });

test("dialog body insets protect first and last focus ink with optional custom headers", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 330 });
  await page.goto("/canvas.html?story=dialog-content-insets");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const kind of ["headerless-short", "headerless-long", "custom-header"]) {
    const trigger = page.getByRole("button", { name: `Open ${kind}`, exact: true });
    await trigger.focus();
    await trigger.press("Enter");
    const dialog = page.getByRole("dialog", { name: kind, exact: true });
    const body = dialog.locator('[data-meowui-part="page-frame/body"]');
    await page.keyboard.press("Tab");
    const first = dialog.getByRole("button", { name: "First action", exact: true });
    await first.focus();
    expect(await focusInkFits(first)).toBe(true);
    const last = dialog.getByRole("button", { name: "Last action", exact: true });
    await last.focus();
    expect(await focusInkFits(last)).toBe(true);
    expect(await dialog.evaluate((node) => node.scrollTop)).toBe(0);
    if (kind !== "headerless-short")
      expect(await body.evaluate((node) => node.scrollHeight > node.clientHeight)).toBe(true);
    await last.click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test("pointer-opened dialogs close and leave the main actions usable", async ({ page }) => {
  await page.goto("/canvas.html?story=dialog-layout");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  for (const name of ["Short form", "Long body", "Short form"]) {
    await page.getByRole("button", { name: `Open ${name}`, exact: true }).click();
    const dialog = page.getByRole("dialog", {
      name: `${name} · Current item and close action`,
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});

test("an initially open drawer enters the modal layer and keeps controlled dismissal live", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/canvas.html?story=drawer-initially-open");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const drawer = page.getByRole("dialog", { name: "Initially open navigation" });
  await expect(drawer).toBeVisible();
  expect(await drawer.evaluate((node) => node.matches(":modal"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  const trigger = page.getByRole("button", { name: "Reopen drawer", exact: true });
  await trigger.click();
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Current workspace", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test("shared drawer keeps title and close above the independently scrolling navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 330 });
  await page.goto("/canvas.html?story=drawer");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.getByRole("button", { name: "Open navigation drawer" });
  await trigger.focus();
  await trigger.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Main navigation" });
  const header = drawer.locator('[data-meowui-part="page-frame/header"]');
  const before = await header.boundingBox();
  await drawer.locator('[data-meowui-part="page-frame/body"]').evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  expect((await header.boundingBox())!.y).toBe(before!.y);
  await expect(page.getByRole("button", { name: "Close navigation" })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("page headers allocate natural height to wrapped identity, actions, and categories", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/canvas.html?story=page-frame-catalog");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const header = page.locator('[data-meowui-part="page-frame/header"]');
  const categories = page.getByRole("group", { name: "Catalog categories" });
  const insideHeader = async () => {
    const outer = await header.boundingBox(),
      inner = await categories.boundingBox();
    return inner!.y + inner!.height <= outer!.y + outer!.height + 1;
  };
  expect(await insideHeader()).toBe(true);
  await page.setViewportSize({ width: 390, height: 330 });
  expect(await insideHeader()).toBe(true);
  await expect(page.getByRole("button", { name: "Refresh catalog", exact: true })).toBeInViewport();
});
