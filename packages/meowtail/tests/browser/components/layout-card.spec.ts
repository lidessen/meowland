import { uiTokens } from "meowtail/theme";
import { expect, test } from "@playwright/test";

test("page containers inherit semantic insets while retaining natural flow and the draft node", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/canvas.html?story=layout-container-page");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const container = page.locator("[data-container-page]");
  const input = page.getByRole("textbox", { name: "Page draft", exact: true });
  const original = await input.elementHandle();
  await input.fill("Draft remains in the same natural page");
  const insets = () =>
    container.evaluate((node) => {
      const style = getComputedStyle(node);
      return [
        style.paddingInlineStart,
        style.paddingBlockStart,
        style.paddingBlockEnd,
        style.maxWidth,
      ];
    });
  expect(await insets()).toEqual(["48px", "36px", "60px", "1136px"]);
  await page.setViewportSize({ width: 390, height: 330 });
  expect(await insets()).toEqual(["16px", "20px", "40px", "1072px"]);
  await page.locator("[data-container-page-scope]").evaluate(
    (node, properties) => {
      for (const [property, value] of properties)
        (node as HTMLElement).style.setProperty(property!, value!);
    },
    [
      [uiTokens.pageInsetInline.name, "64px"],
      [uiTokens.pageInsetBlock.name, "40px"],
      [uiTokens.spacePanel.name, "32px"],
      [uiTokens.pageInsetCompactInline.name, "24px"],
      [uiTokens.pageInsetCompactBlock.name, "24px"],
      [uiTokens.spaceSection.name, "12px"],
    ],
  );
  expect(await insets()).toEqual(["24px", "24px", "36px", "1088px"]);
  await input.focus();
  await expect(input).toHaveValue("Draft remains in the same natural page");
  await expect(input).toBeFocused();
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 600 });
  expect(await insets()).toEqual(["64px", "40px", "72px", "1168px"]);
  await expect(input).toHaveValue("Draft remains in the same natural page");
  await expect(input).toBeFocused();
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await page.setViewportSize({ width: 390, height: 330 });
  const last = page.getByRole("button", { name: "Check trailing actions", exact: true });
  await last.focus();
  await expect(last).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  expect(await container.evaluate((node) => node.scrollTop)).toBe(0);
  expect(await container.evaluate((node) => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(input).toHaveValue("Draft remains in the same natural page");
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
});

test("layout composition keeps text shrinkable, actions intact and axis gaps themed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1030, height: 954 });
  await page.goto("/canvas.html?story=layout-composition");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const summary = page.locator("[data-layout-summary]");
  await expect(summary).toHaveCSS("align-items", "baseline");
  const actions = page.locator("[data-layout-actions]");
  const grid = page.locator("[data-layout-grid-gaps]");
  for (const scheme of ["light", "dark"]) {
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(scheme);
    const spacing = await actions.evaluate(
      (node, properties) =>
        properties.map((property) => getComputedStyle(node).getPropertyValue(property).trim()),
      [uiTokens.spaceGroup.name, uiTokens.spaceSection.name, uiTokens.spacePanel.name],
    );
    await expect(actions).toHaveCSS("row-gap", spacing[1]!);
    await expect(actions).toHaveCSS("column-gap", spacing[0]!);
    await expect(grid).toHaveCSS("row-gap", spacing[0]!);
    await expect(grid).toHaveCSS("column-gap", spacing[2]!);
  }
  const edit = page.getByRole("button", { name: "Edit connection", exact: true });
  const wideWidth = await edit.evaluate((node) => node.getBoundingClientRect().width);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(edit).toBeVisible();
  expect(await edit.evaluate((node) => node.getBoundingClientRect().width)).toBe(wideWidth);
  expect(
    await page
      .locator("[data-layout-fixed]")
      .evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect
    .poll(async () =>
      actions
        .locator("button")
        .evaluateAll(
          (nodes) => new Set(nodes.map((node) => node.getBoundingClientRect().top)).size,
        ),
    )
    .toBeGreaterThan(1);
  await actions.evaluate(
    (node, property) => (node as HTMLElement).style.setProperty(property, "18px"),
    uiTokens.spaceSection.name,
  );
  await expect(actions).toHaveCSS("row-gap", "18px");
  const group = await actions.evaluate(
    (node, property) => getComputedStyle(node).getPropertyValue(property).trim(),
    uiTokens.spaceGroup.name,
  );
  await expect(actions).toHaveCSS("column-gap", group);
});

test(`Studio: card nesting shares surfaces and preserves independent cards`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/canvas.html?story=card-composition");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const cards = page.locator("[data-card-depth]");
  expect(await cards.count()).toBeGreaterThan(3);
  expect(
    await cards.evaluateAll((nodes) =>
      nodes.every((node) => {
        const parent = node.parentElement?.closest("[data-card-depth]");
        return (
          Number(node.getAttribute("data-card-depth")) ===
          (parent ? Number(parent.getAttribute("data-card-depth")) + 1 : 0)
        );
      }),
    ),
  ).toBe(true);
  for (const scheme of ["light", "dark"]) {
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(scheme);
    const embedded = page
      .locator(
        '[data-meowui-part="card/root"]:is([data-option-card-variant="embedded"], [data-option-card-variant="auto"]:not([data-card-depth="0"]))',
      )
      .first();
    await expect(embedded).toHaveCSS("border-top-width", "0px");
    await expect(embedded).toHaveCSS("padding-top", "0px");
    await expect(embedded).toHaveCSS("box-shadow", "none");
    const surfaces = page.locator('[data-card-depth="0"]');
    await expect(surfaces.first()).toHaveCSS("border-top-width", "1px");
    expect(
      await cards.evaluateAll((nodes) =>
        nodes.every((node) => node.scrollWidth <= node.clientWidth + 1),
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Save check conclusion", exact: true }).click();
  await expect(page.locator("[data-card-feedback]")).toContainText("Saved");
});

test("auto grid responds to its container while layout gaps follow the theme", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 844 });
  await page.goto("/canvas.html?story=layout-grid");
  const grid = page.locator('#story-root [data-meowui-part="grid/root"]');
  const items = grid.locator(":scope > *");
  const wide = await items.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().top),
  );
  expect(wide[0]).toBe(wide[1]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => {
      const narrow = await items.evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().top),
      );
      return narrow[1]! > narrow[0]!;
    })
    .toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/canvas.html?story=layout-stack");
  const stack = page
    .locator('#story-root [data-meowui-part="stack/root"][data-option-layout-gap="relaxed"]')
    .first();
  for (const scheme of ["light", "dark"]) {
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(scheme);
    const panelGap = await stack.evaluate(
      (node, property) => getComputedStyle(node).getPropertyValue(property).trim(),
      uiTokens.spacePanel.name,
    );
    await expect(stack).toHaveCSS("gap", panelGap);
  }
  await stack.evaluate(
    (node, property) => (node as HTMLElement).style.setProperty(property, "18px"),
    uiTokens.spacePanel.name,
  );
  await expect(stack).toHaveCSS("gap", "18px");
});
