import { expect, test } from "@playwright/test";

test("region layout keeps bounded geometry and returns focus without remounting drafts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 820 });
  await page.goto("/canvas.html?story=region-layout");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const layout = page.locator('[data-meowui-part="region-layout/root"]');
  await expect(layout).toHaveAttribute("data-compact", "false");
  await page.getByRole("textbox", { name: "Message draft" }).fill("keep this draft");
  const messageViewport = page.getByRole("region", { name: "Message reading area" });
  await messageViewport.evaluate((node) => {
    node.scrollTop = 100;
  });
  const listButton = page.getByRole("button", { name: "Conversation 1", exact: true });
  const originalButton = await listButton.elementHandle();
  await listButton.focus();
  await page.setViewportSize({ width: 390, height: 640 });
  await expect(layout).toHaveAttribute("data-compact", "true");
  await expect(listButton).toBeVisible();
  await listButton.click();
  await expect(page.getByRole("textbox", { name: "Message draft" })).toHaveValue("keep this draft");
  await expect(page.locator('[data-region="list"]')).toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Back to list" }).click();
  await expect(listButton).toBeFocused();
  await expect(listButton).toHaveAttribute("aria-current", "page");
  expect(await originalButton!.evaluate((node) => node.isConnected)).toBe(true);
  await listButton.click();
  await page.setViewportSize({ width: 390, height: 330 });
  await expect(page.getByRole("textbox", { name: "Message draft" })).toBeVisible();
  const bounds = await layout.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const regions = [
      ...node.querySelectorAll<HTMLElement>('[data-meowui-part="region-layout/region"]'),
    ].filter((region) => !region.hidden);
    return regions.every((region) => {
      const box = region.getBoundingClientRect();
      return box.right <= rect.right + 1 && box.bottom <= rect.bottom + 1;
    });
  });
  expect(bounds).toBe(true);
  await page.setViewportSize({ width: 1100, height: 820 });
  await expect(page.getByRole("textbox", { name: "Message draft" })).toHaveValue("keep this draft");
  await expect(messageViewport).toBeVisible();
  await listButton.click();
  await listButton.focus();
  await page.setViewportSize({ width: 390, height: 640 });
  await expect(layout).toHaveAttribute("data-compact", "true");
  await expect(page.getByRole("button", { name: "Back to list" })).toBeHidden();
});

test("isolated content preserves menu and choice keyboard navigation and focus return", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=region-layout-isolated-controls");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.getByRole("button", { name: "Region actions", exact: true });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Read", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Copy", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Copy");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("menuitem", { name: "View details", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("menuitem", { name: "More", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  const choice = page.locator("#isolated-choice");
  await choice.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "First option", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(choice).toContainText("Second option");
  await expect(choice).toBeFocused();
});

test("workspace regions retain long drafts and reachable input actions in short windows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 600 });
  await page.goto("/canvas.html?story=region-layout-workspace");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const input = page.getByRole("textbox", { name: "Workspace draft" });
  const original = await input.elementHandle();
  const draft = Array.from({ length: 24 }, (_, index) => `Draft line ${index + 1}`).join("\n");
  await input.fill(draft);
  await expect(input).toBeFocused();
  const geometry = () =>
    page.evaluate(() => {
      const compose = document.querySelector<HTMLElement>('[data-region="compose"]')!;
      const composer = compose.querySelector<HTMLElement>(
        '[data-meowui-part="chat-composer/root"]',
      )!;
      const input = compose.querySelector("textarea")!;
      const reading = document.querySelector('[aria-label="Workspace messages"]')!;
      const bounds = compose.getBoundingClientRect();
      const box = composer.getBoundingClientRect();
      return {
        actionsReachable: box.top >= bounds.top - 1 && box.bottom <= bounds.bottom + 1,
        readingVisible: reading.getBoundingClientRect().height > 0,
        draftScrolls: input.scrollHeight > input.clientHeight,
      };
    });
  await expect.poll(geometry).toEqual({
    actionsReachable: true,
    readingVisible: true,
    draftScrolls: true,
  });
  await page.setViewportSize({ width: 390, height: 640 });
  await expect(input).toHaveValue(draft);
  await expect(input).toBeFocused();
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await expect.poll(geometry).toEqual({
    actionsReachable: true,
    readingVisible: true,
    draftScrolls: true,
  });
  const choice = page.locator("#workspace-model");
  await choice.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: /Local example model/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(choice).toBeFocused();
  await page.getByText("Current work", { exact: true }).click();
  expect(
    await page.locator("[data-workspace-inline-panel]").evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      return !!document
        .elementFromPoint(bounds.x + 10, bounds.y + 10)
        ?.closest("[data-workspace-inline-panel]");
    }),
  ).toBe(true);
});

test("compact row sizing keeps navigation and scrolling content mounted together", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 820 });
  await page.goto("/canvas.html?story=region-layout-compact-navigation");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const input = page.getByRole("textbox", { name: "Category draft" });
  await input.fill("Retained navigation draft");
  const original = await input.elementHandle();
  await page.getByRole("button", { name: "Category 3", exact: true }).click();
  await input.focus();
  const layout = page.locator('[data-meowui-part="region-layout/root"]');
  await page.setViewportSize({ width: 390, height: 420 });
  await expect(layout).toHaveAttribute("data-compact", "true");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("Retained navigation draft");
  await expect(page.getByRole("button", { name: "Category 3", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const navigation = page.getByRole("region", { name: "Category navigation" });
  const content = page.getByRole("region", { name: "Category body" });
  const navBounds = await navigation.boundingBox();
  const contentBounds = await content.boundingBox();
  expect(navBounds!.y + navBounds!.height).toBeLessThanOrEqual(contentBounds!.y);
  expect(navBounds!.height).toBeLessThan(contentBounds!.height);
  await content.evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect(page.getByRole("button", { name: "End action", exact: true })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Category 1", exact: true })).toBeInViewport();
  await page.getByRole("button", { name: "Category 1", exact: true }).click();
  await expect(input).toHaveValue("Retained navigation draft");
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(page.getByRole("button", { name: "Back", exact: true })).toBeHidden();
});
